import { useFormContext, useWatch } from "react-hook-form";

import type { Dispatch, SetStateAction } from "react";

import { type RegistrationForm } from "@/components/pages/registration/schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface AddStudentModalProps {
  isStudentModalOpen: boolean;
  setIsStudentModalOpen: (value: boolean) => void;
  newStudent: Omit<RegistrationForm["students"][number], "id">;
  setNewStudent: Dispatch<SetStateAction<Omit<RegistrationForm["students"][number], "id">>>;
  handleAddStudent: () => void;
}

export function AddStudentModal({
  isStudentModalOpen,
  setIsStudentModalOpen,
  newStudent,
  setNewStudent,
  handleAddStudent,
}: AddStudentModalProps) {
  const { control } = useFormContext<RegistrationForm>();
  const category = useWatch({ control, name: "schoolInfo.category" });
  return (
    <Modal
      isOpen={isStudentModalOpen}
      onClose={() => setIsStudentModalOpen(false)}
      className="rounded-2xl bg-brand-surface font-display text-brand-ink"
      title="Add a student"
      description="Add their name and class to your school’s attendee list."
    >
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (newStudent.name.trim() && newStudent.class.trim()) handleAddStudent(); }}>
        <Input
          variant="brand"
          label="Student Full Name"
          required
          placeholder="e.g. John Doe"
          value={newStudent.name}
          onChange={(e) =>
            setNewStudent({ ...newStudent, name: e.target.value })
          }
        />

        <div className="group">
          <label htmlFor="student-gender" className="block text-sm font-medium text-brand-ink mb-2 transition-colors group-focus-within:text-brand-primary">
            Gender
          </label>
          <select
            id="student-gender"
            className="h-14 w-full rounded-xl border border-brand-line bg-brand-surface px-4 text-base text-brand-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            value={newStudent.gender}
            onChange={(e) =>
              setNewStudent({
                ...newStudent,
                gender: e.target.value === "Female" ? "Female" : "Male",
              })
            }
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <Input
          variant="brand"
          label="Class Details"
          required
          placeholder={
            category === "Secondary"
              ? "e.g. JSS 2"
              : "e.g. Primary 5"
          }
          value={newStudent.class}
          onChange={(e) =>
            setNewStudent({ ...newStudent, class: e.target.value })
          }
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-brand-line mt-8">
          <Button
            type="button"
            className="rounded-xl"
            variant="ghost"
            onClick={() => setIsStudentModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!newStudent.name.trim() || !newStudent.class.trim()}
            className="rounded-xl"
          >
            Save Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
