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
const eventDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lagos",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function currentEventDate() {
  const parts = eventDateFormat.formatToParts(new Date());
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}
