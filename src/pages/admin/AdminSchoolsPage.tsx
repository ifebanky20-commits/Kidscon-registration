import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  Download,
  GitMerge,
  House,
  School,
  Search,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useEffect, useState } from "react";

import { MergeSchoolsModal } from "@/components/admin/schools/MergeSchoolsModal";
import { RegisteredSchoolsTable } from "@/components/admin/schools/RegisteredSchoolsTable";
import { useEvent } from "@/contexts/event-context";
import {
  buildCsv,
  downloadCsv,
  downloadExcel,
  downloadWord,
} from "@/utils/export";
import { Button } from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { supabase } from "@/lib/supabase";
import type { SchoolSummary } from "@/types/database";
import { getErrorMessage } from "@/utils/error";
import { Card, CardContent } from "@/components/ui/Card";

const PAGE_SIZE = 10;

// ─── Merge Duplicates Modal ────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────

export default function AdminSchoolsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Event filter — shared via context
  const { events, selectedEventId, setSelectedEventId } = useEvent();

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [page, setPage] = useState(0);

  // Debounce search — reset to page 0 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // React Query: Verified Schools (cached mapping)
  const { data: verifiedNamesMap } = useQuery({
    queryKey: ["verifiedSchools"],
    queryFn: async () => {
      const { data } = await supabase
        .from("available_schools")
        .select("id, name");
      if (!data) return new Map();
      return new Map(data.map((s) => [s.name.trim().toLowerCase(), s.id]));
    },
  });
  const verifiedNames = verifiedNamesMap || new Map();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifySchool = async (
    e: React.MouseEvent,
    school: Pick<SchoolSummary, "id" | "name">,
  ) => {
    e.stopPropagation();
    const key = school.name.trim().toLowerCase();
    const existingId = verifiedNames.get(key);
    setVerifyingId(school.id);
    try {
      if (existingId) {
        await supabase.from("available_schools").delete().eq("id", existingId);
      } else {
        await supabase
          .from("available_schools")
          .insert({ name: school.name.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ["verifiedSchools"] });
    } catch (err) {
      console.error("Verification toggle failed:", err);
    } finally {
      setVerifyingId(null);
    }
  };

  // React Query: Registered Schools (paginated & filtered)
  const { data: schoolsData, isLoading: loading } = useQuery({
    queryKey: [
      "registeredSchools",
      page,
      debouncedSearch,
      selectedEventId,
      selectedCategory,
    ],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from("schools")
        .select(
          `
          id, name, category, address, contact_person, phone, created_at,
          students(count), teachers(count)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (debouncedSearch) query = query.ilike("name", `%${debouncedSearch}%`);
      if (selectedEventId) query = query.eq("event_id", selectedEventId);
      if (selectedCategory && selectedCategory !== "All")
        query = query.ilike("category", `%${selectedCategory}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      return { schools: data || [], totalCount: count ?? 0 };
    },
    placeholderData: (previousData) => previousData, // Smooth pagination without jitter
  });

  const schools = schoolsData?.schools || [];
  const totalCount = schoolsData?.totalCount || 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("registered-schools-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schools" },
        () =>
          queryClient.invalidateQueries({ queryKey: ["registeredSchools"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () =>
          queryClient.invalidateQueries({ queryKey: ["registeredSchools"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teachers" },
        () =>
          queryClient.invalidateQueries({ queryKey: ["registeredSchools"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "available_schools" },
        () => queryClient.invalidateQueries({ queryKey: ["verifiedSchools"] }),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDeleteSchool = async (
    e: React.MouseEvent,
    school: Pick<SchoolSummary, "id" | "name">,
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete "${school.name}" and all its student/teacher records? This cannot be undone.`,
      )
    )
      return;
    try {
      await supabase.from("students").delete().eq("school_id", school.id);
      await supabase.from("teachers").delete().eq("school_id", school.id);
      await supabase.from("schools").delete().eq("id", school.id);

      queryClient.invalidateQueries({ queryKey: ["registeredSchools"] });

      const newTotal = totalCount - 1;
      const newPageCount = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const safePage = Math.min(page, newPageCount - 1);
      setPage(safePage);
      toast.success(`"${school.name}" deleted successfully.`);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(
        `Failed to delete: ${getErrorMessage(err) || JSON.stringify(err)}`,
      );
    }
  };

  const handleExportSchools = async (format: "csv" | "xlsx" | "docx") => {
    // Export ALL schools for selected event + category (not just current page)
    try {
      let query = supabase
        .from("schools")
        .select(
          "id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)",
        )
        .order("created_at", { ascending: false });
      if (selectedEventId) query = query.eq("event_id", selectedEventId);
      if (selectedCategory && selectedCategory !== "All")
        query = query.ilike("category", `%${selectedCategory}%`);
      const { data: allSchools } = await query;
      const headers = [
        "School Name",
        "Category",
        "Contact Person",
        "Phone",
        "Address",
        "Total Students",
        "Total Teachers",
        "Registered On",
      ];
      const rows = (allSchools || []).map((s) => [
        s.name,
        s.category || "",
        s.contact_person || "",
        s.phone || "",
        s.address || "",
        s.students[0]?.count || 0,
        s.teachers[0]?.count || 0,
        new Date(s.created_at).toLocaleDateString(),
      ]);
      const date = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        downloadCsv(
          `kidscon_registered_schools_${date}.csv`,
          buildCsv(headers, rows),
        );
      } else if (format === "xlsx") {
        downloadExcel(`kidscon_registered_schools_${date}.xlsx`, headers, rows);
      } else {
        await downloadWord(
          `kidscon_registered_schools_${date}.docx`,
          "Registered Schools Report",
          headers,
          rows,
        );
      }
      toast.success("Export completed successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export. Please try again.");
    }
  };

  return (
    <div className="space-y-7 pb-12 motion-safe:animate-enter [--enter-y:1rem] duration-500 ease-md">
      {/* ── HEADER ROW ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-[-0.045em] text-brand-ink sm:text-4xl">
            Registered schools
          </h1>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Browse, verify and manage the schools taking part in KIDSCON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Event filter */}
          {events.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-line bg-brand-surface px-3">
              <CalendarDays size={16} className="text-brand-muted" />
              <div className="relative">
                <select
                  aria-label="Filter by event"
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value || null);
                    setPage(0);
                  }}
                  className="h-11 appearance-none bg-transparent py-2 pl-1 pr-8 text-sm font-medium text-brand-ink transition focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="">All events</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-brand-muted"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

          <Button
            onClick={() => setMergeOpen(true)}
            variant="outline"
            className="h-11 gap-2 rounded-xl border-brand-line px-4 text-brand-ink hover:bg-brand-soft"
          >
            <GitMerge size={17} /> Merge duplicates
          </Button>
        </div>
      </div>

      <section
        aria-label="Registration summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: "Registered schools",
            value: 10,
            icon: House,
            detail: "Schools taking part",
          },
          {
            label: "Verified schools",
            value: 3,
            icon: Users,
            detail: "Verified schools",
          },
        ].map(({ label, value, detail }) => (
          <Card
            key={label}
            className="rounded-2xl border border-brand-line bg-brand-surface shadow-none hover:shadow-none hover:border-brand-line"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-brand-muted">{label}</p>
              </div>
              <p className="mt-4 text-4xl font-medium tracking-[-0.055em] text-brand-ink">
                {value}
              </p>
              <p className="mt-2 text-xs text-brand-muted">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── FILTER & ACTION CARD ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input Box */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search by school name"
            placeholder="Search by school name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-xl border border-brand-line bg-brand-canvas pl-11 pr-10 text-sm text-brand-ink transition placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-brand-muted transition hover:bg-brand-soft hover:text-brand-ink"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and Exports Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown Selector */}
          <label className="relative flex h-11 shrink-0 items-center gap-2 rounded-xl border border-brand-line bg-brand-canvas px-3 text-brand-muted">
            <House size={15} className="shrink-0" aria-hidden="true" />
            <span className="sr-only">Filter by category</span>
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="h-full appearance-none bg-transparent pr-6 text-sm font-medium text-brand-ink focus:outline-none"
            >
              <option value="All">All categories</option>
              <option value="Primary">Primary only</option>
              <option value="Secondary">Secondary only</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 text-brand-muted"
              aria-hidden="true"
            />
          </label>

          {/* Export Action Menu Dropdown */}
          <div className="relative shrink-0">
            <Button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              variant="outline"
              className="h-11 gap-2 rounded-xl border-brand-line px-4 text-brand-ink hover:bg-brand-soft"
              disabled={loading || totalCount === 0}
              aria-expanded={exportMenuOpen}
              aria-haspopup="menu"
            >
              <Download size={16} className="text-brand-primary" />
              <span>Export</span>
              <ChevronDown size={14} className="text-brand-muted" />
            </Button>
            {exportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setExportMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-brand-line bg-brand-surface py-2 shadow-xl motion-safe:animate-enter [--enter-y:-0.5rem] duration-200"
                >
                  <p className="border-b border-brand-line px-4 pb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-brand-muted">
                    Choose a file format
                  </p>
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleExportSchools("xlsx");
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brand-ink transition hover:bg-brand-soft"
                  >
                    <span className="h-2 w-2 rounded-full bg-brand-primary" />
                    Microsoft Excel (.xlsx)
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleExportSchools("docx");
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brand-ink transition hover:bg-brand-soft"
                  >
                    <span className="h-2 w-2 rounded-full bg-brand-accent" />
                    Microsoft Word (.docx)
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleExportSchools("csv");
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brand-ink transition hover:bg-brand-soft"
                  >
                    <span className="h-2 w-2 rounded-full bg-brand-orange" />
                    Standard CSV (.csv)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-sm text-brand-muted">
          {loading
            ? "Loading schools…"
            : `Showing ${schools.length} of ${totalCount} school${totalCount !== 1 ? "s" : ""}${selectedCategory !== "All" ? ` · ${selectedCategory}` : ""}${debouncedSearch ? ` matching "${debouncedSearch}"` : ""}`}
        </p>
        <span className="self-start rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted sm:self-auto">
          Page {page + 1} of {pageCount}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface [scrollbar-width:thin]">
        <RegisteredSchoolsTable
          loading={loading}
          schools={schools}
          searchTerm={searchTerm}
          verifiedNames={verifiedNames}
          verifyingId={verifyingId}
          handleVerifySchool={handleVerifySchool}
          handleDeleteSchool={handleDeleteSchool}
          navigate={navigate}
        />
      </div>

      {!loading && schools.length > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}

      {mergeOpen && (
        <MergeSchoolsModal
          onClose={() => setMergeOpen(false)}
          onMerged={() => {
            void queryClient.invalidateQueries({
              queryKey: ["registeredSchools"],
            });
          }}
        />
      )}
    </div>
  );
}
