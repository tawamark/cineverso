"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CircleAlert, Plus } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { ApiError, deleteAdminCinema, getAdminCinemas, type AdminCinema } from "@/lib/api";
import { AdminActionsMenu } from "./admin-actions-menu";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminSearch } from "./admin-search";
import { AdminNoResults } from "./admin-no-results";
import { AdminTableSkeleton } from "./admin-skeletons";

export function AdminCinemasList() {
  const [items, setItems] = useState<AdminCinema[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => { const session = getAdminSession(); if (!session) return; getAdminCinemas(session.token).then(setItems).catch((caught) => { if (caught instanceof ApiError && caught.status === 401) clearAdminSession(); else setError(true); }); }, []);
  async function remove(id: string) { const session = getAdminSession(); if (!session) throw new Error("Sessão expirada."); await deleteAdminCinema(session.token, id); }
  const visibleItems = items?.filter((item) => !query || [item.nome, item.cidade, item.endereco].some((value) => value.toLocaleLowerCase("pt-BR").includes(query))) ?? [];
  return <>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Cinemas</h1></div><Link href="/admin/cinemas/novo" className="flex h-11 items-center gap-2 self-start rounded-xl bg-primary px-5 text-sm font-bold text-white sm:self-center"><Plus className="size-4" />Cadastrar cinema</Link></div>
    <AdminSearch placeholder="Buscar por nome, cidade ou endereço" onSearch={setQuery} />
    {!items && !error && <AdminTableSkeleton />}
    {error && <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl bg-white"><CircleAlert className="size-9 text-accent" /><h2 className="mt-5 text-xl font-bold">Não foi possível carregar os cinemas</h2></div>}
    {items?.length === 0 && <AdminEmptyState icon={Building2} title="Nenhum cinema cadastrado" description="Os cinemas adicionados aparecerão aqui." />}
    {items && items.length > 0 && visibleItems.length === 0 && <AdminNoResults />}
    {visibleItems.length > 0 && <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(23,27,49,0.05)]"><div className="hidden grid-cols-[1.2fr_1fr_1.6fr_90px_88px] gap-5 bg-foreground/[0.035] px-6 py-4 text-xs font-semibold text-foreground/55 md:grid"><span>Cinema</span><span>Cidade</span><span>Endereço</span><span>Status</span><span className="text-right">Ações</span></div><div className="divide-y divide-muted/20">{visibleItems.map((item) => <article key={item.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_1fr_1.6fr_90px_88px] md:items-center md:gap-5 md:px-6"><h2 className="font-bold">{item.nome}</h2><p className="text-sm text-foreground/65"><span className="mr-2 font-semibold md:hidden">Cidade:</span>{item.cidade}</p><p className="truncate text-sm text-foreground/65" title={item.endereco}><span className="mr-2 font-semibold md:hidden">Endereço:</span>{item.endereco}</p><div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.ativo ? "bg-primary/10 text-primary" : "bg-muted/25 text-foreground/55"}`}>{item.ativo ? "Ativo" : "Inativo"}</span></div><div className="flex md:justify-end"><AdminActionsMenu editHref={`/admin/cinemas/${item.id}/editar`} label={item.nome} onDelete={() => remove(item.id)} onDeleted={() => setItems((current) => current?.filter((value) => value.id !== item.id) ?? [])} /></div></article>)}</div></div>}
  </>;
}
