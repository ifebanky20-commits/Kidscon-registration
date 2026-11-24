import type { RegistrationForm } from "@/components/pages/registration/schema";

type Draft = RegistrationForm & { step: number; requestId: string };
type StoredDraft = Draft & { expiresAt: number };

const lifetime = 2 * 60 * 60 * 1000;
const prefix = "kidscon_registration_draft:";
const storageKey = (eventId: string) => prefix + eventId;

export function loadRegistrationDraft(eventId: string | null): Draft {
  try {
    for (const field of ["step", "schoolInfo", "students", "teachers"]) {
      localStorage.removeItem(`kidscon_reg_${field}`);
    }

    for (const key of Object.keys(sessionStorage)) {
      if (!key.startsWith(prefix)) continue;
      const draft = JSON.parse(sessionStorage.getItem(key) ?? "null") as StoredDraft | null;
      if (!draft || !(draft.expiresAt > Date.now())) sessionStorage.removeItem(key);
    }

    const stored = eventId && sessionStorage.getItem(storageKey(eventId));
    if (stored) {
      const draft = JSON.parse(stored) as StoredDraft;
      if (draft.requestId && draft.schoolInfo && Array.isArray(draft.students) &&
          Array.isArray(draft.teachers) && [1, 2, 3, 4].includes(draft.step)) {
        return draft;
      }
    }
  } catch {
    // The form remains usable when browser storage is unavailable.
  }

  return {
    step: 1,
    requestId: crypto.randomUUID(),
    schoolInfo: { name: "", category: "Primary", address: "", contactPerson: "", phone: "" },
    students: [],
    teachers: [],
  };
}

export function saveRegistrationDraft(eventId: string, draft: Draft) {
  try {
    sessionStorage.setItem(storageKey(eventId), JSON.stringify({ ...draft, expiresAt: Date.now() + lifetime }));
  } catch {
    // Keep the in-memory form when browser storage is unavailable.
  }
}

export function clearRegistrationDraft(eventId: string) {
  try {
    sessionStorage.removeItem(storageKey(eventId));
  } catch {
    // A storage failure must not turn a completed registration into a failed one.
  }
}
