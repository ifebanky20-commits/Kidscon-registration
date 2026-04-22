import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Users, School, ChevronRight, Trash2, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Next Program state ──
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventSaving, setEventSaving] = useState(false);
  const [eventToast, setEventToast] = useState(null); // { type: 'success'|'error', msg }

  const fetchEventSettings = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'next_event')
      .single();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      setEventName(parsed.name || '');
      setEventDate(parsed.date || '');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventDate) return;
    setEventSaving(true);
    setEventToast(null);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'next_event', value: JSON.stringify({ name: eventName, date: eventDate }) });
    setEventSaving(false);
    if (error) {
      setEventToast({ type: 'error', msg: 'Failed to save — ' + error.message });
    } else {
      setEventToast({ type: 'success', msg: 'Event updated! The countdown will reflect this immediately.' });
    }
    setTimeout(() => setEventToast(null), 4000);
  };

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          created_at,
          students (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchEventSettings();

    // Subscribe to real-time additions (to instantly reflect registrations on the dashboard)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteSchool = async (e, school) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student records? This cannot be undone.`)) return;
    try {
      // Delete children first to avoid FK constraint errors
      const { error: studErr } = await supabase.from('students').delete().eq('school_id', school.id);
      if (studErr) throw studErr;

      const { error: teachErr } = await supabase.from('teachers').delete().eq('school_id', school.id);
      if (teachErr) throw teachErr;

      const { error: schoolErr } = await supabase.from('schools').delete().eq('id', school.id);
      if (schoolErr) throw schoolErr;
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || JSON.stringify(err)}`);
    }
  };

  const totalSchools = schools.length;
  const totalStudents = schools.reduce((sum, school) => sum + (school.students[0]?.count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Dashboard Overview</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">Real-time registration tracking powered by Supabase.</p>
        </div>
      </div>

      {/* ── Next Program Card ── */}
      <Card className="rounded-[28px] border-none bg-md-surface-container-low ring-1 ring-md-outline/10 md-elevation-1">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-md-primary/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-md-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-md-on-background tracking-tight">Next Program</h2>
              <p className="text-sm text-md-on-surface-variant">Updates the countdown timer on the landing page instantly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-md-on-surface-variant uppercase tracking-wide" htmlFor="event-name">
                Event Name
              </label>
              <input
                id="event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. KIDSCON 2026"
                className="px-4 py-3 rounded-xl bg-md-surface-container border border-md-outline/30 text-md-on-background placeholder:text-md-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-md-primary/50 transition font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-md-on-surface-variant uppercase tracking-wide" htmlFor="event-date">
                Event Date
              </label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="px-4 py-3 rounded-xl bg-md-surface-container border border-md-outline/30 text-md-on-background focus:outline-none focus:ring-2 focus:ring-md-primary/50 transition font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="primary"
              onClick={handleSaveEvent}
              disabled={eventSaving || !eventDate}
              className="h-11 px-6"
            >
              {eventSaving ? 'Saving...' : 'Save & Update Countdown'}
            </Button>

            {eventToast && (
              <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl animate-in fade-in duration-300 ${
                eventToast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-md-error/10 text-md-error'
              }`}>
                {eventToast.type === 'success'
                  ? <CheckCircle2 size={16} />
                  : <AlertCircle size={16} />}
                {eventToast.msg}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <Card className="rounded-[28px] border-none bg-md-secondary-container text-md-on-secondary-container hover:bg-md-primary hover:text-md-on-primary transition-all duration-500 group cursor-default">
          <CardContent className="p-8 pb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase opacity-80 mb-1">Total Schools</p>
                <p className="text-5xl font-extrabold tracking-tight">{totalSchools}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                <School size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card className="rounded-[28px] border-none bg-md-tertiary text-md-on-tertiary hover:bg-[#8D6475] transition-all duration-500 group cursor-default shadow-md md:translate-y-[-12px]">
          <CardContent className="p-8 pb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase opacity-80 mb-1">Total Students</p>
                <p className="text-5xl font-extrabold tracking-tight">{totalStudents}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-500">
                <Users size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-bold text-md-on-background tracking-tight">Recent Registrations</h2>
        
        <Table className="rounded-[28px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
          <TableHeader className="bg-md-surface-container">
            <TableRow className="border-md-outline/10">
              <TableHead className="py-5 font-semibold">School Name</TableHead>
              <TableHead className="py-5 font-semibold">Students Enrolled</TableHead>
              <TableHead className="py-5 font-semibold">Date Registered</TableHead>
              <TableHead className="py-5 text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-md-on-surface-variant font-medium">
                  Waiting for initial registrations...
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
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
                          View Details <ChevronRight size={16} />
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
      </div>

    </div>
  );
}
