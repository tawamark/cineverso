"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { AdminDeleteAction } from "./admin-delete-action";

export function AdminActionsMenu({ editHref, viewHref, label, onDelete, onDeleted }: {
  editHref: string;
  viewHref?: string;
  label: string;
  onDelete: () => Promise<void>;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => { const close = (event: PointerEvent) => { const target = event.target as Node; if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 176;
      const height = viewHref ? 136 : 96;
      const gap = 8;
      const openAbove = window.innerHeight - rect.bottom < height + gap && rect.top > height + gap;
      setPosition({
        top: openAbove ? rect.top - height - gap : rect.bottom + gap,
        left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, viewHref]);

  return <div ref={ref} className="relative inline-flex">
    <button type="button" aria-label={`Ações de ${label}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 text-foreground/55 transition hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"><EllipsisVertical className="size-5" /></button>
    {typeof document !== "undefined" && createPortal(<div ref={menuRef} style={{ top: position.top, left: position.left }} className={`${open ? "fixed" : "hidden"} z-[100] w-44 rounded-xl bg-white p-2 shadow-[0_18px_50px_rgba(23,27,49,0.18)]`}>{viewHref && <Link href={viewHref} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-foreground/70 transition hover:bg-primary/10 hover:text-primary"><Eye className="size-4" />Visualizar</Link>}<Link href={editHref} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-foreground/70 transition hover:bg-primary/10 hover:text-primary"><Pencil className="size-4" />Editar</Link><AdminDeleteAction label={label} onDelete={onDelete} onDeleted={onDeleted} onOpen={() => setOpen(false)} /></div>, document.body)}
  </div>;
}
