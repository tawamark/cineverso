"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Ticket } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import {
  ApiError,
  deleteAdminTicketType,
  getAdminTicketTypes,
  type AdminTicketType,
} from "@/lib/api";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminActionsMenu } from "./admin-actions-menu";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";

type TicketTypesState =
  | { status: "loading"; ticketTypes: AdminTicketType[] }
  | { status: "success"; ticketTypes: AdminTicketType[] }
  | { status: "error"; ticketTypes: AdminTicketType[] };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatValidity(ticketType: AdminTicketType) {
  if (!ticketType.inicioVigencia && !ticketType.fimVigencia) return "Sem período definido";
  if (ticketType.inicioVigencia && ticketType.fimVigencia) {
    return `${dateFormatter.format(new Date(ticketType.inicioVigencia))} – ${dateFormatter.format(new Date(ticketType.fimVigencia))}`;
  }
  if (ticketType.inicioVigencia) {
    return `A partir de ${dateFormatter.format(new Date(ticketType.inicioVigencia))}`;
  }
  return `Até ${dateFormatter.format(new Date(ticketType.fimVigencia!))}`;
}

export function AdminTicketTypesList() {
  const [state, setState] = useState<TicketTypesState>({
    status: "loading",
    ticketTypes: [],
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const session = getAdminSession();

    if (!session) return () => controller.abort();

    getAdminTicketTypes(session.token, controller.signal)
      .then((ticketTypes) => setState({ status: "success", ticketTypes }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          return;
        }
        setState({ status: "error", ticketTypes: [] });
      });

    return () => controller.abort();
  }, []);

  async function removeTicketType(id: string) {
    const session = getAdminSession();
    if (!session) throw new Error("Sua sessão expirou.");
    await deleteAdminTicketType(session.token, id);
    setState((current) => ({ ...current, ticketTypes: current.ticketTypes.filter((item) => item.id !== id) }));
  }

  if (state.status === "loading") {
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
        <CircleAlert aria-hidden="true" className="size-9 text-accent" />
        <h2 className="mt-5 text-xl font-bold">Não foi possível carregar os tipos de ingresso</h2>
        <p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p>
      </div>
    );
  }

  if (state.ticketTypes.length === 0) {
    return (
      <AdminEmptyState
        icon={Ticket}
        title="Nenhum tipo de ingresso cadastrado"
        description="Os tipos de ingresso adicionados ao sistema aparecerão aqui."
      />
    );
  }

  const visibleTicketTypes = state.ticketTypes.filter((item) =>
    !query || item.nome.toLocaleLowerCase("pt-BR").includes(query),
  );

  return (
    <><AdminSearch placeholder="Buscar por nome do tipo de ingresso" onSearch={setQuery} />{visibleTicketTypes.length === 0 ? <AdminNoResults /> : <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="hidden grid-cols-[1.2fr_120px_1.4fr_90px_88px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Tipo</span><span>Desconto</span><span>Vigência</span><span>Status</span><span className="text-right">Ações</span></div>
      <div className="divide-y divide-muted/20">
      {visibleTicketTypes.map((ticketType) => (
        <article
          key={ticketType.id}
          className="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_120px_1.4fr_90px_88px] md:items-center md:gap-5 md:px-6"
        >
            <h2 className="font-bold">{ticketType.nome}</h2>
            <p className="text-sm font-bold text-primary"><span className="mr-2 font-semibold text-foreground md:hidden">Desconto:</span>{ticketType.descontoPercentual}%</p>
            <p className="text-sm text-foreground/55"><span className="mr-2 font-semibold text-foreground md:hidden">Vigência:</span>{formatValidity(ticketType)}</p>
            <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                ticketType.ativo
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/25 text-foreground/55"
              }`}
            >
              {ticketType.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex md:justify-end">
            <AdminActionsMenu editHref={`/admin/tipos-ingresso/${ticketType.id}/editar`} label={ticketType.nome} onDelete={() => removeTicketType(ticketType.id)} onDeleted={() => undefined} />
          </div>
        </article>
      ))}
      </div>
    </div>}</>
  );
}
