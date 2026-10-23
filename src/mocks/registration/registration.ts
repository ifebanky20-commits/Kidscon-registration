import type { RegistrationForm } from "@/schemas/registration";

export const mockRegistration: RegistrationForm = {
  schoolInfo: {
    name: "Demo Greenfield School",
    category: "Primary",
    address: "12 Example Street, Ikeja, Lagos",
    contactPerson: "Demo School Coordinator",
    phone: "08000000000",
  },
  students: [
    { id: 1, name: "Demo Student One", gender: "Female", class: "Primary 5" },
    { id: 2, name: "Demo Student Two", gender: "Male", class: "Primary 4" },
  ],
  teachers: [{ id: 3, name: "Demo Teacher" }],
};
