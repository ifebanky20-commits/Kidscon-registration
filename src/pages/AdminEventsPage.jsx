import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  CalendarDays, MapPin, Plus, Trash2, ToggleLeft, ToggleRight,
  CheckCircle2, AlertCircle, School, ShieldCheck, ShieldOff, Loader2, Pencil,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr + 'T00:00:00') - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl animate-in fade-in duration-300 ${
      toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-md-error/10 text-md-error'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {toast.msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  // ── Events state ────────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsToast, setEventsToast] = useState(null);

  // Create event modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', date: '' });
  const [creating, setCreating] = useState(false);

  // Edit event modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // the event being edited
  const [editForm, setEditForm] = useState({ name: '', location: '', date: '' });
  const [saving, setSaving] = useState(false);

  // Toggle / delete busy state
  const [busyId, setBusyId] = useState(null);

  // ── Verified schools state ─────────────────────────────────────────────────────
  const [verifiedSchools, setVerifiedSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [schoolBusyId, setSchoolBusyId] = useState(null);
  const [schoolsToast, setSchoolsToast] = useState(null);
  const [addingSchool, setAddingSchool] = useState(false);
  const [registeredSchoolNames, setRegisteredSchoolNames] = useState([]);

  // ── Fetch events ─────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('id, name, location, date, is_open, created_at, schools(count)')
      .order('date', { ascending: false });
    if (!error) setEvents(data || []);
    setEventsLoading(false);
  }, []);

  // ── Fetch verified schools ─────────────────────────────────────────────────────────
  const fetchSchools = useCallback(async () => {
    setSchoolsLoading(true);
    const [{ data: verData }, { data: regData }] = await Promise.all([
      supabase.from('available_schools').select('id, name').order('name', { ascending: true }),
      supabase.from('schools').select('name').order('name', { ascending: true }),
    ]);
    if (verData) setVerifiedSchools(verData);
    if (regData) {
      // Unique names from registered schools
      const unique = [...new Set(regData.map((s) => s.name.trim()))].sort();
      setRegisteredSchoolNames(unique);
    }
    setSchoolsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchSchools();
  }, [fetchEvents, fetchSchools]);

  // ── Toasts ──────────────────────────────────────────────────────────────────
  function showEventsToast(type, msg) {
    setEventsToast({ type, msg });
    setTimeout(() => setEventsToast(null), 4000);
  }
  function showSchoolsToast(type, msg) {
    setSchoolsToast({ type, msg });
    setTimeout(() => setSchoolsToast(null), 4000);
  }

  // ── Create event ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name.trim() || !form.location.trim() || !form.date) return;
    setCreating(true);
    const { error } = await supabase.from('events').insert({
      name: form.name.trim(),
      location: form.location.trim(),
      date: form.date,
      is_open: true,
    });
    setCreating(false);
    if (error) {
      showEventsToast('error', 'Failed to create event: ' + error.message);
    } else {
      setCreateOpen(false);
      setForm({ name: '', location: '', date: '' });
      showEventsToast('success', 'Event created successfully!');
      fetchEvents();
    }
  };

  // ── Toggle open/closed ───────────────────────────────────────────────────────
  const handleToggle = async (event) => {
    setBusyId(event.id);
    const { error } = await supabase
      .from('events')
      .update({ is_open: !event.is_open })
      .eq('id', event.id);
    setBusyId(null);
    if (error) {
      showEventsToast('error', 'Failed to update: ' + error.message);
    } else {
      showEventsToast('success', `Registration ${!event.is_open ? 'opened' : 'closed'} for "${event.name}"`);
      fetchEvents();
    }
  };

  // ── Save edit ─────────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.location.trim() || !editForm.date) return;
    setSaving(true);
    const { error } = await supabase
      .from('events')
      .update({
        name: editForm.name.trim(),
        location: editForm.location.trim(),
        date: editForm.date,
      })
      .eq('id', editTarget.id);
    setSaving(false);
    if (error) {
      showEventsToast('error', 'Failed to update: ' + error.message);
    } else {
      setEditOpen(false);
      setEditTarget(null);
      showEventsToast('success', 'Event updated!');
      fetchEvents();
    }
  };

  // ── Delete event ─────────────────────────────────────────────────────────────
  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.name}"? Schools registered for this event will have their event link removed (school records are kept).`)) return;
    setBusyId(event.id);
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    setBusyId(null);
    if (error) {
      showEventsToast('error', 'Failed to delete: ' + error.message);
    } else {
      showEventsToast('success', `"${event.name}" deleted.`);
      fetchEvents();
    }
  };

  // ── Add verified school ───────────────────────────────────────────────────────
  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) return;
    setAddingSchool(true);
    const { error } = await supabase.from('available_schools').insert({ name: newSchoolName.trim() });
    setAddingSchool(false);
    if (error) {
      showSchoolsToast('error', 'Failed to add school: ' + error.message);
    } else {
      setNewSchoolName('');
      showSchoolsToast('success', `"${newSchoolName.trim()}" added to verified list.`);
      fetchSchools();
    }
  };

  // ── Remove verified school ────────────────────────────────────────────────────
  const handleRemoveSchool = async (school) => {
    if (!window.confirm(`Remove "${school.name}" from the verified list?`)) return;
    setSchoolBusyId(school.id);
    const { error } = await supabase.from('available_schools').delete().eq('id', school.id);
    setSchoolBusyId(null);
    if (error) {
      showSchoolsToast('error', 'Failed to remove: ' + error.message);
    } else {
      showSchoolsToast('success', `"${school.name}" removed.`);
      fetchSchools();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">

      {/* ═══════════════════════════════════════════════════════ EVENTS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Events</h1>
            <p className="text-md-on-surface-variant font-medium mt-1">
              Create and manage KIDSCON programs. Each event has its own registration pool.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Toast toast={eventsToast} />
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 h-11 px-6 shrink-0"
            >
              <Plus size={18} /> New Event
            </Button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-md-outline/20 rounded-[32px] bg-md-surface-container-low">
            <CalendarDays size={40} className="mx-auto text-md-on-surface-variant/40 mb-4" />
            <p className="text-md-on-surface-variant font-semibold text-lg">No events yet</p>
            <p className="text-sm text-md-on-surface-variant/70 mt-1">Create your first program to get started.</p>
            <Button onClick={() => setCreateOpen(true)} variant="secondary" className="mt-6 gap-2">
              <Plus size={16} /> Create Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {events.map((event) => {
              const days = daysUntil(event.date);
              const isPast = days < 0;
              const schoolCount = event.schools?.[0]?.count ?? 0;
              const busy = busyId === event.id;

              return (
                <Card
                  key={event.id}
                  className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low shadow-none hover:shadow-md transition-shadow duration-300"
                >
                  <CardContent className="p-6 flex flex-col gap-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-bold text-xl text-md-on-background tracking-tight truncate">{event.name}</h2>
                          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            event.is_open && !isPast
                              ? 'bg-emerald-100 text-emerald-700'
                              : isPast
                              ? 'bg-md-surface-container text-md-on-surface-variant/60'
                              : 'bg-md-error/10 text-md-error'
                          }`}>
                            {isPast ? 'Ended' : event.is_open ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-sm text-md-on-surface-variant font-medium">
                          <MapPin size={13} className="shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-sm text-md-on-surface-variant font-medium">
                          <CalendarDays size={13} className="shrink-0" />
                          <span>{formatDate(event.date)}</span>
                          {!isPast && (
                            <span className="ml-1 text-xs text-md-primary font-semibold">
                              ({days === 0 ? 'Today!' : `${days}d away`})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* School count badge */}
                      <div className="shrink-0 text-center bg-md-secondary-container text-md-on-secondary-container rounded-2xl px-4 py-3 min-w-[60px]">
                        <p className="text-2xl font-extrabold leading-none">{schoolCount}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide mt-1 opacity-75">Schools</p>
                      </div>
                    </div>

                    {/* Shareable registration link */}
                    <div className="bg-md-surface-container rounded-2xl px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant/60 mb-1">Registration Link</p>
                      <p className="text-xs font-mono text-md-primary break-all select-all">
                        {window.location.origin}/register?event={event.id}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-md-outline/10">
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditTarget(event);
                          setEditForm({ name: event.name, location: event.location, date: event.date });
                          setEditOpen(true);
                        }}
                        className="h-10 w-10 flex items-center justify-center rounded-full text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 transition-colors"
                        title="Edit event"
                      >
                        <Pencil size={15} />
                      </button>
                      <Button
                        variant="ghost"
                        className={`flex-1 gap-2 h-10 text-sm font-semibold ${
                          event.is_open
                            ? 'text-md-error hover:bg-md-error/10'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => handleToggle(event)}
                        disabled={busy || isPast}
                      >
                        {busy ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : event.is_open ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                        {event.is_open ? 'Close Registration' : 'Open Registration'}
                      </Button>

                      <button
                        onClick={() => handleDelete(event)}
                        disabled={busy}
                        className="h-10 w-10 flex items-center justify-center rounded-full text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════ VERIFIED SCHOOLS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-md-on-background tracking-tight flex items-center gap-2">
              <ShieldCheck size={22} className="text-md-primary" />
              Verified Schools List
            </h2>
            <p className="text-md-on-surface-variant font-medium mt-1">
              Schools on this list get a verified badge on the registration form.
            </p>
          </div>
          <Toast toast={schoolsToast} />
        </div>

        <Card className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low max-w-2xl">
          <CardContent className="p-6 space-y-5">
            {/* Add school input with registered schools dropdown */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  list="registered-schools-list"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSchool()}
                  placeholder="Select or type a school name…"
                  className="w-full h-11 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
                />
                {/* Datalist: registered schools not yet verified */}
                <datalist id="registered-schools-list">
                  {registeredSchoolNames
                    .filter((name) => !verifiedSchools.some(
                      (v) => v.name.toLowerCase() === name.toLowerCase()
                    ))
                    .map((name) => (
                      <option key={name} value={name} />
                    ))}
                </datalist>
              </div>
              <Button
                onClick={handleAddSchool}
                disabled={addingSchool || !newSchoolName.trim()}
                className="h-11 px-5 gap-2 shrink-0"
              >
                {addingSchool ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Add
              </Button>
            </div>

            {/* List */}
            {schoolsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-3 border-md-secondary-container border-t-md-primary animate-spin" />
              </div>
            ) : verifiedSchools.length === 0 ? (
              <div className="text-center py-10 text-md-on-surface-variant">
                <ShieldOff size={28} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium text-sm">No verified schools yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-md-outline/10">
                {verifiedSchools.map((school) => (
                  <li key={school.id} className="flex items-center justify-between py-3 px-2 group hover:bg-md-surface-container/50 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <School size={15} className="text-md-primary shrink-0" />
                      <span className="font-medium text-md-on-background text-sm">{school.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveSchool(school)}
                      disabled={schoolBusyId === school.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 p-2 rounded-full"
                      title="Remove from verified list"
                    >
                      {schoolBusyId === school.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Edit Event Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
        title={`Edit Event`}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Event / Program Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="e.g. KIDSCON Lagos 2026"
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Location / Venue</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              placeholder="e.g. Eko Hotel, Lagos"
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Event Date</label>
            <input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-md-outline/10">
            <Button variant="ghost" onClick={() => { setEditOpen(false); setEditTarget(null); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.name.trim() || !editForm.location.trim() || !editForm.date}
              className="gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Create Event Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setForm({ name: '', location: '', date: '' }); }} title="Create New Event">
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Event / Program Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. KIDSCON Lagos 2026"
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Location / Venue</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Eko Hotel, Lagos"
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">Event Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-md-outline/10">
            <Button variant="ghost" onClick={() => { setCreateOpen(false); setForm({ name: '', location: '', date: '' }); }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.name.trim() || !form.location.trim() || !form.date}
              className="gap-2"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {creating ? 'Creating…' : 'Create Event'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
