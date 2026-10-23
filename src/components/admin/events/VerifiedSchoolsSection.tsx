import { House, LoaderCircle } from "lucide-react";
import {
  Loader2,
  Plus,
  School,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Toast } from "@/components/ui/InlineToast";
import type { AvailableSchoolRow, ToastMessage } from "@/types/database";

interface VerifiedSchoolsSectionProps {
  schoolsToast: ToastMessage | null;
  newSchoolName: string;
  setNewSchoolName: (value: string) => void;
  registeredSchoolNames: string[];
  verifiedSchools: Pick<AvailableSchoolRow, "id" | "name">[];
  addingSchool: boolean;
  handleAddSchool: () => Promise<void>;
  schoolsLoading: boolean;
  schoolBusyId: string | null;
  handleRemoveSchool: (
    school: Pick<AvailableSchoolRow, "id" | "name">,
  ) => Promise<void>;
}

export function VerifiedSchoolsSection({
  schoolsToast,
  newSchoolName,
  setNewSchoolName,
  registeredSchoolNames,
  verifiedSchools,
  addingSchool,
  handleAddSchool,
  schoolsLoading,
  schoolBusyId,
  handleRemoveSchool,
}: VerifiedSchoolsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-brand-ink tracking-tight flex items-center gap-2">
            <ShieldCheck size={22} className="text-brand-primary" />
            Verified Schools List
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Schools on this list get a verified badge on the registration form.
          </p>
        </div>
        <Toast toast={schoolsToast} />
      </div>

      <Card className="rounded-2xl border border-brand-line bg-brand-surface max-w-2xl">
        <CardContent className="p-6 space-y-5">
          {/* Add school input with registered schools dropdown */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                list="registered-schools-list"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSchool()}
                placeholder="Select or type a school name…"
                className="w-full h-11 px-4 rounded-xl bg-brand-wash border border-brand-line text-brand-ink placeholder:text-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
              />
              {/* Datalist: registered schools not yet verified */}
              <datalist id="registered-schools-list">
                {registeredSchoolNames
                  .filter(
                    (name) =>
                      !verifiedSchools.some(
                        (v) => v.name.toLowerCase() === name.toLowerCase(),
                      ),
                  )
                  .map((name) => (
                    <option key={name} value={name} />
                  ))}
              </datalist>
            </div>
            <Button
              onClick={handleAddSchool}
              disabled={addingSchool || !newSchoolName.trim()}
              className="rounded-xl h-11 px-5 gap-2 shrink-0"
            >
              {addingSchool ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              Add
            </Button>
          </div>

          {/* List */}
          {schoolsLoading ? (
            <div className="flex justify-center py-8">
              <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span>
            </div>
          ) : verifiedSchools.length === 0 ? (
            <div className="text-center py-10 text-brand-muted">
              <ShieldOff size={28} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-sm">No verified schools yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-md-outline/10">
              {verifiedSchools.map((school) => (
                <li
                  key={school.id}
                  className="flex items-center justify-between py-3 px-2 group hover:bg-brand-wash/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <House size={15} className="text-brand-primary shrink-0" />
                    <span className="font-medium text-brand-ink text-sm">
                      {school.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSchool(school)}
                    disabled={schoolBusyId === school.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-muted hover:text-md-error hover:bg-md-error/10 p-2 rounded-full"
                    title="Remove from verified list"
                  >
                    {schoolBusyId === school.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
