"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import {
  Armchair,
  CalendarDays,
  Building2,
  ChevronDown,
  Clapperboard,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Ticket,
  X,
} from "lucide-react";
import {
  clearAdminSession,
  getAdminSession,
  subscribeToAdminSession,
} from "@/lib/admin-session";

type AdminShellProps = {
  children: ReactNode;
};

const subscribeToHydration = () => () => undefined;

const navigation = [
  { label: "Visão geral", href: "/admin", icon: LayoutDashboard },
  { label: "Filmes", href: "/admin/filmes", icon: Clapperboard },
  { label: "Cinemas", href: "/admin/cinemas", icon: Building2 },
  { label: "Salas", href: "/admin/salas", icon: Armchair },
  { label: "Sessões", href: "/admin/sessoes", icon: CalendarDays },
  { label: "Tipos de ingresso", href: "/admin/tipos-ingresso", icon: Ticket },
  { label: "Vendas", href: "/admin/vendas", icon: ReceiptText },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isAuthenticated = useSyncExternalStore(
    subscribeToAdminSession,
    () => getAdminSession() !== null,
    () => false,
  );
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const session = hasHydrated ? getAdminSession() : null;

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/admin/login");
  }, [hasHydrated, isAuthenticated, router]);

  function logout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  if (!hasHydrated || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-foreground/60">Verificando acesso...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] lg:grid lg:grid-cols-[260px_1fr]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-foreground/55 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-foreground text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-5">
          <Link href="/admin" aria-label="Página inicial do painel">
            <Image
              src="/branding/logo.svg"
              alt="CineVerso"
              width={174}
              height={34}
              priority
              className="h-auto w-40"
            />
          </Link>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="absolute right-3 rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label="Navegação administrativa" className="flex-1 space-y-1 px-3 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const styles = `flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${
              active
                ? "bg-primary text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white"
            }`;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles}
                onClick={() => setMenuOpen(false)}
              >
                <Icon aria-hidden="true" className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-muted/35 bg-white px-4 sm:px-6 lg:justify-end lg:px-8">
          <div className="lg:hidden">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-foreground transition hover:bg-muted/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
            >
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-3 rounded-xl bg-[#f4f5f7] px-3 py-2 text-left transition hover:bg-muted/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-w-56"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-white">
                A
              </div>
              <div className="hidden min-w-0 flex-1 sm:block">
                <p className="truncate text-sm font-semibold">Administrador</p>
                <p className="truncate text-xs text-foreground/50">{session?.email}</p>
              </div>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 text-foreground/55 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] w-72 rounded-xl border border-muted/35 bg-white p-2 shadow-[0_18px_50px_rgba(23,27,49,0.14)]"
              >
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold text-foreground">Administrador</p>
                  <p className="mt-1 truncate text-xs text-foreground/55">
                    {session?.email}
                  </p>
                </div>
                <div className="my-1 h-px bg-muted/30" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-accent transition hover:bg-accent/8 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
