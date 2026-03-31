import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-md-background flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background glows */}
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-md-secondary-container/40 blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-md-primary/10 blur-[100px] mix-blend-multiply pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex w-16 h-16 bg-md-primary text-md-on-primary rounded-2xl items-center justify-center font-bold text-3xl shadow-md mb-5">
            K
          </div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">Admin Portal</h1>
          <p className="text-md-on-surface-variant mt-2">Sign in to access the KIDSCON dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-md-surface-container rounded-[32px] p-8 shadow-md animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          
          {error && (
            <div className="flex items-center gap-3 bg-md-error/10 text-md-error p-4 rounded-2xl mb-6 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-md-on-surface-variant mb-1 pl-4 transition-colors group-focus-within:text-md-primary">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none z-10" />
                <input
                  type="email"
                  required
                  placeholder="admin@kidscon.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low pl-11 pr-4 py-2 text-base text-md-on-background placeholder:text-md-on-background/40 focus:outline-none focus:border-md-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-md-on-surface-variant mb-1 pl-4 transition-colors group-focus-within:text-md-primary">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none z-10" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low pl-11 pr-4 py-2 text-base text-md-on-background placeholder:text-md-on-background/40 focus:outline-none focus:border-md-primary transition-all duration-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 h-14 text-base font-bold shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
