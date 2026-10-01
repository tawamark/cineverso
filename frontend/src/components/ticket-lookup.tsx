"use client";

import { type FormEvent, useState } from "react";
import { CircleAlert, Search } from "lucide-react";
import { ApiError, getPurchaseByCode, type PublicPurchaseDetails } from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function TicketLookup() {
  const [code, setCode] = useState("");
  const [purchase, setPurchase] = useState<PublicPurchaseDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim();
    if (!normalized) {
      setError("Informe o código da compra para continuar.");
      return;
    }
    setError("");
    setPurchase(null);
    setLoading(true);
    try {
      setPurchase(await getPurchaseByCode(normalized));
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 404 ? "Compra não encontrada. Confira o código e tente novamente." : caught instanceof Error ? caught.message : "Não foi possível consultar a compra.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="mx-auto min-h-[70vh] w-full max-w-[1600px] px-6 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-10">
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Consultar ingressos</h1>
    <p className="mt-3 max-w-2xl leading-7 text-foreground/60">Digite o código recebido após a confirmação da compra para consultar seus ingressos.</p>
    {error && <p role="alert" className="mt-5 flex items-start gap-2 text-sm font-semibold text-accent"><CircleAlert className="mt-0.5 size-5 shrink-0" />{error}</p>}

    <form noValidate onSubmit={submit} className="mt-8 rounded-2xl bg-[#e2e6ec] p-5 sm:p-7"><label htmlFor="purchase-code" className="text-sm font-semibold">Código da compra</label><div className="mt-2 flex w-full flex-col gap-3 sm:flex-row"><input id="purchase-code" value={code} onChange={(event) => { setCode(event.target.value); if (error === "Informe o código da compra para continuar.") setError(""); }} placeholder="Cole o código da compra" className="h-12 w-full min-w-0 appearance-none rounded-xl border border-muted/60 bg-white px-4 text-base text-foreground outline-none transition placeholder:text-foreground/35 focus:border-2 focus:border-primary sm:flex-1" /><button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><Search className="size-4" />{loading ? "Consultando..." : "Consultar"}</button></div></form>

    {purchase && <div className="mt-8 overflow-hidden rounded-2xl bg-[#e2e6ec]"><div className="bg-foreground p-6 text-white sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-white/55">Compra confirmada</p><h2 className="mt-2 text-2xl font-bold">{purchase.sessao.filme.titulo}</h2><p className="mt-2 capitalize text-sm text-white/60">{dateTimeFormatter.format(new Date(purchase.sessao.inicio))}</p></div><div className="flex gap-1.5"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold">{purchase.sessao.formato}</span><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold">{purchase.sessao.versao === "DUBLADO" ? "Dub" : purchase.sessao.versao === "LEGENDADO" ? "Leg" : "Original"}</span></div></div><p className="mt-5 break-all text-xs text-white/45">{purchase.codigo}</p></div>
      <div className="p-5 sm:p-8"><div className="mb-6 flex flex-wrap justify-between gap-4"><div><p className="text-xs text-foreground/45">Local</p><p className="mt-1 font-semibold">{purchase.sessao.sala.cinema.nome} · {purchase.sessao.sala.nome}</p></div><div className="sm:text-right"><p className="text-xs text-foreground/45">Total</p><p className="mt-1 text-xl font-bold text-primary">{currencyFormatter.format(purchase.totalCentavos / 100)}</p></div></div><div className="space-y-3">{purchase.ingressos.map((ticket) => <article key={ticket.id} className="flex flex-col justify-between gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center"><div><p className="font-bold">Poltrona {ticket.assento.fileira}{ticket.assento.numero} · {ticket.tipoIngresso.nome}</p><p className="mt-1 break-all text-xs text-foreground/45">{ticket.codigo}</p></div><p className="shrink-0 font-semibold">{currencyFormatter.format(ticket.precoCentavos / 100)}</p></article>)}</div></div>
    </div>}
  </section>;
}
