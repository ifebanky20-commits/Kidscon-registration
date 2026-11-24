export function KidsconLogo() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <img
        src="/kidscon-mascot.jpeg"
        alt="KIDSCON mascot"
        width={792}
        height={1280}
        className="h-12 w-auto shrink-0 object-contain sm:h-14"
      />
      <span className="text-left text-brand-ink">
        <span className="block text-base font-semibold tracking-[-0.035em] sm:text-lg">
          KIDSCON
        </span>
        <span className="mt-0.5 hidden text-[8px] font-medium uppercase tracking-[0.08em] text-brand-muted sm:block">
          Multicreation International
        </span>
      </span>
    </span>
  );
}
