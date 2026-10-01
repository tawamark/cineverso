"use client";

import { ErrorPage } from "@/components/error-page";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage code={500} message="Algo deu errado" actionLabel="Tentar novamente" onAction={reset} />;
}
