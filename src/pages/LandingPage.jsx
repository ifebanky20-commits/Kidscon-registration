import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import ceoPic from '../assets/ceo.jpg';
import eventPic from '../assets/event.jpg';

// Fallback if Supabase hasn't been set up yet
const FALLBACK_EVENT = { name: 'KIDSCON', date: '2026-05-23' };

function getTimeLeft(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const diff = target - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function CountdownUnit({ value, label }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--md-primary, #6750A4) 0%, var(--md-tertiary, #7D5260) 100%)',
          boxShadow: '0 8px 32px rgba(103,80,164,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-2xl pointer-events-none" />
        <span className="relative text-3xl md:text-4xl font-extrabold text-white tracking-tighter tabular-nums">
          {display}
        </span>
      </div>
      <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-md-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const [event, setEvent] = useState(FALLBACK_EVENT);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(FALLBACK_EVENT.date));

  // Fetch the event from Supabase once on mount
  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'next_event')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          setEvent(parsed);
          setTimeLeft(getTimeLeft(parsed.date));
        }
      });
  }, []);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(event.date)), 1000);
    return () => clearInterval(id);
  }, [event.date]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-20 text-center lg:text-left relative z-10 pt-6 lg:pt-0">

        {/* Left Content Area */}
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-md-secondary-container text-md-on-secondary-container text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-md">
              <span className="flex w-2 h-2 rounded-full bg-md-primary mr-2 animate-pulse"></span>
              2026 Event Registration Now Open
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold text-md-on-background tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ease-md fill-mode-both">
              Pre-register Students for <span className="text-md-primary bg-md-primary/10 px-2 rounded-2xl inline-block -rotate-1 mt-1">KIDSCON</span> Events with Ease
            </h1>

            <p className="text-xl md:text-2xl font-medium text-md-on-surface-variant max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 ease-md fill-mode-both">
              A fast, secure, and stress-free way for schools to register students before event day—saving time, reducing paperwork, and making participation seamless.
            </p>

            <p className="text-base md:text-lg text-md-on-surface-variant/80 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[300ms] ease-md fill-mode-both">
              KIDSCON Register helps school administrators submit student and teacher details online in advance, so event-day check-in is faster, more organized, and hassle-free for everyone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms] ease-md fill-mode-both">
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

        {/* Hero Image — visible on ALL screen sizes (was hidden on mobile) */}
        <div className="w-full max-w-sm mx-auto md:flex-1 md:max-w-md lg:max-w-lg">
          <div className="relative w-full aspect-[4/3] lg:aspect-[1.1/1] bg-md-surface-container rounded-[32px] md:rounded-[48px] overflow-hidden md-elevation-1 animate-in fade-in slide-in-from-right-8 duration-[700ms] ease-md group ring-4 ring-white/50 shadow-2xl">
            <img 
              src={eventPic} 
              alt="Kidscon Event Audience" 
              className="absolute inset-0 w-full h-full object-cover contrast-[1.05] saturate-[1.15] brightness-[1.03] transition-transform duration-[700ms] ease-md group-hover:scale-105" 
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-black/0 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* ── Countdown Timer ── */}
      <div className="w-full max-w-5xl mt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-[700ms] delay-[450ms] ease-md fill-mode-both">
        <div className="bg-md-surface-container-low rounded-[40px] p-8 md:p-12 ring-1 ring-md-outline/10 md-elevation-1 text-center">
          {timeLeft.expired ? (
            <p className="text-2xl font-bold text-md-primary">🎉 The event is live today!</p>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest text-md-on-surface-variant mb-2">
                Next Program
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-md-on-background tracking-tight mb-8">
                {event.name} —{' '}
                {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>

              <div className="flex items-start justify-center gap-4 md:gap-8">
                <CountdownUnit value={timeLeft.days}    label="Days"    />
                <span className="text-4xl md:text-5xl font-extrabold text-md-primary mt-3 select-none">:</span>
                <CountdownUnit value={timeLeft.hours}   label="Hours"   />
                <span className="text-4xl md:text-5xl font-extrabold text-md-primary mt-3 select-none">:</span>
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <span className="text-4xl md:text-5xl font-extrabold text-md-primary mt-3 select-none">:</span>
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </div>

              <p className="mt-8 text-sm text-md-on-surface-variant/70">
                Register your school now to secure your spot before the big day!
              </p>
            </>
          )}
        </div>
      </div>

      {/* CEO Welcome Section */}
      <div className="w-full max-w-5xl mt-12 mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-[700ms] delay-[500ms] ease-md fill-mode-both">
        <div className="bg-md-surface-container-low rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 md-elevation-1 ring-1 ring-md-outline/5 transition-transform duration-500 hover:shadow-lg">
          <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-full overflow-hidden border-8 border-white dark:border-md-background shadow-xl">
            <img src={ceoPic} alt="CEO of KIDSCON Multicreations International" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-md-on-background tracking-tight">Welcome to the Portal</h2>
            <p className="text-lg md:text-xl text-md-on-surface-variant leading-relaxed">
              "We can't wait to host your brilliant students at our next big event. Our team built this secure portal specifically to make your registration completely hassle-free, so you can focus on preparing the kids for an unforgettable experience."
            </p>
            <div className="pt-2 border-t border-md-outline/10 mt-6 inline-block w-full md:w-auto">
              <p className="font-bold text-md-on-background text-lg pt-4">Funmi Bankole</p>
              <p className="text-md-on-surface-variant text-sm font-medium">KIDSCON MD/CEO</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
