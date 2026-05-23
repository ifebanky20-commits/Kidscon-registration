import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import ThemeToggle from '../ThemeToggle';
import logo from '../../assets/logo.jpeg';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-2 z-40 mx-2 md:mx-6 md-elevation-1 bg-md-surface-container/80 backdrop-blur-md border border-md-outline/10 rounded-full px-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 transition-transform active:scale-95 ease-md">
          <img src={logo} alt="KIDSCON Logo" className="h-12 w-auto mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-90" />
          <span className="font-bold text-sm sm:text-base lg:text-lg text-md-on-background tracking-tight leading-tight max-w-[120px] sm:max-w-none">KIDSCON MULTICREATION INTERNATIONAL</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {isAdmin && (
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link to="/">Exit Admin</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
