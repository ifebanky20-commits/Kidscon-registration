import {
  ChevronRight,
  School,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { SchoolSummary } from "@/types/database";

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
    <Table className="min-w-max whitespace-nowrap bg-brand-surface">
      <TableHeader className="bg-brand-wash">
        <TableRow className="border-brand-line">
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
          <TableHead className="py-5 text-right font-semibold ">
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
              className="py-10 text-center font-medium text-brand-muted"
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
                className="group cursor-pointer border-brand-line/70 transition-colors hover:bg-brand-soft"
                onClick={() => navigate(`/admin/school/${school.id}`)}
              >
                <TableCell className="py-5 font-medium text-brand-ink">
                  <div className="flex items-center gap-2">
                    <School
                      size={16}
                      className="shrink-0 text-brand-primary"
                    />
                    <span>{school.name}</span>
                    {isVerified && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-medium tracking-wide text-brand-primary">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-5 font-medium text-brand-muted">
                  {school.category || "-"}
                </TableCell>
                <TableCell className="py-5 text-brand-muted">
                  <div className="flex flex-col">
                    <span className="font-medium text-brand-ink">
                      {school.contact_person || "-"}
                    </span>
                    <span className="text-xs">{school.phone || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="rounded-full bg-brand-tint px-3 py-1 text-sm font-medium tracking-wide text-brand-primary">
                    {school.students[0]?.count || 0}
                  </span>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="rounded-full bg-brand-highlight px-3 py-1 text-sm font-medium tracking-wide text-brand-on-highlight">
                    {school.teachers[0]?.count || 0}
                  </span>
                </TableCell>
                <TableCell className="py-5 font-medium text-brand-muted">
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
                        ? "cursor-wait border-brand-line bg-brand-soft text-brand-muted"
                        : isVerified
                          ? "group/vbtn border-brand-line bg-brand-tint text-brand-primary hover:border-brand-red/30 hover:bg-brand-red/10 hover:text-brand-red"
                          : "border-brand-line bg-brand-surface text-brand-muted hover:border-brand-line hover:bg-brand-wash hover:text-brand-primary"
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
                <TableCell className="sticky right-0 bg-brand-surface py-3 text-right transition-colors duration-200 group-hover:bg-brand-soft">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="bg-brand-tint/60 text-brand-primary transition-opacity hover:bg-brand-tint md:opacity-0 md:group-hover:opacity-100"
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
                      className="text-brand-red transition-opacity hover:bg-brand-red/10 hover:text-brand-red md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Delete ${school.name}`}
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
