"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { CircleAlert, ImagePlus, Trash2, Undo2, X, ZoomIn } from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";
import { toast } from "@/lib/toast";
import {
  ApiError,
  createAdminMovie,
  getAdminMovie,
  updateAdminMovie,
  type AdminMovieInput,
} from "@/lib/api";
import { AdminSelect } from "./admin-select";
import { AdminNumberInput } from "./admin-number-input";

type AdminMovieFormProps = {
  movieId?: string;
};

type FormValues = {
  title: string;
  duration: string;
  genre: string;
  rating: string;
  posterUrl: string;
  synopsis: string;
  active: boolean;
};
type FieldErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  title: "",
  duration: "",
  genre: "",
  rating: "",
  posterUrl: "",
  synopsis: "",
  active: true,
};

const ageRatings = [
  { value: "Livre", label: "Livre", badge: { label: "L", className: "bg-[#149447] text-white" } },
  { value: "10 anos", label: "10 anos", badge: { label: "10", className: "bg-[#1684c7] text-white" } },
  { value: "12 anos", label: "12 anos", badge: { label: "12", className: "bg-[#f2c230] text-foreground" } },
  { value: "14 anos", label: "14 anos", badge: { label: "14", className: "bg-[#e97824] text-white" } },
  { value: "16 anos", label: "16 anos", badge: { label: "16", className: "bg-[#d52b2b] text-white" } },
  { value: "18 anos", label: "18 anos", badge: { label: "18", className: "bg-[#171717] text-white" } },
];

const acceptedPosterTypes = ["image/jpeg", "image/png", "image/webp"];
const maxPosterSize = 2 * 1024 * 1024;

function optionalValue(value: string) {
  const normalized = value.trim();
  return normalized || undefined;
}

export function AdminMovieForm({ movieId }: AdminMovieFormProps) {
  const router = useRouter();
  const editing = Boolean(movieId);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false);
  const [draggingPoster, setDraggingPoster] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    const controller = new AbortController();
    const session = getAdminSession();
    if (!session) return () => controller.abort();

    getAdminMovie(session.token, movieId, controller.signal)
      .then((movie) => {
        setForm({
          title: movie.titulo,
          duration: movie.duracaoMinutos.toString(),
          genre: movie.genero ?? "",
          rating: movie.classificacao ?? "",
          posterUrl: movie.cartazUrl ?? "",
          synopsis: movie.sinopse ?? "",
          active: movie.ativo,
        });
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearAdminSession();
          return;
        }
        setError(caughtError instanceof Error ? caughtError.message : "Não foi possível carregar o filme.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [movieId]);

  function updateField<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handlePoster(file?: File) {
    if (!file) return;
    if (!acceptedPosterTypes.includes(file.type)) {
      setError("O cartaz deve estar nos formatos JPG, PNG ou WebP.");
      return;
    }
    if (file.size > maxPosterSize) {
      setError("O cartaz deve ter no máximo 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("posterUrl", reader.result);
        setError(null);
      }
    };
    reader.onerror = () => setError("Não foi possível carregar a imagem selecionada.");
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors: FieldErrors = {};
    if (!form.title.trim()) validationErrors.title = "Título é obrigatório.";
    if (!form.duration) validationErrors.duration = "Duração é obrigatória.";
    else if (Number(form.duration) < 1 || Number(form.duration) > 600) validationErrors.duration = "Informe uma duração entre 1 e 600 minutos.";
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    const session = getAdminSession();
    if (!session) {
      clearAdminSession();
      return;
    }

    const input: AdminMovieInput = {
      titulo: form.title.trim(),
      duracaoMinutos: Number(form.duration),
      genero: optionalValue(form.genre),
      classificacao: optionalValue(form.rating),
      cartazUrl: optionalValue(form.posterUrl),
      sinopse: optionalValue(form.synopsis),
      ...(editing ? { ativo: form.active } : {}),
    };

    setError(null);
    setSubmitting(true);
    try {
      if (movieId) await updateAdminMovie(session.token, movieId, input);
      else await createAdminMovie(session.token, input);
      toast.success(movieId ? "Alterações salvas" : "Cadastro concluído", `Filme ${movieId ? "atualizado" : "cadastrado"} com sucesso.`);
      router.push("/admin/filmes");
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) clearAdminSession();
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível salvar o filme.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            {editing ? "Editar filme" : "Cadastrar filme"}
          </h1>
          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-semibold text-accent">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              {error}
            </p>
          )}
        </div>
        <Link
          href="/admin/filmes"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-foreground/[0.07] px-5 text-sm font-bold text-foreground/70 transition hover:bg-foreground/[0.12] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"
        >
          <Undo2 aria-hidden="true" className="size-4" />
          Voltar
        </Link>
      </div>

      {!loading && (
        <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(23,27,49,0.05)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
            <Field label="Título" error={fieldErrors.title}><input autoFocus value={form.title} onChange={(e) => updateField("title", e.target.value)} className="admin-input" /></Field>
            <Field label="Duração (min)" error={fieldErrors.duration}><AdminNumberInput min={1} max={600} value={form.duration} onChange={(value) => updateField("duration", value)} /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Gênero"><input value={form.genre} onChange={(e) => updateField("genre", e.target.value)} className="admin-input" /></Field>
            <Field label="Classificação">
              <AdminSelect
                value={form.rating}
                onChange={(value) => updateField("rating", value)}
                placeholder="Não informada"
                options={[{ value: "", label: "Não informada", badge: { label: "?", className: "bg-[#7047a8] text-white" } }, ...ageRatings]}
              />
            </Field>
          </div>
          <div>
            <p className="text-sm font-semibold">Cartaz</p>
            {form.posterUrl ? (
              <div className="mt-2 flex items-center justify-between gap-5 rounded-xl border border-muted/50 p-3">
                <button
                  type="button"
                  aria-label="Ampliar cartaz"
                  onClick={() => setPosterPreviewOpen(true)}
                  className="group relative size-20 shrink-0 overflow-hidden rounded-lg transition-shadow hover:shadow-[0_8px_18px_rgba(23,27,49,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {/* Pode ser uma URL antiga ou uma imagem enviada em base64. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.posterUrl}
                    alt="Prévia do cartaz"
                    className="size-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-foreground/0 text-white opacity-0 transition group-hover:bg-foreground/45 group-hover:opacity-100 group-focus-visible:bg-foreground/45 group-focus-visible:opacity-100">
                    <ZoomIn aria-hidden="true" className="size-6" />
                  </span>
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("posterUrl", "");
                      setPosterPreviewOpen(false);
                    }}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 text-sm font-bold text-accent transition hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <label
                onDragEnter={(event) => { event.preventDefault(); setDraggingPoster(true); }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDraggingPoster(true); }}
                onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDraggingPoster(false); }}
                onDrop={(event) => { event.preventDefault(); setDraggingPoster(false); handlePoster(event.dataTransfer.files?.[0]); }}
                className={`mt-2 flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition ${draggingPoster ? "border-primary bg-primary/[0.06]" : "border-muted/60 hover:border-primary hover:bg-primary/[0.025]"}`}
              >
                <ImagePlus aria-hidden="true" className="size-9 text-primary" />
                <span className="mt-4 text-sm font-bold">{draggingPoster ? "Solte o cartaz aqui" : "Selecionar ou arrastar cartaz"}</span>
                <span className="mt-1 text-xs text-foreground/50">JPG, PNG ou WebP de até 2 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => handlePoster(event.target.files?.[0])}
                />
              </label>
            )}
          </div>
          <Field label="Sinopse"><textarea rows={5} value={form.synopsis} onChange={(e) => updateField("synopsis", e.target.value)} className="admin-input h-auto resize-y py-3" /></Field>
          {editing && <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => updateField("active", e.target.checked)} className="size-4 accent-primary" />Filme ativo</label>}
          <div className="flex flex-col-reverse gap-3 border-t border-muted/25 pt-6 sm:flex-row sm:justify-end">
            <Link href="/admin/filmes" className="flex h-12 items-center justify-center rounded-xl bg-muted/20 px-5 text-sm font-bold transition hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Cancelar</Link>
            <button type="submit" disabled={submitting} className="h-12 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60">{submitting ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar filme"}</button>
          </div>
        </form>
      )}

      {posterPreviewOpen && form.posterUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/85 p-6">
          <button
            type="button"
            aria-label="Fechar visualização"
            className="absolute inset-0"
            onClick={() => setPosterPreviewOpen(false)}
          />
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setPosterPreviewOpen(false)}
            className="fixed right-5 top-5 z-20 rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.posterUrl}
            alt="Cartaz ampliado"
            className="relative z-10 max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] rounded-xl object-contain"
          />
        </div>
      )}
    </section>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <label className="block text-sm font-semibold">{label}{children}{error && <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{error}</span>}</label>;
}
