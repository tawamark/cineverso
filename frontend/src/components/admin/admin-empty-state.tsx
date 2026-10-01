import type { LucideIcon } from "lucide-react";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <Icon aria-hidden="true" className="size-9 text-primary" />
      <h2 className="mt-5 text-xl font-bold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-md leading-7 text-foreground/55">{description}</p>
    </div>
  );
}
