import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Printer, Download, MapPin, User, Phone } from 'lucide-react';

export default function SchoolDetailPage() {
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
            students (*),
            teachers (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Sort students logically if needed by ID
        if (data.students) {
          data.students.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        setSchool(data);
      } catch (err) {
        console.error('Error fetching school details:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSchool();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold text-md-on-background">School Not Found</h2>
        <p className="text-md-on-surface-variant mt-2 mb-6">The registration record you are looking for does not exist.</p>
        <Link to="/admin">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-md-surface-container-low hover:bg-md-surface-container hover:shadow-sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-md-on-background tracking-tight flex items-center gap-3">
              {school.name}
              <span className="inline-flex w-3 h-3 rounded-full bg-success-500"></span>
            </h1>
            <p className="text-md-on-surface-variant font-medium mt-1">{school.category} Category</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none gap-2 bg-white">
            <Download size={18} /> Download PDF
          </Button>
          <Link to={`/print/${id}`} target="_blank" className="flex-1 lg:flex-none">
            <Button variant="primary" className="w-full gap-2 md-elevation-1">
              <Printer size={18} /> Print Attendance
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Contact Info */}
        <div className="space-y-8">
          <Card className="rounded-[32px] md-elevation-1 bg-md-surface-container-low border-0">
            <CardHeader className="pt-8 px-8 pb-4 border-b-0">
              <CardTitle className="font-bold tracking-tight text-xl">Contact Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-6">
              
              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-full bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-md-on-surface-variant tracking-wide uppercase mb-1">Physical Address</p>
                  <p className="text-base text-md-on-background font-medium leading-relaxed">{school.address || 'N/A'}</p>
                </div>
              </div>

              <div className="h-px w-full bg-md-outline/10"></div>
              
              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-full bg-md-tertiary/20 text-md-on-surface-variant flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-md-on-surface-variant tracking-wide uppercase mb-1">Contact Person</p>
                  <p className="text-base text-md-on-background font-medium">{school.contact_person || 'N/A'}</p>
                </div>
              </div>

              <div className="h-px w-full bg-md-outline/10"></div>

              <div className="flex gap-4 group">
                <div className="mt-1 w-10 h-10 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-md-on-surface-variant tracking-wide uppercase mb-1">Phone Reference</p>
                  <p className="text-base text-md-on-background font-medium">{school.phone || 'N/A'}</p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Quick Stat */}
          <div className="bg-md-secondary-container text-md-on-secondary-container p-8 rounded-[32px] text-center md-elevation-1 transform transition-transform hover:-translate-y-2 hover:shadow-lg duration-500 ease-md">
            <p className="font-semibold tracking-wide uppercase mb-2 text-sm opacity-80">Total Enrollments</p>
            <p className="text-6xl font-extrabold tracking-tight">{school.students?.length || 0}</p>
          </div>
        </div>

        {/* Right Column - Students List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-md-on-background tracking-tight">Registered Roster</h2>
          </div>
          
          <Table className="rounded-[24px] overflow-hidden md-elevation-1 border border-md-outline/5 bg-md-background">
            <TableHeader className="bg-md-surface-container border-b-0">
              <TableRow className="border-0">
                <TableHead className="w-16 text-center rounded-tl-[24px]">S/N</TableHead>
                <TableHead className="font-semibold">Student Name</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold rounded-tr-[24px]">Class / Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child_td:first-child]:rounded-bl-[24px] [&_tr:last-child_td:last-child]:rounded-br-[24px]">
              {(!school.students || school.students.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 font-medium text-md-on-surface-variant">
                    No students registered for this school.
                  </TableCell>
                </TableRow>
              ) : (
                school.students.map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-md-surface-container-low transition-colors duration-200 border-md-outline/5">
                    <TableCell className="text-center text-md-on-surface-variant font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-bold text-md-on-background">{student.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        student.gender === 'Female' ? 'bg-[#FFD8E4] text-[#31111D]' : 'bg-md-secondary-container text-md-on-secondary-container'
                      }`}>
                        {student.gender}
                      </span>
                    </TableCell>
                    <TableCell className="text-md-on-surface-variant font-medium">{student.class}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}
