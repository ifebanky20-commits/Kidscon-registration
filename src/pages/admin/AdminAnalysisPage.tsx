import { LoaderCircle } from "lucide-react";
import { AdminPageHeading } from "@/components/admin/ui/AdminPageHeading";
import { Activity, Filter } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { DailyRegistrationsChart } from "@/components/admin/analysis/DailyRegistrationsChart";
import { GenderRatioChart } from "@/components/admin/analysis/GenderRatioChart";
import { SchoolCategoriesChart } from "@/components/admin/analysis/SchoolCategoriesChart";
import { SchoolRegistrationsChart } from "@/components/admin/analysis/SchoolRegistrationsChart";
import { StudentVolumeChart } from "@/components/admin/analysis/StudentVolumeChart";
import { useEvent } from "@/contexts/event-context";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import type {
  CountRelation,
  SchoolRow,
  StudentRow,
} from "@/types/database";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminAnalysisPage() {
  const { events, selectedEventId, setSelectedEventId } = useEvent();
  const [rawSchools, setRawSchools] = useState<
    (Pick<SchoolRow, "id" | "name" | "created_at" | "category" | "event_id"> & {
      students: CountRelation;
      teachers: CountRelation;
    })[]
  >([]);
  const [rawStudents, setRawStudents] = useState<
    Pick<StudentRow, "school_id" | "gender" | "created_at">[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All"); // 0-11 string format

  // Fetch base data
  useEffect(() => {
    async function init() {
      setLoading(true);
      const [schoolsRes, studentsRes] = await Promise.all([
        supabase
          .from("schools")
          .select(
            "id, name, created_at, category, event_id, students(count), teachers(count)",
          ),
        supabase.from("students").select("school_id, gender, created_at"),
      ]);

      if (schoolsRes.data) setRawSchools(schoolsRes.data);
      if (studentsRes.data) setRawStudents(studentsRes.data);
      setLoading(false);
    }
    init();

    // Subscribe to changes to keep analysis live
    const channel = supabase
      .channel("analysis-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schools" },
        init,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        init,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // Compute available years based on data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    rawSchools.forEach((s) => {
      if (s.created_at)
        years.add(new Date(s.created_at).getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  }, [rawSchools]);

  // Apply filters
  const filteredData = useMemo(() => {
    return rawSchools.filter((school) => {
      if (selectedEventId && school.event_id !== selectedEventId) return false;

      const date = new Date(school.created_at);
      if (
        selectedYear !== "All" &&
        date.getFullYear().toString() !== selectedYear
      )
        return false;
      if (
        selectedMonth !== "All" &&
        date.getMonth().toString() !== selectedMonth
      )
        return false;

      return true;
    });
  }, [rawSchools, selectedEventId, selectedYear, selectedMonth]);

  // Compute Chart Data & Analytics
  const {
    monthlyRegData,
    dailyRegData,
    monthlyStudentData,
    categoryData,
    genderData,
    insights,
  } = useMemo(() => {
    let totalSchools = 0;
    let totalStudents = 0;
    let totalTeachers = 0;
    let maleCount = 0;
    let femaleCount = 0;

    const monthsMap: Record<
      string,
      { name: string; Schools: number; sortKey: string }
    > = {};
    const daysMap: Record<
      string,
      { name: string; Schools: number; sortKey: string }
    > = {};
    const studentsByMonthMap: Record<
      string,
      { name: string; Students: number; sortKey: string }
    > = {};
    const catsMap: Record<string, number> = {};

    // Create a set of valid school IDs based on current filters
    const validSchoolIds = new Set(filteredData.map((s) => s.id));

    filteredData.forEach((school) => {
      totalSchools++;
      const stCount = school.students[0]?.count || 0;
      const tCount = school.teachers[0]?.count || 0;
      totalStudents += stCount;
      totalTeachers += tCount;

      const date = new Date(school.created_at);
      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const mLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

      const dKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const dLabel = `${date.getDate()} ${MONTHS[date.getMonth()]}`;

      // Aggregate registrations per month
      if (!monthsMap[mKey])
        monthsMap[mKey] = { name: mLabel, Schools: 0, sortKey: mKey };
      monthsMap[mKey].Schools += 1;

      // Aggregate registrations per day
      if (!daysMap[dKey])
        daysMap[dKey] = { name: dLabel, Schools: 0, sortKey: dKey };
      daysMap[dKey].Schools += 1;

      // Aggregate categories
      const cat = school.category || "Uncategorized";
      catsMap[cat] = (catsMap[cat] || 0) + 1;
    });

    // Process students belonging to the filtered schools
    rawStudents.forEach((student) => {
      if (!validSchoolIds.has(student.school_id)) return;

      // Gender aggregation
      if (student.gender === "Male") maleCount++;
      else if (student.gender === "Female") femaleCount++;

      // Monthly student volume aggregation
      const date = new Date(student.created_at);
      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const mLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

      if (!studentsByMonthMap[mKey])
        studentsByMonthMap[mKey] = { name: mLabel, Students: 0, sortKey: mKey };
      studentsByMonthMap[mKey].Students += 1;
    });

    const monthlyRegArr = Object.values(monthsMap).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
    const dailyRegArr = Object.values(daysMap).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
    const monthlyStudentArr = Object.values(studentsByMonthMap).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );

    const categoryArr = Object.keys(catsMap)
      .map((key) => ({ name: key, value: catsMap[key] }))
      .sort((a, b) => b.value - a.value);

    // Generate accurate written insights
    let topMonthText = "";
    if (monthlyStudentArr.length > 0) {
      const topMonth = [...monthlyStudentArr].sort(
        (a, b) => b.Students - a.Students,
      )[0];
      const matchingRegs =
        monthlyRegArr.find((m) => m.sortKey === topMonth.sortKey)?.Schools || 0;
      topMonthText = `${topMonth.name} represents your highest volume period, bringing in ${topMonth.Students} students across ${matchingRegs} schools.`;
    }

    let topCatText = "";
    if (categoryArr.length > 0) {
      const topCat = categoryArr[0];
      const pct = Math.round((topCat.value / totalSchools) * 100);
      topCatText = `${topCat.name} schools make up the majority of your registrations at ${pct}%.`;
    }

    const eventName = selectedEventId
      ? events.find((e) => e.id === selectedEventId)?.name
      : "all events";
    const timeFrame = selectedYear === "All" ? "overall" : `in ${selectedYear}`;

    let insightText = "";
    if (totalSchools === 0) {
      insightText = `There is currently no registration data available for the selected filters.`;
    } else {
      insightText = `For ${eventName} ${timeFrame}, a total of ${totalStudents} students and ${totalTeachers} teachers have been registered across ${totalSchools} schools. ${topMonthText} ${topCatText}`;
    }

    return {
      monthlyRegData: monthlyRegArr,
      dailyRegData: dailyRegArr,
      monthlyStudentData: monthlyStudentArr,
      categoryData: categoryArr,
      demographicsData: [
        { name: "Students", value: totalStudents },
        { name: "Teachers", value: totalTeachers },
      ],
      genderData: [
        { name: "Male", value: maleCount },
        { name: "Female", value: femaleCount },
      ].filter((d) => d.value > 0),
      insights: insightText,
    };
  }, [filteredData, rawStudents, selectedEventId, selectedYear, events]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">
      {/* ── Header & Filters ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <AdminPageHeading title="Analytics & reporting" description={<> Deep dive into registration metrics, trends, and demographics. </>} />

        <div className="flex flex-wrap items-center gap-3 bg-brand-surface p-2 rounded-2xl border border-brand-line shadow-sm">
          <div className="flex items-center gap-2 pl-3 border-r border-brand-line pr-2">
            <Filter size={16} className="text-brand-muted" />
            <span className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
              Filters
            </span>
          </div>

          <select
            aria-label="Filter by event"
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(e.target.value || null)}
            className="h-10 px-4 rounded-xl bg-brand-wash border border-transparent text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-brand-line transition"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by year"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (e.target.value === "All") setSelectedMonth("All");
            }}
            className="h-10 px-4 rounded-xl bg-brand-wash border border-transparent text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-brand-line transition"
          >
            <option value="All">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === "All"}
            className="h-10 px-4 rounded-xl bg-brand-wash border border-transparent text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 cursor-pointer hover:border-brand-line transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i.toString()}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Written Analysis ── */}
      <Card className="rounded-2xl border border-brand-line bg-brand-wash shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity size={120} />
        </div>
        <CardContent className="p-8 md:p-10 relative z-10">
          <h2 className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={18} />
            Smart Insights
          </h2>
          <p className="text-xl md:text-2xl text-brand-ink font-medium leading-relaxed tracking-tight max-w-4xl">
            {insights}
          </p>
        </CardContent>
      </Card>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Registrations Timeline */}
        <SchoolRegistrationsChart monthlyRegData={monthlyRegData} />

        {/* Students Timeline */}
        <StudentVolumeChart monthlyStudentData={monthlyStudentData} />

        {/* Demographics row */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SchoolCategoriesChart categoryData={categoryData} />

          <GenderRatioChart genderData={genderData} />
        </div>

        {/* Daily Registration Timeline Full Width */}
        <DailyRegistrationsChart dailyRegData={dailyRegData} />
      </div>
    </div>
  );
}
