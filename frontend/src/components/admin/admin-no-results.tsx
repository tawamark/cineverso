import { SearchX } from "lucide-react";

export function AdminNoResults() {
  return (
    <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <SearchX aria-hidden="true" className="size-9 text-primary" />
      <h2 className="mt-5 text-xl font-bold">Nenhum resultado encontrado</h2>
      <p className="mt-2 text-foreground/55">Tente buscar usando outros termos.</p>
    </div>
  );
}
