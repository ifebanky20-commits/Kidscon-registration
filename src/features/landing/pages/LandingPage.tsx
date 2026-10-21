import { usePublicEvents } from "@/features/events/hooks/usePublicEvents";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { OpenEventsSection } from "@/features/landing/components/OpenEventsSection";
import { RegistrationFaq } from "@/features/landing/components/RegistrationFaq";
import { RegistrationGuide } from "@/features/landing/components/RegistrationGuide";
import { WelcomeSection } from "@/features/landing/components/WelcomeSection";

export default function LandingPage() {
  const { data: openEvents = [], isPending, isError, refetch } = usePublicEvents();

  return (
    <div className="font-display text-brand-ink">
      <LandingHero featuredEvent={openEvents[0]} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <OpenEventsSection
          loadingEvents={isPending}
          hasError={isError}

onRetry={() => {
            void refetch();
          }}
          openEvents={openEvents}
        />

        <RegistrationGuide />
        <WelcomeSection />
        <RegistrationFaq />
      </div>
    </div>
  );
}
