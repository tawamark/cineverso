import Image from "next/image";
import { Catalog } from "@/components/catalog";

export default function Home() {
  return (
    <div id="inicio">
      <section className="relative isolate overflow-hidden border-b border-foreground/10 bg-foreground text-background">
        <Image
          src="/images/home-hero-background.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(23,27,49,0.9)_0%,rgba(23,27,49,0.66)_48%,rgba(23,27,49,0.2)_100%)]"
        />
        <div className="mx-auto flex min-h-[520px] max-w-[1600px] items-center px-6 py-20 sm:min-h-[620px] sm:px-8 lg:min-h-[680px] lg:px-10">
          <div className="max-w-3xl">
            <h1 className="text-balance text-5xl font-bold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Grandes histórias merecem a tela grande.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-background/75 sm:text-xl">
              Encontre filmes em cartaz, escolha o melhor horário e prepare-se
              para viver o cinema.
            </p>
          </div>
        </div>
      </section>

      <Catalog />
    </div>
  );
}
