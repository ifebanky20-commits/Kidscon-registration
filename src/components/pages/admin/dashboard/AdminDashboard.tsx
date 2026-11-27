"use client";

import {
  ArrowUpRight,
  BarChart3,
  Download,
  CalendarDays,
  ChevronRight,
  School,
  Trash2,
  Users,
  House,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { EventPicker } from "@/components/pages/admin/dashboard/EventPicker";
import { useEvent } from "@/components/pages/admin/events/event-context";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { dashboardQueryKey, useDashboard } from "@/components/pages/admin/dashboard/dashboardQuery";
import { registeredSchoolsKey } from "@/components/pages/admin/schools/registeredSchools";
import { deleteRegisteredSchool } from "@/components/pages/admin/schools/deleteRegisteredSchool";
import type { SchoolCounts } from "@/types/database";
import { getErrorMessage } from "@/utils/error";

export default function AdminDashboard() {
  const router = useRouter();

  const { events, selectedEventId, setSelectedEventId } = useEvent();

  const queryClient = useQueryClient();
  const { data, isPending: loading, isError, refetch } = useDashboard(selectedEventId);
  const { totalSchools, totalStudents, recent } = data ?? {
    totalSchools: 0,
    totalStudents: 0,
    recent: [],
  };

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
      await deleteRegisteredSchool(school.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete: ${getErrorMessage(err) || JSON.stringify(err)}`);
    } finally {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      void queryClient.invalidateQueries({ queryKey: registeredSchoolsKey });
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
            href="/admin/analysis"
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
            value: data ? totalSchools.toLocaleString() : "—",
            icon: House,
            detail: "Schools taking part",
            color: "bg-brand-tint text-brand-primary",
          },
          {
            label: "Registered students",
            value: data ? totalStudents.toLocaleString() : "—",
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
              {loading ? (
                <Skeleton className="mt-4 h-10 w-20" />
              ) : (
                <p className="mt-4 text-4xl font-medium tracking-[-0.055em] text-brand-ink">{value}</p>
              )}
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
          href="/admin/schools"
          className="text-sm font-semibold text-md-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight size={15} />
        </Link>
      </div>
      {loading && <p className="sr-only" role="status">Loading registrations</p>}
      {isError && !data ? (
        <div role="alert" className="rounded-xl border border-brand-line p-5">
          <p>Couldn’t load registration data.</p>
          <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
            Try again
          </Button>
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
          <TableBody aria-busy={loading}>
            {loading ? (
              [1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row} aria-hidden="true">
                  <TableCell className="py-5"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-8 w-20 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : recent.length === 0 ? (
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
                  onClick={() => router.push(`/admin/schools/${school.id}`)}
                >
                  <TableCell className="font-medium text-brand-ink py-5">
                    <Link
                      href={`/admin/schools/${school.id}`}
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
                          href={`/admin/schools/${school.id}`}
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
