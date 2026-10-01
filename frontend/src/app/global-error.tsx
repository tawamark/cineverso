"use client";

import { ErrorPage } from "@/components/error-page";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR"><body><ErrorPage code={500} message="Algo deu errado" actionLabel="Tentar novamente" onAction={reset} /></body></html>;
}
