import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import { FormProvider } from "react-hook-form";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { EventPageState } from "@/components/public/events/EventPageState";
import { RegistrationReviewStep } from "@/components/registration/RegistrationReviewStep";
import { SchoolInfoStep } from "@/components/registration/school/SchoolInfoStep";
import { StudentsStep } from "@/components/registration/students/StudentsStep";
import { TeachersStep } from "@/components/registration/teachers/TeachersStep";
import { useRegistrationDraft } from "@/hooks/registration/useRegistrationDraft";
import { useRegistrationEvent } from "@/hooks/registration/useRegistrationEvent";
import { useRegistrationForm } from "@/hooks/registration/useRegistrationForm";
import { useRegistrationSubmission } from "@/hooks/registration/useRegistrationSubmission";
import { Button } from "@/components/ui/Button";

export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const { form, formData, step, handlePrev, handleNext, isNextDisabled } =
    useRegistrationForm();
  const { selectedEvent, eventLoading, eventError } =
    useRegistrationEvent(eventId);
  const { onSubmit, submitLoading } = useRegistrationSubmission(eventId);
  useRegistrationDraft(step, formData);

  const steps = [
    {
      label: "School",
      title: "Tell us about your school.",
      description:
        "Add your school and the person we can contact about this registration.",
      icon: BookOpen,
    },
    {
      label: "Students",
      title: "Who’s coming along?",
      description:
        "Add students individually or import your list from a spreadsheet.",
      icon: Users,
    },
    {
      label: "Teachers",
      title: "Meet the accompanying team.",
      description: "Add the teachers and staff attending with your students.",
      icon: UserPlus,
    },
    {
      label: "Review",
      title: "One last look.",
      description:
        "Check your school details and attendee totals before submitting.",
      icon: CheckCircle,
    },
  ];
  const currentStep = steps[step - 1] ?? steps[0];

  if (eventLoading) return <EventPageState loading />;

  if (eventError || !selectedEvent) {
    return (
      <EventPageState
        title="Choose an event to get started."
        message="This registration link is missing or unavailable. Browse our events to find the one your school would like to attend."
      />
    );
  }

  const formattedEventDate = new Date(
    selectedEvent.date + "T00:00:00",
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <FormProvider {...form}>
      <div className="font-display text-brand-ink">
        <header className="border-b border-brand-line bg-brand-wash">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
            <Link
              to={`/events/${selectedEvent.id}`}
              className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to event
            </Link>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-primary">
              School registration
            </p>
            <h1 className="text-3xl font-medium tracking-[-0.045em] sm:text-5xl">
              A great day starts here.
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-brand-muted">
              <span className="font-semibold text-brand-ink">
                {selectedEvent.name}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                {formattedEventDate}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} aria-hidden="true" />
                {selectedEvent.location}
              </span>
            </div>
          </div>
        </header>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-14">
          <aside>
            <nav aria-label="Registration progress">
              <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-6">
                {steps.map(({ label, icon: Icon }, index) => (
                  <li
                    key={label}
                    aria-current={step === index + 1 ? "step" : undefined}
                    className="flex flex-col items-center gap-3 lg:flex-row lg:items-start"
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${step >= index + 1 ? "bg-brand-action text-white" : "border border-brand-line text-brand-muted"}`}
                    >
                      {step > index + 1 ? (
                        <CheckCircle size={18} aria-hidden="true" />
                      ) : (
                        <Icon size={18} aria-hidden="true" />
                      )}
                    </span>
                    <div className="text-center lg:pt-0.5 lg:text-left">
                      <p className="hidden text-[10px] uppercase tracking-widest text-brand-muted lg:block">
                        Step {index + 1}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${step === index + 1 ? "font-semibold text-brand-primary" : "text-brand-muted"}`}
                      >
                        {label}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="mt-8 hidden border-t border-brand-line pt-5 text-xs leading-6 text-brand-muted lg:block">
              Your progress is saved on this device as you go.
            </p>
          </aside>
          <section
            aria-labelledby="registration-step-title"
            className="min-w-0"
          >
            <div className="mb-8" aria-live="polite">
              <p className="mb-2 text-xs font-medium text-brand-primary">
                Step {step} of 4
              </p>
              <h2
                id="registration-step-title"
                className="text-2xl font-medium tracking-tight sm:text-3xl"
              >
                {currentStep.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {currentStep.description}
              </p>
            </div>
            <div className="min-h-80">
              {step === 1 && <SchoolInfoStep />}
              {step === 2 && <StudentsStep />}
              {step === 3 && <TeachersStep />}
              {step === 4 && <RegistrationReviewStep />}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-brand-line pt-6">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={step === 1 || submitLoading}
                className={`rounded-xl ${step === 1 ? "invisible" : ""}`}
              >
                <ArrowLeft size={16} className="mr-2" aria-hidden="true" /> Back
              </Button>
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  className="h-12 rounded-xl px-7"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={submitLoading}
                  className="min-h-12 rounded-xl px-7"
                >
                  {submitLoading
                    ? "Submitting registration…"
                    : "Complete registration"}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </FormProvider>
  );
}
