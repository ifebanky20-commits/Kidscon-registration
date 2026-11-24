"use client";

import { AdminPageHeading } from "@/components/pages/admin/ui/AdminPageHeading";
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, Search, Users } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useEvent } from '@/components/pages/admin/events/event-context';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 15;

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Event filter — shared via context
  const { events, selectedEventId, setSelectedEventId } = useEvent();

  const [page, setPage] = useState(0);

  // Debounce search so we don't hit Supabase on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: studentsData, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['students', page, debouncedSearch, selectedEventId],
    queryFn: async ({ signal }) => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('students')
        .select(selectedEventId
          ? 'id, name, gender, class, created_at, schools!inner(name)'
          : 'id, name, gender, class, created_at, schools(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to);

      if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`);
      if (selectedEventId) query = query.eq('schools.event_id', selectedEventId);

      const { data, count, error } = await query.abortSignal(signal);
      if (error) throw error;
      return { students: data || [], totalCount: count ?? 0 };
    },
  });

  const students = studentsData?.students || [];
  const totalCount = studentsData?.totalCount || 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-8 motion-safe:animate-enter [--enter-y:1.0rem] duration-300 ease-md pb-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdminPageHeading title="Students" description={<> View and search across all registered students. </>} />
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-md-tertiary/10 text-md-tertiary px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shrink-0">
            <Users size={16} />
            {totalCount} Students
          </div>
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-muted" />
              <div className="relative">
                <select
                  aria-label="Filter by event"
                  value={selectedEventId || ''}
                  onChange={(e) => { setSelectedEventId(e.target.value || null); setPage(0); }}
                  className="appearance-none h-10 pl-4 pr-10 rounded-xl border border-brand-line bg-brand-wash text-brand-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-md-primary/40 transition cursor-pointer"
                >
                  <option value="">All Events</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          aria-label="Search students by name"
          placeholder="Search by student name…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-9 pr-3 bg-brand-surface rounded-xl border border-brand-line focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm text-brand-ink placeholder:text-brand-muted/60 transition-colors"
        />
      </div>

      {/* Page label */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-muted font-medium">
          {loading ? 'Loading…' : isError ? 'Student list unavailable' : `Showing ${students.length} of ${totalCount} students`}
        </p>
        <span className="text-sm text-brand-muted font-medium">
          Page {page + 1} of {pageCount}
        </span>
      </div>

      <div className="rounded-2xl overflow-x-auto shadow-none border border-brand-line bg-brand-surface">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-brand-wash">
            <TableRow className="border-brand-line">
              <TableHead className="py-5 font-semibold">Student Name</TableHead>
              <TableHead className="py-5 font-semibold">School</TableHead>
              <TableHead className="py-5 font-semibold text-center">Gender</TableHead>
              <TableHead className="py-5 font-semibold">Class / Grade</TableHead>
              <TableHead className="py-5 font-semibold text-right">Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <div role="alert">Couldn’t load students.</div>
                  <button className="mt-3 underline" onClick={() => void refetch()}>Try again</button>
                </TableCell>
              </TableRow>
            ) : loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="py-5"><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell className="py-5"><Skeleton className="h-6 w-56" /></TableCell>
                  <TableCell className="py-5"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell className="py-5"><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="py-5 flex justify-end"><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-brand-muted font-medium">
                  {searchTerm ? 'No students found matching your search.' : 'No students have been registered yet.'}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-brand-wash transition-colors border-brand-line">
                  <TableCell className="font-medium text-brand-ink py-5">{student.name}</TableCell>
                  <TableCell className="text-brand-muted font-medium py-5">
                    {student.schools?.name || 'Unknown School'}
                  </TableCell>
                  <TableCell className="text-center py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${student.gender === 'Female' ? 'bg-brand-highlight text-brand-on-highlight' : 'bg-brand-tint text-brand-primary'
                      }`}>
                      {student.gender}
                    </span>
                  </TableCell>
                  <TableCell className="text-brand-muted font-medium py-5">{student.class}</TableCell>
                  <TableCell className="text-brand-muted text-right py-5 text-sm">
                    {new Date(student.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && students.length > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}
    </div>
  );
}
