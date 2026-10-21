import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { useMemo, useState } from "react";

import { loadRegistrationDraft } from "@/features/registration/utils/registrationDraft";
import { registrationSchema, type RegistrationForm } from "@/schemas/registration";

export function useRegistrationForm() {
  const [savedData] = useState(loadRegistrationDraft);
  const [step, setStep] = useState(savedData.step);
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: savedData,
    mode: "onTouched",
  });
  const { control, trigger } = form;
  const [schoolInfo, students, teachers] = useWatch({
    control,
    name: ["schoolInfo", "students", "teachers"],
  });
  const formData = useMemo(
    () => ({ schoolInfo, students, teachers }),
    [schoolInfo, students, teachers],
  );
  const handleNext = async () => {
    if (step === 1) {
      const isStepValid = await trigger("schoolInfo");
      if (isStepValid) setStep(2);
    } else if (step === 2) {
      if (formData.students.length > 0) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrev = () => setStep((s) => s - 1);

  const isNextDisabled = () => {
    if (step === 2) return formData.students.length === 0;
    return false;
  };

  return { form, formData, step, handlePrev, handleNext, isNextDisabled };
}
