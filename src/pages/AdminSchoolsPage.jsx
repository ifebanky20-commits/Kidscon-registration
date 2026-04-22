import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { School, Trash2, ChevronRight, Download } from 'lucide-react';

const PAGE_SIZE = 10;

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

function downloadExcel(filename, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
}

async function downloadWord(filename, title, headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new DocxTableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new DocxTableCell({
        borders: cellBorders,
        shading: { fill: '6750A4' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(h), bold: true, color: 'FFFFFF', size: 20 })] })],
      })
    ),
  });

  const dataRows = rows.map((row, i) =>
    new DocxTableRow({
      children: row.map((cell) =>
        new DocxTableCell({
          borders: cellBorders,
          shading: { fill: i % 2 === 0 ? 'F8F4FF' : 'FFFFFF' },
          children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? ''), size: 18 })] })],
        })
      ),
    })
  );

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: 'KIDSCON Registration', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 26, color: '6750A4' })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, italics: true, color: '888888', size: 18 })], spacing: { after: 300 } }),
        new DocxTable({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSchoolsPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('xlsx');

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchRegisteredSchools = useCallback(async (p) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from('schools')
      .select(`
        id, name, category, address, contact_person, phone, created_at,
        students(count), teachers(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (!error) {
      setSchools(data || []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRegisteredSchools(0);

    // Real-time subscription
    const channel = supabase
      .channel('registered-schools-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' },  () => fetchRegisteredSchools(page))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchRegisteredSchools(page))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => fetchRegisteredSchools(page))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRegisteredSchools(page);
  }, [page, fetchRegisteredSchools]);

  const handleDeleteSchool = async (e, school) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${school.name}" and all its student/teacher records? This cannot be undone.`)) return;
    try {
      await supabase.from('students').delete().eq('school_id', school.id);
      await supabase.from('teachers').delete().eq('school_id', school.id);
      await supabase.from('schools').delete().eq('id', school.id);
      const newTotal = totalCount - 1;
      const newPageCount = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const safePage = Math.min(page, newPageCount - 1);
      setPage(safePage);
      fetchRegisteredSchools(safePage);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleExportSchools = async () => {
    // Export ALL schools (not just current page) for full data export
    try {
      const { data: allSchools } = await supabase
        .from('schools')
        .select('id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)')
        .order('created_at', { ascending: false });
      const headers = ['School Name', 'Category', 'Contact Person', 'Phone', 'Address', 'Total Students', 'Total Teachers', 'Registered On'];
      const rows = (allSchools || []).map((s) => [
        s.name, s.category || '', s.contact_person || '', s.phone || '', s.address || '',
        s.students[0]?.count || 0, s.teachers[0]?.count || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === 'csv') {
        downloadCsv(`kidscon_registered_schools_${date}.csv`, buildCsv(headers, rows));
      } else if (exportFormat === 'xlsx') {
        downloadExcel(`kidscon_registered_schools_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(`kidscon_registered_schools_${date}.docx`, 'Registered Schools Report', headers, rows);
      }
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
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1 bg-md-surface-container-low border border-md-outline/10 p-1.5 rounded-full shadow-sm">
            <button onClick={() => setExportFormat('csv')}  className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-colors ${exportFormat === 'csv'  ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}>CSV</button>
            <button onClick={() => setExportFormat('xlsx')} className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-colors ${exportFormat === 'xlsx' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}>Excel</button>
            <button onClick={() => setExportFormat('docx')} className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-colors ${exportFormat === 'docx' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}>Word</button>
          </div>
          <Button onClick={handleExportSchools} variant="outline" className="gap-2 shadow-sm font-semibold" disabled={loading || totalCount === 0}>
            <Download size={18} /> Export as {exportFormat.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Page info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-md-on-surface-variant font-medium">
          {loading ? 'Loading…' : `Showing ${schools.length} of ${totalCount} schools`}
        </p>
        <span className="text-sm text-md-on-surface-variant font-medium">
          Page {page + 1} of {pageCount}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-md-outline/20 border-t-md-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
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
                          <TableCell className="text-md-on-surface-variant font-medium py-5">{school.category || '-'}</TableCell>
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
                              <Button variant="ghost" size="sm" asChild className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-md-secondary-container/50 hover:bg-md-secondary-container">
                                <Link to={`/admin/school/${school.id}`} className="gap-2" onClick={(e) => e.stopPropagation()}>
                                  Details <ChevronRight size={16} />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteSchool(e, school)}
                                className="text-md-error hover:bg-md-error/10 hover:text-md-error opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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

              {/* Pagination */}
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
