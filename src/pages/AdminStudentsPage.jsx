import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Users, Search, Filter } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // We join the 'schools' table to get the school name alongside the student
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          schools (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schools?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Master Student Directory</h1>
          <p className="text-md-on-surface-variant font-medium mt-1">View and search across all registered students from all schools.</p>
        </div>
        <div className="bg-md-tertiary/10 text-md-tertiary px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
          <Users size={16} />
          {students.length} Total Students
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant" />
        <input
          type="text"
          placeholder="Search students, schools, or class..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-md-surface-container rounded-full border border-md-outline/10 focus:outline-none focus:ring-2 focus:ring-md-primary/50 text-md-on-background placeholder:text-md-on-surface-variant/50 transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-md-tertiary/20 border-t-md-tertiary animate-spin" />
        </div>
      ) : (
        <Table className="rounded-[28px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-surface-container-low">
          <TableHeader className="bg-md-surface-container">
            <TableRow className="border-md-outline/10">
              <TableHead className="py-5 font-semibold">Student Name</TableHead>
              <TableHead className="py-5 font-semibold">Associated School</TableHead>
              <TableHead className="py-5 font-semibold text-center">Gender</TableHead>
              <TableHead className="py-5 font-semibold">Class / Grade</TableHead>
              <TableHead className="py-5 font-semibold text-right">Registration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-md-on-surface-variant font-medium">
                  {searchTerm ? 'No students found matching your search.' : 'No students have been registered yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-md-surface-container transition-colors border-md-outline/5">
                  <TableCell className="font-bold text-md-on-background py-5">{student.name}</TableCell>
                  <TableCell className="text-md-on-surface-variant font-medium py-5">
                    {student.schools?.name || 'Unknown School'}
                  </TableCell>
                  <TableCell className="text-center py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      student.gender === 'Female' ? 'bg-[#FFD8E4] text-[#31111D]' : 'bg-md-secondary-container text-md-on-secondary-container'
                    }`}>
                      {student.gender}
                    </span>
                  </TableCell>
                  <TableCell className="text-md-on-surface-variant font-medium py-5">{student.class}</TableCell>
                  <TableCell className="text-md-on-surface-variant text-right py-5 text-sm">
                    {new Date(student.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

    </div>
  );
}
