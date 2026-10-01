"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, Film, Search, X } from "lucide-react";
import { getCatalog } from "@/lib/api";
import type { Movie } from "@/types/catalog";

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}min` : `${minutes}min`;
}

function rating(movie: Movie) {
  const value = movie.classificacao?.toLocaleLowerCase("pt-BR") ?? "";
  if (value.includes("livre")) return { label: "L", style: "bg-[#149447]" };
  if (value.startsWith("10")) return { label: "10", style: "bg-[#1684c7]" };
  if (value.startsWith("12")) return { label: "12", style: "bg-[#f2c230] text-foreground" };
  if (value.startsWith("14")) return { label: "14", style: "bg-[#e97824]" };
  if (value.startsWith("16")) return { label: "16", style: "bg-[#d52b2b]" };
  if (value.startsWith("18")) return { label: "18", style: "bg-[#171717]" };
  return { label: "?", style: "bg-[#7047a8]" };
}

export function PublicMovieSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return movies;
    return movies.filter((movie) => [movie.titulo, movie.genero ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalized)));
  }, [movies, query]);

  function showSearch() {
    setOpen(true);
    setQuery("");
    setError(false);
    if (!loaded && !loading) {
      setLoading(true);
      getCatalog()
        .then((items) => { setMovies(items); setLoaded(true); })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }

  function closeSearch() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSearch();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return <>
    <button type="button" onClick={showSearch} className="relative inline-flex h-10 items-center gap-2 px-1 text-sm font-semibold text-white/70 transition after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-white after:transition-transform hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-2 sm:after:inset-x-2"><Search className="size-4" /><span className="hidden sm:inline">Buscar</span></button>
    {open && typeof document !== "undefined" && createPortal(<div role="dialog" aria-modal="true" aria-label="Buscar filmes" className="fixed inset-0 z-[200] overflow-y-auto bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/95 py-5 backdrop-blur-sm"><div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 sm:px-8 lg:px-10"><div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground/40" /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por título ou gênero" className="h-14 w-full rounded-xl border border-muted/60 bg-white pl-12 pr-4 text-base outline-none transition focus:border-2 focus:border-primary" /></div><button type="button" aria-label="Fechar busca" onClick={closeSearch} className="grid size-12 shrink-0 place-items-center rounded-xl bg-foreground/[0.07] text-foreground transition hover:bg-foreground/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><X className="size-5" /></button></div></div>
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-5 sm:px-8 lg:px-10"><div><h2 className="text-2xl font-bold tracking-tight">{query.trim() ? "Resultados" : "Filmes disponíveis"}</h2></div>
        {loading && <div className="min-h-64" />}
        {error && <div className="flex min-h-64 flex-col items-center justify-center text-center"><Film className="size-9 text-accent" /><p className="mt-4 font-bold">Não foi possível carregar os filmes.</p><button type="button" onClick={showSearch} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Tentar novamente</button></div>}
        {!loading && !error && results.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center text-center"><Search className="size-9 text-primary" /><p className="mt-4 font-bold">Nenhum filme encontrado</p><p className="mt-2 text-sm text-foreground/50">Tente buscar usando outro título ou gênero.</p><button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Limpar busca</button></div>}
        {!loading && !error && results.length > 0 && <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((movie) => { const classification = rating(movie); return <Link key={movie.id} href={`/filmes/${movie.slug}`} onClick={closeSearch} className="group flex min-w-0 gap-4 rounded-2xl bg-[#e2e6ec] p-3 transition hover:bg-muted/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-primary/15 sm:w-24">{movie.cartazUrl ? <img src={movie.cartazUrl} alt={`Cartaz de ${movie.titulo}`} className="size-full object-cover transition group-hover:scale-[1.03]" /> : <div className="grid size-full place-items-center bg-foreground"><Film className="size-7 text-white/60" /></div>}</div><div className="flex min-w-0 flex-1 flex-col py-1"><h3 className="font-bold sm:text-lg">{movie.titulo}</h3><p className="mt-2 text-sm text-foreground/55">{movie.genero || "Gênero não informado"}</p><div className="mt-auto flex items-center justify-between gap-3 pt-4"><span className="flex items-center gap-1.5 text-xs text-foreground/50"><Clock3 className="size-3.5" />{duration(movie.duracaoMinutos)}</span><span className={`grid size-7 place-items-center rounded-md text-[10px] font-extrabold text-white ${classification.style}`}>{classification.label}</span></div></div></Link>; })}</div>}
      </div>
    </div>, document.body)}
  </>;
}
