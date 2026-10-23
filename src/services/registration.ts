import type { RegistrationForm } from "@/schemas/registration";
import { supabase } from "@/lib/supabase";

export async function submitRegistration(data: RegistrationForm, eventId: string | null) {
  const schoolId = crypto.randomUUID();

  const { error: schoolError } = await supabase.from("schools").insert({
    id: schoolId,
    name: data.schoolInfo.name,
    category: data.schoolInfo.category,
    address: data.schoolInfo.address,
    contact_person: data.schoolInfo.contactPerson,
    phone: data.schoolInfo.phone,
    event_id: eventId || null,
  });

  if (schoolError) throw schoolError;

  if (data.students.length > 0) {
    const { error: studentsError } = await supabase.from("students").insert(
      data.students.map((s) => ({
        school_id: schoolId,
        name: s.name,
        gender: s.gender,
        class: s.class,
      })),
    );
    if (studentsError) throw studentsError;
  }

  if (data.teachers.length > 0) {
    const { error: teachersError } = await supabase
      .from("teachers")
      .insert(
        data.teachers.map((t) => ({ school_id: schoolId, name: t.name })),
      );
    if (teachersError) throw teachersError;
  }

  return schoolId;
}
