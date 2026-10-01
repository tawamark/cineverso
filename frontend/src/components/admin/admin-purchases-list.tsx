"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, Eye, Ticket } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, getAdminPurchases, type AdminPurchase } from "@/lib/api";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";

type PurchasesState =
  | { status: "loading"; purchases: AdminPurchase[] }
  | { status: "success"; purchases: AdminPurchase[] }
  | { status: "error"; purchases: AdminPurchase[] };

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function AdminPurchasesList() {
  const [state, setState] = useState<PurchasesState>({
    status: "loading",
    purchases: [],
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const session = getAdminSession();

    if (!session) return () => controller.abort();

    getAdminPurchases(session.token, controller.signal)
      .then((purchases) => setState({ status: "success", purchases }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          return;
        }
        setState({ status: "error", purchases: [] });
      });

    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
        <CircleAlert aria-hidden="true" className="size-9 text-accent" />
        <h2 className="mt-5 text-xl font-bold">Não foi possível carregar as vendas</h2>
        <p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p>
      </div>
    );
  }

  if (state.purchases.length === 0) {
    return (
      <AdminEmptyState
        icon={Ticket}
        title="Nenhum ingresso vendido"
        description="As vendas realizadas no CineVerso aparecerão aqui."
      />
    );
  }

  const visiblePurchases = state.purchases.filter((purchase) =>
    !query || [purchase.codigo, purchase.sessao.filme.titulo].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(query),
    ),
  );

  return (
    <><AdminSearch placeholder="Buscar por código da compra ou filme" onSearch={setQuery} />{visiblePurchases.length === 0 ? <AdminNoResults /> : <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(170px,1fr)_90px_120px_140px] gap-3 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Compra</span><span>Data</span><span>Ingressos</span><span className="text-right">Total</span><span className="pl-5 text-right">Ação</span></div>
      <div className="divide-y divide-muted/20">
      {visiblePurchases.map((purchase) => (
        <article
          key={purchase.id}
          className="grid gap-3 px-5 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(170px,1fr)_90px_120px_140px] md:items-center md:px-6"
        >
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{purchase.sessao.filme.titulo}</h2>
              <p className="mt-1 truncate text-xs text-foreground/45" title={purchase.codigo}>
                Compra {purchase.codigo}
              </p>
            </div>

            <p className="text-sm text-foreground/65">{dateTimeFormatter.format(new Date(purchase.criadaEm))}</p>
            <p className="text-sm text-foreground/65">{purchase.ingressos.length} {purchase.ingressos.length === 1 ? "ingresso" : "ingressos"}</p>

            <div className="md:text-right">
              <p className="text-xs text-foreground/50">Total</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {currencyFormatter.format(purchase.totalCentavos / 100)}
              </p>
            </div>
            <div className="flex md:justify-end md:pl-5"><Link href={`/admin/vendas/${purchase.id}`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary/10 px-3.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Eye className="size-4" />Visualizar</Link></div>
        </article>
      ))}
      </div>
    </div>}</>
  );
}
