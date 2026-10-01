import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Em cartaz", href: "/#em-cartaz" },
  { label: "Em breve", href: "/#em-breve" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <Link href="/" aria-label="CineVerso — início" className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Image src="/branding/logo.svg" alt="CineVerso" width={184} height={36} className="h-auto w-40 sm:w-44" />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
              Sistema acadêmico para consulta de filmes, sessões e reserva simulada de ingressos.
            </p>
          </div>
          <nav aria-label="Navegação do rodapé">
            <p className="text-sm font-bold">Navegação</p>
            <ul className="mt-4 space-y-3">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/60 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CineVerso.</p>
          <p>Projeto da disciplina de Programação IV.</p>
        </div>
      </div>
    </footer>
  );
}
