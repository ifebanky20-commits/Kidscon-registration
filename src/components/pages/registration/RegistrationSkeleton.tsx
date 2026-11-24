import { Skeleton } from "@/components/ui/Skeleton";

export default function RegistrationSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading registration form</span>
      <div className="border-b border-brand-line bg-brand-wash">
        <div className="mx-auto max-w-7xl space-y-4 px-5 py-10 sm:px-8 lg:px-12">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-4/5 max-w-md sm:h-12" />
          <Skeleton className="h-4 w-2/3 max-w-xs" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-14">
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-6">
          {["school", "students", "teachers", "review"].map((step) => (
            <div key={step} className="flex flex-col items-center gap-3 lg:flex-row">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-7 w-2/3 max-w-sm" />
          <Skeleton className="h-4 w-4/5 max-w-md" />
          {["name", "category", "address"].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
