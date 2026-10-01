"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CircleAlert, CircleDollarSign, Film, Ticket, type LucideIcon } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, getAdminOverview, type AdminOverview } from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function AdminOverviewContent() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) return;
    getAdminOverview(session.token)
      .then(setData)
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === 401) clearAdminSession();
        else setError(true);
      });
  }, []);

  if (error) return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><CircleAlert className="size-9 text-accent" /><h2 className="mt-5 text-xl font-bold">Não foi possível carregar a visão geral</h2><p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p></div>;
  if (!data) return null;

  const stats = data.estatisticas;
  return <>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={CircleDollarSign} label="Faturamento simulado" value={currencyFormatter.format(stats.faturamentoCentavos / 100)} detail={`${stats.vendasRealizadas} ${stats.vendasRealizadas === 1 ? "venda realizada" : "vendas realizadas"}`} />
      <Metric icon={Ticket} label="Ingressos vendidos" value={String(stats.ingressosVendidos)} detail="Em todas as sessões" />
      <Metric icon={CalendarDays} label="Próximas sessões" value={String(stats.sessoesFuturas)} detail="Publicadas e futuras" />
      <Metric icon={Film} label="Filmes ativos" value={String(stats.filmesAtivos)} detail="Disponíveis no sistema" />
    </div>
    <div className="mt-8 grid gap-8 2xl:grid-cols-2">
      <section><h2 className="text-xl font-bold">Vendas recentes</h2><div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">{data.vendasRecentes.length === 0 ? <Empty text="Nenhuma venda registrada." /> : <><div className="hidden grid-cols-[1fr_120px_110px] gap-4 bg-foreground/[0.035] px-5 py-4 text-xs font-semibold text-foreground/55 sm:grid"><span>Filme</span><span>Ingressos</span><span className="text-right">Total</span></div><div className="divide-y divide-muted/20">{data.vendasRecentes.map((sale) => <div key={sale.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_120px_110px] sm:items-center sm:gap-4"><div className="min-w-0"><p className="truncate font-semibold">{sale.sessao.filme.titulo}</p><p className="mt-1 text-xs text-foreground/45">{dateFormatter.format(new Date(sale.criadaEm))}</p></div><p className="text-sm text-foreground/65">{sale._count.ingressos} {sale._count.ingressos === 1 ? "ingresso" : "ingressos"}</p><p className="font-bold text-primary sm:text-right">{currencyFormatter.format(sale.totalCentavos / 100)}</p></div>)}</div></>}</div></section>
      <section><h2 className="text-xl font-bold">Próximas sessões</h2><div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">{data.proximasSessoes.length === 0 ? <Empty text="Nenhuma sessão futura publicada." /> : <><div className="hidden grid-cols-[1fr_150px_100px] gap-4 bg-foreground/[0.035] px-5 py-4 text-xs font-semibold text-foreground/55 sm:grid"><span>Filme</span><span>Data</span><span className="text-right">Vendidos</span></div><div className="divide-y divide-muted/20">{data.proximasSessoes.map((session) => <div key={session.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_150px_100px] sm:items-center sm:gap-4"><div className="min-w-0"><p className="truncate font-semibold">{session.filme.titulo}</p><p className="mt-1 truncate text-xs text-foreground/45">{session.sala.nome}</p><div className="mt-2 flex gap-1.5"><span className="rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-white">{session.formato}</span><span className="rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-white">{session.versao === "DUBLADO" ? "Dub" : session.versao === "LEGENDADO" ? "Leg" : "Original"}</span></div></div><p className="text-sm text-foreground/65">{dateFormatter.format(new Date(session.inicio))} · {timeFormatter.format(new Date(session.inicio))}</p><p className="font-bold text-primary sm:text-right">{session._count.ingressos}</p></div>)}</div></>}</div></section>
    </div>
  </>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <article className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-foreground/55">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight">{value}</p></div><Icon className="size-6 text-primary" /></div><p className="mt-4 text-xs text-foreground/45">{detail}</p></article>;
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-12 text-center text-sm text-foreground/50">{text}</p>;
}
