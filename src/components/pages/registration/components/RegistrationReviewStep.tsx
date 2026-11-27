import { GraduationCap, Users } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import type { RegistrationForm } from "@/components/pages/registration/schema";

export function RegistrationReviewStep() {
  const { control } = useFormContext<RegistrationForm>();
  const [school, students, teachers] = useWatch({ control, name: ["schoolInfo", "students", "teachers"] });
  const details = [
    ["School name", school.name],
    ["Category", school.category],
    ["Address", school.address],
    ["Contact person", school.contactPerson],
    ["Phone number", school.phone],
  ];

  return (
    <div className="space-y-8">
      <dl className="grid gap-x-8 gap-y-6 border-y border-brand-line py-6 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-brand-muted">{label}</dt>
            <dd className="mt-2 break-words text-sm font-medium text-brand-ink">{value || "Not provided"}</dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Students", count: students.length, icon: GraduationCap },
          { label: "Teachers", count: teachers.length, icon: Users },
        ].map(({ label, count, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-brand-wash p-5 sm:p-6">
            <Icon size={22} strokeWidth={1.5} className="mb-5 text-brand-primary" aria-hidden="true" />
            <p className="text-3xl font-medium tracking-tight text-brand-ink">{count}</p>
            <p className="mt-1 text-sm text-brand-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm leading-7 text-brand-muted">Need to change anything? Use Back to update your details before completing registration.</p>
    </div>
  );
}
