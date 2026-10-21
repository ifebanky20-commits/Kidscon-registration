import { useEffect } from "react";

import { saveRegistrationDraft } from "@/features/registration/utils/registrationDraft";
import type { RegistrationForm } from "@/schemas/registration";

export function useRegistrationDraft(step: number, formData: RegistrationForm) {
  useEffect(() => {
    saveRegistrationDraft(step, formData);
  }, [step, formData]);
}
