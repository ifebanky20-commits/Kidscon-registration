export function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function daysUntil(dateStr: string) {
  const diff = new Date(dateStr + 'T00:00:00').getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}