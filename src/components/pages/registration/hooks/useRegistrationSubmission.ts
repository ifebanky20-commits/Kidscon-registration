import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useRef, useState } from "react";

import { submitRegistration } from "@/components/pages/registration/registration";
import { saveRegistrationReceipt } from "@/components/pages/registration/registrationReceipt";
import { clearRegistrationDraft } from "@/components/pages/registration/registrationDraft";
import type { RegistrationForm } from "@/components/pages/registration/schema";

export function useRegistrationSubmission(eventId: string | null, requestId: string) {
  const router = useRouter();
  const submitting = useRef(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    if (!eventId || submitting.current) return;
    submitting.current = true;
    setSubmitLoading(true);
    try {
      const schoolId = await submitRegistration(data, eventId, requestId);
      clearRegistrationDraft(eventId);

      toast.success("Registration submitted successfully!");
      saveRegistrationReceipt({
        totalStudents: data.students.length,
        schoolName: data.schoolInfo.name,
        registrationId: schoolId,
      });
      router.push("/confirmation");
    } catch (err) {
      const code = typeof err === "object" && err !== null && "code" in err ? err.code : undefined;
      toast.error(code === "23505"
        ? "This registration was already submitted with different details. Restore the original details to recover your confirmation."
        : code === "22023"
          ? "Registration is unavailable or the details are invalid. Review the event and your form."
          : "Failed to register. Please check your connection and try again.");
      console.error("Registration error:", err);
    } finally {
      submitting.current = false;
      setSubmitLoading(false);
    }
  };
  return { onSubmit, submitLoading };
}
