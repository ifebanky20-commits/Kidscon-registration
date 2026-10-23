import { usePublicEvents } from "@/hooks/events/usePublicEvents";
import { LandingHero } from "@/components/public/landing/LandingHero";
import { OpenEventsSection } from "@/components/public/landing/OpenEventsSection";
import { RegistrationFaq } from "@/components/public/landing/RegistrationFaq";
import { RegistrationGuide } from "@/components/public/landing/RegistrationGuide";
import { WelcomeSection } from "@/components/public/landing/WelcomeSection";

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
