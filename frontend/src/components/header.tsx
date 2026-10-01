"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { PublicMovieSearch } from "@/components/public-movie-search";

export function Header() {
  const pathname = usePathname();

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-foreground text-background">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-5 px-6 sm:px-8 lg:px-10">
        <Link href="/" aria-label="CineVerso — início" onClick={handleLogoClick}>
          <Image
            src="/branding/logo.svg"
            alt="CineVerso"
            width={184}
            height={36}
            priority
            className="h-auto w-36 sm:w-44"
          />
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/ingressos" className="relative inline-flex h-10 items-center px-1 text-sm font-semibold text-white/70 transition after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-white after:transition-transform hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-2 sm:after:inset-x-2"><span className="sm:hidden">Ingressos</span><span className="hidden sm:inline">Consultar ingressos</span></Link>
          <PublicMovieSearch />
        </div>
      </div>
    </header>
  );
}
