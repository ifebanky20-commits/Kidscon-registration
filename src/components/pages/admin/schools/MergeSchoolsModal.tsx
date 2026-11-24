import { Modal } from "@/components/ui/Modal";
import { House, LoaderCircle } from "lucide-react";
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
} from "lucide-react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import type { SchoolSummary } from "@/types/database";
import { getErrorMessage } from "@/utils/error";
import { fetchAllPages } from "@/lib/fetchAllPages";

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
  eventId: string | null;
}

export function MergeSchoolsModal({
  onClose,
  onMerged,
  eventId,
}: MergeSchoolsModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  // per-group state: { [groupKey]: { primaryId, contactSourceId, merging, merged, error } }
  const [groupState, setGroupState] = useState<Record<string, MergeState>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  // Detect duplicates
  useEffect(() => {
    let cancelled = false;
    async function detect() {
      setLoading(true);
      setLoadError(null);
      const schools = await fetchAllPages((from, to) => {
        let query = supabase
          .from("schools")
          .select("id, name, category, address, contact_person, phone, created_at, event_id, students(count), teachers(count)", { count: "exact" })
          .order("name")
          .order("id")
          .range(from, to);
        if (eventId) query = query.eq("event_id", eventId);
        return query;
      });

      if (cancelled) return;

      const map: Record<string, SchoolSummary[]> = {};
      for (const school of schools) {
        const normalizedName = school.name.trim().toLowerCase().replace(/\s+/g, " ");
        const key = JSON.stringify([school.event_id, normalizedName]);
        (map[key] ??= []).push(school);
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
    void detect().catch(() => {
      if (cancelled) return;
      setLoadError("Couldn’t load duplicate schools. Close this dialog and try again.");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [eventId]);

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
      const { error } = await supabase.rpc("merge_registered_schools", {
        p_primary_id: primaryId,
        p_duplicate_ids: group.schools.filter((school) => school.id !== primaryId).map((school) => school.id),
        p_contact_source_id: contactSourceId,
      });
      if (error) throw error;

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
    <Modal isOpen onClose={onClose} title="Merge duplicate schools" description={loading ? "Scanning for duplicate school names…" : `${totalGroups} duplicate group${totalGroups !== 1 ? "s" : ""} found. Choose the record and contact details to keep.`} busy={Object.values(groupState).some(state => state.merging)} className="max-w-4xl">
        {/* Modal Body */}
        <div className="space-y-6">
          {loadError ? <p role="alert">{loadError}</p> : loading ? (
            <div className="flex items-center justify-center py-20">
              <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span>
            </div>
          ) : allMerged ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-brand-primary mb-4" />
              <h3 className="text-xl font-medium text-brand-ink">
                All duplicates merged!
              </h3>
              <p className="text-brand-muted mt-2 mb-6">
                Your school records are now clean and accurate.
              </p>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : totalGroups === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={48} className="text-brand-primary mb-4" />
              <h3 className="text-xl font-medium text-brand-ink">
                No duplicates found
              </h3>
              <p className="text-brand-muted mt-2">
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
                    className="rounded-2xl border border-brand-line bg-brand-wash px-6 py-4 flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={20}
                      className="text-brand-primary shrink-0"
                    />
                    <span className="font-semibold text-emerald-800">
                      {group.name}
                    </span>
                    <span className="text-sm text-brand-primary ml-auto">
                      Merged successfully
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={group.key}
                  className="rounded-2xl border border-md-outline/15 bg-brand-surface overflow-hidden"
                >
                  {/* Group Header */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-wash transition-colors"
                    onClick={() => toggleExpand(group.key)}
                  >
                    <div className="flex items-center gap-3">
                      <House size={18} className="text-brand-primary" />
                      <span className="font-medium text-brand-ink">
                        {group.name}
                      </span>
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {group.schools.length} duplicates
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp
                        size={18}
                        className="text-brand-muted"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-brand-muted"
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6 border-t border-brand-line pt-5">
                      {/* Records table */}
                      <div className="overflow-x-auto rounded-xl border border-brand-line">
                        <table className="w-full text-sm min-w-max">
                          <thead>
                            <tr className="bg-brand-wash text-brand-muted">
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
                                className="border-t border-brand-line hover:bg-brand-wash/50 transition-colors"
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
                                    <span className="font-medium text-brand-ink">
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
                                      className="accent-brand-primary w-4 h-4"
                                    />
                                    <span className="font-medium text-brand-ink">
                                      Use this
                                    </span>
                                  </label>
                                </td>
                                <td className="py-3 px-4 text-brand-muted">
                                  {s.contact_person || "—"}
                                </td>
                                <td className="py-3 px-4 text-brand-muted">
                                  {s.phone || "—"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="bg-brand-tint text-brand-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    {s.students[0]?.count || 0}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-brand-muted text-xs">
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
                          <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-3">
                            Primary Record (ID kept)
                          </p>
                          <p className="font-medium text-brand-ink">
                            {primarySchool?.name}
                          </p>
                          <p className="text-xs text-brand-muted mt-1">
                            {primarySchool?.category || "N/A"}
                          </p>
                          <p className="text-sm text-brand-muted mt-2 font-medium">
                            Total students after merge:
                            <span className="ml-2 font-medium text-brand-ink">
                              {group.schools.reduce(
                                (sum, s) => sum + (s.students[0]?.count || 0),
                                0,
                              )}
                            </span>
                          </p>
                        </div>

                        {/* Contact preview */}
                        <div className="rounded-xl bg-brand-wash border border-brand-line p-4">
                          <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-3">
                            Contact Details (from selected source)
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User
                                size={14}
                                className="text-brand-primary mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-brand-ink font-medium">
                                {contactSource?.contact_person || "—"}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone
                                size={14}
                                className="text-brand-primary mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-brand-ink font-medium">
                                {contactSource?.phone || "—"}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin
                                size={14}
                                className="text-brand-primary mt-0.5 shrink-0"
                              />
                              <span className="text-sm text-brand-ink font-medium">
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
                              <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span>{" "}
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
    </Modal>
  );
}
