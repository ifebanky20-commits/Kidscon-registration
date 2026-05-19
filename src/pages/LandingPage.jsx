import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import ceoPic from '../assets/ceo.jpg';
import eventPic from '../assets/event.jpg';
import { MapPin, CalendarDays, ArrowRight, CalendarX } from 'lucide-react';

// ── Countdown helpers ─────────────────────────────────────────────────────────
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
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--md-primary, #6750A4) 0%, var(--md-tertiary, #7D5260) 100%)',
          boxShadow: '0 4px 16px rgba(103,80,164,0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-xl pointer-events-none" />
        <span className="relative text-xl sm:text-2xl font-extrabold text-white tracking-tighter tabular-nums">
          {display}
        </span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-md-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

// ── Single event card with its own live countdown ─────────────────────────────
function EventCard({ event }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(event.date));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(event.date)), 1000);
    return () => clearInterval(id);
  }, [event.date]);

  const formattedDate = new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-md-surface-container-low rounded-[32px] p-6 sm:p-8 ring-1 ring-md-outline/10 md-elevation-1 flex flex-col gap-6 hover:shadow-lg transition-shadow duration-300">
      {/* Event info */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-md-on-background tracking-tight">{event.name}</h3>

        <div className="flex items-center gap-2 text-sm text-md-on-surface-variant font-medium">
          <MapPin size={14} className="shrink-0 text-md-primary" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-md-on-surface-variant font-medium">
          <CalendarDays size={14} className="shrink-0 text-md-primary" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Mini countdown */}
      {!timeLeft.expired && (
        <div className="flex items-center gap-2 sm:gap-3">
          <CountdownUnit value={timeLeft.days} label="Days" />
          <span className="text-xl font-extrabold text-md-primary pb-4">:</span>
          <CountdownUnit value={timeLeft.hours} label="Hrs" />
          <span className="text-xl font-extrabold text-md-primary pb-4">:</span>
          <CountdownUnit value={timeLeft.minutes} label="Min" />
          <span className="text-xl font-extrabold text-md-primary pb-4">:</span>
          <CountdownUnit value={timeLeft.seconds} label="Sec" />
        </div>
      )}

      {/* Register button */}
      <Link to={`/register?event=${event.id}`} className="mt-auto">
        <Button className="w-full gap-2 h-12 text-base font-bold md-elevation-1">
          Register for this Event <ArrowRight size={18} />
        </Button>
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openEvents, setOpenEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('events')
      .select('id, name, location, date')
      .eq('is_open', true)
      .gte('date', today)
      .order('date', { ascending: true })
      .then(({ data }) => {
        setOpenEvents(data || []);
        setLoadingEvents(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-20 text-center lg:text-left relative z-10 pt-6 lg:pt-0">

        {/* Left Content Area */}
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-md-secondary-container text-md-on-secondary-container text-xs font-medium mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-md">
              <span className="flex w-2 h-2 rounded-full bg-md-primary mr-2 animate-pulse"></span>
              2026 Event Registration Now Open
            </div>

            <h1 className="text-4xl font-bold text-md-on-background tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ease-md fill-mode-both">
              Pre-register Students for <span className="text-md-primary bg-md-primary/10 px-2 rounded-2xl inline-block -rotate-1 mt-1">KIDSCON</span> Events with Ease
            </h1>

            <p className="text-sm text-justify text-md-on-surface-variant/80 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[300ms] ease-md fill-mode-both">
              A fast, secure, and stress-free way for schools to register students before event day—saving time, reducing paperwork, and making participation seamless.
              KIDSCON Register helps school administrators submit student and teacher details online in advance, so event-day check-in is faster, more organized, and hassle-free for everyone.
            </p>
          </div>
        </div>

        {/* Hero Image */}
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

      {/* ── Open Events Section ───────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl mt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-[700ms] delay-[450ms] ease-md fill-mode-both">

        <div className="mb-6 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-md-on-surface-variant mb-1">
            Upcoming Programs
          </p>
          <h2 className="text-2xl font-extrabold text-md-on-background tracking-tight">
            Choose Your Event
          </h2>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
          </div>
        ) : openEvents.length === 0 ? (
          <div className="bg-md-surface-container-low rounded-[32px] p-10 ring-1 ring-md-outline/10 text-center">
            <CalendarX size={36} className="mx-auto text-md-on-surface-variant/40 mb-3" />
            <p className="font-bold text-md-on-surface-variant text-lg">No open registrations at this time</p>
            <p className="text-sm text-md-on-surface-variant/70 mt-1">Check back soon for upcoming KIDSCON programs.</p>
          </div>
        ) : (
          <div className={`grid gap-5 ${openEvents.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {openEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
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
