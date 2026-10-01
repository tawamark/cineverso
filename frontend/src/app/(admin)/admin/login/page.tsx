"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { ApiError, loginAdmin } from "@/lib/api";
import { toast } from "@/lib/toast";
import { saveAdminSession } from "@/lib/admin-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors: { email?: string; password?: string } = {};
    if (!email.trim()) validationErrors.email = "Email é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) validationErrors.email = "Informe um email válido.";
    if (!password) validationErrors.password = "Senha é obrigatória.";
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const session = await loginAdmin({ email, senha: password });
      saveAdminSession(session);
      toast.success("Acesso realizado", "Bem-vindo ao painel administrativo.");
      router.replace("/admin");
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        setError("Email ou senha incorretos.");
      } else if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(560px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/images/admin-login-background.webp"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(145deg,rgba(23,27,49,0.88),rgba(23,27,49,0.35)_55%,rgba(59,95,164,0.55))]"
        />
        <Image
          src="/branding/logo.svg"
          alt="CineVerso"
          width={210}
          height={42}
          priority
          className="relative h-auto w-48"
        />

        <div className="relative max-w-xl">
          <h1 className="text-5xl font-bold leading-tight tracking-[-0.04em] xl:text-6xl">
            Tudo pronto para a próxima sessão.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-background/70">
            Organize a programação, as salas e a experiência do público em um só lugar.
          </p>
        </div>

        <p className="relative text-sm text-background/55">
          Painel administrativo CineVerso
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <Image
            src="/branding/icon.svg"
            alt=""
            width={54}
            height={54}
            className="mb-10 h-12 w-auto lg:hidden"
          />

          <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Acessar o painel</h2>

          {error && (
            <p
              role="alert"
              className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent"
            >
              <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
              {error}
            </p>
          )}

          <form noValidate className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground/45"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }}
                  placeholder="admin@cineverso.local"
                  className="h-14 w-full rounded-2xl border border-muted/70 bg-white pl-12 pr-4 outline-none transition placeholder:text-foreground/35 focus:border-2 focus:border-primary"
                />
              </div>
              {fieldErrors.email && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                Senha
              </label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground/45"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }}
                  placeholder="Digite sua senha"
                  className="h-14 w-full rounded-2xl border border-muted/70 bg-white pl-12 pr-12 outline-none transition placeholder:text-foreground/35 focus:border-2 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground/50 transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent"><CircleAlert aria-hidden="true" className="size-4 shrink-0" />{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-bold text-background transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
              {!isSubmitting && <ArrowRight aria-hidden="true" className="size-5" />}
            </button>
          </form>

        </div>
      </section>
    </main>
  );
}
