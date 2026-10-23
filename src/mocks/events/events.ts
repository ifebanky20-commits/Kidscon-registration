import type { EventRow } from "@/types/database";

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const mockEvents: EventRow[] = [
  { id: "demo-discovery", name: "KIDSCON Discovery Day", location: "Ikeja, Lagos", date: futureDate(21), is_open: true, created_at: new Date().toISOString() },
  { id: "demo-creative", name: "Creative Minds Festival", location: "Ibadan, Oyo", date: futureDate(35), is_open: true, created_at: new Date().toISOString() },
  { id: "demo-science", name: "Young Explorers Science Fair", location: "Abuja, FCT", date: futureDate(49), is_open: true, created_at: new Date().toISOString() },
];
