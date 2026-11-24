import { useEffect } from "react";

import { saveRegistrationDraft } from "@/components/pages/registration/registrationDraft";
import type { RegistrationForm } from "@/components/pages/registration/schema";

export function useRegistrationDraft(eventId: string | null, step: number, requestId: string, formData: RegistrationForm) {
  useEffect(() => {
    if (eventId) saveRegistrationDraft(eventId, { ...formData, step, requestId });
  }, [eventId, step, requestId, formData]);
}
