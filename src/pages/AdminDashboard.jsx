import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Users, School, ChevronRight, Trash2, CalendarDays, ChevronDown } from 'lucide-react';

// ── Tiny event picker ─────────────────────────────────────────────────────────
function EventPicker({ events, selectedId, onChange }) {
  const selected = events.find((e) => e.id === selectedId);
  return (
    <div className="relative inline-block">
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="appearance-none h-10 pl-4 pr-10 rounded-full border border-md-outline/20 bg-md-surface-container text-md-on-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-md-primary/40 transition cursor-pointer"
      >
        <option value="">All Events</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>{ev.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [events, setEvents]           = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [totalSchools, setTotalSchools]   = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recent, setRecent]               = useState([]);
  const [loading, setLoading]             = useState(true);

  // Fetch events for the picker
  useEffect(() => {
    supabase
      .from('events')
      .select('id, name, date')
      .order('date', { ascending: false })
      .then(({ data }) => {
        const evts = data || [];
        setEvents(evts);
        // Default to the most recent event
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      });
  }, []);

  // Fetch aggregate counts filtered by event
  const fetchTotals = useCallback(async (eventId) => {
    let schoolQ = supabase.from('schools').select('*', { count: 'exact', head: true });
    let studentQ = supabase.from('students').select('*', { count: 'exact', head: true });

    if (eventId) {
      schoolQ = schoolQ.eq('event_id', eventId);
      // Students: count those belonging to schools of this event
      const { data: schoolIds } = await supabase
        .from('schools')
        .select('id')
        .eq('event_id', eventId);
      const ids = (schoolIds || []).map((s) => s.id);
      if (ids.length > 0) {
        studentQ = studentQ.in('school_id', ids);
      } else {
        setTotalStudents(0);
        const [{ count: sc }] = await Promise.all([schoolQ]);
        setTotalSchools(sc ?? 0);
        return;
      }
    }

    const [{ count: sc }, { count: st }] = await Promise.all([schoolQ, studentQ]);
    setTotalSchools(sc ?? 0);
    setTotalStudents(st ?? 0);
  }, []);

  // Fetch 5 most recent schools filtered by event
  const fetchRecent = useCallback(async (eventId) => {
    setLoading(true);
    let query = supabase
      .from('schools')
      .select('id, name, created_at, students(count)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error } = await query;
    if (!error) setRecent(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTotals(selectedEventId);
    fetchRecent(selectedEventId);

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
        fetchTotals(selectedEventId);
        fetchRecent(selectedEventId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchTotals(selectedEventId);
        fetchRecent(selectedEventId);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedEventId, fetchTotals, fetchRecent]);

  const handleDeleteSchool = async (e, school) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student records? This cannot be undone.`)) return;
    try {
      await supabase.from('students').delete().eq('school_id', school.id);
      await supabase.from('teachers').delete().eq('school_id', school.id);
      await supabase.from('schools').delete().eq('id', school.id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || JSON.stringify(err)}`);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Dashboard Overview</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">Real-time registration tracking powered by Supabase.</p>
        </div>
        {/* Event Filter */}
        {events.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <CalendarDays size={16} className="text-md-on-surface-variant" />
            <EventPicker events={events} selectedId={selectedEventId} onChange={setSelectedEventId} />
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-[28px] border-none bg-md-secondary-container text-md-on-secondary-container hover:bg-md-primary hover:text-md-on-primary transition-all duration-500 group cursor-default">
          <CardContent className="p-8 pb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase opacity-80 mb-1">
                  {selectedEvent ? `Schools · ${selectedEvent.name}` : 'Total Schools'}
                </p>
                <p className="text-5xl font-extrabold tracking-tight">{totalSchools}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                <School size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-none bg-md-tertiary text-md-on-tertiary hover:bg-[#8D6475] transition-all duration-500 group cursor-default shadow-md md:translate-y-[-12px]">
          <CardContent className="p-8 pb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase opacity-80 mb-1">
                  {selectedEvent ? `Students · ${selectedEvent.name}` : 'Total Students'}
                </p>
                <p className="text-5xl font-extrabold tracking-tight">{totalStudents}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-500">
                <Users size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest 5 Registrations */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-md-on-background tracking-tight">Latest Registrations</h2>
          <Link
            to="/admin/schools"
            className="text-sm font-semibold text-md-primary hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
          </div>
        ) : (
          <Table className="rounded-[28px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
            <TableHeader className="bg-md-surface-container">
              <TableRow className="border-md-outline/10">
                <TableHead className="py-5 font-semibold">School Name</TableHead>
                <TableHead className="py-5 font-semibold">Students</TableHead>
                <TableHead className="py-5 font-semibold">Date Registered</TableHead>
                <TableHead className="py-5 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-md-on-surface-variant font-medium">
                    {selectedEvent ? `No registrations yet for ${selectedEvent.name}.` : 'Waiting for initial registrations…'}
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((school) => (
                  <TableRow
                    key={school.id}
                    className="group hover:bg-md-surface-container border-md-outline/5 cursor-pointer"
                    onClick={() => navigate(`/admin/school/${school.id}`)}
                  >
                    <TableCell className="font-bold text-md-on-background py-5">{school.name}</TableCell>
                    <TableCell className="py-5">
                      <span className="bg-md-primary/10 text-md-primary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                        {school.students[0]?.count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-md-on-surface-variant font-medium py-5">
                      {new Date(school.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity bg-md-secondary-container/50 hover:bg-md-secondary-container">
                          <Link to={`/admin/school/${school.id}`} className="gap-2" onClick={(e) => e.stopPropagation()}>
                            View <ChevronRight size={16} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSchool(e, school)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-md-error hover:bg-md-error/10 hover:text-md-error"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

    </div>
  );
}
