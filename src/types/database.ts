/** Database columns used by the application. Keep in sync with the Supabase schema. */
export type EventRow = {
  id: string; name: string; location: string; date: string; is_open: boolean; created_at: string;
};
export type SchoolRow = {
  id: string; name: string; category: string; address: string; contact_person: string;
  phone: string; event_id: string | null; created_at: string;
};
export type StudentRow = {
  id: string; school_id: string; name: string; gender: string; class: string; created_at: string;
};
export type TeacherRow = { id: string; school_id: string; name: string; created_at: string; };
export type AvailableSchoolRow = { id: string; name: string; created_at: string; };
type Table<Row, Required extends keyof Row, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Row>;
  Update: Partial<Row>;
  Relationships: Relationships;
};
export type Database = {
  public: {
    Tables: {
      events: Table<EventRow, 'name' | 'location' | 'date'>;
      schools: Table<SchoolRow, 'name' | 'category' | 'address' | 'contact_person' | 'phone', [{
        foreignKeyName: 'schools_event_id_fkey'; columns: ['event_id']; isOneToOne: false;
        referencedRelation: 'events'; referencedColumns: ['id'];
      }]>;
      students: Table<StudentRow, 'school_id' | 'name' | 'gender' | 'class', [{
        foreignKeyName: 'students_school_id_fkey'; columns: ['school_id']; isOneToOne: false;
        referencedRelation: 'schools'; referencedColumns: ['id'];
      }]>;
      teachers: Table<TeacherRow, 'school_id' | 'name', [{
        foreignKeyName: 'teachers_school_id_fkey'; columns: ['school_id']; isOneToOne: false;
        referencedRelation: 'schools'; referencedColumns: ['id'];
      }]>;
      available_schools: Table<AvailableSchoolRow, 'name'>;
      app_settings: Table<{ key: string; value: string; }, 'key' | 'value'>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
};

export type CountRelation = { count: number; }[];
export type SchoolCounts = Pick<SchoolRow, 'id' | 'name' | 'created_at'> & { students: CountRelation; };
export type SchoolSummary = Omit<SchoolRow, 'event_id'> & { students: CountRelation; teachers: CountRelation; };
export type SchoolDetails = SchoolRow & { students: StudentRow[]; teachers: TeacherRow[]; };
export type EventWithCounts = EventRow & { schools: CountRelation; };
export type ToastMessage = { type: 'success' | 'error'; msg: string; };
