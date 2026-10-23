import { useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";

import { useState } from "react";

import {
  MAX_STUDENTS,
  type RegistrationForm,
} from "@/schemas/registration";

export function useRegistrationTeachers(control: Control<RegistrationForm>) {
  const {
    fields: teacherFields,
    append: appendTeacher,
    remove: removeTeacher,
  } = useFieldArray({
    control,
    name: "teachers",
  });

  const [newTeacherName, setNewTeacherName] = useState("");
  const handleAddTeacher = () => {
    if (newTeacherName.trim()) {
      appendTeacher({ name: newTeacherName, id: Date.now() });
      setNewTeacherName("");
    }
  };

  return {
    teacherFields,
    removeTeacher,
    newTeacherName,
    setNewTeacherName,
    handleAddTeacher,
  };
}
