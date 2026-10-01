"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, BadgeCheck, CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  ApiError,
  createPurchase,
  getPublicSeats,
  getPublicSession,
  type PublicSeat,
  type PublicSession,
  type Purchase,
} from "@/lib/api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function TicketPurchase({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<PublicSession | null>(null);
  const [seats, setSeats] = useState<PublicSeat[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSeatNumbers, setShowSeatNumbers] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getPublicSession(sessionId), getPublicSeats(sessionId)])
      .then(([sessionData, seatData]) => {
        if (!active) return;
        setSession(sessionData);
        setSeats(seatData);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar a sessão.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sessionId]);

  const rows = useMemo(() => Map.groupBy(seats, (seat) => seat.fileira), [seats]);
  const selectedSeats = seats.filter((seat) => selection[seat.id]);
  const total = selectedSeats.reduce((sum, seat) => {
    const type = session?.tiposIngresso.find((item) => item.id === selection[seat.id]);
    return sum + (type?.precoCentavos ?? 0);
  }, 0);

  function toggleSeat(seat: PublicSeat) {
    if (!seat.disponivel || !session?.tiposIngresso.length) return;
    setError("");
    setSelection((current) => {
      const next = { ...current };
      if (next[seat.id]) delete next[seat.id];
      else next[seat.id] = session.tiposIngresso[0].id;
      return next;
    });
  }

  async function confirmPurchase() {
    if (!selectedSeats.length) {
      setError("Selecione pelo menos um assento para continuar.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await createPurchase(sessionId, selectedSeats.map((seat) => ({
        assentoId: seat.id,
        tipoIngressoId: selection[seat.id],
      })));
      setPurchase(result);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível confirmar a compra.");
      if (caught instanceof ApiError && caught.status === 409) {
        const updatedSeats = await getPublicSeats(sessionId);
        setSeats(updatedSeats);
        setSelection({});
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen" />;
  if (!session) return <section className="mx-auto max-w-[1600px] px-6 pb-20 pt-32 sm:px-8 lg:px-10"><h1 className="text-3xl font-bold">Sessão não disponível</h1>{error && <p className="mt-3 text-red-600">{error}</p>}</section>;

  const starts = new Date(session.inicio);

  if (purchase) return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
      <div className="text-center"><BadgeCheck className="mx-auto size-12 text-[#149447] sm:size-14" /><h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Ingressos confirmados</h1><p className="mt-3 text-sm text-foreground/60 sm:text-base">Guarde os códigos abaixo para apresentar na entrada.</p></div>
      <div className="mt-8 min-w-0 rounded-2xl bg-[#e2e6ec] p-4 sm:mt-10 sm:p-8"><p className="text-sm text-foreground/55">Código da compra</p><p className="mt-1 break-all text-base font-bold text-primary sm:text-xl">{purchase.codigo}</p><div className="mt-7 space-y-3">{purchase.ingressos.map((ticket) => <div key={ticket.id} className="flex min-w-0 flex-col justify-between gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="font-bold">Assento {ticket.assento.fileira}{ticket.assento.numero} · {ticket.tipoIngresso.nome}</p><p className="mt-1 break-all text-xs text-foreground/50 sm:text-sm">{ticket.codigo}</p></div><p className="shrink-0 font-semibold">{currencyFormatter.format(ticket.precoCentavos / 100)}</p></div>)}</div><div className="mt-7 flex items-center justify-between border-t border-foreground/10 pt-5"><span className="font-semibold">Total</span><strong className="text-xl sm:text-2xl">{currencyFormatter.format(purchase.totalCentavos / 100)}</strong></div></div>
    </section>
  );

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-10">
      <div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Escolha seus ingressos</h1><p className="mt-3 text-sm leading-6 text-foreground/60 sm:text-base">Selecione os assentos e informe o tipo de ingresso de cada pessoa.</p></div>
      {error && <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-red-600"><span aria-hidden="true">●</span>{error}</p>}
      <div className="mt-7 grid min-w-0 gap-6 sm:mt-9 sm:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-7"><h2 className="text-xl font-bold">Mapa da sala</h2><button type="button" role="switch" aria-checked={showSeatNumbers} onClick={() => setShowSeatNumbers((current) => !current)} className="flex items-center gap-3 rounded-md text-sm font-semibold text-foreground/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span>Mostrar números</span><span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${showSeatNumbers ? "bg-primary" : "bg-foreground/20"}`}><span className={`absolute left-0 top-1 size-4 rounded-full bg-white transition-transform ${showSeatNumbers ? "translate-x-6" : "translate-x-1"}`} /></span></button></div>
          <div className="mx-auto mb-9 max-w-2xl sm:mb-12">
            <div className="relative h-12 overflow-hidden">
              <div className="absolute inset-x-[3%] top-0 h-8 rounded-[50%] bg-gradient-to-b from-primary via-[#4f76bd] to-[#8da7d8] shadow-[0_12px_28px_rgba(59,95,164,0.32)] [clip-path:polygon(2%_10%,98%_10%,91%_72%,9%_72%)]" />
              <div className="absolute inset-x-[9%] top-[18px] h-4 rounded-[50%] bg-background/90" />
            </div>
            <p className="-mt-2 text-center text-sm font-semibold text-primary">Tela</p>
          </div>
          <div className="scrollbar-light max-w-full overflow-x-auto overscroll-x-contain pb-3"><div className="mx-auto w-max min-w-max space-y-2 px-1">{Array.from(rows.entries()).map(([row, rowSeats]) => <div key={row} className="flex items-center gap-2 sm:gap-2.5"><span className="w-4 text-center text-[11px] font-bold text-foreground/45 sm:w-5 sm:text-xs">{row}</span><div className="flex gap-1 sm:gap-1.5">{rowSeats.map((seat) => { const selected = Boolean(selection[seat.id]); return <button key={seat.id} type="button" title={`Assento ${seat.fileira}${seat.numero}`} disabled={!seat.disponivel} aria-label={`Assento ${seat.fileira}${seat.numero}${seat.disponivel ? "" : ", indisponível"}`} aria-pressed={selected} onClick={() => toggleSeat(seat)} className={`grid size-6 place-items-center rounded text-[9px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-7 sm:rounded-md sm:text-[10px] ${!seat.disponivel ? "cursor-not-allowed bg-[#68717d] text-white/55" : selected ? "bg-primary text-white" : "bg-[#d9dfe7] text-foreground/70 hover:bg-primary/20"}`}>{showSeatNumbers ? seat.numero : null}</button>; })}</div></div>)}</div></div>
          <div className="mt-9"><p className="text-sm font-bold text-foreground">Legenda</p><div className="mt-3 flex flex-wrap justify-start gap-5 text-xs text-foreground/55"><span className="flex items-center gap-2"><i className="size-3 rounded bg-[#d9dfe7]" />Disponível</span><span className="flex items-center gap-2"><i className="size-3 rounded bg-primary" />Selecionado</span><span className="flex items-center gap-2"><i className="size-3 rounded bg-[#68717d]" />Indisponível</span></div></div>
        </div>
        <aside className="h-fit min-w-0 rounded-2xl bg-foreground p-5 text-white sm:p-7">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4"><h2 className="min-w-0 break-words text-xl font-bold sm:text-2xl">{session.filme.titulo}</h2><div className="flex shrink-0 gap-1.5"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{session.formato}</span><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{session.versao === "DUBLADO" ? "Dub" : session.versao === "LEGENDADO" ? "Leg" : "Original"}</span></div></div><div className="mt-5 min-w-0 space-y-3 text-sm text-white/65"><p className="flex gap-2"><CalendarDays className="size-4 shrink-0 text-white" /><span className="capitalize">{dateFormatter.format(starts)}</span></p><p className="flex gap-2"><Clock3 className="size-4 shrink-0 text-white" />{timeFormatter.format(starts)}</p><p className="flex min-w-0 gap-2"><MapPin className="size-4 shrink-0 text-white" /><span className="min-w-0 break-words">{session.sala.nome} · {session.sala.cinema.nome}</span></p></div>
          <div className="my-6 border-t border-white/10" />
          {selectedSeats.length === 0 ? <div className="py-5 text-center text-white/50"><Armchair className="mx-auto size-8" /><p className="mt-3 text-sm">Nenhum assento selecionado</p></div> : <div className="scrollbar-dark max-h-80 space-y-5 overflow-y-auto overscroll-contain pr-2">{selectedSeats.map((seat) => <div key={seat.id}><label className="text-sm font-semibold">Assento {seat.fileira}{seat.numero}</label><AdminSelect value={selection[seat.id]} options={session.tiposIngresso.map((type) => ({ value: type.id, label: `${type.nome} · ${currencyFormatter.format(type.precoCentavos / 100)}` }))} placeholder="Selecione o tipo" onChange={(value) => setSelection((current) => ({ ...current, [seat.id]: value }))} /></div>)}</div>}
          <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-white/65">Total</span><strong className="text-2xl">{currencyFormatter.format(total / 100)}</strong></div>
          <button type="button" disabled={!selectedSeats.length || submitting || !session.tiposIngresso.length} onClick={confirmPurchase} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45"><Ticket className="size-4" />{submitting ? "Confirmando..." : "Confirmar compra"}</button>
        </aside>
      </div>
    </section>
  );
}
