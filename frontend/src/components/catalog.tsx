"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import { getCatalog } from "@/lib/api";
import type { Movie } from "@/types/catalog";
import { MovieCard } from "./movie-card";

type CatalogState =
  | { status: "loading"; movies: Movie[] }
  | { status: "success"; movies: Movie[] }
  | { status: "error"; movies: Movie[] };

function itemsPerPage() {
  if (window.innerWidth >= 1536) return 5;
  if (window.innerWidth >= 1024) return 4;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

export function Catalog() {
  const [state, setState] = useState<CatalogState>({ status: "loading", movies: [] });

  function retry() {
    setState((current) => ({ ...current, status: "loading" }));
    getCatalog().then((movies) => setState({ status: "success", movies })).catch(() => setState({ status: "error", movies: [] }));
  }

  useEffect(() => {
    const controller = new AbortController();
    getCatalog(controller.signal)
      .then((movies) => setState({ status: "success", movies }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error", movies: [] });
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") return <CatalogSkeleton />;
  if (state.status === "error") return <section className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="rounded-3xl bg-accent/10 px-6 py-12 text-center sm:px-10"><p className="text-xl font-bold">Não foi possível carregar o catálogo.</p><p className="mt-2 text-foreground/65">Verifique se o backend está em execução e tente novamente.</p><button type="button" onClick={retry} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Tentar novamente</button></div></section>;

  const nowPlaying = state.movies.filter((movie) => movie.sessoes.length > 0);
  const comingSoon = state.movies.filter((movie) => movie.sessoes.length === 0);

  return <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
    <MovieRail id="em-cartaz" title="Em cartaz" movies={nowPlaying} emptyText="Nenhum filme em cartaz no momento." />
    <MovieRail id="em-breve" title="Em breve" movies={comingSoon} emptyText="Nenhuma estreia anunciada no momento." className="mt-16 sm:mt-20" />
  </div>;
}

function CatalogSkeleton() {
  return (
    <div
      className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10"
      role="status"
      aria-label="Carregando catálogo de filmes"
    >
      <SkeletonRail />
      <SkeletonRail className="mt-16 sm:mt-20" />
      <span className="sr-only">Carregando filmes...</span>
    </div>
  );
}

function SkeletonRail({ className = "" }: { className?: string }) {
  const visibility = [
    "block",
    "hidden sm:block",
    "hidden lg:block",
    "hidden lg:block",
    "hidden 2xl:block",
  ];

  return (
    <section className={className} aria-hidden="true">
      <div className="skeleton-shimmer mb-8 h-10 w-44 rounded-lg sm:mb-10 sm:w-52" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
        {visibility.map((classes, index) => (
          <div
            key={index}
            className={classes}
          >
            <div className="skeleton-shimmer aspect-[2/3] rounded-2xl" />
            <div className="space-y-4 p-4">
              <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="skeleton-shimmer h-3 w-2/3 rounded" />
                <div className="skeleton-shimmer size-8 shrink-0 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MovieRail({ id, title, movies, emptyText, className = "" }: { id: string; title: string; movies: Movie[]; emptyText: string; className?: string }) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(movies.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const visibleMovies = useMemo(() => movies.slice(safePage * perPage, safePage * perPage + perPage), [movies, safePage, perPage]);

  useEffect(() => {
    function update() { setPerPage(itemsPerPage()); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <section id={id} className={className}>
    <div className="mb-8 flex items-center justify-between gap-5 sm:mb-10"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>{pageCount > 1 && <div className="flex gap-2"><button type="button" aria-label={`Voltar filmes de ${title}`} disabled={safePage === 0} onClick={() => setPage(Math.max(0, safePage - 1))} className="grid size-10 place-items-center rounded-full bg-[#e2e6ec] text-foreground transition hover:bg-muted/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-5" /></button><button type="button" aria-label={`Avançar filmes de ${title}`} disabled={safePage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} className="grid size-10 place-items-center rounded-full bg-[#e2e6ec] text-foreground transition hover:bg-muted/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-5" /></button></div>}</div>
    {movies.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[#e2e6ec] px-6 text-center"><Clapperboard className="size-8 text-primary" /><p className="mt-4 font-semibold text-foreground/60">{emptyText}</p></div> : <><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">{visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>{pageCount > 1 && <div className="mt-7 flex justify-center gap-2" aria-label={`Página ${safePage + 1} de ${pageCount}`}>{Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-label={`Ir para a página ${index + 1}`} aria-current={index === safePage ? "page" : undefined} onClick={() => setPage(index)} className={`h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary ${index === safePage ? "w-8 bg-foreground/75" : "w-4 bg-[#e2e6ec] hover:bg-muted"}`} />)}</div>}</>}
  </section>;
}
