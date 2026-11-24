"use client";

import { House } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AdminPageHeading } from "@/components/pages/admin/ui/AdminPageHeading";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  Loader2,
  School,
  Users,
} from "lucide-react";

import { useState } from "react";

import { ExportCard } from "@/components/pages/admin/exports/ExportCard";
import { useEvent } from "@/components/pages/admin/events/event-context";
import {
  buildCsv,
  downloadCsv,
  downloadExcel,
  downloadWord,
} from "@/components/pages/admin/exports/export";
import { useExportData } from "@/components/pages/admin/exports/useExportData";

export default function AdminExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState("xlsx"); // 'csv' | 'xlsx' | 'docx'
  const [error, setError] = useState("");

  // Event filter — shared via context
  const { events, selectedEventId, setSelectedEventId } = useEvent();

  const { data, isPending: loading, isError, refetch } = useExportData(selectedEventId);
  const schools = data?.schools ?? [];
  const allStudents = data?.students ?? [];

  const handleExportAll = async () => {
    setExporting("all");
    setError("");
    try {
      const headers = [
        "S/N",
        "Student Name",
        "Gender",
        "Class / Grade",
        "School",
        "Category",
        "Registration Date",
      ];
      const rows = allStudents.map((s, i) => [
        i + 1,
        s.name,
        s.gender,
        s.class,
        s.school_name,
        s.school_category || "",
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === "csv") {
        downloadCsv(
          `kidscon_all_students_${date}.csv`,
          buildCsv(headers, rows),
        );
      } else if (exportFormat === "xlsx") {
        downloadExcel(`kidscon_all_students_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(
          `kidscon_all_students_${date}.docx`,
          "All Students Report",
          headers,
          rows,
        );
      }
      setExported("all");
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportSchool = async (school: (typeof schools)[number]) => {
    setExporting(school.id);
    setError("");
    try {
      const headers = [
        "S/N",
        "Student Name",
        "Gender",
        "Class / Grade",
        "Registration Date",
      ];
      const rows = (school.students || []).map((s, i) => [
        i + 1,
        s.name,
        s.gender,
        s.class,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const safeName = school.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === "csv") {
        downloadCsv(`kidscon_${safeName}_${date}.csv`, buildCsv(headers, rows));
      } else if (exportFormat === "xlsx") {
        downloadExcel(`kidscon_${safeName}_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(
          `kidscon_${safeName}_${date}.docx`,
          `${school.name} — Student List`,
          headers,
          rows,
        );
      }
      setExported(school.id);
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportSchoolsOverview = async () => {
    setExporting("schools");
    setError("");
    try {
      const headers = [
        "School Name",
        "Category",
        "Contact Person",
        "Phone",
        "Address",
        "Total Students",
        "Registered On",
      ];
      const rows = schools.map((s) => [
        s.name,
        s.category || "",
        s.contact_person || "",
        s.phone || "",
        s.address || "",
        s.students?.length || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (exportFormat === "csv") {
        downloadCsv(
          `kidscon_schools_overview_${date}.csv`,
          buildCsv(headers, rows),
        );
      } else if (exportFormat === "xlsx") {
        downloadExcel(`kidscon_schools_overview_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(
          `kidscon_schools_overview_${date}.docx`,
          "Schools Overview Report",
          headers,
          rows,
        );
      }
      setExported("schools");
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportAttendance = async () => {
    setExporting("attendance");
    setError("");
    try {
      const headers = [
        "S/N",
        "Student Name",
        "Gender",
        "Class / Grade",
        "School",
        "Category",
        "Attendance",
      ];
      const rows = allStudents.map((s, i) => [
        i + 1,
        s.name,
        s.gender,
        s.class,
        s.school_name,
        s.school_category || "",
        "",
      ]);
      downloadCsv("kidscon.csv", buildCsv(headers, rows));
      setExported("attendance");
      setTimeout(() => setExported(null), 3000);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div role="alert" className="rounded-xl border border-brand-line p-5">
        <p>Couldn’t load the report data.</p>
        <button className="mt-3 underline" onClick={() => void refetch()}>Try again</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-7">
        <AdminPageHeading title="Export registrations" description="Download registration data in your preferred format." />
        <div role="status">
          <span className="sr-only">Loading registration reports</span>
          <div className="grid gap-4 sm:grid-cols-3">
            {["students", "schools", "attendance"].map((report) => (
              <div key={report} className="space-y-4 rounded-2xl border border-brand-line bg-brand-surface p-5">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-7 h-48 rounded-2xl bg-brand-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdminPageHeading
          title="Export registrations"
          description={
            <>
              {" "}
              Download registration data instantly in your preferred
              format.{" "}
            </>
          }
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Event filter */}
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-muted" />
              <div className="relative">
                <select
                  aria-label="Filter by event"
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(e.target.value || null)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-xl border border-brand-line bg-brand-wash text-brand-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-md-primary/40 transition cursor-pointer"
                >
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
              </div>
            </div>
          )}
          {/* Format Picker: CSV | Excel | Word */}
          <div className="flex items-center gap-1 bg-brand-surface border border-brand-line p-1.5 rounded-xl shadow-none">
            <button
              onClick={() => setExportFormat("csv")}
              className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-colors ${exportFormat === "csv" ? "bg-md-primary text-md-on-primary shadow-sm" : "text-brand-muted hover:bg-brand-wash"}`}
            >
              CSV
            </button>
            <button
              onClick={() => setExportFormat("xlsx")}
              className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-colors ${exportFormat === "xlsx" ? "bg-md-primary text-md-on-primary shadow-sm" : "text-brand-muted hover:bg-brand-wash"}`}
            >
              Excel
            </button>
            <button
              onClick={() => setExportFormat("docx")}
              className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-colors ${exportFormat === "docx" ? "bg-md-primary text-md-on-primary shadow-sm" : "text-brand-muted hover:bg-brand-wash"}`}
            >
              Word
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-md-error/10 text-md-error p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-brand-line bg-brand-surface text-brand-ink rounded-2xl p-6 flex flex-col gap-1">
          <House size={22} className="opacity-70" />
          <p className="text-3xl font-medium tracking-tight mt-2">
            {schools.length}
          </p>
          <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">
            Schools
          </p>
        </div>
        <div className="border border-brand-line bg-brand-surface text-brand-ink rounded-2xl p-6 flex flex-col gap-1">
          <Users size={22} className="opacity-70" />
          <p className="text-3xl font-medium tracking-tight mt-2">
            {allStudents.length}
          </p>
          <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">
            Students
          </p>
        </div>
      </div>

      {/* Master exports */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-brand-ink tracking-tight">
          Master Exports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ExportCard
            icon={<Users size={22} />}
            title="All Students"
            description={`${allStudents.length} students across all schools`}
            color="primary"
            loading={exporting === "all"}
            done={exported === "all"}
            onExport={handleExportAll}
            disabled={allStudents.length === 0}
            format={exportFormat}
          />

          <ExportCard
            icon={<House size={22} />}
            title="Schools Overview"
            description={`${schools.length} schools with enrollment counts`}
            color="secondary"
            loading={exporting === "schools"}
            done={exported === "schools"}
            onExport={handleExportSchoolsOverview}
            disabled={schools.length === 0}
            format={exportFormat}
          />

          <ExportCard
            icon={<ClipboardList size={22} />}
            title="Attendance Sheet"
            description={`${allStudents.length} students — ready for attendance marking`}
            color="tertiary"
            loading={exporting === "attendance"}
            done={exported === "attendance"}
            onExport={handleExportAttendance}
            disabled={allStudents.length === 0}
            format="csv"
          />
        </div>
      </div>

      {/* Per-school exports */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-brand-ink tracking-tight">
          Export by School
        </h2>

        {schools.length === 0 ? (
          <p className="text-brand-muted font-medium py-8 text-center">
            No schools registered yet.
          </p>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-brand-line bg-brand-surface">
            {schools.map((school, idx) => (
              <div
                key={school.id}
                className={`flex items-center justify-between px-6 py-4 gap-4 hover:bg-brand-wash transition-colors ${idx !== schools.length - 1 ? "border-b border-brand-line" : ""}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-tint text-brand-primary flex items-center justify-center shrink-0 font-medium text-sm">
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-ink truncate">
                      {school.name}
                    </p>
                    <p className="text-sm text-brand-muted font-medium">
                      {school.students?.length || 0} students
                      {school.category ? ` · ${school.category}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExportSchool(school)}
                  disabled={
                    exporting === school.id ||
                    (school.students?.length || 0) === 0
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                    exported === school.id
                      ? "bg-brand-tint text-brand-primary"
                      : (school.students?.length || 0) === 0
                        ? "bg-brand-wash text-brand-muted/40 cursor-not-allowed"
                        : "bg-brand-tint text-brand-primary hover:bg-md-primary hover:text-md-on-primary"
                  }`}
                >
                  {exporting === school.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : exported === school.id ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Download size={14} />
                  )}
                  {exported === school.id
                    ? "Exported!"
                    : (school.students?.length || 0) === 0
                      ? "No Data"
                      : `Export ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable export card ───────────────────────────────────────────────────────
