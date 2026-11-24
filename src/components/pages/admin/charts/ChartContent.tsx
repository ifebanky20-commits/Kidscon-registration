import type { TooltipContentProps } from "recharts";

import { cn } from "@/utils/cn";

const defaultMarkers: Record<string, string> = {
  Schools: "bg-[#007C43]",
  Students: "bg-[#B65A0C]",
  Male: "bg-[#346747]",
  Female: "bg-[#BA1720]",
};

export function ChartTooltip({
  active,
  payload,
  label,
  markers = defaultMarkers,
}: TooltipContentProps & { markers?: Record<string, string> }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border-0 bg-md-surface px-3 py-2 text-sm text-brand-ink shadow-[0_8px_24px_rgb(0_0_0/0.1)]">
      {label != null && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((entry, index) => (
        <div
          key={`${String(entry.dataKey ?? entry.name)}-${index}`}
          className="flex items-center gap-2 py-0.5"
        >
          <span
            className={cn(
              "size-2.5 rounded-full bg-md-primary",
              markers[String(entry.name)],
            )}
          />
          <span>
            {entry.name}: {String(entry.value ?? "")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { name: string; markerClass: string }[];
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[13px] font-medium text-brand-ink">
      {items.map((entry, index) => (
        <li
          key={`${entry.name}-${index}`}
          className="flex items-center gap-1.5"
        >
          <span
            className={cn(
              "size-2.5 rounded-full bg-md-primary",
              entry.markerClass,
            )}
          />
          {entry.name}
        </li>
      ))}
    </ul>
  );
}
