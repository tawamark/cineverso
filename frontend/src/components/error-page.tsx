"use client";

import Image from "next/image";
import Link from "next/link";

type ErrorPageProps = {
  code: 404 | 500 | 503;
  message: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
};

export function ErrorPage({ code, message, actionLabel, actionHref, onAction }: ErrorPageProps) {
  const actionClass = "mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

  return <main className="relative flex min-h-screen flex-col px-6 py-8 text-center sm:py-10">
    <Link href="/" aria-label="Ir para a página inicial" className="mx-auto shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      <Image src="/branding/logo.svg" alt="CineVerso" width={180} height={48} priority className="h-auto w-40 brightness-0 sm:w-44" />
    </Link>

    <div className="flex flex-1 flex-col items-center justify-center py-10">
      <div className="relative h-64 w-full max-w-xl sm:h-80 lg:h-96">
        <Image src={`/images/errors/${code}.webp`} alt={`Erro ${code}`} fill priority sizes="(max-width: 640px) 100vw, 576px" className="object-contain" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{message}</h1>
      {actionHref ? <Link href={actionHref} className={actionClass}>{actionLabel}</Link> : <button type="button" onClick={onAction} className={actionClass}>{actionLabel}</button>}
    </div>
  </main>;
}
