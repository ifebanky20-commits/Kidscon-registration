import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Download,
  FileSpreadsheet,
  Users,
  School,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ─── CSV helper ────────────────────────────────────────────────────────────────
function escapeCsvCell(value) {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if the value contains a comma, quote, or newline
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
// ──────────────────────────────────────────────────────────────────────────────

export default function AdminExportPage() {
  const [schools, setSchools] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // 'all' | school.id | null
  const [exported, setExported] = useState(null);   // 'all' | school.id | null
  const [exportFormat, setExportFormat] = useState('xlsx'); // 'csv' | 'xlsx'
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all schools with their students
      const { data: schoolData, error: schoolErr } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          category,
          address,
          contact_person,
          phone,
          created_at,
          students (
            id,
            name,
            gender,
            class,
            created_at
          )
        `)
        .order('name', { ascending: true });

      if (schoolErr) throw schoolErr;

      // Flatten students for the 'all' export
      const flat = (schoolData || []).flatMap((s) =>
        (s.students || []).map((st) => ({ ...st, school_name: s.name, school_category: s.category }))
      );

      setSchools(schoolData || []);
      setAllStudents(flat);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // ── Export handlers ──────────────────────────────────────────────────────────

  const handleExportAll = () => {
    setExporting('all');
    setError('');
    try {
      const headers = ['S/N', 'Student Name', 'Gender', 'Class / Grade', 'School', 'Category', 'Registration Date'];
      const rows = allStudents.map((s, i) => [
        i + 1,
        s.name,
        s.gender,
        s.class,
        s.school_name,
        s.school_category || '',
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === 'csv') {
        const csv = buildCsv(headers, rows);
        downloadCsv(`kidscon_all_students_${date}.csv`, csv);
      } else {
        downloadExcel(`kidscon_all_students_${date}.xlsx`, headers, rows);
      }
      setExported('all');
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportSchool = (school) => {
    setExporting(school.id);
    setError('');
    try {
      const headers = ['S/N', 'Student Name', 'Gender', 'Class / Grade', 'Registration Date'];
      const rows = (school.students || []).map((s, i) => [
        i + 1,
        s.name,
        s.gender,
        s.class,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const csv = buildCsv(headers, rows);
      const safeName = school.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === 'csv') {
        const csv = buildCsv(headers, rows);
        downloadCsv(`kidscon_${safeName}_${date}.csv`, csv);
      } else {
        downloadExcel(`kidscon_${safeName}_${date}.xlsx`, headers, rows);
      }
      setExported(school.id);
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportSchoolsOverview = () => {
    setExporting('schools');
    setError('');
    try {
      const headers = ['School Name', 'Category', 'Contact Person', 'Phone', 'Address', 'Total Students', 'Registered On'];
      const rows = schools.map((s) => [
        s.name,
        s.category || '',
        s.contact_person || '',
        s.phone || '',
        s.address || '',
        s.students?.length || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === 'csv') {
        const csv = buildCsv(headers, rows);
        downloadCsv(`kidscon_schools_overview_${date}.csv`, csv);
      } else {
        downloadExcel(`kidscon_schools_overview_${date}.xlsx`, headers, rows);
      }
      setExported('schools');
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Export Data</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">
            Download registration data instantly in your preferred format.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-md-surface-container-low border border-md-outline/10 p-1.5 rounded-full shadow-sm">
          <button 
            onClick={() => setExportFormat('csv')} 
            className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${exportFormat === 'csv' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}
          >CSV</button>
          <button 
            onClick={() => setExportFormat('xlsx')} 
            className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${exportFormat === 'xlsx' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container'}`}
          >Excel</button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-md-error/10 text-md-error p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-md-secondary-container text-md-on-secondary-container rounded-[24px] p-6 flex flex-col gap-1">
          <School size={22} className="opacity-70" />
          <p className="text-3xl font-extrabold tracking-tight mt-2">{schools.length}</p>
          <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">Schools</p>
        </div>
        <div className="bg-md-tertiary text-md-on-tertiary rounded-[24px] p-6 flex flex-col gap-1">
          <Users size={22} className="opacity-70" />
          <p className="text-3xl font-extrabold tracking-tight mt-2">{allStudents.length}</p>
          <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">Students</p>
        </div>
      </div>

      {/* Master exports */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-md-on-background tracking-tight">Master Exports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <ExportCard
            icon={<Users size={22} />}
            title="All Students"
            description={`${allStudents.length} students across all schools`}
            color="primary"
            loading={exporting === 'all'}
            done={exported === 'all'}
            onExport={handleExportAll}
            disabled={allStudents.length === 0}
            format={exportFormat}
          />

          <ExportCard
            icon={<School size={22} />}
            title="Schools Overview"
            description={`${schools.length} schools with enrollment counts`}
            color="secondary"
            loading={exporting === 'schools'}
            done={exported === 'schools'}
            onExport={handleExportSchoolsOverview}
            disabled={schools.length === 0}
            format={exportFormat}
          />
        </div>
      </div>

      {/* Per-school exports */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-md-on-background tracking-tight">Export by School</h2>

        {schools.length === 0 ? (
          <p className="text-md-on-surface-variant font-medium py-8 text-center">No schools registered yet.</p>
        ) : (
          <div className="rounded-[28px] overflow-hidden border border-md-outline/5 bg-md-surface-container-low">
            {schools.map((school, idx) => (
              <div
                key={school.id}
                className={`flex items-center justify-between px-6 py-4 gap-4 hover:bg-md-surface-container transition-colors ${idx !== schools.length - 1 ? 'border-b border-md-outline/5' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center shrink-0 font-bold text-sm">
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-md-on-background truncate">{school.name}</p>
                    <p className="text-sm text-md-on-surface-variant font-medium">
                      {school.students?.length || 0} students
                      {school.category ? ` · ${school.category}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExportSchool(school)}
                  disabled={exporting === school.id || (school.students?.length || 0) === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                    exported === school.id
                      ? 'bg-green-100 text-green-700'
                      : (school.students?.length || 0) === 0
                      ? 'bg-md-surface-container text-md-on-surface-variant/40 cursor-not-allowed'
                      : 'bg-md-secondary-container text-md-on-secondary-container hover:bg-md-primary hover:text-md-on-primary'
                  }`}
                >
                  {exporting === school.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : exported === school.id ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Download size={14} />
                  )}
                  {exported === school.id ? 'Exported!' : (school.students?.length || 0) === 0 ? 'No Data' : `Export ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Reusable export card ───────────────────────────────────────────────────────
function ExportCard({ icon, title, description, color, loading, done, onExport, disabled, format = 'csv' }) {
  const colorMap = {
    primary: 'bg-md-primary/10 text-md-primary',
    secondary: 'bg-md-secondary-container text-md-on-secondary-container',
    tertiary: 'bg-md-tertiary/10 text-md-tertiary',
  };

  return (
    <Card className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low shadow-none hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-7 flex flex-col gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-md-on-background">{title}</h3>
          <p className="text-sm text-md-on-surface-variant font-medium mt-0.5">{description}</p>
        </div>
        <button
          onClick={onExport}
          disabled={loading || disabled}
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-full font-semibold text-sm transition-all ${
            done
              ? 'bg-green-100 text-green-700'
              : disabled
              ? 'bg-md-surface-container text-md-on-surface-variant/40 cursor-not-allowed'
              : 'bg-md-secondary-container text-md-on-secondary-container hover:bg-md-primary hover:text-md-on-primary active:scale-95'
          }`}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : done ? (
            <CheckCircle2 size={16} />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          {loading ? 'Preparing…' : done ? 'Downloaded!' : `Download ${format.toUpperCase()}`}
        </button>
      </CardContent>
    </Card>
  );
}
