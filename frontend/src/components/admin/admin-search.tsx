"use client";

import { FormEvent, useState } from "react";
import { Search, X } from "lucide-react";

export function AdminSearch({ placeholder, onSearch }: {
  placeholder: string;
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSearch(value.trim().toLocaleLowerCase("pt-BR")); }
  function clear() { setValue(""); onSearch(""); }
  return <form onSubmit={submit} role="search" className="mt-8 flex max-w-2xl gap-3">
    <div className="relative flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground/40" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-muted/60 bg-white pl-12 pr-11 outline-none placeholder:text-foreground/35 focus:border-2 focus:border-primary" />{value && <button type="button" aria-label="Limpar busca" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground/45 hover:text-foreground"><X className="size-4" /></button>}</div>
    <button type="submit" className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Search aria-hidden="true" className="size-4" />Buscar</button>
  </form>;
}
