"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeDollarSign, Clock3, Film, MapPin, Ticket } from "lucide-react";
import { getPublicMovie } from "@/lib/api";
import type { Movie } from "@/types/catalog";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function duration(minutes: number) { const hours = Math.floor(minutes / 60); const rest = minutes % 60; return hours ? `${hours}h ${rest}min` : `${minutes}min`; }
function ratingClass(rating: string | null) { const value = rating?.toLowerCase() ?? ""; if (value.includes("livre")) return "bg-[#149447]"; if (value.startsWith("10")) return "bg-[#1684c7]"; if (value.startsWith("12")) return "bg-[#f2c230] text-foreground"; if (value.startsWith("14")) return "bg-[#e97824]"; if (value.startsWith("16")) return "bg-[#d52b2b]"; if (value.startsWith("18")) return "bg-[#171717]"; return "bg-[#7047a8]"; }

export function MovieDetails({ slug }: { slug: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { const controller = new AbortController(); getPublicMovie(slug, controller.signal).then(setMovie).catch((caught) => { if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(true); }); return () => controller.abort(); }, [slug]);

  if (error) return <section className="mx-auto max-w-[1600px] px-6 pb-20 pt-32 sm:px-8 lg:px-10"><h1 className="text-3xl font-bold">Filme não disponível</h1></section>;
  if (!movie) return <div className="min-h-screen" />;

  return <>
    <section className="bg-foreground text-white">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 pb-16 pt-32 sm:px-8 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] lg:gap-14 lg:px-10">
        <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-primary/20">{movie.cartazUrl ? (
          // O cartaz pode ser uma URL externa ou uma imagem em base64.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={movie.cartazUrl} alt={`Cartaz de ${movie.titulo}`} className="size-full object-cover" />
        ) : <div className="grid size-full place-items-center"><Film className="size-12 text-white/60" /></div>}</div>
        <div className="self-center"><h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl lg:text-6xl">{movie.titulo}</h1><div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/65"><span>{movie.genero || "Gênero não informado"}</span><span>•</span><span>{duration(movie.duracaoMinutos)}</span><span className={`rounded-md px-2.5 py-1 text-xs font-extrabold text-white ${ratingClass(movie.classificacao)}`}>{movie.classificacao || "?"}</span></div>{movie.sinopse && <p className="mt-7 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">{movie.sinopse}</p>}</div>
      </div>
    </section>
    <section className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-10"><h2 className="text-3xl font-bold tracking-tight">Sessões disponíveis</h2>{movie.sessoes.length === 0 ? <div className="mt-8 rounded-2xl bg-[#e2e6ec] px-6 py-12 text-center"><p className="font-semibold text-foreground/60">As sessões deste filme serão anunciadas em breve.</p></div> : <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{movie.sessoes.map((session) => { const starts = new Date(session.inicio); const version = session.versao === "DUBLADO" ? "Dub" : session.versao === "LEGENDADO" ? "Leg" : "Original"; return <article key={session.id} className="flex overflow-hidden rounded-2xl bg-[#e2e6ec]"><div className="flex min-w-0 flex-1 flex-col"><div className="flex-1 p-5"><div className="flex items-start justify-between gap-4"><p className="font-bold capitalize">{dateFormatter.format(starts)}</p><div className="flex shrink-0 gap-1.5"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{session.formato}</span><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{version}</span></div></div><div className="mt-4 space-y-2 text-sm text-foreground/65"><p className="flex items-center gap-2"><Clock3 className="size-4 text-primary" />{timeFormatter.format(starts)}</p><p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{session.sala.nome} · {session.sala.cinema.nome}</p><p className="flex items-center gap-2"><BadgeDollarSign className="size-4 text-primary" />A partir de {currencyFormatter.format(session.precoBaseCentavos / 100)}</p></div></div><Link href={`/sessoes/${session.id}`} className="flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"><Ticket className="size-4" />Escolher ingressos</Link></div></article>; })}</div>}</section>
  </>;
}
