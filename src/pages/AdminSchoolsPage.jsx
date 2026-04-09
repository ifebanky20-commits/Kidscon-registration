import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { School, Trash2, ChevronRight, Download } from 'lucide-react';

function escapeCsvCell(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers, rows) {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerRow, ...dataRows].join('\n');
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSchoolsPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegisteredSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          category,
          address,
          contact_person,
          phone,
          created_at,
          students (count),
          teachers (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching registered schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredSchools();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('registered-schools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => fetchRegisteredSchools()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => fetchRegisteredSchools()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers' },
        () => fetchRegisteredSchools()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteSchool = async (e, school) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student/teacher records? This cannot be undone.`)) return;

    try {
      // Delete children first to bypass FK constraints
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

  const handleExportSchools = () => {
    try {
      const headers = ['School Name', 'Category', 'Contact Person', 'Phone', 'Address', 'Total Students', 'Total Teachers', 'Registered On'];
      const rows = schools.map((s) => [
        s.name,
        s.category || '',
        s.contact_person || '',
        s.phone || '',
        s.address || '',
        s.students[0]?.count || 0,
        s.teachers[0]?.count || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const csv = buildCsv(headers, rows);
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`kidscon_registered_schools_${date}.csv`, csv);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export. Please try again.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-md pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Registered Schools</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">A comprehensive master list of all schools that have officially registered for the event.</p>
        </div>
        <Button onClick={handleExportSchools} variant="outline" className="gap-2 shadow-sm shrink-0 font-semibold" disabled={loading || schools.length === 0}>
          <Download size={18} /> Export List as CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-md-outline/20 border-t-md-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-[28px] overflow-x-auto md-elevation-1 border border-md-outline/5 bg-md-surface-container-low scrollbar-thin">
              <Table className="min-w-max whitespace-nowrap">
                <TableHeader className="bg-md-surface-container">
                  <TableRow className="border-md-outline/10">
                    <TableHead className="py-5 font-semibold">School Name</TableHead>
                    <TableHead className="py-5 font-semibold">Category</TableHead>
                    <TableHead className="py-5 font-semibold">Contact</TableHead>
                    <TableHead className="py-5 font-semibold text-center">Students</TableHead>
                    <TableHead className="py-5 font-semibold text-center">Teachers</TableHead>
                    <TableHead className="py-5 font-semibold">Date Registered</TableHead>
                    <TableHead className="py-5 text-right font-semibold sticky right-0 bg-md-surface-container/90 backdrop-blur-md">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-md-on-surface-variant font-medium">
                        No schools have registered yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow 
                        key={school.id} 
                        className="group hover:bg-md-surface-container transition-colors border-md-outline/5 cursor-pointer"
                        onClick={() => navigate(`/admin/school/${school.id}`)}
                      >
                        <TableCell className="font-bold text-md-on-background py-5 flex items-center gap-3">
                          <School size={16} className="text-md-on-surface-variant/50" />
                          {school.name}
                        </TableCell>
                        <TableCell className="text-md-on-surface-variant font-medium py-5">
                          {school.category || '-'}
                        </TableCell>
                        <TableCell className="text-md-on-surface-variant py-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-md-on-background">{school.contact_person || '-'}</span>
                            <span className="text-xs">{school.phone || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-5">
                          <span className="bg-md-primary/10 text-md-primary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                            {school.students[0]?.count || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-5">
                          <span className="bg-md-tertiary/10 text-md-tertiary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                            {school.teachers[0]?.count || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-md-on-surface-variant font-medium py-5">
                          {new Date(school.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right py-3 sticky right-0 group-hover:bg-md-surface-container bg-md-surface-container-low transition-colors duration-200">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity bg-md-secondary-container/50 hover:bg-md-secondary-container">
                              <Link to={`/admin/school/${school.id}`} className="gap-2" onClick={(e) => e.stopPropagation()}>
                                Details <ChevronRight size={16} />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => handleDeleteSchool(e, school)}
                              className="text-md-error hover:bg-md-error/10 hover:text-md-error opacity-0 group-hover:opacity-100 transition-opacity"
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
          )}
        </div>

      </div>
    </div>
  );
}
