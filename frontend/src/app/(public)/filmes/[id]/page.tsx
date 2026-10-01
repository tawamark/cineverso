import { MovieDetails } from "@/components/movie-details";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  return <MovieDetails slug={slug} />;
}
