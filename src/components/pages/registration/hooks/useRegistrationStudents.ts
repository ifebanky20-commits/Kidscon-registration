import { useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";

import { useState } from "react";

import {
  MAX_STUDENTS,
  type RegistrationForm,
} from "@/components/pages/registration/schema";

export function useRegistrationStudents(control: Control<RegistrationForm>) {
  const {
    fields: studentFields,
    append: appendStudent,
    remove: removeStudent,
  } = useFieldArray({
    control,
    name: "students",
  });

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<
    Omit<RegistrationForm["students"][number], "id">
  >({ name: "", gender: "Male", class: "" });
  const isAtStudentLimit = studentFields.length >= MAX_STUDENTS;

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.class) {
      if (studentFields.length >= MAX_STUDENTS) return;
      appendStudent({ ...newStudent, id: Date.now() });
      setNewStudent({ name: "", gender: "Male", class: "" });
      setIsStudentModalOpen(false);
    }
  };

  return {
    studentFields,
    removeStudent,
    isStudentModalOpen,
    setIsStudentModalOpen,
    newStudent,
    setNewStudent,
    handleAddStudent,
    isAtStudentLimit,
  };
}
