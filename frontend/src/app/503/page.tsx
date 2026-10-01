import { ErrorPage } from "@/components/error-page";

export default function ServiceUnavailablePage() {
  return <ErrorPage code={503} message="Serviço temporariamente indisponível" actionLabel="Tentar novamente" actionHref="/" />;
}
