"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Undo2 } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, getAdminSessionItem, type AdminSessionDetails as SessionDetails } from "@/lib/api";
import { AdminDetailsSkeleton } from "./admin-skeletons";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AdminSessionDetails({ id }: { id: string }) {
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const admin = getAdminSession();
    if (!admin) return;
    getAdminSessionItem(admin.token, id).then(setSession).catch((caught: unknown) => {
      if (caught instanceof ApiError && caught.status === 401) clearAdminSession();
      else setError(caught instanceof Error ? caught.message : "Não foi possível carregar a sessão.");
    });
  }, [id]);

  const rows = useMemo(() => {
    if (!session) return new Map<string, SessionDetails["sala"]["assentos"]>();
    return Map.groupBy(session.sala.assentos, (seat) => seat.fileira);
  }, [session]);

  return <section>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Detalhes da sessão</h1>{error && <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-accent"><CircleAlert className="mt-0.5 size-5 shrink-0" />{error}</p>}</div><Link href="/admin/sessoes" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-foreground/[0.07] px-5 text-sm font-bold text-foreground/70 transition hover:bg-foreground/[0.12] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"><Undo2 className="size-4" />Voltar</Link></div>
    {!session && !error && <AdminDetailsSkeleton withMap />}
    {session && <><div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="flex flex-col gap-4 bg-foreground/[0.035] px-6 py-6 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-bold">{session.filme.titulo}</h2><p className="mt-2 text-sm capitalize text-foreground/55">{dateFormatter.format(new Date(session.inicio))}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{session.formato}</span><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{session.versao === "DUBLADO" ? "Dub" : session.versao === "LEGENDADO" ? "Leg" : "Original"}</span><span className={`rounded-md px-2.5 py-1 text-xs font-bold ${session.publicada ? "bg-primary/10 text-primary" : "bg-muted/25 text-foreground/55"}`}>{session.publicada ? "Publicada" : "Não publicada"}</span></div></div>
      <dl className="grid sm:grid-cols-2 xl:grid-cols-4">
        <Item label="Horário" value={`${timeFormatter.format(new Date(session.inicio))}–${timeFormatter.format(new Date(session.fim))}`} />
        <Item label="Cinema" value={session.sala.cinema.nome} />
        <Item label="Sala" value={session.sala.nome} />
        <Item label="Preço base" value={currencyFormatter.format(session.precoBaseCentavos / 100)} />
        <Item label="Ingressos vendidos" value={String(session._count?.ingressos ?? 0)} />
        <Item label="Compras realizadas" value={String(session._count?.compras ?? 0)} />
        <Item label="Capacidade da sala" value={`${session.sala.fileiras * session.sala.assentosPorFileira} assentos`} />
        <Item label="Disponibilidade" value={`${Math.max(0, session.sala.fileiras * session.sala.assentosPorFileira - (session._count?.ingressos ?? 0))} assentos`} />
      </dl>
    </div>
    <div className="mt-8 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(23,27,49,0.05)] sm:p-8"><h2 className="text-xl font-bold">Mapa da sala</h2><p className="mt-2 text-sm text-foreground/55">Distribuição e ocupação atual das poltronas.</p><div className="mx-auto mb-9 mt-8 max-w-2xl sm:mb-12"><div className="relative h-12 overflow-hidden"><div className="absolute inset-x-[3%] top-0 h-8 rounded-[50%] bg-gradient-to-b from-primary via-[#4f76bd] to-[#8da7d8] shadow-[0_12px_28px_rgba(59,95,164,0.32)] [clip-path:polygon(2%_10%,98%_10%,91%_72%,9%_72%)]" /><div className="absolute inset-x-[9%] top-[18px] h-4 rounded-[50%] bg-white" /></div><p className="-mt-2 text-center text-sm font-semibold text-primary">Tela</p></div><div className="scrollbar-light max-w-full overflow-x-auto overscroll-x-contain pb-3"><div className="mx-auto w-max min-w-max space-y-2 px-1">{Array.from(rows.entries()).map(([row, seats]) => <div key={row} className="flex items-center gap-2 sm:gap-2.5"><span className="w-4 text-center text-[11px] font-bold text-foreground/45 sm:w-5 sm:text-xs">{row}</span><div className="flex gap-1 sm:gap-1.5">{seats.map((seat) => { const sold = session.ingressos.some((ticket) => ticket.assentoId === seat.id); return <span key={seat.id} title={`Poltrona ${seat.fileira}${seat.numero} · ${sold ? "Vendida" : "Disponível"}`} className={`grid size-6 place-items-center rounded text-[9px] font-bold sm:size-7 sm:rounded-md sm:text-[10px] ${sold ? "bg-accent text-white" : "bg-[#d9dfe7] text-foreground/70"}`}>{seat.numero}</span>; })}</div></div>)}</div></div><div className="mt-7"><p className="text-sm font-bold">Legenda</p><div className="mt-3 flex flex-wrap gap-5 text-xs text-foreground/55"><span className="flex items-center gap-2"><i className="size-3 rounded bg-[#d9dfe7]" />Disponível</span><span className="flex items-center gap-2"><i className="size-3 rounded bg-accent" />Vendida</span></div></div></div></>}
  </section>;
}

function Item({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-muted/20 px-6 py-5 sm:border-r"><dt className="text-xs font-semibold text-foreground/45">{label}</dt><dd className="mt-2 font-semibold text-foreground/80">{value}</dd></div>;
}
