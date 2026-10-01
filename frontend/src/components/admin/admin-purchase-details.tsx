"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleAlert, Undo2 } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, getAdminPurchase, type AdminPurchase } from "@/lib/api";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AdminPurchaseDetails({ id }: { id: string }) {
  const [purchase, setPurchase] = useState<AdminPurchase | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const admin = getAdminSession();
    if (!admin) return;
    getAdminPurchase(admin.token, id).then(setPurchase).catch((caught: unknown) => {
      if (caught instanceof ApiError && caught.status === 401) clearAdminSession();
      else setError(caught instanceof Error ? caught.message : "Não foi possível carregar a venda.");
    });
  }, [id]);

  if (!purchase && !error) return null;

  return <section>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Detalhes da venda</h1>{error && <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-accent"><CircleAlert className="mt-0.5 size-5 shrink-0" />{error}</p>}</div><Link href="/admin/vendas" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-foreground/[0.07] px-5 text-sm font-bold text-foreground/70 transition hover:bg-foreground/[0.12] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"><Undo2 className="size-4" />Voltar</Link></div>
    {purchase && <>
      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><div className="bg-foreground/[0.035] px-6 py-5"><h2 className="text-xl font-bold">{purchase.sessao.filme.titulo}</h2><p className="mt-2 break-all text-xs text-foreground/45">Compra {purchase.codigo}</p></div><dl className="grid sm:grid-cols-2 xl:grid-cols-4"><Item label="Realizada em" value={dateTimeFormatter.format(new Date(purchase.criadaEm))} /><Item label="Cinema" value={purchase.sessao.sala.cinema.nome} /><Item label="Sala" value={purchase.sessao.sala.nome} /><Item label="Sessão" value={dateTimeFormatter.format(new Date(purchase.sessao.inicio))} /><Item label="Exibição" value={`${purchase.sessao.formato} · ${purchase.sessao.versao === "DUBLADO" ? "Dublado" : purchase.sessao.versao === "LEGENDADO" ? "Legendado" : "Original"}`} /><Item label="Ingressos" value={String(purchase.ingressos.length)} /><Item label="Total da compra" value={currencyFormatter.format(purchase.totalCentavos / 100)} /></dl></div>
      <div className="mt-8"><h2 className="text-xl font-bold">Ingressos comprados</h2><div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><div className="hidden grid-cols-[100px_1fr_1.5fr_130px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Poltrona</span><span>Tipo</span><span>Código</span><span className="text-right">Valor</span></div><div className="divide-y divide-muted/20">{purchase.ingressos.map((ticket) => <article key={ticket.id} className="grid gap-3 px-5 py-5 md:grid-cols-[100px_1fr_1.5fr_130px] md:items-center md:gap-5 md:px-6"><p className="font-bold text-primary">{ticket.assento.fileira}{ticket.assento.numero}</p><p className="text-sm font-semibold">{ticket.tipoIngresso.nome}</p><p className="break-all text-xs text-foreground/50">{ticket.codigo}</p><p className="font-bold md:text-right">{currencyFormatter.format(ticket.precoCentavos / 100)}</p></article>)}</div></div></div>
    </>}
  </section>;
}

function Item({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-muted/20 px-6 py-5 sm:border-r"><dt className="text-xs font-semibold text-foreground/45">{label}</dt><dd className="mt-2 font-semibold text-foreground/80">{value}</dd></div>;
}
