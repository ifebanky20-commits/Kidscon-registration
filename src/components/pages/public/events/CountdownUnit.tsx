interface CountdownUnitProps {
  value: number;
  label: string;
}

export function CountdownUnit({ value, label }: CountdownUnitProps) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="min-w-10">
      <span className="block text-xl font-medium tabular-nums tracking-[-0.04em] text-brand-ink">
        {display}
      </span>
      <span className="mt-1 block text-[8px] font-medium uppercase tracking-widest text-brand-muted">
        {label}
      </span>
    </div>
  );
}
