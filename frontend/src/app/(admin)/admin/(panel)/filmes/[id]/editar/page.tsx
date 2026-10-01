import { AdminMovieForm } from "@/components/admin/admin-movie-form";

type EditAdminMoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminMoviePage({ params }: EditAdminMoviePageProps) {
  const { id } = await params;
  return <AdminMovieForm movieId={id} />;
}
