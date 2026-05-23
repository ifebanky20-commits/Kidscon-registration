import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { School, Trash2, ChevronRight, Download, GitMerge, X, CheckCircle2, AlertTriangle, MapPin, User, Phone, Users, ChevronDown, ChevronUp, Search, CalendarDays, ShieldCheck, ShieldOff } from 'lucide-react';
import { useEvent } from '../context/EventContext';

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

// ─── Merge Duplicates Modal ────────────────────────────────────────────────

function MergeSchoolsModal({ onClose, onMerged }) {
  const [loading, setLoading] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  // per-group state: { [groupKey]: { primaryId, contactSourceId, merging, merged, error } }
  const [groupState, setGroupState] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const overlayRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Detect duplicates
  useEffect(() => {
    async function detect() {
      setLoading(true);
      const { data } = await supabase
        .from('schools')
        .select('id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)')
        .order('name');

      if (!data) { setLoading(false); return; }

      // Group by normalised name: lowercase + collapse internal whitespace
      const normalise = (n) => n.trim().toLowerCase().replace(/\s+/g, ' ');
      const map = {};
      for (const s of data) {
        const key = normalise(s.name);
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }

      const groups = Object.entries(map)
        .filter(([, list]) => list.length >= 2)
        .map(([key, list]) => ({ key, name: list[0].name.trim(), schools: list }));

      setDuplicateGroups(groups);

      // Initialise per-group state
      const init = {};
      const expanded = {};
      for (const g of groups) {
        // default primary = school with most students
        const primary = [...g.schools].sort(
          (a, b) => (b.students[0]?.count || 0) - (a.students[0]?.count || 0)
        )[0];
        init[g.key] = { primaryId: primary.id, contactSourceId: primary.id, merging: false, merged: false, error: null };
        expanded[g.key] = true;
      }
      setGroupState(init);
      setExpandedGroups(expanded);
      setLoading(false);
    }
    detect();
  }, []);

  const setGroupField = (key, field, value) =>
    setGroupState(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const toggleExpand = (key) =>
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const handleMerge = async (group) => {
    const { primaryId, contactSourceId } = groupState[group.key];

    setGroupState(prev => ({
      ...prev,
      [group.key]: { ...prev[group.key], merging: true, error: null },
    }));

    try {
      const duplicates = group.schools.filter(s => s.id !== primaryId);

      for (const dup of duplicates) {
        // ── Step 1: fetch all students belonging to the duplicate school
        const { data: dupStudents, error: fse } = await supabase
          .from('students').select('*').eq('school_id', dup.id);
        if (fse) throw new Error(`Fetch students failed: ${fse.message}`);

        // ── Step 2: fetch all teachers belonging to the duplicate school
        const { data: dupTeachers, error: fte } = await supabase
          .from('teachers').select('*').eq('school_id', dup.id);
        if (fte) throw new Error(`Fetch teachers failed: ${fte.message}`);

        // ── Step 3: delete students from duplicate (removes FK dependency)
        if (dupStudents?.length) {
          const { error: dse } = await supabase.from('students').delete().eq('school_id', dup.id);
          if (dse) throw new Error(`Delete students failed: ${dse.message}`);

          // ── Step 4: re-insert under the primary school (strip id so DB generates a new one)
          const { error: ise } = await supabase.from('students').insert(
            dupStudents.map(({ id: _id, ...rest }) => ({ ...rest, school_id: primaryId }))
          );
          if (ise) throw new Error(`Insert students failed: ${ise.message}`);
        }

        // ── Step 5: same for teachers
        if (dupTeachers?.length) {
          const { error: dte } = await supabase.from('teachers').delete().eq('school_id', dup.id);
          if (dte) throw new Error(`Delete teachers failed: ${dte.message}`);

          const { error: ite } = await supabase.from('teachers').insert(
            dupTeachers.map(({ id: _id, ...rest }) => ({ ...rest, school_id: primaryId }))
          );
          if (ite) throw new Error(`Insert teachers failed: ${ite.message}`);
        }

        // ── Step 6: delete the now-empty duplicate school record
        const { error: de } = await supabase.from('schools').delete().eq('id', dup.id);
        if (de) throw new Error(`School delete failed: ${de.message}`);
      }

      // ── Step 7: update contact details on primary if a different source was chosen
      if (contactSourceId !== primaryId) {
        const source = group.schools.find(s => s.id === contactSourceId);
        const { error: ue } = await supabase.from('schools').update({
          contact_person: source.contact_person,
          phone: source.phone,
          address: source.address,
        }).eq('id', primaryId);
        if (ue) throw new Error(`Contact update failed: ${ue.message}`);
      }

      setGroupState(prev => ({
        ...prev,
        [group.key]: { ...prev[group.key], merging: false, merged: true, error: null },
      }));
      onMerged();
    } catch (err) {
      console.error('Merge error:', err);
      setGroupState(prev => ({
        ...prev,
        [group.key]: { ...prev[group.key], merging: false, error: err.message || 'Merge failed. Please try again.' },
      }));
    }
  };

  const totalGroups = duplicateGroups.length;
  const mergedCount = Object.values(groupState).filter(s => s.merged).length;
  const allMerged = totalGroups > 0 && mergedCount === totalGroups;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4"
    >
      <div className="bg-md-surface w-full max-w-4xl rounded-[28px] shadow-2xl border border-md-outline/10 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-md-outline/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center">
              <GitMerge size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-md-on-background tracking-tight">Merge Duplicate Schools</h2>
              <p className="text-sm text-md-on-surface-variant font-medium mt-0.5">
                {loading ? 'Scanning for duplicates…' : `${totalGroups} duplicate group${totalGroups !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-md-on-surface-variant/10 transition-colors flex items-center justify-center text-md-on-surface-variant"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-md-outline/20 border-t-md-primary rounded-full animate-spin" />
            </div>
          ) : allMerged ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-md-on-background">All duplicates merged!</h3>
              <p className="text-md-on-surface-variant mt-2 mb-6">Your school records are now clean and accurate.</p>
              <Button variant="primary" onClick={onClose}>Close</Button>
            </div>
          ) : totalGroups === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-md-on-background">No duplicates found</h3>
              <p className="text-md-on-surface-variant mt-2">All school names are unique.</p>
            </div>
          ) : (
            duplicateGroups.map((group) => {
              const gs = groupState[group.key] || {};
              const isExpanded = expandedGroups[group.key];
              const primarySchool = group.schools.find(s => s.id === gs.primaryId);
              const contactSource = group.schools.find(s => s.id === gs.contactSourceId);

              if (gs.merged) {
                return (
                  <div key={group.key} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-800">{group.name}</span>
                    <span className="text-sm text-emerald-600 ml-auto">Merged successfully</span>
                  </div>
                );
              }

              return (
                <div key={group.key} className="rounded-2xl border border-md-outline/15 bg-md-surface-container-low overflow-hidden">
                  {/* Group Header */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-md-surface-container transition-colors"
                    onClick={() => toggleExpand(group.key)}
                  >
                    <div className="flex items-center gap-3">
                      <School size={18} className="text-md-primary" />
                      <span className="font-bold text-md-on-background">{group.name}</span>
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {group.schools.length} duplicates
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-md-on-surface-variant" /> : <ChevronDown size={18} className="text-md-on-surface-variant" />}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6 border-t border-md-outline/10 pt-5">

                      {/* Records table */}
                      <div className="overflow-x-auto rounded-xl border border-md-outline/10">
                        <table className="w-full text-sm min-w-max">
                          <thead>
                            <tr className="bg-md-surface-container text-md-on-surface-variant">
                              <th className="py-3 px-4 text-left font-semibold">Primary Record</th>
                              <th className="py-3 px-4 text-left font-semibold">Contact Source</th>
                              <th className="py-3 px-4 text-left font-semibold">Contact Person</th>
                              <th className="py-3 px-4 text-left font-semibold">Phone</th>
                              <th className="py-3 px-4 text-center font-semibold"><Users size={14} className="inline" /> Students</th>
                              <th className="py-3 px-4 text-left font-semibold">Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.schools.map((s) => (
                              <tr key={s.id} className="border-t border-md-outline/10 hover:bg-md-surface-container/50 transition-colors">
                                <td className="py-3 px-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`primary-${group.key}`}
                                      checked={gs.primaryId === s.id}
                                      onChange={() => {
                                        setGroupField(group.key, 'primaryId', s.id);
                                        // Reset contact source to new primary if it was same as old primary
                                        if (gs.contactSourceId === gs.primaryId) {
                                          setGroupField(group.key, 'contactSourceId', s.id);
                                        }
                                      }}
                                      className="accent-md-primary w-4 h-4"
                                    />
                                    <span className="font-medium text-md-on-background">Keep this</span>
                                  </label>
                                </td>
                                <td className="py-3 px-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`contact-${group.key}`}
                                      checked={gs.contactSourceId === s.id}
                                      onChange={() => setGroupField(group.key, 'contactSourceId', s.id)}
                                      className="accent-indigo-600 w-4 h-4"
                                    />
                                    <span className="font-medium text-md-on-background">Use this</span>
                                  </label>
                                </td>
                                <td className="py-3 px-4 text-md-on-surface-variant">{s.contact_person || '—'}</td>
                                <td className="py-3 px-4 text-md-on-surface-variant">{s.phone || '—'}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className="bg-md-primary/10 text-md-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {s.students[0]?.count || 0}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-md-on-surface-variant text-xs">
                                  {new Date(s.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Merged Record Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Primary summary */}
                        <div className="rounded-xl bg-md-primary/5 border border-md-primary/20 p-4">
                          <p className="text-xs font-bold text-md-primary uppercase tracking-widest mb-3">Primary Record (ID kept)</p>
                          <p className="font-bold text-md-on-background">{primarySchool?.name}</p>
                          <p className="text-xs text-md-on-surface-variant mt-1">{primarySchool?.category || 'N/A'}</p>
                          <p className="text-sm text-md-on-surface-variant mt-2 font-medium">
                            Total students after merge:
                            <span className="ml-2 font-bold text-md-on-background">
                              {group.schools.reduce((sum, s) => sum + (s.students[0]?.count || 0), 0)}
                            </span>
                          </p>
                        </div>

                        {/* Contact preview */}
                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Contact Details (from selected source)</p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-md-on-background font-medium">{contactSource?.contact_person || '—'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-md-on-background font-medium">{contactSource?.phone || '—'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-md-on-background font-medium">{contactSource?.address || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Error */}
                      {gs.error && (
                        <div className="flex items-center gap-2 text-md-error bg-md-error/10 px-4 py-3 rounded-xl text-sm font-medium">
                          <AlertTriangle size={16} className="shrink-0" />
                          {gs.error}
                        </div>
                      )}

                      {/* Merge button */}
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          onClick={() => handleMerge(group)}
                          disabled={gs.merging}
                          className="gap-2"
                        >
                          {gs.merging ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Merging…</>
                          ) : (
                            <><GitMerge size={16} /> Merge Group</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function AdminSchoolsPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [mergeOpen, setMergeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Event filter — shared via context
  const { events, selectedEventId, setSelectedEventId } = useEvent();

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Verified schools — names stored in available_schools table
  const [verifiedNames, setVerifiedNames] = useState(new Set());
  const [verifyingId, setVerifyingId] = useState(null); // school id currently being toggled

  const fetchVerifiedSchools = useCallback(async () => {
    const { data } = await supabase.from('available_schools').select('id, name');
    if (data) setVerifiedNames(new Map(data.map(s => [s.name.trim().toLowerCase(), s.id])));
  }, []);

  useEffect(() => { fetchVerifiedSchools(); }, [fetchVerifiedSchools]);

  const handleVerifySchool = async (e, school) => {
    e.stopPropagation();
    const key = school.name.trim().toLowerCase();
    const existingId = verifiedNames instanceof Map ? verifiedNames.get(key) : undefined;
    setVerifyingId(school.id);
    try {
      if (existingId) {
        // Unverify — remove from available_schools
        await supabase.from('available_schools').delete().eq('id', existingId);
      } else {
        // Verify — add to available_schools
        await supabase.from('available_schools').insert({ name: school.name.trim() });
      }
      await fetchVerifiedSchools();
    } catch (err) {
      console.error('Verification toggle failed:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  // Debounce search — reset to page 0 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchRegisteredSchools = useCallback(async (p, search, eventId, category) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from('schools')
      .select(`
        id, name, category, address, contact_person, phone, created_at,
        students(count), teachers(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('name', `%${search}%`);
    if (eventId) query = query.eq('event_id', eventId);
    if (category && category !== 'All') query = query.ilike('category', `%${category}%`);

    const { data, count, error } = await query;
    if (!error) {
      setSchools(data || []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRegisteredSchools(0, '', selectedEventId, selectedCategory);

    // Real-time subscription
    const channel = supabase
      .channel('registered-schools-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' },  () => fetchRegisteredSchools(page, debouncedSearch, selectedEventId, selectedCategory))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchRegisteredSchools(page, debouncedSearch, selectedEventId, selectedCategory))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => fetchRegisteredSchools(page, debouncedSearch, selectedEventId, selectedCategory))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedEventId, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRegisteredSchools(page, debouncedSearch, selectedEventId, selectedCategory);
  }, [page, debouncedSearch, selectedEventId, selectedCategory, fetchRegisteredSchools]);

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
      fetchRegisteredSchools(safePage, debouncedSearch);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleExportSchools = async () => {
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
      <div className="bg-md-surface-container-low border border-md-outline/5 rounded-[28px] p-4 sm:p-6 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 shadow-sm">
        {/* Search Input Box */}
        <div className="relative w-full xl:max-w-md">
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

        {/* Filters and Exports */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category filter */}
          <div className="flex items-center gap-1 bg-md-surface-container border border-md-outline/10 p-1 rounded-full">
            {['All', 'Primary', 'Secondary'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(0); }}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors ${
                  selectedCategory === cat
                    ? 'bg-md-primary text-md-on-primary shadow-sm'
                    : 'text-md-on-surface-variant hover:bg-md-surface-container-low'
                }`}
              >
                {cat === 'All' ? 'Both' : cat}
              </button>
            ))}
          </div>

          {/* Export Toggles & Trigger */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-md-surface-container border border-md-outline/10 p-1 rounded-full">
              <button onClick={() => setExportFormat('csv')}  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors ${exportFormat === 'csv'  ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container-low'}`}>CSV</button>
              <button onClick={() => setExportFormat('xlsx')} className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors ${exportFormat === 'xlsx' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container-low'}`}>Excel</button>
              <button onClick={() => setExportFormat('docx')} className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors ${exportFormat === 'docx' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant hover:bg-md-surface-container-low'}`}>Word</button>
            </div>
            <Button onClick={handleExportSchools} variant="outline" className="gap-2 shadow-sm font-semibold h-11 rounded-full whitespace-nowrap" disabled={loading || totalCount === 0}>
              <Download size={16} /> Export as {exportFormat.toUpperCase()}
            </Button>
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
                      <TableHead className="py-5 font-semibold text-center">Verified</TableHead>
                      <TableHead className="py-5 text-right font-semibold sticky right-0 bg-md-surface-container/90 backdrop-blur-md">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-md-on-surface-variant font-medium">
                          {searchTerm ? `No schools found matching "${searchTerm}".` : 'No schools have registered yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      schools.map((school) => {
                        const isVerified = verifiedNames instanceof Map && verifiedNames.has(school.name.trim().toLowerCase());
                        const isVerifying = verifyingId === school.id;
                        return (
                          <TableRow
                            key={school.id}
                            className="group hover:bg-md-surface-container transition-colors border-md-outline/5 cursor-pointer"
                            onClick={() => navigate(`/admin/school/${school.id}`)}
                          >
                            <TableCell className="font-bold text-md-on-background py-5">
                              <div className="flex items-center gap-2">
                                <School size={16} className="text-md-on-surface-variant/50 shrink-0" />
                                <span>{school.name}</span>
                                {isVerified && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shrink-0">
                                    <ShieldCheck size={10} /> Verified
                                  </span>
                                )}
                              </div>
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
                            <TableCell className="text-center py-5">
                              <button
                                onClick={(e) => handleVerifySchool(e, school)}
                                disabled={isVerifying}
                                title={isVerified ? 'Click to unverify this school' : 'Click to verify this school'}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 border ${
                                  isVerifying
                                    ? 'bg-md-surface-container text-md-on-surface-variant border-md-outline/20 cursor-wait'
                                    : isVerified
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 group/vbtn'
                                    : 'bg-md-surface-container text-md-on-surface-variant border-md-outline/20 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                }`}
                              >
                                {isVerifying ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    <span>Saving…</span>
                                  </>
                                ) : isVerified ? (
                                  <>
                                    <ShieldCheck size={12} className="group-hover/vbtn:hidden" />
                                    <ShieldOff size={12} className="hidden group-hover/vbtn:block" />
                                    <span className="group-hover/vbtn:hidden">Verified</span>
                                    <span className="hidden group-hover/vbtn:block">Unverify</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={12} />
                                    <span>Verify</span>
                                  </>
                                )}
                              </button>
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
                        );
                      })
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

      {mergeOpen && (
        <MergeSchoolsModal
          onClose={() => setMergeOpen(false)}
          onMerged={() => fetchRegisteredSchools(page, debouncedSearch)}
        />
      )}
    </div>
  );
}
