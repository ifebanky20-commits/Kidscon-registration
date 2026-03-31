import { useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Download, Edit } from 'lucide-react';

export default function ConfirmationPage() {
  const location = useLocation();
  const totalStudents = location.state?.totalStudents || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 relative z-10">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-md-secondary-container/60 blur-[100px] rounded-full -z-10 mix-blend-multiply" />

      <div className="text-center space-y-6 max-w-md w-full bg-md-surface-container p-8 md:p-12 rounded-[32px] md-elevation-2 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-md">
        
        <div className="mx-auto w-24 h-24 bg-success-50 text-success-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-12 h-12" strokeWidth={1.5} />
        </div>
        
        <div>
          <h1 className="text-3xl font-medium text-md-on-background tracking-tight">Registration Successful!</h1>
          <p className="mt-3 text-md-on-surface-variant text-lg leading-relaxed">Your school and students have been properly enrolled.</p>
        </div>

        <div className="bg-md-surface-container-low py-5 px-8 rounded-3xl mt-8 inline-block shadow-sm">
          <p className="text-md-on-surface-variant text-sm font-semibold tracking-wide uppercase mb-1">Total Enrolled</p>
          <p className="text-5xl font-bold text-md-primary">{totalStudents}</p>
        </div>

        <div className="flex flex-col gap-4 mt-8 pt-4">
          <Button variant="primary" size="lg" className="w-full gap-2 text-base md-elevation-1" onClick={() => window.print()}>
            <Download size={20} /> Download PDF
          </Button>
          
          <Link to="/register" className="w-full">
            <Button variant="ghost" size="lg" className="w-full gap-2 text-md-on-surface-variant">
              <Edit size={18} /> Edit Submission
            </Button>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
