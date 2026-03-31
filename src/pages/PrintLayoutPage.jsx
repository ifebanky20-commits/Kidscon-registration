import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

// Mock data
const mockSchool = {
  id: '1',
  name: 'Greenwood High School',
  students: [
    { id: 1, name: 'Alice Smith', gender: 'Female', class: 'Grade 5' },
    { id: 2, name: 'Bob Johnson', gender: 'Male', class: 'Grade 5' },
    { id: 3, name: 'Charlie Brown', gender: 'Male', class: 'Grade 6' },
    { id: 4, name: 'Diana Prince', gender: 'Female', class: 'Grade 6' },
    { id: 5, name: 'Ethan Hunt', gender: 'Male', class: 'Grade 7' },
    { id: 6, name: 'Fiona Gallagher', gender: 'Female', class: 'Grade 7' },
  ]
};

export default function PrintLayoutPage() {
  const { id } = useParams();
  const school = mockSchool;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-12 font-sans">
      
      {/* Non-printable controls */}
      <div className="max-w-4xl mx-auto py-6 px-8 flex justify-between items-center print:hidden">
        <Link to={`/admin/school/${id}`}>
          <Button variant="outline" className="gap-2 bg-white">
            <ArrowLeft size={16} /> Back to School
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="gap-2 shadow-md">
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
                <TableHead className="w-40 border-slate-300 text-slate-800 font-bold p-3 text-center">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {school.students.map((student, idx) => (
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
                  <TableCell className="p-3">
                    <div className="w-8 h-8 rounded border-2 border-slate-300 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* padding rows for extra manual entries if needed */}
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="border-b border-slate-300">
                   <TableCell className="border-r border-slate-300 text-center text-slate-400 p-3">{school.students.length + i + 1}</TableCell>
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
