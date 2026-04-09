import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Plus, Trash2, Upload, BookOpen, Users, UserPlus, CheckCircle, School, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form State
  const [schoolInfo, setSchoolInfo] = useState({ name: '', category: 'Primary', address: '', contactPerson: '', phone: '' });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gender: 'Male', class: '' });
  
  const [newTeacherName, setNewTeacherName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');



  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  
  const handleAddStudent = () => {
    if (newStudent.name && newStudent.class) {
      setStudents([...students, { ...newStudent, id: Date.now() }]);
      setNewStudent({ name: '', gender: 'Male', class: '' });
      setIsStudentModalOpen(false);
    }
  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleAddTeacher = () => {
    if (newTeacherName.trim()) {
      setTeachers([...teachers, { name: newTeacherName, id: Date.now() }]);
      setNewTeacherName('');
    }
  };

  const handleRemoveTeacher = (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      // Generate UUID locally so we don't need to .select() it back (which triggers RLS block)
      const schoolId = crypto.randomUUID();

      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          id: schoolId,
          name: schoolInfo.name,
          category: schoolInfo.category,
          address: schoolInfo.address,
          contact_person: schoolInfo.contactPerson,
          phone: schoolInfo.phone,
        });

      if (schoolError) throw schoolError;

      if (students.length > 0) {
        const { error: studentsError } = await supabase
          .from('students')
          .insert(students.map(s => ({
            school_id: schoolId,
            name: s.name,
            gender: s.gender,
            class: s.class,
          })));
        if (studentsError) throw studentsError;
      }

      if (teachers.length > 0) {
        const { error: teachersError } = await supabase
          .from('teachers')
          .insert(teachers.map(t => ({ school_id: schoolId, name: t.name })));
        if (teachersError) throw teachersError;
      }

      navigate('/confirmation', { state: { totalStudents: students.length, schoolName: schoolInfo.name } });
    } catch (err) {
      setSubmitError('Failed to register. Please check your connection and try again.');
      console.error('Registration error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const stepIcons = [BookOpen, Users, UserPlus, CheckCircle];

  return (
    <div className="max-w-4xl mx-auto relative z-10">
      
      {/* Decorative Blobs */}
      <div className="fixed top-20 left-10 w-[300px] h-[300px] bg-md-secondary-container/40 blur-[80px] rounded-full -z-10 mix-blend-multiply" />
      <div className="fixed bottom-20 right-10 w-[400px] h-[400px] bg-md-primary/10 blur-[100px] rounded-full -z-10 mix-blend-multiply" />

      {/* Progress Indicator */}
      <div className="mb-14 px-2 sm:px-8">
        <div className="flex justify-between items-start relative h-20">
          <div className="absolute left-8 right-8 sm:left-14 sm:right-14 top-6 h-1 bg-md-surface-container-low -z-10 rounded-full">
            <div 
              className="h-full bg-md-primary rounded-full transition-all duration-500 ease-md" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
          
          {['School Info', 'Students', 'Teachers', 'Review'].map((label, idx) => {
            const Icon = stepIcons[idx];
            const isCompleted = step > idx + 1;
            const isCurrent = step === idx + 1;
            
            return (
              <div key={idx} className="flex flex-col items-center w-16 sm:w-24 relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-md ${
                    isCompleted ? 'bg-md-primary text-md-on-primary scale-100 shadow-md' 
                    : isCurrent ? 'bg-md-secondary-container text-md-on-secondary-container ring-4 ring-md-primary/20 scale-110 z-10 shadow-md' 
                    : 'bg-md-surface-container text-md-on-surface-variant shadow-sm'
                  }`}
                >
                  <Icon size={isCurrent ? 22 : 20} strokeWidth={isCurrent || isCompleted ? 2.5 : 1.5} />
                </div>
                <span className={`text-[11px] sm:text-sm tracking-wide text-center absolute top-16 w-24 ${isCurrent ? 'font-bold text-md-on-background' : 'font-medium text-md-on-surface-variant'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <Card className="rounded-[32px] md-elevation-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-md">
        <CardHeader className="bg-md-secondary-container/20 pb-4 pt-6 px-8 rounded-t-[32px]">
          <CardTitle className="text-2xl font-bold tracking-tight text-md-on-background">
            {step === 1 && 'School Details'}
            {step === 2 && 'Student Enrollment'}
            {step === 3 && 'Teachers & Staff Entry'}
            {step === 4 && 'Final Review & Registration'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="min-h-[350px] p-8">
          
          {/* STEP 1: School Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300 ease-md">
              <Input
                label="School Name"
                placeholder="Enter your school's full name"
                value={schoolInfo.name}
                onChange={e => setSchoolInfo({...schoolInfo, name: e.target.value})}
              />
              <div className="group">
                <label className="block text-sm font-medium text-md-on-surface-variant mb-1 pl-4 transition-colors group-focus-within:text-md-primary">School Category</label>
                <select 
                  className="flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low px-4 py-2 text-base focus:outline-none focus:border-md-primary focus:bg-md-surface-container-low/80 transition-all duration-200 ease-md"
                  value={schoolInfo.category}
                  onChange={e => setSchoolInfo({...schoolInfo, category: e.target.value})}
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Both">Both (Primary & Secondary)</option>
                </select>
              </div>
              <Input 
                label="Physical Address" 
                placeholder="Where is the school located?"
                value={schoolInfo.address}
                onChange={e => setSchoolInfo({...schoolInfo, address: e.target.value})}
              />
              <Input 
                label="Contact Person Name" 
                placeholder="Principal or representative"
                value={schoolInfo.contactPerson}
                onChange={e => setSchoolInfo({...schoolInfo, contactPerson: e.target.value})}
              />
              <Input 
                label="Phone Number" 
                type="tel" 
                placeholder="e.g. 08012345678"
                value={schoolInfo.phone}
                onChange={e => setSchoolInfo({...schoolInfo, phone: e.target.value})}
              />
            </div>
          )}

          {/* STEP 2: Students */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 ease-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-md-surface-container-low p-4 rounded-2xl">
                <p className="text-md-on-surface-variant font-medium ml-2">Total Students: <span className="font-bold text-2xl text-md-primary ml-2">{students.length}</span></p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="hidden sm:flex gap-2 flex-1">
                    <Upload size={18} /> Upload Excel
                  </Button>
                  <Button variant="secondary" onClick={() => setIsStudentModalOpen(true)} className="gap-2 flex-1 md-elevation-1 shadow-md">
                    <Plus size={18} /> Add Student
                  </Button>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-md-outline/30 rounded-3xl bg-md-surface-container">
                  <p className="text-md-on-surface-variant text-lg">No students added yet.</p>
                  <Button variant="ghost" className="mt-4 gap-2 text-md-primary" onClick={() => setIsStudentModalOpen(true)}>
                    <Plus size={18} /> Add your first student
                  </Button>
                </div>
              ) : (
                <Table className="rounded-2xl overflow-hidden">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="w-[80px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium text-md-on-background">{s.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            s.gender === 'Female' ? 'bg-[#FFD8E4] text-[#31111D]' : 'bg-md-secondary-container text-md-on-secondary-container'
                          }`}>
                            {s.gender}
                          </span>
                        </TableCell>
                        <TableCell className="text-md-on-surface-variant font-medium">{s.class}</TableCell>
                        <TableCell className="text-right">
                          <button onClick={() => handleRemoveStudent(s.id)} className="text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 transition-colors p-2 rounded-full active:scale-95">
                            <Trash2 size={18} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* STEP 3: Teachers */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 ease-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  label="Teacher's Full Name"
                  placeholder="e.g. Adebayo Ogunlesi" 
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTeacher()}
                  className="flex-1"
                />
                <Button onClick={handleAddTeacher} variant="secondary" className="sm:mt-6 px-8 whitespace-nowrap h-14 md-elevation-1 shadow-md">
                  <Plus size={18} className="mr-2" /> Add Teacher
                </Button>
              </div>

              {teachers.length === 0 ? (
                <div className="text-center py-12 rounded-3xl bg-md-surface-container-low border border-md-outline/10 text-md-on-surface-variant">
                  <p>No teachers currently assigned to this registration.</p>
                </div>
              ) : (
                <div className="bg-md-surface-container rounded-[24px] border border-md-outline/10 overflow-hidden md-elevation-1">
                  <ul className="divide-y divide-md-outline/10">
                    {teachers.map(t => (
                      <li key={t.id} className="p-4 px-6 flex justify-between items-center group hover:bg-md-surface-container-low/50 transition-colors">
                        <span className="font-medium text-lg text-md-on-background tracking-tight">{t.name}</span>
                        <button onClick={() => handleRemoveTeacher(t.id)} className="text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 transition-colors p-2 rounded-full active:scale-95 opacity-0 group-hover:opacity-100">
                          <Trash2 size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 ease-md">
              <div className="bg-md-surface-container-low p-8 rounded-[24px] space-y-6">
                <h3 className="font-bold text-xl text-md-on-background tracking-tight flex items-center gap-3">
                  <School className="text-md-primary" />
                  School Details Profile
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 gap-y-8">
                  <div>
                    <span className="text-md-on-surface-variant text-sm font-medium tracking-wide uppercase block mb-1">School Name</span>
                    <span className="font-semibold text-lg text-md-on-background">{schoolInfo.name || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-md-on-surface-variant text-sm font-medium tracking-wide uppercase block mb-1">Category</span>
                    <span className="font-semibold text-lg text-md-on-background">{schoolInfo.category || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-md-on-surface-variant text-sm font-medium tracking-wide uppercase block mb-1">Physical Address</span>
                    <span className="font-semibold text-base text-md-on-background">{schoolInfo.address || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-md-on-surface-variant text-sm font-medium tracking-wide uppercase block mb-1">Contact Details</span>
                    <span className="font-semibold text-base text-md-on-background block">{schoolInfo.contactPerson || '-'}</span>
                    <span className="text-md-on-surface-variant">{schoolInfo.phone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 bg-md-secondary-container text-md-on-secondary-container p-6 rounded-[24px] text-center md-elevation-1 transition-transform hover:scale-[1.02] duration-300 ease-md">
                  <p className="font-semibold tracking-wide uppercase mb-2 opacity-80 text-sm">Total Students</p>
                  <p className="text-5xl font-extrabold">{students.length}</p>
                </div>
                <div className="flex-1 bg-md-tertiary text-md-on-tertiary p-6 rounded-[24px] text-center md-elevation-1 transition-transform hover:scale-[1.02] duration-300 ease-md">
                  <p className="font-semibold tracking-wide uppercase mb-2 opacity-80 text-sm">Total Teachers</p>
                  <p className="text-5xl font-extrabold">{teachers.length}</p>
                </div>
              </div>
            </div>
          )}

        </CardContent>

        {submitError && step === 4 && (
          <div className="mx-6 mb-4 flex items-center justify-center gap-2 bg-md-error/10 text-md-error p-4 rounded-xl text-sm font-semibold">
            <AlertCircle size={20} />
            {submitError}
          </div>
        )}
        
        <CardFooter className="justify-between bg-md-surface-container-low/50 border-t border-md-outline/10 p-6 rounded-b-[32px]">
          <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={step === 1 || submitLoading}
            className={step === 1 ? 'invisible focus:outline-none' : 'text-md-on-surface-variant'}
          >
            ← Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext} className="gap-2 px-8 h-12 text-base md-elevation-1 shadow-md">
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              variant="primary" 
              disabled={submitLoading}
              className="gap-2 px-10 h-14 text-lg font-bold bg-md-primary hover:bg-md-primary/90 md-elevation-2 hover:md-elevation-3 transition-opacity"
            >
              {submitLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting Registration...
                </span>
              ) : (
                'Submit Registration'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Add Student Modal */}
      <Modal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        title="Add New Student"
      >
        <div className="space-y-6">
          <Input 
            label="Student Full Name" 
            placeholder="e.g. John Doe"
            value={newStudent.name}
            onChange={e => setNewStudent({...newStudent, name: e.target.value})}
          />
          
          <div className="group">
            <label className="block text-sm font-medium text-md-on-surface-variant mb-1 pl-4 transition-colors group-focus-within:text-md-primary">Gender</label>
            <select 
              className="flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low px-4 py-2 text-base focus:outline-none focus:border-md-primary focus:bg-md-surface-container-low/80 transition-all duration-200 ease-md"
              value={newStudent.gender}
              onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <Input 
            label="Class / Grade Details" 
            placeholder="e.g. Grade 5"
            value={newStudent.class}
            onChange={e => setNewStudent({...newStudent, class: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-md-outline/10 mt-8">
            <Button variant="ghost" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} className="md-elevation-1">Save Student</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
