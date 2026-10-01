"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CircleAlert } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, deleteAdminSession, getAdminSessions, type AdminSessionItem } from "@/lib/api";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminActionsMenu } from "./admin-actions-menu";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";

type SessionsState =
  | { status: "loading"; sessions: AdminSessionItem[] }
  | { status: "success"; sessions: AdminSessionItem[] }
  | { status: "error"; sessions: AdminSessionItem[] };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function AdminSessionsList() {
  const [state, setState] = useState<SessionsState>({
    status: "loading",
    sessions: [],
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const session = getAdminSession();

    if (!session) return () => controller.abort();

    getAdminSessions(session.token, controller.signal)
      .then((sessions) => setState({ status: "success", sessions }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          return;
        }
        setState({ status: "error", sessions: [] });
      });

    return () => controller.abort();
  }, []);

  async function removeSession(id: string) {
    const adminSession = getAdminSession();
    if (!adminSession) throw new Error("Sua sessão expirou.");
    await deleteAdminSession(adminSession.token, id);
    setState((current) => ({ ...current, sessions: current.sessions.filter((item) => item.id !== id) }));
  }

  if (state.status === "loading") {
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
        <CircleAlert aria-hidden="true" className="size-9 text-accent" />
        <h2 className="mt-5 text-xl font-bold">Não foi possível carregar as sessões</h2>
        <p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p>
      </div>
    );
  }

  if (state.sessions.length === 0) {
    return (
      <AdminEmptyState
        icon={CalendarDays}
        title="Nenhuma sessão cadastrada"
        description="As sessões adicionadas ao sistema aparecerão aqui."
      />
    );
  }

  const visibleSessions = state.sessions.filter((session) =>
    !query || [session.filme.titulo, session.sala.nome, session.sala.cinema.nome].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(query),
    ),
  );

  return (
    <><AdminSearch placeholder="Buscar por filme, sala ou cinema" onSearch={setQuery} />{visibleSessions.length === 0 ? <AdminNoResults /> : <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="hidden grid-cols-[1.3fr_1fr_1.1fr_110px_120px_100px_88px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Filme</span><span>Data</span><span>Sala</span><span>Exibição</span><span>Preço</span><span>Status</span><span className="text-right">Ações</span></div>
      <div className="divide-y divide-muted/20">
      {visibleSessions.map((session) => {
        const startsAt = new Date(session.inicio);
        const endsAt = new Date(session.fim);

        return (
          <article
            key={session.id}
            className="grid gap-3 px-5 py-5 md:grid-cols-[1.3fr_1fr_1.1fr_110px_120px_100px_88px] md:items-center md:gap-5 md:px-6"
          >
            <div className="min-w-0">
              <h2 className="truncate font-bold">{session.filme.titulo}</h2>
            </div>
            <p className="text-sm text-foreground/65">{dateFormatter.format(startsAt)} · {timeFormatter.format(startsAt)}–{timeFormatter.format(endsAt)}</p>
            <p className="truncate text-sm text-foreground/65">{session.sala.nome} · {session.sala.cinema.nome}</p>
            <div className="flex flex-wrap gap-1.5"><span className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-white">{session.formato}</span><span className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-white">{session.versao === "DUBLADO" ? "Dub" : session.versao === "LEGENDADO" ? "Leg" : "Original"}</span></div>
            <p className="text-sm font-bold text-primary">{currencyFormatter.format(session.precoBaseCentavos / 100)}</p>
            <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${session.publicada ? "bg-primary/10 text-primary" : "bg-muted/25 text-foreground/55"}`}>{session.publicada ? "Publicada" : "Não publicada"}</span></div>
              <div className="flex md:justify-end">
                <AdminActionsMenu viewHref={`/admin/sessoes/${session.id}`} editHref={`/admin/sessoes/${session.id}/editar`} label={`sessão de ${session.filme.titulo}`} onDelete={() => removeSession(session.id)} onDeleted={() => undefined} />
              </div>
          </article>
        );
      })}
      </div>
    </div>}</>
  );
}
