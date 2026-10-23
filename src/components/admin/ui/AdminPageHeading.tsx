import type { ReactNode } from "react";

export function AdminPageHeading({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-medium leading-tight tracking-[-0.045em] text-brand-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{description}</p>
    </div>
  );
}
