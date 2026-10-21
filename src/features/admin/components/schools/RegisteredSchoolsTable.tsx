import {
  ChevronRight,
  School,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";
import type { SchoolSummary } from "@/shared/types/database";

interface RegisteredSchoolsTableProps {
  loading: boolean;
  schools: SchoolSummary[];
  searchTerm: string;
  verifiedNames: Map<string, string>;
  verifyingId: string | null;
  handleVerifySchool: (
    event: React.MouseEvent,
    school: Pick<SchoolSummary, "id" | "name">,
  ) => Promise<void>;
  handleDeleteSchool: (
    event: React.MouseEvent,
    school: Pick<SchoolSummary, "id" | "name">,
  ) => Promise<void>;
  navigate: (path: string) => void;
}

export function RegisteredSchoolsTable({
  loading,
  schools,
  searchTerm,
  verifiedNames,
  verifyingId,
  handleVerifySchool,
  handleDeleteSchool,
  navigate,
}: RegisteredSchoolsTableProps) {
  return (
    <Table className="min-w-max whitespace-nowrap">
      <TableHeader className="bg-md-surface-container">
        <TableRow className="border-md-outline/10">
          <TableHead className="py-5 font-semibold">School Name</TableHead>
          <TableHead className="py-5 font-semibold">Category</TableHead>
          <TableHead className="py-5 font-semibold">Contact</TableHead>
          <TableHead className="py-5 font-semibold text-center">
            Students
          </TableHead>
          <TableHead className="py-5 font-semibold text-center">
            Teachers
          </TableHead>
          <TableHead className="py-5 font-semibold">Date Registered</TableHead>
          <TableHead className="py-5 font-semibold text-center">
            Verified
          </TableHead>
          <TableHead className="py-5 text-right font-semibold sticky right-0 bg-md-surface-container/90 backdrop-blur-md">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-48" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-32" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-12 mx-auto" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-12 mx-auto" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-6 w-16 mx-auto" />
              </TableCell>
              <TableCell className="py-5">
                <Skeleton className="h-8 w-8 ml-auto rounded-full" />
              </TableCell>
            </TableRow>
          ))
        ) : schools.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center py-10 text-md-on-surface-variant font-medium"
            >
              {searchTerm
                ? `No schools found matching "${searchTerm}".`
                : "No schools have registered yet."}
            </TableCell>
          </TableRow>
        ) : (
          schools.map((school) => {
            const isVerified =
              verifiedNames instanceof Map &&
              verifiedNames.has(school.name.trim().toLowerCase());
            const isVerifying = verifyingId === school.id;
            return (
              <TableRow
                key={school.id}
                className="group hover:bg-md-surface-container transition-colors border-md-outline/5 cursor-pointer"
                onClick={() => navigate(`/admin/school/${school.id}`)}
              >
                <TableCell className="font-bold text-md-on-background py-5">
                  <div className="flex items-center gap-2">
                    <School
                      size={16}
                      className="text-md-on-surface-variant/50 shrink-0"
                    />
                    <span>{school.name}</span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shrink-0">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-md-on-surface-variant font-medium py-5">
                  {school.category || "-"}
                </TableCell>
                <TableCell className="text-md-on-surface-variant py-5">
                  <div className="flex flex-col">
                    <span className="font-medium text-md-on-background">
                      {school.contact_person || "-"}
                    </span>
                    <span className="text-xs">{school.phone || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="bg-md-primary/10 text-md-primary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                    {school.students[0]?.count || 0}
                  </span>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="bg-md-tertiary/10 text-md-tertiary px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                    {school.teachers[0]?.count || 0}
                  </span>
                </TableCell>
                <TableCell className="text-md-on-surface-variant font-medium py-5">
                  {new Date(school.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center py-5">
                  <button
                    onClick={(e) => handleVerifySchool(e, school)}
                    disabled={isVerifying}
                    title={
                      isVerified
                        ? "Click to unverify this school"
                        : "Click to verify this school"
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 border ${
                      isVerifying
                        ? "bg-md-surface-container text-md-on-surface-variant border-md-outline/20 cursor-wait"
                        : isVerified
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 group/vbtn"
                          : "bg-md-surface-container text-md-on-surface-variant border-md-outline/20 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : isVerified ? (
                      <>
                        <ShieldCheck
                          size={12}
                          className="group-hover/vbtn:hidden"
                        />
                        <ShieldOff
                          size={12}
                          className="hidden group-hover/vbtn:block"
                        />
                        <span className="group-hover/vbtn:hidden">
                          Verified
                        </span>
                        <span className="hidden group-hover/vbtn:block">
                          Unverify
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={12} />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-right py-3 sticky right-0 group-hover:bg-md-surface-container bg-md-surface-container-low transition-colors duration-200">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-md-secondary-container/50 hover:bg-md-secondary-container"
                    >
                      <Link
                        to={`/admin/school/${school.id}`}
                        className="gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Details <ChevronRight size={16} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSchool(e, school)}
                      className="text-md-error hover:bg-md-error/10 hover:text-md-error opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
