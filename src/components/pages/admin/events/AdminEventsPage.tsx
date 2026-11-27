"use client";

import { useCallback, useEffect, useState } from 'react';

import { EventFormModal } from '@/components/pages/admin/events/EventFormModal';
import { EventsSection } from '@/components/pages/admin/events/EventsSection';
import { supabase } from '@/lib/supabase';
import type { EventWithCounts, ToastMessage } from "@/types/database";

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Toast helper ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  // ── Events state ────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsToast, setEventsToast] = useState<ToastMessage | null>(null);

  const [formError, setFormError] = useState<string | undefined>();

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

  useEffect(() => {
    // Start the initial remote fetches with their loading indicators.
    fetchEvents();
  }, [fetchEvents]);

  // ── Toasts ──────────────────────────────────────────────────────────────────
  function showEventsToast(type: ToastMessage['type'], msg: string) {
    setEventsToast({ type, msg });
    setTimeout(() => setEventsToast(null), 4000);
  }
  // ── Create event ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name.trim() || !form.location.trim() || !form.date) return;
    setCreating(true);
    setFormError(undefined);
    try {
      const { error } = await supabase.from('events').insert({ name: form.name.trim(), location: form.location.trim(), date: form.date, is_open: true });
      if (error) throw error;
      setCreateOpen(false);
      setForm({ name: '', location: '', date: '' });
      showEventsToast('success', 'Event created successfully!');
      void fetchEvents();
    } catch {
      setFormError('Unable to create the event. Please try again. Your details have been kept.');
    } finally {
      setCreating(false);
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
    setFormError(undefined);
    try {
      const { error } = await supabase.from('events').update({ name: editForm.name.trim(), location: editForm.location.trim(), date: editForm.date }).eq('id', editTarget.id);
      if (error) throw error;
      setEditOpen(false);
      setEditTarget(null);
      showEventsToast('success', 'Event updated!');
      void fetchEvents();
    } catch {
      setFormError('Unable to save the event. Please try again. Your changes have been kept.');
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-10 motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">

      {/* ═══════════════════════════════════════════════════════ EVENTS SECTION */}
      <EventsSection
        eventsToast={eventsToast}
        setCreateOpen={(open) => { setFormError(undefined); setCreateOpen(open); }}
        eventsLoading={eventsLoading}
        events={events}
        busyId={busyId}
        handleToggle={handleToggle}
        handleDelete={handleDelete}
        setEditTarget={setEditTarget}
        setEditForm={setEditForm}
        setEditOpen={(open) => { setFormError(undefined); setEditOpen(open); }}
      />

      {/* ── Edit Event Modal ──────────────────────────────────────────────────── */}
      <EventFormModal
        mode="edit"
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
        form={editForm}
        onFormChange={setEditForm}
        error={formError}
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
        error={formError}
        busy={creating}
        onSubmit={handleCreate}
      />

    </div>
  );
}
