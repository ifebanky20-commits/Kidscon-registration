import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useState } from "react";

import { submitRegistration } from "@/features/registration/services/registration";
import { clearRegistrationDraft } from "@/features/registration/utils/registrationDraft";
import type { RegistrationForm } from "@/schemas/registration";

export function useRegistrationSubmission(eventId: string | null) {
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    setSubmitLoading(true);
    try {
      const schoolId = await submitRegistration(data, eventId);
      clearRegistrationDraft();

      toast.success("Registration submitted successfully!");
      navigate("/confirmation", {
        state: {
          totalStudents: data.students.length,
          schoolName: data.schoolInfo.name,
          registrationId: schoolId,
        },
      });
    } catch (err) {
      toast.error(
        "Failed to register. Please check your connection and try again.",
      );
      console.error("Registration error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };
  return { onSubmit, submitLoading };
}
