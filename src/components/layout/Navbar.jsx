import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-2 z-40 mx-2 md:mx-6 md-elevation-1 bg-md-surface-container/80 backdrop-blur-md border border-md-outline/10 rounded-full px-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95 ease-md">
          <div className="w-10 h-10 bg-md-primary text-md-on-primary rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
            K
          </div>
          <span className="font-medium text-lg text-md-on-background tracking-tight">KIDSCON</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          {isAdmin ? (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link to="/">Exit Admin</Link>
              </Button>
            </>
          ) : (
            <>
              <Link to="/admin" className="hidden sm:block">
                <Button variant="ghost">Admin Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Register School</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
