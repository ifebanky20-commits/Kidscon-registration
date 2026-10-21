import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitMerge,
  MapPin,
  Phone,
  School,
  User,
  Users,
  X,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/Button";
import { supabase } from "@/shared/lib/supabase";
import type { SchoolSummary } from "@/shared/types/database";
import { getErrorMessage } from "@/shared/utils/error";
type DuplicateGroup = { key: string; name: string; schools: SchoolSummary[] };
type MergeState = {
  primaryId: string;
  contactSourceId: string;
  merging: boolean;
  merged: boolean;
  error: string | null;
};

interface MergeSchoolsModalProps {
  onClose: () => void;
  onMerged: () => void;
}

export function MergeSchoolsModal({
  onClose,
  onMerged,
}: MergeSchoolsModalProps) {
  const [loading, setLoading] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  // per-group state: { [groupKey]: { primaryId, contactSourceId, merging, merged, error } }
  const [groupState, setGroupState] = useState<Record<string, MergeState>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Lock body scroll
  useEffect(() => {
    const wasLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    return () => {
      if (!wasLocked) document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // Detect duplicates
  useEffect(() => {
    async function detect() {
      setLoading(true);
      const { data } = await supabase
        .from("schools")
        .select(
          "id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)",
        )
        .order("name");

      if (!data) {
        setLoading(false);
        return;
      }

      // Group by normalised name: lowercase + collapse internal whitespace
      const normalise = (n: string) =>
        n.trim().toLowerCase().replace(/\s+/g, " ");
      const map: Record<string, SchoolSummary[]> = {};
      for (const s of data) {
        const key = normalise(s.name);
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }

      const groups = Object.entries(map)
        .filter(([, list]) => list.length >= 2)
        .map(([key, list]) => ({
          key,
          name: list[0].name.trim(),
          schools: list,
        }));

      setDuplicateGroups(groups);

      // Initialise per-group state
      const init: Record<string, MergeState> = {};
      const expanded: Record<string, boolean> = {};
      for (const g of groups) {
        // default primary = school with most students
        const primary = [...g.schools].sort(
          (a, b) => (b.students[0]?.count || 0) - (a.students[0]?.count || 0),
        )[0];
        init[g.key] = {
          primaryId: primary.id,
          contactSourceId: primary.id,
          merging: false,
          merged: false,
          error: null,
        };
        expanded[g.key] = true;
      }
      setGroupState(init);
      setExpandedGroups(expanded);
      setLoading(false);
    }
    detect();
  }, []);

  const setGroupField = <K extends keyof MergeState>(
    key: string,
    field: K,
    value: MergeState[K],
  ) =>
    setGroupState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

  const toggleExpand = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleMerge = async (group: DuplicateGroup) => {
    const { primaryId, contactSourceId } = groupState[group.key];

    setGroupState((prev) => ({
      ...prev,
      [group.key]: { ...prev[group.key], merging: true, error: null },
    }));

    try {
      const duplicates = group.schools.filter((s) => s.id !== primaryId);

      for (const dup of duplicates) {
        // ── Step 1: fetch all students belonging to the duplicate school
        const { data: dupStudents, error: fse } = await supabase
          .from("students")
          .select("*")
          .eq("school_id", dup.id);
        if (fse) throw new Error(`Fetch students failed: ${fse.message}`);

        // ── Step 2: fetch all teachers belonging to the duplicate school
        const { data: dupTeachers, error: fte } = await supabase
          .from("teachers")
          .select("*")
          .eq("school_id", dup.id);
        if (fte) throw new Error(`Fetch teachers failed: ${fte.message}`);

        // ── Step 3: delete students from duplicate (removes FK dependency)
        if (dupStudents?.length) {
          const { error: dse } = await supabase
            .from("students")
            .delete()
            .eq("school_id", dup.id);
          if (dse) throw new Error(`Delete students failed: ${dse.message}`);

          // ── Step 4: re-insert under the primary school (strip id so DB generates a new one)
          const { error: ise } = await supabase.from("students").insert(
            dupStudents.map(({ id: _id, ...rest }) => ({
              ...rest,
              school_id: primaryId,
            })),
          );
          if (ise) throw new Error(`Insert students failed: ${ise.message}`);
        }

        // ── Step 5: same for teachers
        if (dupTeachers?.length) {
          const { error: dte } = await supabase
            .from("teachers")
            .delete()
            .eq("school_id", dup.id);
          if (dte) throw new Error(`Delete teachers failed: ${dte.message}`);

          const { error: ite } = await supabase.from("teachers").insert(
            dupTeachers.map(({ id: _id, ...rest }) => ({
              ...rest,
              school_id: primaryId,
            })),
          );
          if (ite) throw new Error(`Insert teachers failed: ${ite.message}`);
        }

        // ── Step 6: delete the now-empty duplicate school record
        const { error: de } = await supabase
          .from("schools")
          .delete()
          .eq("id", dup.id);
        if (de) throw new Error(`School delete failed: ${de.message}`);
      }

      // ── Step 7: update contact details on primary if a different source was chosen
      if (contactSourceId !== primaryId) {
        const source = group.schools.find((s) => s.id === contactSourceId);
        if (!source) throw new Error("Contact source school was not found");
        const { error: ue } = await supabase
          .from("schools")
          .update({
            contact_person: source.contact_person,
            phone: source.phone,
            address: source.address,
          })
          .eq("id", primaryId);
        if (ue) throw new Error(`Contact update failed: ${ue.message}`);
      }

      setGroupState((prev) => ({
        ...prev,
        [group.key]: {
          ...prev[group.key],
          merging: false,
          merged: true,
          error: null,
        },
      }));
      onMerged();
    } catch (err) {
      console.error("Merge error:", err);
      setGroupState((prev) => ({
        ...prev,
        [group.key]: {
          ...prev[group.key],
          merging: false,
          error: getErrorMessage(err) || "Merge failed. Please try again.",
        },
      }));
    }
  };

  const totalGroups = duplicateGroups.length;
  const mergedCount = Object.values(groupState).filter((s) => s.merged).length;
  const allMerged = totalGroups > 0 && mergedCount === totalGroups;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4"
    >
      <div className="bg-md-surface w-full max-w-4xl rounded-[28px] shadow-2xl border border-md-outline/10 flex flex-col motion-safe:animate-enter [--enter-y:1.0rem] duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-md-outline/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center">
              <GitMerge size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-md-on-background tracking-tight">
                Merge Duplicate Schools
              </h2>
              <p className="text-sm text-md-on-surface-variant font-medium mt-0.5">
                {loading
                  ? "Scanning for duplicates…"
                  : `${totalGroups} duplicate group${totalGroups !== 1 ? "s" : ""} found`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-md-on-surface-variant/10 transition-colors flex items-center justify-center text-md-on-surface-variant"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-md-outline/20 border-t-md-primary rounded-full animate-spin" />
            </div>
          ) : allMerged ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-md-on-background">
                All duplicates merged!
              </h3>
              <p className="text-md-on-surface-variant mt-2 mb-6">
                Your school records are now clean and accurate.
              </p>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : totalGroups === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-md-on-background">
                No duplicates found
              </h3>
              <p className="text-md-on-surface-variant mt-2">
                All school names are unique.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group) => {
              const gs = groupState[group.key] || {};
              const isExpanded = expandedGroups[group.key];
              const primarySchool = group.schools.find(
                (s) => s.id === gs.primaryId,
              );
              const contactSource = group.schools.find(
                (s) => s.id === gs.contactSourceId,
              );

              if (gs.merged) {
                return (
                  <div
                    key={group.key}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600 shrink-0"
                    />
                    <span className="font-semibold text-emerald-800">
                      {group.name}
                    </span>
                    <span className="text-sm text-emerald-600 ml-auto">
                      Merged successfully
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={group.key}
                  className="rounded-2xl border border-md-outline/15 bg-md-surface-container-low overflow-hidden"
                >
                  {/* Group Header */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-md-surface-container transition-colors"
                    onClick={() => toggleExpand(group.key)}
                  >
                    <div className="flex items-center gap-3">
                      <School size={18} className="text-md-primary" />
                      <span className="font-bold text-md-on-background">
                        {group.name}
                      </span>
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {group.schools.length} duplicates
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp
                        size={18}
                        className="text-md-on-surface-variant"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-md-on-surface-variant"
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6 border-t border-md-outline/10 pt-5">
                      {/* Records table */}
                      <div className="overflow-x-auto rounded-xl border border-md-outline/10">
                        <table className="w-full text-sm min-w-max">
                          <thead>
                            <tr className="bg-md-surface-container text-md-on-surface-variant">
                              <th className="py-3 px-4 text-left font-semibold">
                                Primary Record
                              </th>
                              <th className="py-3 px-4 text-left font-semibold">
                                Contact Source
                              </th>
                              <th className="py-3 px-4 text-left font-semibold">
                                Contact Person
                              </th>
                              <th className="py-3 px-4 text-left font-semibold">
                                Phone
                              </th>
                              <th className="py-3 px-4 text-center font-semibold">
                                <Users size={14} className="inline" /> Students
                              </th>
                              <th className="py-3 px-4 text-left font-semibold">
                                Registered
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.schools.map((s) => (
                              <tr
                                key={s.id}
                                className="border-t border-md-outline/10 hover:bg-md-surface-container/50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`primary-${group.key}`}
                                      checked={gs.primaryId === s.id}
                                      onChange={() => {
                                        setGroupField(
                                          group.key,
                                          "primaryId",
                                          s.id,
                                        );
                                        // Reset contact source to new primary if it was same as old primary
                                        if (
                                          gs.contactSourceId === gs.primaryId
                                        ) {
                                          setGroupField(
                                            group.key,
                                            "contactSourceId",
                                            s.id,
                                          );
                                        }
                                      }}
                                      className="accent-md-primary w-4 h-4"
                                    />
                                    <span className="font-medium text-md-on-background">
                                      Keep this
                                    </span>
                                  </label>
                                </td>
                                <td className="py-3 px-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`contact-${group.key}`}
                                      checked={gs.contactSourceId === s.id}
                                      onChange={() =>
                                        setGroupField(
                                          group.key,
                                          "contactSourceId",
                                          s.id,
                                        )
                                      }
                                      className="accent-indigo-600 w-4 h-4"
                                    />
                                    <span className="font-medium text-md-on-background">
                                      Use this
                                    </span>
                                  </label>
                                </td>
                                <td className="py-3 px-4 text-md-on-surface-variant">
                                  {s.contact_person || "—"}
                                </td>
                                <td className="py-3 px-4 text-md-on-surface-variant">
                                  {s.phone || "—"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="bg-md-primary/10 text-md-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {s.students[0]?.count || 0}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-md-on-surface-variant text-xs">
                                  {new Date(s.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Merged Record Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Primary summary */}
                        <div className="rounded-xl bg-md-primary/5 border border-md-primary/20 p-4">
                          <p className="text-xs font-bold text-md-primary uppercase tracking-widest mb-3">
                            Primary Record (ID kept)
                          </p>
                          <p className="font-bold text-md-on-background">
                            {primarySchool?.name}
                          </p>
                          <p className="text-xs text-md-on-surface-variant mt-1">
                            {primarySchool?.category || "N/A"}
                          </p>
                          <p className="text-sm text-md-on-surface-variant mt-2 font-medium">
                            Total students after merge:
                            <span className="ml-2 font-bold text-md-on-background">
                              {group.schools.reduce(
                                (sum, s) => sum + (s.students[0]?.count || 0),
                                0,
                              )}
                            </span>
                          </p>
                        </div>

                        {/* Contact preview */}
                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">
                            Contact Details (from selected source)
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User
                                size={14}
                                className="text-indigo-400 mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-md-on-background font-medium">
                                {contactSource?.contact_person || "—"}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone
                                size={14}
                                className="text-indigo-400 mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-md-on-background font-medium">
                                {contactSource?.phone || "—"}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin
                                size={14}
                                className="text-indigo-400 mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-md-on-background font-medium">
                                {contactSource?.address || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Error */}
                      {gs.error && (
                        <div className="flex items-center gap-2 text-md-error bg-md-error/10 px-4 py-3 rounded-xl text-sm font-medium">
                          <AlertTriangle size={16} className="shrink-0" />
                          {gs.error}
                        </div>
                      )}

                      {/* Merge button */}
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          onClick={() => handleMerge(group)}
                          disabled={gs.merging}
                          className="gap-2"
                        >
                          {gs.merging ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                              Merging…
                            </>
                          ) : (
                            <>
                              <GitMerge size={16} /> Merge Group
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
