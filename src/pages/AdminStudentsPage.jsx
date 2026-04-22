import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Users, Search } from 'lucide-react';

const PAGE_SIZE = 15;

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Debounce search so we don't hit Supabase on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchStudents = useCallback(async (p, search) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('students')
      .select('*, schools(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      // ilike filter — searches student name; Supabase doesn't do multi-column OR easily via JS SDK
      // so we filter on name only server-side, then do a local filter for school/class
      query = query.ilike('name', `%${search}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setStudents(data || []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents(page, debouncedSearch);
  }, [page, debouncedSearch, fetchStudents]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-md pb-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Master Student Directory</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">View and search across all registered students from all schools.</p>
        </div>
        <div className="bg-md-tertiary/10 text-md-tertiary px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shrink-0">
          <Users size={16} />
          {totalCount} Total Students
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by student name…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-md-surface-container rounded-full border border-md-outline/10 focus:outline-none focus:ring-2 focus:ring-md-primary/50 text-md-on-background placeholder:text-md-on-surface-variant/50 transition-all font-medium"
        />
      </div>

      {/* Page label */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-md-on-surface-variant font-medium">
          {loading ? 'Loading…' : `Showing ${students.length} of ${totalCount} students`}
        </p>
        <span className="text-sm text-md-on-surface-variant font-medium">
          Page {page + 1} of {pageCount}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-md-tertiary/20 border-t-md-tertiary animate-spin" />
        </div>
      ) : (
        <>
          {/* Responsive wrapper */}
          <div className="rounded-[28px] overflow-x-auto md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
            <Table className="min-w-[640px]">
              <TableHeader className="bg-md-surface-container">
                <TableRow className="border-md-outline/10">
                  <TableHead className="py-5 font-semibold">Student Name</TableHead>
                  <TableHead className="py-5 font-semibold">School</TableHead>
                  <TableHead className="py-5 font-semibold text-center">Gender</TableHead>
                  <TableHead className="py-5 font-semibold">Class / Grade</TableHead>
                  <TableHead className="py-5 font-semibold text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-md-on-surface-variant font-medium">
                      {searchTerm ? 'No students found matching your search.' : 'No students have been registered yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-md-surface-container transition-colors border-md-outline/5">
                      <TableCell className="font-bold text-md-on-background py-5">{student.name}</TableCell>
                      <TableCell className="text-md-on-surface-variant font-medium py-5">
                        {student.schools?.name || 'Unknown School'}
                      </TableCell>
                      <TableCell className="text-center py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                          student.gender === 'Female' ? 'bg-[#FFD8E4] text-[#31111D]' : 'bg-md-secondary-container text-md-on-secondary-container'
                        }`}>
                          {student.gender}
                        </span>
                      </TableCell>
                      <TableCell className="text-md-on-surface-variant font-medium py-5">{student.class}</TableCell>
                      <TableCell className="text-md-on-surface-variant text-right py-5 text-sm">
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

        </>
      )}

    </div>
  );
}
