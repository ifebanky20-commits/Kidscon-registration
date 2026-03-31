import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GraduationCap, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20 text-center lg:text-left relative z-10">

        {/* Left Content Area */}
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-md-secondary-container text-md-on-secondary-container text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-md">
              <span className="flex w-2 h-2 rounded-full bg-md-primary mr-2 animate-pulse"></span>
              Registrations now open for 2026
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold text-md-on-background tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ease-md fill-mode-both">
              Pre-register students for <span className="text-md-primary bg-md-primary/10 px-2 rounded-2xl inline-block -rotate-1 mt-1">Kidscon</span> events
            </h1>

            <p className="text-lg md:text-xl text-md-on-surface-variant max-w-lg lg:max-w-none mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 ease-md fill-mode-both">
              A personal, fast, and secure way for school administrators to manage student registrations and event participation. Let's make it effortless.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 ease-md fill-mode-both">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full h-14 md-elevation-2">
                Register Your School
              </Button>
            </Link>
            <Link to="/admin" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full h-14">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Hero Visuals */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-lg hidden md:block pt-12 lg:pt-0">

          <div className="relative w-full aspect-square bg-md-surface-container rounded-[48px] overflow-visible md-elevation-1 animate-in fade-in slide-in-from-right-8 duration-700 ease-md group">

            {/* Organic Blur decorations nested inside container */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--color-md-secondary-container)_0%,_transparent_70%)] opacity-80 mix-blend-multiply rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--color-md-tertiary)_0%,_transparent_70%)] opacity-20 mix-blend-multiply rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl" />

            {/* Glassmorphism Abstract Items */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 relative z-10 transition-transform duration-500 group-hover:scale-[1.02] ease-md">

              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] md-elevation-2 transform -rotate-3 transition-transform duration-500 ease-md group-hover:-rotate-6">
                <GraduationCap className="w-24 h-24 text-md-primary" strokeWidth={1.5} />
              </div>

              <div className="flex gap-6 items-center">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[24px] md-elevation-2 transform rotate-6 transition-transform duration-500 ease-md group-hover:rotate-12 group-hover:-translate-y-2">
                  <Users className="w-12 h-12 text-md-tertiary" strokeWidth={1.5} />
                </div>
                <div className="bg-md-primary/10 p-5 rounded-full transform -translate-y-6 -rotate-2 md-elevation-1">
                  <span className="font-bold text-3xl text-md-primary">+</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
