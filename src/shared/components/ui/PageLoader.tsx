export default function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex-1 flex flex-col items-center justify-center min-h-[60vh] w-full motion-safe:animate-enter duration-300"
    >
      <div className="relative">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-md-primary/20 blur-sm" />

        {/* Inner spinning loader */}
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-md-primary border-r-md-primary animate-spin relative z-10" />
      </div>
      <p className="mt-6 text-sm font-semibold text-md-on-surface-variant animate-pulse tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
