import type { RegistrationForm } from "@/components/pages/registration/schema";
import { supabase } from "@/lib/supabase";

export async function submitRegistration(data: RegistrationForm, eventId: string, requestId: string) {
  const { data: schoolId, error } = await supabase.rpc("submit_school_registration", {
    p_request_id: requestId,
    p_event_id: eventId,
    p_school: data.schoolInfo,
    p_students: data.students.map(({ name, gender, class: studentClass }) => ({
      name,
      gender,
      class: studentClass,
    })),
    p_teachers: data.teachers.map(({ name }) => ({ name })),
  });

  if (error) throw error;
  return schoolId;
}
