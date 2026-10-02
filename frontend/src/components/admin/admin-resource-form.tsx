"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CircleAlert, Undo2 } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import {
  ApiError,
  createAdminCinema,
  createAdminRoom,
  createAdminSession,
  createAdminTicketType,
  getAdminCinema,
  getAdminCinemas,
  getAdminMovies,
  getAdminRoom,
  getAdminRooms,
  getAdminSessionItem,
  getAdminTicketType,
  updateAdminCinema,
  updateAdminRoom,
  updateAdminSession,
  updateAdminTicketType,
  type AdminCinema,
  type AdminMovie,
  type AdminRoom,
} from "@/lib/api";
import { AdminSelect } from "./admin-select";
import { AdminNumberInput } from "./admin-number-input";
import { toast } from "@/lib/toast";
import { AdminFormSkeleton } from "./admin-skeletons";

type ResourceKind = "cinema" | "sala" | "sessao" | "tipo-ingresso";
type Props = { kind: ResourceKind; id?: string };
type Values = Record<string, string | boolean>;
type FieldErrors = Record<string, string>;

const configs = {
  cinema: { singular: "cinema", back: "/admin/cinemas" },
  sala: { singular: "sala", back: "/admin/salas" },
  sessao: { singular: "sessão", back: "/admin/sessoes" },
  "tipo-ingresso": { singular: "tipo de ingresso", back: "/admin/tipos-ingresso" },
} as const;

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function optionalIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(digits) / 100);
}

function currencyInputToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

export function AdminResourceForm({ kind, id }: Props) {
  const router = useRouter();
  const editing = Boolean(id);
  const config = configs[kind];
  const [values, setValues] = useState<Values>({ ativo: true, publicada: true, formato: "2D", versao: "DUBLADO" });
  const [cinemas, setCinemas] = useState<AdminCinema[]>([]);
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(editing || kind === "sala" || kind === "sessao");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const session = getAdminSession();
    if (!session) return;

    async function load() {
      try {
        if (kind === "sala") setCinemas(await getAdminCinemas(session!.token));
        if (kind === "sessao") {
          const [movieItems, roomItems] = await Promise.all([
            getAdminMovies(session!.token),
            getAdminRooms(session!.token),
          ]);
          setMovies(movieItems.filter((movie) => movie.ativo));
          setRooms(roomItems.filter((room) => room.ativo && room.cinema.ativo));
        }
        if (id) {
          if (kind === "cinema") {
            const item = await getAdminCinema(session!.token, id);
            setValues({ nome: item.nome, cidade: item.cidade, endereco: item.endereco, ativo: item.ativo });
          } else if (kind === "sala") {
            const item = await getAdminRoom(session!.token, id);
            setValues({ cinemaId: item.cinemaId, nome: item.nome, fileiras: String(item.fileiras), assentosPorFileira: String(item.assentosPorFileira), ativo: item.ativo });
          } else if (kind === "sessao") {
            const item = await getAdminSessionItem(session!.token, id);
            setValues({ filmeId: item.filmeId, salaId: item.salaId, inicio: toLocalDateTime(item.inicio), preco: (item.precoBaseCentavos / 100).toFixed(2).replace(".", ","), formato: item.formato, versao: item.versao, publicada: item.publicada });
          } else {
            const item = await getAdminTicketType(session!.token, id);
            setValues({ nome: item.nome, desconto: String(item.descontoPercentual), inicio: item.inicioVigencia ? toLocalDateTime(item.inicioVigencia) : "", fim: item.fimVigencia ? toLocalDateTime(item.fimVigencia) : "", ativo: item.ativo });
          }
        }
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) clearAdminSession();
        setError(caughtError instanceof Error ? caughtError.message : "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, kind]);

  function set(key: string, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const errors: FieldErrors = {};
    const required = (key: string, label: string) => {
      if (!String(values[key] ?? "").trim()) errors[key] = `${label} é obrigatório.`;
    };

    if (kind === "cinema") {
      required("nome", "Nome"); required("cidade", "Cidade"); required("endereco", "Endereço");
    } else if (kind === "sala") {
      required("cinemaId", "Cinema"); required("nome", "Nome da sala");
      const rows = Number(values.fileiras);
      const seats = Number(values.assentosPorFileira);
      if (!String(values.fileiras ?? "")) errors.fileiras = "Quantidade de fileiras é obrigatória.";
      else if (rows < 1 || rows > 26) errors.fileiras = "Informe de 1 a 26 fileiras.";
      if (!String(values.assentosPorFileira ?? "")) errors.assentosPorFileira = "Assentos por fileira é obrigatório.";
      else if (seats < 1 || seats > 50) errors.assentosPorFileira = "Informe de 1 a 50 assentos por fileira.";
    } else if (kind === "sessao") {
      required("filmeId", "Filme"); required("salaId", "Sala"); required("inicio", "Data e horário"); required("preco", "Preço base");
      if (values.inicio && Number.isNaN(new Date(String(values.inicio)).getTime())) errors.inicio = "Informe uma data e um horário válidos.";
      if (values.preco && currencyInputToCents(String(values.preco)) <= 0) errors.preco = "O preço deve ser maior que zero.";
    } else {
      required("nome", "Nome");
      const discount = Number(values.desconto);
      if (!String(values.desconto ?? "")) errors.desconto = "Desconto é obrigatório.";
      else if (discount < 0 || discount > 100) errors.desconto = "Informe um desconto entre 0% e 100%.";
      const start = String(values.inicio ?? "");
      const end = String(values.fim ?? "");
      if (start && end && new Date(end) <= new Date(start)) errors.fim = "O fim da vigência deve ser posterior ao início.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    const session = getAdminSession();
    if (!session) return clearAdminSession();
    setError(null);
    setSubmitting(true);
    try {
      if (kind === "cinema") {
        const input = { nome: String(values.nome).trim(), cidade: String(values.cidade).trim(), endereco: String(values.endereco).trim(), ...(editing ? { ativo: Boolean(values.ativo) } : {}) };
        if (id) await updateAdminCinema(session.token, id, input); else await createAdminCinema(session.token, input);
      } else if (kind === "sala") {
        const input = { cinemaId: String(values.cinemaId), nome: String(values.nome).trim(), fileiras: Number(values.fileiras), assentosPorFileira: Number(values.assentosPorFileira), ...(editing ? { ativo: Boolean(values.ativo) } : {}) };
        if (id) await updateAdminRoom(session.token, id, input); else await createAdminRoom(session.token, input);
      } else if (kind === "sessao") {
        const input = { filmeId: String(values.filmeId), salaId: String(values.salaId), inicio: new Date(String(values.inicio)).toISOString(), precoBaseCentavos: currencyInputToCents(String(values.preco)), formato: String(values.formato) as "2D" | "3D", versao: String(values.versao) as "DUBLADO" | "LEGENDADO" | "ORIGINAL", publicada: Boolean(values.publicada) };
        if (id) await updateAdminSession(session.token, id, input); else await createAdminSession(session.token, input);
      } else {
        const input = { nome: String(values.nome).trim(), descontoPercentual: Number(values.desconto), inicioVigencia: optionalIso(String(values.inicio ?? "")), fimVigencia: optionalIso(String(values.fim ?? "")), ...(editing ? { ativo: Boolean(values.ativo) } : {}) };
        if (id) await updateAdminTicketType(session.token, id, input); else await createAdminTicketType(session.token, input);
      }
      toast.success(editing ? "Alterações salvas" : "Cadastro concluído", editing ? "As informações foram atualizadas com sucesso." : "O cadastro foi realizado com sucesso.");
      router.push(config.back);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) clearAdminSession();
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  const action = editing ? "Editar" : "Cadastrar";
  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{action} {config.singular}</h1>
          {error && <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-semibold text-accent"><CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />{error}</p>}
        </div>
        <Link href={config.back} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-foreground/[0.07] px-5 text-sm font-bold text-foreground/70 transition hover:bg-foreground/[0.12] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"><Undo2 aria-hidden="true" className="size-4" />Voltar</Link>
      </div>
      {loading && <AdminFormSkeleton />}
      {!loading && (
        <form noValidate onSubmit={submit} className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(23,27,49,0.05)] sm:p-8">
          {kind === "cinema" && <CinemaFields values={values} set={set} errors={fieldErrors} />}
          {kind === "sala" && <RoomFields values={values} set={set} cinemas={cinemas} editing={editing} errors={fieldErrors} />}
          {kind === "sessao" && <SessionFields values={values} set={set} movies={movies} rooms={rooms} errors={fieldErrors} />}
          {kind === "tipo-ingresso" && <TicketTypeFields values={values} set={set} errors={fieldErrors} />}
          {editing && kind !== "sessao" && <Check label={`${config.singular.charAt(0).toUpperCase() + config.singular.slice(1)} ativo`} checked={Boolean(values.ativo)} onChange={(value) => set("ativo", value)} />}
          <div className="flex flex-col-reverse gap-3 border-t border-muted/25 pt-6 sm:flex-row sm:justify-end"><Link href={config.back} className="flex h-12 items-center justify-center rounded-xl bg-muted/20 px-5 text-sm font-bold transition hover:bg-muted/30">Cancelar</Link><button type="submit" disabled={submitting} className="h-12 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">{submitting ? "Salvando..." : editing ? "Salvar alterações" : `Cadastrar ${config.singular}`}</button></div>
        </form>
      )}
    </section>
  );
}

type Setter = (key: string, value: string | boolean) => void;
const Field = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => <label className="block text-sm font-semibold">{label}{children}{error && <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{error}</span>}</label>;
const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-primary" />{label}</label>;
function CinemaFields({ values, set, errors }: { values: Values; set: Setter; errors: FieldErrors }) { return <><Field label="Nome" error={errors.nome}><input value={String(values.nome ?? "")} onChange={(e) => set("nome", e.target.value)} className="admin-input" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Cidade" error={errors.cidade}><input value={String(values.cidade ?? "")} onChange={(e) => set("cidade", e.target.value)} className="admin-input" /></Field><Field label="Endereço" error={errors.endereco}><input value={String(values.endereco ?? "")} onChange={(e) => set("endereco", e.target.value)} className="admin-input" /></Field></div></>; }
function RoomFields({ values, set, cinemas, editing, errors }: { values: Values; set: Setter; cinemas: AdminCinema[]; editing: boolean; errors: FieldErrors }) { const options = cinemas.filter((item) => item.ativo || item.id === values.cinemaId).map((item) => ({ value: item.id, label: `${item.nome} · ${item.cidade}` })); return <><Field label="Cinema" error={errors.cinemaId}><AdminSelect disabled={editing} value={String(values.cinemaId ?? "")} onChange={(value) => set("cinemaId", value)} placeholder="Selecione um cinema" options={options} /></Field><Field label="Nome da sala" error={errors.nome}><input value={String(values.nome ?? "")} onChange={(e) => set("nome", e.target.value)} className="admin-input" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Fileiras" error={errors.fileiras}><AdminNumberInput min={1} max={26} value={String(values.fileiras ?? "")} onChange={(value) => set("fileiras", value)} /></Field><Field label="Assentos por fileira" error={errors.assentosPorFileira}><AdminNumberInput min={1} max={50} value={String(values.assentosPorFileira ?? "")} onChange={(value) => set("assentosPorFileira", value)} /></Field></div></>; }
function SessionFields({ values, set, movies, rooms, errors }: { values: Values; set: Setter; movies: AdminMovie[]; rooms: AdminRoom[]; errors: FieldErrors }) { return <><div className="grid gap-5 sm:grid-cols-2"><Field label="Filme" error={errors.filmeId}><AdminSelect searchable value={String(values.filmeId ?? "")} onChange={(value) => set("filmeId", value)} placeholder="Selecione um filme" options={movies.map((item) => ({ value: item.id, label: item.titulo }))} /></Field><Field label="Sala" error={errors.salaId}><AdminSelect value={String(values.salaId ?? "")} onChange={(value) => set("salaId", value)} placeholder="Selecione uma sala" options={rooms.map((item) => ({ value: item.id, label: `${item.nome} · ${item.cinema.nome}` }))} /></Field></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Data e horário" error={errors.inicio}><input type="datetime-local" value={String(values.inicio ?? "")} onChange={(e) => set("inicio", e.target.value)} className="admin-input" /></Field><Field label="Preço base (R$)" error={errors.preco}><input inputMode="numeric" value={String(values.preco ?? "")} onChange={(e) => set("preco", formatCurrencyInput(e.target.value))} placeholder="0,00" className="admin-input" /></Field></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Formato"><AdminSelect value={String(values.formato ?? "2D")} onChange={(value) => set("formato", value)} placeholder="Selecione o formato" options={[{ value: "2D", label: "2D" }, { value: "3D", label: "3D" }]} /></Field><Field label="Versão"><AdminSelect value={String(values.versao ?? "DUBLADO")} onChange={(value) => set("versao", value)} placeholder="Selecione a versão" options={[{ value: "DUBLADO", label: "Dublado" }, { value: "LEGENDADO", label: "Legendado" }, { value: "ORIGINAL", label: "Original" }]} /></Field></div><Check label="Sessão publicada" checked={Boolean(values.publicada)} onChange={(value) => set("publicada", value)} /></>; }
function TicketTypeFields({ values, set, errors }: { values: Values; set: Setter; errors: FieldErrors }) { return <><div className="grid gap-5 sm:grid-cols-[1fr_200px]"><Field label="Nome" error={errors.nome}><input value={String(values.nome ?? "")} onChange={(e) => set("nome", e.target.value)} className="admin-input" /></Field><Field label="Desconto (%)" error={errors.desconto}><AdminNumberInput min={0} max={100} value={String(values.desconto ?? "")} onChange={(value) => set("desconto", value)} /></Field></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Início da vigência"><input type="datetime-local" value={String(values.inicio ?? "")} onChange={(e) => set("inicio", e.target.value)} className="admin-input" /></Field><Field label="Fim da vigência" error={errors.fim}><input type="datetime-local" value={String(values.fim ?? "")} onChange={(e) => set("fim", e.target.value)} className="admin-input" /></Field></div></>; }
