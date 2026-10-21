import { CalendarDays, ClipboardList, Ticket } from "lucide-react";

const steps = [
  { number: "01", icon: CalendarDays, title: "Find your event", description: "A new discovery starts with a date. Choose the KIDSCON program that feels right for your school." },
  { number: "02", icon: ClipboardList, title: "Make it a school thing", description: "Add your school, students, and accompanying teachers. Everything together, in one simple registration." },
  { number: "03", icon: Ticket, title: "Let the good days begin", description: "Download your digital ticket, get everyone ready, and leave the paperwork behind." },
];

export function RegistrationGuide() {
  return (
    <section id="how-it-works" aria-labelledby="guide-heading" className="scroll-mt-32 border-b border-brand-line py-16 sm:py-24">
      <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
        <p className="mb-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted"><span className="size-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" /> Thoughtfully simple</p>
        <h2 id="guide-heading" className="text-3xl font-medium leading-[1.13] tracking-[-0.055em] sm:text-5xl">Less organising.<br /><span className="text-brand-muted">More looking forward.</span></h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-brand-muted">From the first click to the big day. A simple registration process that respects your time.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <article key={number} className="flex flex-col border-t border-brand-line py-7 md:px-3">
            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-medium uppercase tracking-widest text-brand-muted">Step {number}</span></div>
            <Icon size={58} strokeWidth={1.1} className="my-8 text-brand-primary" aria-hidden="true" />
            <h3 className="text-lg font-medium tracking-[-0.035em]">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-brand-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
