import {
  House,
  School,
  ShieldCheck
} from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { useVerifiedSchool } from "@/hooks/registration/useVerifiedSchool";
import { type RegistrationForm } from "@/schemas/registration";
import { Input } from "@/components/ui/Input";

export function SchoolInfoStep() {
  const { register, control, formState: { errors } } = useFormContext<RegistrationForm>();
  const schoolName = useWatch({ control, name: "schoolInfo.name" });
  const isVerified = useVerifiedSchool(schoolName);
  return (
    <div
      key="step1"
      className="motion-safe:animate-enter [--enter-x:1.25rem] [--enter-blur:4px] duration-[450ms] grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
    >
      <div>
        <Input
          variant="brand"
          label="School Name"
          placeholder="Enter your school's full name"
          {...register("schoolInfo.name")}
          error={errors.schoolInfo?.name?.message}
        />
        {(schoolName || "").trim() && (
          <div
            className={`flex items-center gap-1.5 mt-2 ml-4 text-xs font-semibold transition-all ${isVerified
              ? "text-brand-primary"
              : "text-brand-muted/60"
              }`}
          >
            {isVerified ? (
              <>
                <ShieldCheck size={13} /> Verified School
              </>
            ) : (
              <>
                <House size={13} /> Not yet on verified list
              </>
            )}
          </div>
        )}
      </div>
      <div className="group">
        <label htmlFor="school-category" className="block text-sm font-medium text-brand-ink mb-2 transition-colors group-focus-within:text-brand-primary">
          School Category
        </label>
        <select
          id="school-category"
          className="h-14 w-full rounded-xl border border-brand-line bg-brand-surface px-4 text-base text-brand-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
          {...register("schoolInfo.category")}
        >
          <option value="Primary">Primary</option>
          <option value="Secondary">Secondary</option>
          <option value="Both">Both (Primary & Secondary)</option>
        </select>
      </div>
      <Input
        variant="brand"
        label="Physical Address"
        placeholder="Where is the school located?"
        {...register("schoolInfo.address")}
        error={errors.schoolInfo?.address?.message}
      />
      <Input
        variant="brand"
        label="Contact Person Name"
        placeholder="Principal or representative"
        {...register("schoolInfo.contactPerson")}
        error={errors.schoolInfo?.contactPerson?.message}
      />
      <Input
        variant="brand"
        label="Phone Number"
        type="tel"
        placeholder="e.g. 08012345678"
        {...register("schoolInfo.phone")}
        error={errors.schoolInfo?.phone?.message}
      />
    </div>
  );
}
