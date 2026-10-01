import { ErrorPage } from "@/components/error-page";

export default function NotFound() {
  return <ErrorPage code={404} message="Página não encontrada" actionLabel="Voltar ao início" actionHref="/" />;
}
