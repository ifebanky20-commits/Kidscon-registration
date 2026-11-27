import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading event details</span>
      <div className="bg-brand-wash">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:px-12">
          <Skeleton className="mb-4 h-3 w-24" />
          <Skeleton className="h-11 w-4/5 max-w-xl sm:h-16" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:px-12">
        <div className="space-y-5">
          <Skeleton className="aspect-[1.6] w-full rounded-2xl bg-brand-soft" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-5 self-start rounded-2xl border border-brand-line bg-brand-surface p-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
