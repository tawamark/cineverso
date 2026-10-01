"use client";

import { useEffect, useState } from "react";
import { Armchair, CircleAlert } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, deleteAdminRoom, getAdminRooms, type AdminRoom } from "@/lib/api";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminActionsMenu } from "./admin-actions-menu";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";

type RoomsState =
  | { status: "loading"; rooms: AdminRoom[] }
  | { status: "success"; rooms: AdminRoom[] }
  | { status: "error"; rooms: AdminRoom[] };

export function AdminRoomsList() {
  const [state, setState] = useState<RoomsState>({ status: "loading", rooms: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const session = getAdminSession();

    if (!session) return () => controller.abort();

    getAdminRooms(session.token, controller.signal)
      .then((rooms) => setState({ status: "success", rooms }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          return;
        }
        setState({ status: "error", rooms: [] });
      });

    return () => controller.abort();
  }, []);

  async function removeRoom(id: string) {
    const session = getAdminSession();
    if (!session) throw new Error("Sua sessão expirou.");
    await deleteAdminRoom(session.token, id);
    setState((current) => ({ ...current, rooms: current.rooms.filter((room) => room.id !== id) }));
  }

  if (state.status === "loading") {
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
        <CircleAlert aria-hidden="true" className="size-9 text-accent" />
        <h2 className="mt-5 text-xl font-bold">Não foi possível carregar as salas</h2>
        <p className="mt-2 text-foreground/55">Verifique a conexão com o servidor e tente novamente.</p>
      </div>
    );
  }

  if (state.rooms.length === 0) {
    return (
      <AdminEmptyState
        icon={Armchair}
        title="Nenhuma sala cadastrada"
        description="As salas adicionadas ao sistema aparecerão aqui."
      />
    );
  }

  const visibleRooms = state.rooms.filter((room) =>
    !query || [room.nome, room.cinema.nome, room.cinema.cidade].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(query),
    ),
  );

  return (
    <><AdminSearch placeholder="Buscar por sala, cinema ou cidade" onSearch={setQuery} />{visibleRooms.length === 0 ? <AdminNoResults /> : <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]">
      <div className="hidden grid-cols-[1.2fr_1.2fr_90px_110px_90px_88px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Sala</span><span>Cinema</span><span>Fileiras</span><span>Capacidade</span><span>Status</span><span className="text-right">Ações</span></div>
      <div className="divide-y divide-muted/20">
      {visibleRooms.map((room) => {
        const capacity = room.fileiras * room.assentosPorFileira;

        return (
          <article
            key={room.id}
            className="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_1.2fr_90px_110px_90px_88px] md:items-center md:gap-5 md:px-6"
          >
            <h2 className="font-bold">{room.nome}</h2>
            <p className="text-sm text-foreground/65"><span className="mr-2 font-semibold md:hidden">Cinema:</span>{room.cinema.nome}</p>
            <p className="text-sm text-foreground/65"><span className="mr-2 font-semibold md:hidden">Fileiras:</span>{room.fileiras}</p>
            <p className="text-sm text-foreground/65"><span className="mr-2 font-semibold md:hidden">Capacidade:</span>{capacity}</p>
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  room.ativo
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/25 text-foreground/55"
                }`}
              >
                {room.ativo ? "Ativa" : "Inativa"}
              </span>
            </div>
            <div className="flex md:justify-end">
              <AdminActionsMenu editHref={`/admin/salas/${room.id}/editar`} label={room.nome} onDelete={() => removeRoom(room.id)} onDeleted={() => undefined} />
            </div>
          </article>
        );
      })}
      </div>
    </div>}</>
  );
}
