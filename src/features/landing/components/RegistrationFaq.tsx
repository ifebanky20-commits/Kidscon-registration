import { Plus } from "lucide-react";

import { MAX_STUDENTS } from "@/schemas/registration";

const questions = [
  { question: "How do I register my school?", answer: "Choose an event from the upcoming events, then enter your school details, students, and accompanying teachers. Review your information and submit your registration." },
  { question: "How many students can I register?", answer: `Each school registration can include up to ${MAX_STUDENTS} students. You can also add the teachers accompanying them.` },
  { question: "Can I upload my student list?", answer: "Yes. The registration form accepts Excel or CSV files with student names, genders, and classes. You can review the imported list before submitting." },
  { question: "What happens after I register?", answer: "You'll receive a confirmation on screen and can download your school's PDF entry ticket. Keep it ready for arrival at the event." },
];

export function RegistrationFaq() {
  return (
    <section id="questions" aria-labelledby="faq-heading" className="grid scroll-mt-32 gap-9 border-t border-brand-line py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div><p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted"><span className="size-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" /> Good to know</p><h2 id="faq-heading" className="text-3xl font-medium leading-tight tracking-[-0.055em] sm:text-4xl">A few things<br /><span className="text-brand-muted">you might be wondering.</span></h2></div>
      <div className="border-t border-brand-line">
        {questions.map(({ question, answer }) => (
          <details key={question} name="registration-faq" className="group border-b border-brand-line">
            <summary className="flex min-h-18 cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-medium text-brand-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-primary [&::-webkit-details-marker]:hidden">{question}<Plus size={18} strokeWidth={1.5} className="shrink-0 text-brand-muted transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" /></summary>
            <p className="max-w-xl pb-6 pr-7 text-sm leading-7 text-brand-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
