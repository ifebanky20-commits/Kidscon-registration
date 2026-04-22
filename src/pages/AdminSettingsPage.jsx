import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarDays, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'next_event')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          setEventName(parsed.name || '');
          setEventDate(parsed.date || '');
        }
        setLoadingSettings(false);
      });
  }, []);

  const handleSave = async () => {
    if (!eventDate) return;
    setSaving(true);
    setToast(null);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'next_event', value: JSON.stringify({ name: eventName, date: eventDate }) });
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: 'Failed to save — ' + error.message });
    } else {
      setToast({ type: 'success', msg: 'Saved! The countdown on the landing page is now updated.' });
    }
    setTimeout(() => setToast(null), 5000);
  };

  // Compute a preview of the countdown with the current inputs
  const previewMs = eventDate ? new Date(eventDate + 'T00:00:00') - new Date() : 0;
  const previewDays = previewMs > 0 ? Math.floor(previewMs / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">

      <div>
        <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Settings</h1>
        <p className="text-md-on-surface-variant font-medium mt-1">
          Manage site-wide settings like the next program date.
        </p>
      </div>

      <Card className="rounded-[28px] border-none bg-md-surface-container-low ring-1 ring-md-outline/10 md-elevation-1 max-w-2xl">
        <CardContent className="p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-md-primary/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-md-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-md-on-background tracking-tight">Next Program</h2>
              <p className="text-sm text-md-on-surface-variant">
                This controls the countdown timer visible on the public landing page.
              </p>
            </div>
          </div>

          {loadingSettings ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="event-name"
                    className="text-xs font-bold text-md-on-surface-variant uppercase tracking-widest"
                  >
                    Event / Program Name
                  </label>
                  <input
                    id="event-name"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. KIDSCON 2026"
                    className="px-4 py-3 rounded-xl bg-md-surface-container border border-md-outline/30 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/50 transition font-medium text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="event-date"
                    className="text-xs font-bold text-md-on-surface-variant uppercase tracking-widest"
                  >
                    Event Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-md-surface-container border border-md-outline/30 text-md-on-background focus:outline-none focus:ring-2 focus:ring-md-primary/50 transition font-medium text-sm"
                  />
                </div>
              </div>

              {/* Preview */}
              {eventDate && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  previewDays > 0
                    ? 'bg-md-primary/8 text-md-primary'
                    : 'bg-md-error/8 text-md-error'
                }`}>
                  <Clock size={16} className="shrink-0" />
                  {previewDays > 0
                    ? `The countdown will show ${previewDays} day${previewDays === 1 ? '' : 's'} remaining. It will be hidden automatically once the date passes.`
                    : 'This date has already passed. The countdown will be hidden on the landing page until you set a future date.'}
                </div>
              )}

              {/* Save row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving || !eventDate}
                  className="h-11 px-8"
                >
                  {saving ? 'Saving…' : 'Save & Update Countdown'}
                </Button>

                {toast && (
                  <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl animate-in fade-in duration-300 ${
                    toast.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-md-error/10 text-md-error'
                  }`}>
                    {toast.type === 'success'
                      ? <CheckCircle2 size={16} />
                      : <AlertCircle size={16} />}
                    {toast.msg}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
