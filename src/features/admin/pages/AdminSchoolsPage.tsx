import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, Download, GitMerge, School, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { MergeSchoolsModal } from '@/features/admin/components/schools/MergeSchoolsModal';
import { RegisteredSchoolsTable } from '@/features/admin/components/schools/RegisteredSchoolsTable';
import { useEvent } from '@/features/admin/context/event';
import { buildCsv, downloadCsv, downloadExcel, downloadWord } from '@/features/admin/utils/export';
import { Button } from '@/shared/components/ui/Button';
import Pagination from '@/shared/components/ui/Pagination';
import { supabase } from '@/shared/lib/supabase';
import type { SchoolSummary } from "@/shared/types/database";
import { getErrorMessage } from "@/shared/utils/error";

const PAGE_SIZE = 10;

// ─── Merge Duplicates Modal ────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────

export default function AdminSchoolsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Event filter — shared via context
  const { events, selectedEventId, setSelectedEventId } = useEvent();

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [page, setPage] = useState(0);

  // Debounce search — reset to page 0 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // React Query: Verified Schools (cached mapping)
  const { data: verifiedNamesMap } = useQuery({
    queryKey: ['verifiedSchools'],
    queryFn: async () => {
      const { data } = await supabase.from('available_schools').select('id, name');
      if (!data) return new Map();
      return new Map(data.map(s => [s.name.trim().toLowerCase(), s.id]));
    }
  });
  const verifiedNames = verifiedNamesMap || new Map();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifySchool = async (e: React.MouseEvent, school: Pick<SchoolSummary, 'id' | 'name'>) => {
    e.stopPropagation();
    const key = school.name.trim().toLowerCase();
    const existingId = verifiedNames.get(key);
    setVerifyingId(school.id);
    try {
      if (existingId) {
        await supabase.from('available_schools').delete().eq('id', existingId);
      } else {
        await supabase.from('available_schools').insert({ name: school.name.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] });
    } catch (err) {
      console.error('Verification toggle failed:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  // React Query: Registered Schools (paginated & filtered)
  const { data: schoolsData, isLoading: loading } = useQuery({
    queryKey: ['registeredSchools', page, debouncedSearch, selectedEventId, selectedCategory],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from('schools')
        .select(`
          id, name, category, address, contact_person, phone, created_at,
          students(count), teachers(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`);
      if (selectedEventId) query = query.eq('event_id', selectedEventId);
      if (selectedCategory && selectedCategory !== 'All') query = query.ilike('category', `%${selectedCategory}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      return { schools: data || [], totalCount: count ?? 0 };
    },
    placeholderData: (previousData) => previousData // Smooth pagination without jitter
  });

  const schools = schoolsData?.schools || [];
  const totalCount = schoolsData?.totalCount || 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('registered-schools-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => queryClient.invalidateQueries({ queryKey: ['registeredSchools'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => queryClient.invalidateQueries({ queryKey: ['registeredSchools'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => queryClient.invalidateQueries({ queryKey: ['registeredSchools'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'available_schools' }, () => queryClient.invalidateQueries({ queryKey: ['verifiedSchools'] }))
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleDeleteSchool = async (e: React.MouseEvent, school: Pick<SchoolSummary, 'id' | 'name'>) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student/teacher records? This cannot be undone.`)) return;
    try {
      await supabase.from('students').delete().eq('school_id', school.id);
      await supabase.from('teachers').delete().eq('school_id', school.id);
      await supabase.from('schools').delete().eq('id', school.id);

      queryClient.invalidateQueries({ queryKey: ['registeredSchools'] });

      const newTotal = totalCount - 1;
      const newPageCount = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const safePage = Math.min(page, newPageCount - 1);
      setPage(safePage);
      toast.success(`"${school.name}" deleted successfully.`);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(`Failed to delete: ${getErrorMessage(err) || JSON.stringify(err)}`);
    }
  };

  const handleExportSchools = async (format: 'csv' | 'xlsx' | 'docx') => {
    // Export ALL schools for selected event + category (not just current page)
    try {
      let query = supabase
        .from('schools')
        .select('id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)')
        .order('created_at', { ascending: false });
      if (selectedEventId) query = query.eq('event_id', selectedEventId);
      if (selectedCategory && selectedCategory !== 'All') query = query.ilike('category', `%${selectedCategory}%`);
      const { data: allSchools } = await query;
      const headers = ['School Name', 'Category', 'Contact Person', 'Phone', 'Address', 'Total Students', 'Total Teachers', 'Registered On'];
      const rows = (allSchools || []).map((s) => [
        s.name, s.category || '', s.contact_person || '', s.phone || '', s.address || '',
        s.students[0]?.count || 0, s.teachers[0]?.count || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (format === 'csv') {
        downloadCsv(`kidscon_registered_schools_${date}.csv`, buildCsv(headers, rows));
      } else if (format === 'xlsx') {
        downloadExcel(`kidscon_registered_schools_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(`kidscon_registered_schools_${date}.docx`, 'Registered Schools Report', headers, rows);
      }
      toast.success('Export completed successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export. Please try again.');
    }
  };

  return (
    <div className="space-y-10 motion-safe:animate-enter [--enter-y:1.0rem] duration-300 ease-md pb-12">

      {/* ── HEADER ROW ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Registered Schools</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">A comprehensive list of all schools that have registered for the selected event.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Event filter */}
          {events.length > 0 && (
            <div className="flex items-center gap-2 bg-md-surface-container-low border border-md-outline/10 p-1.5 rounded-full shadow-sm">
              <CalendarDays size={16} className="text-md-on-surface-variant ml-2" />
              <div className="relative">
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => { setSelectedEventId(e.target.value || null); setPage(0); }}
                  className="appearance-none h-8 pl-2 pr-8 rounded-full border-none bg-transparent text-md-on-background text-sm font-semibold focus:outline-none transition cursor-pointer"
                >
                  <option value="">All Events</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
              </div>
            </div>
          )}

          <Button
            onClick={() => setMergeOpen(true)}
            variant="outline"
            className="gap-2 shadow-sm font-semibold border-amber-300 text-amber-700 hover:bg-amber-50 h-11 rounded-full"
          >
            <GitMerge size={18} /> Merge Duplicates
          </Button>
        </div>
      </div>

      {/* ── FILTER & ACTION CARD ── */}
      <div className="bg-md-surface-container-low border border-md-outline/5 rounded-[28px] p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 shadow-sm">
        {/* Search Input Box */}
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search by school name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-10 bg-md-surface-container rounded-full border border-md-outline/10 focus:outline-none focus:ring-2 focus:ring-md-primary/50 text-md-on-background placeholder:text-md-on-surface-variant/50 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant hover:text-md-on-background transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and Exports Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown Selector */}
          <div className="flex items-center gap-2 bg-md-surface-container border border-md-outline/10 h-11 px-4 rounded-full shadow-sm relative shrink-0">
            <School size={15} className="text-md-on-surface-variant/75 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
              className="appearance-none pr-8 bg-transparent text-md-on-background text-sm font-bold focus:outline-none transition cursor-pointer border-none"
            >
              <option value="All">All Categories</option>
              <option value="Primary">Primary Only</option>
              <option value="Secondary">Secondary Only</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
          </div>

          {/* Export Action Menu Dropdown */}
          <div className="relative shrink-0">
            <Button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              variant="outline"
              className="gap-2 shadow-sm font-semibold h-11 rounded-full whitespace-nowrap border-md-outline/20 bg-md-surface-container-low"
              disabled={loading || totalCount === 0}
            >
              <Download size={16} className="text-md-primary shrink-0" />
              <span>Export Report</span>
              <ChevronDown size={14} className="text-md-on-surface-variant/70 shrink-0" />
            </Button>
            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-md-surface rounded-[20px] shadow-2xl border border-md-outline/10 py-2.5 z-30 motion-safe:animate-enter [--enter-y:-0.5rem] duration-200">
                  <div className="px-4 py-1 text-[11px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest border-b border-md-outline/5 pb-2 mb-1">
                    Select File Format
                  </div>
                  <button
                    onClick={() => { handleExportSchools('xlsx'); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-md-surface-container transition-colors text-md-on-background flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Microsoft Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => { handleExportSchools('docx'); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-md-surface-container transition-colors text-md-on-background flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Microsoft Word (.docx)
                  </button>
                  <button
                    onClick={() => { handleExportSchools('csv'); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-md-surface-container transition-colors text-md-on-background flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Standard CSV (.csv)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
        <p className="text-sm text-md-on-surface-variant font-medium">
          {loading ? 'Loading…' : `Showing ${schools.length} of ${totalCount} school${totalCount !== 1 ? 's' : ''}${selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}${debouncedSearch ? ` matching "${debouncedSearch}"` : ''}`}
        </p>
        <span className="text-sm text-md-on-surface-variant font-medium bg-md-surface-container-low border border-md-outline/10 px-3 py-1 rounded-full">
          Page {page + 1} of {pageCount}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="rounded-[28px] overflow-x-auto shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] border border-md-outline/5 bg-md-surface-container-low [scrollbar-width:thin]">
            <RegisteredSchoolsTable
              loading={loading}
              schools={schools}
              searchTerm={searchTerm}
              verifiedNames={verifiedNames}
              verifyingId={verifyingId}
              handleVerifySchool={handleVerifySchool}
              handleDeleteSchool={handleDeleteSchool}
              navigate={navigate}
            />
          </div>

          {/* Pagination */}
          {!loading && schools.length > 0 && (
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          )}
        </div>
      </div>

      {mergeOpen && (
        <MergeSchoolsModal
          onClose={() => setMergeOpen(false)}
          onMerged={() => { void queryClient.invalidateQueries({ queryKey: ['registeredSchools'] }); }}
        />
      )}
    </div>
  );
}
