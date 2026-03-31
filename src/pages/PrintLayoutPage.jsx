import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { supabase } from '../lib/supabase';

export default function PrintLayoutPage() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchool() {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select(`
            *,
            students (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data.students) {
          data.students.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        setSchool(data);
      } catch (err) {
        console.error('Error fetching school for print:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSchool();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-800 animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">School Not Found</h2>
        <Link to="/admin" className="mt-4">
          <Button variant="outline" className="bg-white">Return to Admin</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-12 font-sans">
      
      {/* Non-printable controls */}
      <div className="max-w-4xl mx-auto py-6 px-8 flex justify-between items-center print:hidden">
        <Link to={`/admin/school/${id}`}>
          <Button variant="outline" className="gap-2 bg-white text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to School
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="gap-2 shadow-md bg-slate-800 text-white hover:bg-slate-900 border-0">
          <Printer size={18} /> Print Now
        </Button>
      </div>

      {/* A4 Printable Document */}
      <div className="max-w-[210mm] mx-auto bg-white sm:shadow-lg sm:my-4 print:shadow-none print:m-0 print:p-0">
        <div className="p-[20mm] print:p-0">
          
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-8 mt-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  KIDSCON Registration
                </h1>
                <p className="text-lg text-slate-600 font-medium">Event Attendance Sheet</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider">School</p>
                <p className="text-xl font-bold text-slate-900">{school.name}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <Table className="border-collapse border border-slate-300">
            <TableHeader>
              <TableRow className="bg-slate-100 border-b-2 border-slate-300">
                <TableHead className="w-16 border-r border-slate-300 text-slate-800 font-bold p-3 text-center">S/N</TableHead>
                <TableHead className="border-r border-slate-300 text-slate-800 font-bold p-3">Student Name</TableHead>
                <TableHead className="w-32 border-r border-slate-300 text-slate-800 font-bold p-3 text-center">Gender</TableHead>
                <TableHead className="w-40 border-slate-300 text-slate-800 font-bold p-3 text-center">Class</TableHead>
                <TableHead className="w-40 border-slate-300 text-slate-800 font-bold p-3 text-center">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {school.students && school.students.length > 0 ? (
                school.students.map((student, idx) => (
                  <TableRow key={student.id} className="border-b border-slate-300">
                    <TableCell className="border-r border-slate-300 text-center font-medium p-3">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="border-r border-slate-300 font-medium text-slate-900 p-3">
                      {student.name}
                    </TableCell>
                    <TableCell className="border-r border-slate-300 text-center p-3">
                      {student.gender}
                    </TableCell>
                    <TableCell className="border-r border-slate-300 text-center p-3">
                      {student.class}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="w-8 h-8 rounded border-2 border-slate-300 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-b border-slate-300">
                  <TableCell colSpan={5} className="text-center font-medium text-slate-500 p-6">
                    No students registered for this school.
                  </TableCell>
                </TableRow>
              )}
              
              {/* padding rows for extra manual entries if needed */}
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="border-b border-slate-300">
                   <TableCell className="border-r border-slate-300 text-center text-slate-400 p-3">{(school.students?.length || 0) + i + 1}</TableCell>
                   <TableCell className="border-r border-slate-300 p-3"></TableCell>
                   <TableCell className="border-r border-slate-300 p-3"></TableCell>
                   <TableCell className="border-r border-slate-300 p-3"></TableCell>
                   <TableCell className="p-3">
                     <div className="w-8 h-8 rounded border-2 border-slate-300 mx-auto"></div>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-slate-200 text-center text-slate-500 text-sm">
            <p>Official KIDSCON Registration &bull; Printed on {new Date().toLocaleDateString()}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
