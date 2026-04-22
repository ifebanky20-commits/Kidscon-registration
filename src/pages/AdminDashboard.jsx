import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Users, School, ChevronRight, Trash2, ChevronLeft } from 'lucide-react';

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Stat totals (lightweight counts)
  const [totalSchools, setTotalSchools] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // Paginated recent registrations
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);       // 0-indexed
  const [pageCount, setPageCount] = useState(1);

  // ── Fetch totals ──────────────────────────────────────────────────────────
  const fetchTotals = useCallback(async () => {
    const [{ count: sc }, { count: st }] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
    ]);
    setTotalSchools(sc ?? 0);
    setTotalStudents(st ?? 0);
    setPageCount(Math.max(1, Math.ceil((sc ?? 0) / PAGE_SIZE)));
  }, []);

  // ── Fetch current page ────────────────────────────────────────────────────
  const fetchPage = useCallback(async (p) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, created_at, students(count)')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (!error) setSchools(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTotals();
    fetchPage(0);

    // Real-time: refresh totals + current page on any change
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
        fetchTotals();
        fetchPage(page);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchTotals();
        fetchPage(page);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when page changes
  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const handleDeleteSchool = async (e, school) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student records? This cannot be undone.`)) return;
    try {
      await supabase.from('students').delete().eq('school_id', school.id);
      await supabase.from('teachers').delete().eq('school_id', school.id);
      await supabase.from('schools').delete().eq('id', school.id);
      // After delete, go back a page if current page is now empty
      const newTotal = totalSchools - 1;
      const newPageCount = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const safePage = Math.min(page, newPageCount - 1);
      setPage(safePage);
      fetchTotals();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || JSON.stringify(err)}`);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Dashboard Overview</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">Real-time registration tracking powered by Supabase.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Registrations */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-md-on-background tracking-tight">Recent Registrations</h2>
          <span className="text-sm text-md-on-surface-variant font-medium">
            Page {page + 1} of {pageCount}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
          </div>
        ) : (
          <>
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
                      Waiting for initial registrations…
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

            {/* Pagination Controls */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="gap-1 font-semibold"
                >
                  <ChevronLeft size={16} /> Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                        i === page
                          ? 'bg-md-primary text-md-on-primary shadow-sm'
                          : 'text-md-on-surface-variant hover:bg-md-surface-container'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page === pageCount - 1}
                  className="gap-1 font-semibold"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
