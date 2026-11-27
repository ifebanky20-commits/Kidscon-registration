import { Quote } from "lucide-react";


export function WelcomeSection() {
  return (
    <section id="our-story" aria-labelledby="welcome-heading" className="scroll-mt-32 py-16 sm:py-24">
      <div className="grid items-center gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] bg-brand-soft">
          <img src="/funmi-bankole.jpg" alt="Funmi Bankole, MD and CEO of KIDSCON Multicreation International" loading="lazy" className="aspect-[0.95] w-full object-cover object-top" />
          <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/70 bg-white/95 px-5 py-4 text-[#231F20] backdrop-blur-sm"><p className="text-sm font-semibold tracking-tight">Funmi Bankole</p><p className="mt-1 text-[10px] text-[#62685F]">MD / CEO, KIDSCON Multicreation International</p></div>
        </div>
        <div>
          <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted"><span className="size-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" /> A personal welcome</p>
          <h2 id="welcome-heading" className="text-3xl font-medium leading-[1.15] tracking-[-0.055em] sm:text-5xl">The best part?<br /><span className="text-brand-muted">Seeing them light up.</span></h2>
          <Quote size={30} strokeWidth={1.2} className="mb-4 mt-8 text-brand-primary" aria-hidden="true" />
          <blockquote className="max-w-lg text-base leading-8 text-brand-muted sm:text-lg sm:leading-9">We can't wait to host your brilliant students at our next big event. Our team built this portal to make registration hassle-free, so you can focus on preparing the kids for an unforgettable event.</blockquote>
          <a href="#events" className="mt-8 inline-flex min-h-11 items-center gap-4 border-b border-brand-ink pb-1 text-sm font-medium text-brand-ink transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary">Find your school's next event</a>
        </div>
      </div>
    </section>
  );
}
