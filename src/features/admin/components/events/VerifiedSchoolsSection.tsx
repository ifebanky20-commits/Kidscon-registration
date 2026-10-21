import {
  Loader2,
  Plus,
  School,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Toast } from "@/shared/components/ui/InlineToast";
import type { AvailableSchoolRow, ToastMessage } from "@/shared/types/database";

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
          <h2 className="text-2xl font-bold text-md-on-background tracking-tight flex items-center gap-2">
            <ShieldCheck size={22} className="text-md-primary" />
            Verified Schools List
          </h2>
          <p className="text-md-on-surface-variant font-medium mt-1">
            Schools on this list get a verified badge on the registration form.
          </p>
        </div>
        <Toast toast={schoolsToast} />
      </div>

      <Card className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low max-w-2xl">
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
                className="w-full h-11 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
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
              className="h-11 px-5 gap-2 shrink-0"
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
              <div className="w-8 h-8 rounded-full border-3 border-md-secondary-container border-t-md-primary animate-spin" />
            </div>
          ) : verifiedSchools.length === 0 ? (
            <div className="text-center py-10 text-md-on-surface-variant">
              <ShieldOff size={28} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-sm">No verified schools yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-md-outline/10">
              {verifiedSchools.map((school) => (
                <li
                  key={school.id}
                  className="flex items-center justify-between py-3 px-2 group hover:bg-md-surface-container/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <School size={15} className="text-md-primary shrink-0" />
                    <span className="font-medium text-md-on-background text-sm">
                      {school.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSchool(school)}
                    disabled={schoolBusyId === school.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 p-2 rounded-full"
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
