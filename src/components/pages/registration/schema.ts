import * as z from "zod";

export const MAX_STUDENTS = 20;

export const registrationSchema = z.object({
  schoolInfo: z.object({
    name: z.string().min(2, "School name must be at least 2 characters"),
    category: z.enum(["Primary", "Secondary", "Both"]),
    address: z.string().min(5, "Physical address is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    phone: z.string().min(10, "Valid phone number is required"),
  }),
  students: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Name is required"),
        gender: z.enum(["Male", "Female"]),
        class: z.string().min(1, "Class is required"),
      }),
    )
    .min(1, "Add at least one student")
    .max(MAX_STUDENTS, `Max ${MAX_STUDENTS} students allowed`),
  teachers: z.array(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Name is required"),
    }),
  ),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
