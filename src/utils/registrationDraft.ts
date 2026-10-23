import type { RegistrationForm } from "@/schemas/registration";

const storageKey = (field: string) => `kidscon_reg_${field}`;

export function loadRegistrationDraft(): RegistrationForm & { step: number } {
  try {
    const step = localStorage.getItem(storageKey("step"));
    const schoolInfo = localStorage.getItem(storageKey("schoolInfo"));
    const students = localStorage.getItem(storageKey("students"));
    const teachers = localStorage.getItem(storageKey("teachers"));

    return {
      step: step ? JSON.parse(step) : 1,
      schoolInfo: schoolInfo
        ? JSON.parse(schoolInfo)
        : {
            name: "",
            category: "Primary",
            address: "",
            contactPerson: "",
            phone: "",
          },
      students: students ? JSON.parse(students) : [],
      teachers: teachers ? JSON.parse(teachers) : [],
    };
  } catch {
    return {
      step: 1,
      schoolInfo: {
        name: "",
        category: "Primary",
        address: "",
        contactPerson: "",
        phone: "",
      },
      students: [],
      teachers: [],
    };
  }
}

export function saveRegistrationDraft(step: number, data: RegistrationForm) {
  localStorage.setItem(storageKey("step"), JSON.stringify(step));
  for (const field of ["schoolInfo", "students", "teachers"] as const) {
    localStorage.setItem(storageKey(field), JSON.stringify(data[field]));
  }
}

export function clearRegistrationDraft() {
  for (const field of ["step", "schoolInfo", "students", "teachers"]) {
    localStorage.removeItem(storageKey(field));
  }
}
