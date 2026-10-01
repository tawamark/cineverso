"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type AdminSelectOption = {
  value: string;
  label: string;
  badge?: {
    label: string;
    className: string;
  };
};

type AdminSelectProps = {
  value: string;
  options: AdminSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
};

export function AdminSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  searchable = false,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 256,
  });
  const selected = options.find((option) => option.value === value);
  const filteredOptions = searchable && query
    ? options.filter((option) => option.label.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")))
    : options;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 8;
      const availableBelow = window.innerHeight - rect.bottom - gap;
      const availableAbove = rect.top - gap;
      const openAbove = availableBelow < 180 && availableAbove > availableBelow;
      const desiredHeight = Math.min(256, options.length * 44 + 16);
      const maxHeight = Math.max(120, Math.min(desiredHeight, openAbove ? availableAbove : availableBelow));
      setMenuPosition({
        top: openAbove ? rect.top - gap - maxHeight : rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length, searchable]);

  return (
    <div ref={rootRef} className="relative mt-2 font-normal">
      {searchable && selected && !open ? <div className="flex h-12 w-full items-center rounded-xl border border-muted/60 bg-white pl-4 transition focus-within:border-2 focus-within:border-primary">
        <span className="min-w-0 flex-1 truncate text-foreground">{selected.label}</span>
        <button type="button" disabled={disabled} aria-label={`Remover seleção de ${selected.label}`} onClick={() => { onChange(""); setQuery(""); }} className="grid h-full w-11 shrink-0 place-items-center text-foreground/40 transition hover:text-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"><X aria-hidden="true" className="size-4" /></button>
      </div> : searchable ? <div className={`flex h-12 w-full items-center rounded-xl bg-white transition ${open ? "border-2 border-primary" : "border border-muted/60"}`}>
        <Search aria-hidden="true" className="ml-4 size-4 shrink-0 text-foreground/40" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          disabled={disabled}
          value={open ? query : selected?.label ?? ""}
          placeholder={placeholder}
          onFocus={(event) => { const input = event.currentTarget; setQuery(selected?.label ?? ""); setOpen(true); requestAnimationFrame(() => input.select()); }}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          className="min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-foreground/35 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button type="button" disabled={disabled} aria-label={open ? "Fechar opções" : "Abrir opções"} onClick={() => { setQuery(""); setOpen((current) => !current); }} className="grid h-full w-11 shrink-0 place-items-center text-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"><ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} /></button>
      </div> : <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { if (!open) setQuery(""); setOpen((current) => !current); }}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl bg-white px-4 text-left transition focus-visible:border-2 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted/15 disabled:opacity-60 ${
          open ? "border-2 border-primary" : "border border-muted/60"
        }`}
      >
        <span className={selected ? "truncate text-foreground" : "truncate text-foreground/35"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>}

      {open && !disabled && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width, maxHeight: menuPosition.maxHeight }}
          className="fixed z-[100] overflow-y-auto rounded-xl bg-white p-2 shadow-[0_18px_50px_rgba(23,27,49,0.18)]"
        >
          {filteredOptions.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-primary ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground/70 hover:bg-foreground/[0.045] hover:text-foreground"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">{option.badge && <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-md text-[10px] font-extrabold ${option.badge.className}`}>{option.badge.label}</span>}<span className="truncate">{option.label}</span></span>
                {active && <Check aria-hidden="true" className="size-4 shrink-0" />}
              </button>
            );
          })}
          {filteredOptions.length === 0 && <p className="px-3 py-5 text-center text-sm text-foreground/45">Nenhuma opção encontrada</p>}
        </div>,
        document.body,
      )}
    </div>
  );
}
