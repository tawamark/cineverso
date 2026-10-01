"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, Clapperboard, Film, Plus } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import {
  ApiError,
  deleteAdminMovie,
  getAdminMovies,
  type AdminMovie,
} from "@/lib/api";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminActionsMenu } from "./admin-actions-menu";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";

type MoviesState =
  | { status: "loading"; movies: AdminMovie[] }
  | { status: "success"; movies: AdminMovie[] }
  | { status: "error"; movies: AdminMovie[] };

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${minutes} min`;
  return remaining ? `${hours}h ${remaining}min` : `${hours}h`;
}

export function AdminMoviesList() {
  const [state, setState] = useState<MoviesState>({ status: "loading", movies: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const session = getAdminSession();
    if (!session) return () => controller.abort();

    getAdminMovies(session.token, controller.signal)
      .then((movies) => setState({ status: "success", movies }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          return;
        }
        setState({ status: "error", movies: [] });
      });

    return () => controller.abort();
  }, []);

  async function removeMovie(movie: AdminMovie) {
    const session = getAdminSession();
    if (!session) throw new Error("Sua sessão expirou.");
    await deleteAdminMovie(session.token, movie.id);
    setState((current) => ({ status: "success", movies: current.movies.filter((item) => item.id !== movie.id) }));
  }

  const visibleMovies = state.movies.filter((movie) =>
    !query || [movie.titulo, movie.genero, movie.classificacao].some((value) =>
      value?.toLocaleLowerCase("pt-BR").includes(query),
    ),
  );

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Filmes</h1>
        </div>
        <Link
          href="/admin/filmes/novo"
          className="flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"
        >
          <Plus aria-hidden="true" className="size-4" />
          Cadastrar filme
        </Link>
      </div>
      <AdminSearch placeholder="Buscar por título, gênero ou classificação" onSearch={setQuery} />

      {state.status === "error" && <MoviesError />}
      {state.status === "success" && state.movies.length === 0 && (
        <AdminEmptyState icon={Clapperboard} title="Nenhum filme cadastrado" description="Os filmes adicionados ao sistema aparecerão aqui." />
      )}
      {state.status === "success" && state.movies.length > 0 && visibleMovies.length === 0 && <AdminNoResults />}
      {state.status === "success" && visibleMovies.length > 0 && (
        <MoviesTable movies={visibleMovies} onDelete={removeMovie} />
      )}
    </>
  );
}

function MoviesTable({ movies, onDelete }: {
  movies: AdminMovie[];
  onDelete: (movie: AdminMovie) => Promise<void>;
}) {
  return (
    <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="hidden grid-cols-[minmax(240px,1.5fr)_1fr_110px_90px_88px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid">
        <span>Filme</span><span>Gênero</span><span>Duração</span><span>Status</span><span className="text-right">Ações</span>
      </div>
      <div className="divide-y divide-muted/20">
        {movies.map((movie) => (
          <article key={movie.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(240px,1.5fr)_1fr_110px_90px_88px] md:items-center md:gap-5 md:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground text-white">
                {movie.cartazUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={movie.cartazUrl} alt="" className="h-full w-full object-cover" />
                ) : <Film aria-hidden="true" className="size-5 text-white/75" />}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-bold">{movie.titulo}</h2>
                <p className="mt-1 text-xs text-foreground/50">{movie.classificacao || "Classificação não informada"}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/65"><span className="mr-2 font-semibold text-foreground md:hidden">Gênero:</span>{movie.genero || "Não informado"}</p>
            <p className="text-sm text-foreground/65"><span className="mr-2 font-semibold text-foreground md:hidden">Duração:</span>{formatDuration(movie.duracaoMinutos)}</p>
            <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${movie.ativo ? "bg-primary/10 text-primary" : "bg-muted/25 text-foreground/55"}`}>{movie.ativo ? "Ativo" : "Inativo"}</span></div>
            <div className="flex gap-1 md:justify-end">
              <AdminActionsMenu editHref={`/admin/filmes/${movie.id}/editar`} label={movie.titulo} onDelete={() => onDelete(movie)} onDeleted={() => undefined} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MoviesError() {
  return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><CircleAlert aria-hidden="true" className="size-9 text-accent" /><h2 className="mt-5 text-xl font-bold">Não foi possível carregar os filmes</h2><p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p></div>;
}
