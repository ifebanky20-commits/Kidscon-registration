import { Skeleton } from "@/components/ui/Skeleton";

export default function EventListSkeleton() {
  return (
    <div role="status" className="grid gap-5 md:grid-cols-2">
      <span className="sr-only">Loading upcoming events</span>
      {[1, 2].map((card) => (
        <div key={card} className="space-y-5 rounded-3xl border border-brand-line bg-brand-surface p-6 sm:p-8">
          <Skeleton className="h-10 w-24" />
          <div className="space-y-4 border-y border-brand-line py-6">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
