"use client";

import {
  ArrowLeft,
  Download,
  MapPin,
  Phone,
  Printer,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { supabase } from "@/lib/supabase";
import type { SchoolDetails } from "@/types/database";

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchool() {
      try {
        if (!id) throw new Error("Missing school ID");
        const { data, error } = await supabase
          .from("schools")
          .select(
            `
            *,
            students (*),
            teachers (*)
          `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        // Sort students logically if needed by ID
        if (data.students) {
          data.students.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
        }

        setSchool(data);
      } catch (err) {
        console.error("Error fetching school details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchool();
  }, [id]);

  if (loading) {
    return (
      <div role="status" className="space-y-6">
        <span className="sr-only">Loading school details</span>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-4/5 max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["contact", "students", "teachers"].map((section) => (
            <Skeleton key={section} className="h-28 rounded-2xl bg-brand-soft" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-brand-soft" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-20 motion-safe:animate-enter">
        <h2 className="text-2xl font-medium text-brand-ink">
          School Not Found
        </h2>
        <p className="text-brand-muted mt-2 mb-6">
          The registration record you are looking for does not exist.
        </p>
        <Link href="/admin">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl motion-safe:animate-enter [--enter-y:1.0rem] duration-500 ease-md pb-12">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="rounded-xl w-12 h-12 rounded-xl p-0 flex items-center justify-center bg-brand-surface hover:bg-brand-wash hover:shadow-sm"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-medium text-brand-ink tracking-[-0.045em] sm:text-4xl flex items-center gap-3">
              {school.name}
              <span className="inline-flex w-3 h-3 rounded-full bg-success-500"></span>
            </h1>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              {school.category} Category
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            className="rounded-xl flex-1 lg:flex-none gap-2 bg-brand-surface border-brand-line"
          >
            <Download size={18} /> Download PDF
          </Button>
          <Link
            href={`/print/${id}`}
            target="_blank"
            className="flex-1 lg:flex-none"
          >
            <Button variant="primary" className="rounded-xl w-full gap-2 shadow-none">
              <Printer size={18} /> Print Attendance
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact Info */}
        <div className="space-y-8">
          <Card className="rounded-2xl shadow-none bg-brand-surface border border-brand-line">
            <CardHeader className="pt-8 px-8 pb-4 border-b-0">
              <CardTitle className="font-medium tracking-tight text-xl">
                Contact Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-6">
              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-xl bg-brand-tint text-brand-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-muted tracking-wide uppercase mb-1">
                    Physical Address
                  </p>
                  <p className="text-base text-brand-ink font-medium leading-relaxed">
                    {school.address || "N/A"}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-md-outline/10"></div>

              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-xl bg-md-tertiary/20 text-brand-muted flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-muted tracking-wide uppercase mb-1">
                    Contact Person
                  </p>
                  <p className="text-base text-brand-ink font-medium">
                    {school.contact_person || "N/A"}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-md-outline/10"></div>

              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-xl bg-brand-tint text-brand-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-muted tracking-wide uppercase mb-1">
                    Phone Reference
                  </p>
                  <p className="text-base text-brand-ink font-medium">
                    {school.phone || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stat */}
          <div className="bg-brand-tint text-brand-primary p-8 rounded-2xl text-center shadow-none transform transition-transform hover:-translate-y-2 hover:shadow-lg duration-500 ease-md">
            <p className="font-semibold tracking-wide uppercase mb-2 text-sm opacity-80">
              Total Enrollments
            </p>
            <p className="text-6xl font-medium tracking-tight">
              {school.students?.length || 0}
            </p>
          </div>
        </div>

        {/* Right Column - Students List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-medium text-brand-ink tracking-tight">
              Registered Roster
            </h2>
          </div>

          <Table className="rounded-2xl overflow-hidden shadow-none border border-brand-line bg-md-background">
            <TableHeader className="bg-brand-wash border-b-0">
              <TableRow className="border-0">
                <TableHead className="w-16 text-center rounded-tl-[24px]">
                  S/N
                </TableHead>
                <TableHead className="font-semibold">Student Name</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold rounded-tr-3xl">
                  Class / Grade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child_td:first-child]:rounded-bl-3xl [&_tr:last-child_td:last-child]:rounded-br-3xl">
              {!school.students || school.students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 font-medium text-brand-muted"
                  >
                    No students registered for this school.
                  </TableCell>
                </TableRow>
              ) : (
                school.students.map((student, idx) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-brand-surface transition-colors duration-200 border-brand-line"
                  >
                    <TableCell className="text-center text-brand-muted font-medium">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-brand-ink">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${student.gender === "Female"
                            ? "bg-brand-highlight text-brand-on-highlight"
                            : "bg-brand-tint text-brand-primary"
                          }`}
                      >
                        {student.gender}
                      </span>
                    </TableCell>
                    <TableCell className="text-brand-muted font-medium">
                      {student.class}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
