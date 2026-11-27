import {
  Plus,
  Trash2
} from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useRegistrationTeachers } from "@/components/pages/registration/hooks/useRegistrationTeachers";
import { type RegistrationForm } from "@/components/pages/registration/schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function TeachersStep() {
  const { control } = useFormContext<RegistrationForm>();
  const { teacherFields, removeTeacher, newTeacherName, setNewTeacherName, handleAddTeacher } = useRegistrationTeachers(control);
  return (
    <div
      key="step3"
      className="motion-safe:animate-enter [--enter-x:1.25rem] [--enter-blur:4px] duration-[450ms] space-y-8"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          variant="brand"
          label="Teacher's Full Name"
          placeholder="e.g. Adebayo Ogunlesi"
          value={newTeacherName}
          onChange={(e) => setNewTeacherName(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" && (e.preventDefault(), handleAddTeacher()))}
          className="flex-1"
        />
        <Button
          onClick={handleAddTeacher}
          variant="secondary"
          type="button"
          className="sm:mt-7 px-8 whitespace-nowrap h-14 rounded-xl shadow-none"
        >
          <Plus size={18} className="mr-2" /> Add Teacher
        </Button>
      </div>

      {teacherFields.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-brand-wash border border-brand-line text-brand-muted">
          <p>No teachers currently assigned to this registration.</p>
        </div>
      ) : (
        <div className="bg-brand-surface rounded-2xl border border-brand-line overflow-hidden shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
          <ul className="divide-y divide-brand-line">
            {teacherFields.map((field, index) => (
              <li
                key={field.id}
                className="p-4 px-6 flex justify-between items-center group hover:bg-brand-wash/50 transition-colors"
              >
                <span className="font-medium text-lg text-brand-ink tracking-tight">
                  {field.name}
                </span>
                <button
                  aria-label={`Remove ${field.name}`}
                  onClick={() => removeTeacher(index)}
                  type="button"
                  className="text-brand-muted hover:text-md-error hover:bg-md-error/10 transition-colors p-2 rounded-full active:scale-95 "
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
