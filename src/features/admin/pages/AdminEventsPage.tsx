import { useCallback, useEffect, useState } from 'react';

import { EventFormModal } from '@/features/admin/components/events/EventFormModal';
import { EventsSection } from '@/features/admin/components/events/EventsSection';
import { VerifiedSchoolsSection } from '@/features/admin/components/events/VerifiedSchoolsSection';
import { supabase } from '@/shared/lib/supabase';
import type { AvailableSchoolRow, EventWithCounts, ToastMessage } from "@/shared/types/database";

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Toast helper ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  // ── Events state ────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsToast, setEventsToast] = useState<ToastMessage | null>(null);

  // Create event modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', date: '' });
  const [creating, setCreating] = useState(false);

  // Edit event modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventWithCounts | null>(null); // the event being edited
  const [editForm, setEditForm] = useState({ name: '', location: '', date: '' });
  const [saving, setSaving] = useState(false);

  // Toggle / delete busy state
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Verified schools state ─────────────────────────────────────────────────────
  const [verifiedSchools, setVerifiedSchools] = useState<Pick<AvailableSchoolRow, 'id' | 'name'>[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [schoolBusyId, setSchoolBusyId] = useState<string | null>(null);
  const [schoolsToast, setSchoolsToast] = useState<ToastMessage | null>(null);
  const [addingSchool, setAddingSchool] = useState(false);
  const [registeredSchoolNames, setRegisteredSchoolNames] = useState<string[]>([]);

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
    // Start the initial remote fetches with their loading indicators.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
    fetchSchools();
  }, [fetchEvents, fetchSchools]);

  // ── Toasts ──────────────────────────────────────────────────────────────────
  function showEventsToast(type: ToastMessage['type'], msg: string) {
    setEventsToast({ type, msg });
    setTimeout(() => setEventsToast(null), 4000);
  }
  function showSchoolsToast(type: ToastMessage['type'], msg: string) {
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
  const handleToggle = async (event: EventWithCounts) => {
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
    if (!editTarget || !editForm.name.trim() || !editForm.location.trim() || !editForm.date) return;
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
  const handleDelete = async (event: EventWithCounts) => {
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
  const handleRemoveSchool = async (school: Pick<AvailableSchoolRow, 'id' | 'name'>) => {
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
    <div className="space-y-14 motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">

      {/* ═══════════════════════════════════════════════════════ EVENTS SECTION */}
      <EventsSection
        eventsToast={eventsToast}
        setCreateOpen={setCreateOpen}
        eventsLoading={eventsLoading}
        events={events}
        busyId={busyId}
        handleToggle={handleToggle}
        handleDelete={handleDelete}
        setEditTarget={setEditTarget}
        setEditForm={setEditForm}
        setEditOpen={setEditOpen}
      />

      {/* ══════════════════════════════════════ VERIFIED SCHOOLS SECTION */}
      <VerifiedSchoolsSection
        schoolsToast={schoolsToast}
        newSchoolName={newSchoolName}
        setNewSchoolName={setNewSchoolName}
        registeredSchoolNames={registeredSchoolNames}
        verifiedSchools={verifiedSchools}
        addingSchool={addingSchool}
        handleAddSchool={handleAddSchool}
        schoolsLoading={schoolsLoading}
        schoolBusyId={schoolBusyId}
        handleRemoveSchool={handleRemoveSchool}
      />

      {/* ── Edit Event Modal ──────────────────────────────────────────────────── */}
      <EventFormModal
        mode="edit"
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
        form={editForm}
        onFormChange={setEditForm}
        busy={saving}
        onSubmit={handleSaveEdit}
      />

      {/* ── Create Event Modal ────────────────────────────────────────────────── */}
      <EventFormModal
        mode="create"
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setForm({ name: '', location: '', date: '' }); }}
        form={form}
        onFormChange={setForm}
        busy={creating}
        onSubmit={handleCreate}
      />

    </div>
  );
}
