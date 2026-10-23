import {
  ArrowUpRight,
  BarChart3,
  Download,
  LoaderCircle,
  CalendarDays,
  ChevronRight,
  School,
  Trash2,
  Users,
  House,
  PieChart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCallback, useEffect, useState } from "react";

import { EventPicker } from "@/components/admin/dashboard/EventPicker";
import { useEvent } from "@/contexts/event-context";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { supabase } from "@/lib/supabase";
import type { SchoolCounts } from "@/types/database";
import { getErrorMessage } from "@/utils/error";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { events, selectedEventId, setSelectedEventId } = useEvent();

  const [totalSchools, setTotalSchools] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recent, setRecent] = useState<SchoolCounts[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch aggregate counts filtered by event
  const fetchTotals = useCallback(async (eventId: string | null) => {
    let schoolQ = supabase
      .from("schools")
      .select("*", { count: "exact", head: true });
    let studentQ = supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (eventId) {
      schoolQ = schoolQ.eq("event_id", eventId);
      // Students: count those belonging to schools of this event
      const { data: schoolIds } = await supabase
        .from("schools")
        .select("id")
        .eq("event_id", eventId);
      const ids = (schoolIds || []).map((s) => s.id);
      if (ids.length > 0) {
        studentQ = studentQ.in("school_id", ids);
      } else {
        setTotalStudents(0);
        const [{ count: sc }] = await Promise.all([schoolQ]);
        setTotalSchools(sc ?? 0);
        return;
      }
    }

    const [{ count: sc }, { count: st }] = await Promise.all([
      schoolQ,
      studentQ,
    ]);
    setTotalSchools(sc ?? 0);
    setTotalStudents(st ?? 0);
  }, []);

  // Fetch 5 most recent schools filtered by event
  const fetchRecent = useCallback(async (eventId: string | null) => {
    setLoading(true);
    let query = supabase
      .from("schools")
      .select("id, name, created_at, students(count)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (eventId) query = query.eq("event_id", eventId);

    const { data, error } = await query;
    if (!error) setRecent(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Refresh remote data and show the loading state when the event filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTotals(selectedEventId);
    fetchRecent(selectedEventId);

    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schools" },
        () => {
          fetchTotals(selectedEventId);
          fetchRecent(selectedEventId);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchTotals(selectedEventId);
          fetchRecent(selectedEventId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedEventId, fetchTotals, fetchRecent]);

  const handleDeleteSchool = async (
    e: React.MouseEvent,
    school: SchoolCounts,
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete "${school.name}" and all its student records? This cannot be undone.`,
      )
    )
      return;
    try {
      await supabase.from("students").delete().eq("school_id", school.id);
      await supabase.from("teachers").delete().eq("school_id", school.id);
      await supabase.from("schools").delete().eq("id", school.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete: ${getErrorMessage(err) || JSON.stringify(err)}`);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-7 motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-medium text-brand-ink tracking-[-0.045em] sm:text-4xl">
            Registration overview
          </h1>
          <p className="text-brand-muted text-sm leading-7 mt-3">
            A little overview of the big things happening at KIDSCON.
          </p>
        </div>
        {/* Event Filter */}
        {events.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <CalendarDays size={16} className="text-md-on-surface-variant" />
            <EventPicker
              events={events}
              selectedId={selectedEventId}
              onChange={setSelectedEventId}
            />
          </div>
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-brand-line bg-brand-wash p-6 text-brand-ink sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[40px] border-brand-primary/5" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-lg">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.17em] text-brand-muted">
              Every registration is a new possibility
            </p>
            <h2 className="text-3xl font-medium leading-[1.13] tracking-[-0.055em] sm:text-4xl">
              Small steps. Big futures.
            </h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Keep your schools, students and events moving together. Everything
              you need for the next great experience is right here.
            </p>
          </div>
          <Link
            to="/admin/analysis"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand-action px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-action-hover sm:self-auto"
          >
            Explore analytics <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <section
        aria-label="Registration summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: "Registered schools",
            value: totalSchools.toLocaleString(),
            icon: House,
            detail: "Schools taking part",
            color: "bg-brand-tint text-brand-primary",
          },
          {
            label: "Registered students",
            value: totalStudents.toLocaleString(),
            icon: Users,
            detail: "Young minds ready to explore",
            color: "bg-brand-highlight text-brand-on-highlight",
          },
          {
            label: "Students per school",
            value: totalSchools
              ? Math.round(totalStudents / totalSchools).toLocaleString()
              : "—",
            icon: PieChart,
            detail: "Average across registered schools",
            color: "bg-brand-soft text-brand-muted",
          },
        ].map(({ label, value, icon: Icon, detail, color }) => (
          <Card
            key={label}
            className="rounded-2xl border border-brand-line bg-brand-surface shadow-none hover:shadow-none hover:border-brand-line"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-brand-muted">{label}</p>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-4xl font-medium tracking-[-0.055em] text-brand-ink">
                {value}
              </p>
              <p className="mt-2 text-xs text-brand-muted">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Latest 5 Registrations */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-brand-ink tracking-[-0.035em]">
          Latest registrations
        </h2>
        <Link
          to="/admin/schools"
          className="text-sm font-semibold text-md-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight size={15} />
        </Link>
      </div>
      {/* <div className="space-y-4 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-6"> */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span
            role="status"
            className="flex items-center gap-3 text-sm text-brand-muted"
          >
            <LoaderCircle
              size={24}
              strokeWidth={1.6}
              className="motion-safe:animate-spin"
              aria-hidden="true"
            />
            Loading registrations…
          </span>
        </div>
      ) : (
        <Table className="min-w-160 overflow-hidden bg-brand-surface">
          <TableHeader className="bg-brand-wash">
            <TableRow className="border-md-outline/10">
              <TableHead className="py-5 font-semibold">School Name</TableHead>
              <TableHead className="py-5 font-semibold">Students</TableHead>
              <TableHead className="py-5 font-semibold">
                Date Registered
              </TableHead>
              <TableHead className="py-5 text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-md-on-surface-variant font-medium"
                >
                  {selectedEvent
                    ? `No registrations yet for ${selectedEvent.name}.`
                    : "Waiting for initial registrations…"}
                </TableCell>
              </TableRow>
            ) : (
              recent.map((school) => (
                <TableRow
                  key={school.id}
                  className="group hover:bg-md-surface-container border-md-outline/5 cursor-pointer"
                  onClick={() => navigate(`/admin/school/${school.id}`)}
                >
                  <TableCell className="font-medium text-brand-ink py-5">
                    <Link
                      to={`/admin/school/${school.id}`}
                      className="hover:text-brand-primary hover:underline"
                    >
                      {school.name}
                    </Link>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="bg-md-primary/10 text-md-primary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                      {school.students[0]?.count || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-md-on-surface-variant font-medium py-5">
                    {new Date(school.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="bg-md-secondary-container/50 hover:bg-md-secondary-container"
                      >
                        <Link
                          to={`/admin/school/${school.id}`}
                          className="gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View <ChevronRight size={16} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteSchool(e, school)}
                        className="text-md-error hover:bg-md-error/10 hover:text-md-error"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete {school.name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      {/* </div> */}
    </div>
  );
}
