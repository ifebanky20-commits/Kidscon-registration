import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, School, Users, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true },
    { label: 'Verified Schools', icon: School, path: '/admin/schools' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Export Data', icon: Download, path: '/admin/export' },
  ];

  return (
    <div className="min-h-screen flex bg-md-surface-container">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-md-surface-container-low border-r border-md-outline/10 text-md-on-background relative z-20 shadow-sm transition-all">
        
        {/* Glow behind logo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-md-primary/10 blur-xl pointer-events-none -z-10" />

        <div className="h-24 flex items-center px-8 border-b border-md-outline/5 relative">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <img src={logo} alt="KIDSCON Logo" className="h-12 w-auto" style={{mixBlendMode: 'multiply'}} />
            <span className="font-bold tracking-tight text-lg">KIDSCON Admin</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-full transition-all duration-300 ease-md group font-medium ${
                  isActive 
                  ? 'bg-md-secondary-container text-md-on-secondary-container md-elevation-1' 
                  : 'text-md-on-surface-variant hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 hover:text-md-on-background'
                }`
              }
            >
              <item.icon size={20} className="transition-transform group-hover:scale-110 duration-300 ease-md" strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-md-outline/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 rounded-full text-md-on-surface-variant hover:bg-bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 transition-all font-medium w-full text-left cursor-pointer"
          >
            <LogOut size={20} strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-md-background md:rounded-l-[32px] md:shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
        
        {/* Top organic blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-md-primary/5 blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-md-outline/10 flex items-center px-4 bg-md-surface-container/80 backdrop-blur-md sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="KIDSCON Logo" className="h-9 w-auto" style={{mixBlendMode: 'multiply'}} />
            <span className="font-bold">Admin Portal</span>
          </Link>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
