import { Film } from "lucide-react";
import Link from "next/link";
import type { Movie } from "@/types/catalog";

type MovieCardProps = {
  movie: Movie;
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0 ? `${hours}h ${remainingMinutes}min` : `${minutes}min`;
}

function ratingStyle(rating: string | null) {
  const value = rating?.toLocaleLowerCase("pt-BR") ?? "";
  if (value.includes("livre")) return "bg-[#149447] text-white";
  if (value.startsWith("10")) return "bg-[#1684c7] text-white";
  if (value.startsWith("12")) return "bg-[#f2c230] text-foreground";
  if (value.startsWith("14")) return "bg-[#e97824] text-white";
  if (value.startsWith("16")) return "bg-[#d52b2b] text-white";
  if (value.startsWith("18")) return "bg-[#171717] text-white";
  return "bg-[#7047a8] text-white";
}

function ratingLabel(rating: string | null) {
  if (!rating) return "?";
  if (rating.toLocaleLowerCase("pt-BR").includes("livre")) return "L";
  return rating.match(/\d+/)?.[0] ?? rating;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/filmes/${movie.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-[#e2e6ec] transition duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      <div className="relative aspect-[2/3] overflow-hidden bg-primary/15">
        {movie.cartazUrl ? (
          // A URL é cadastrada pelo administrador e pode pertencer a qualquer provedor.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.cartazUrl}
            alt={`Cartaz do filme ${movie.titulo}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(145deg,#3b5fa4,#171b31)] p-8 text-center">
            <Film className="size-12 text-background/80" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-[0.12em] text-background/75">
              CineVerso
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold tracking-tight">{movie.titulo}</h3>
        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-foreground/55">
            <span className="truncate">{movie.genero || "Gênero não informado"}</span>
            <span aria-hidden="true">•</span>
            <span className="shrink-0">{formatDuration(movie.duracaoMinutos)}</span>
          </div>
          <span
            title={movie.classificacao || "Classificação não informada"}
            className={`grid size-8 shrink-0 place-items-center rounded-md text-xs font-extrabold ${ratingStyle(movie.classificacao)}`}
          >
            {ratingLabel(movie.classificacao)}
          </span>
        </div>
      </div>
    </Link>
  );
}
