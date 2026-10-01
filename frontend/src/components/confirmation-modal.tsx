"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, X } from "lucide-react";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  loadingLabel = "Aguarde...",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-foreground/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description" className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" aria-label="Fechar" disabled={loading} onClick={onClose} className="absolute right-5 top-5 rounded-lg p-2 text-foreground/50 transition hover:bg-muted/20 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"><X className="size-5" /></button>
        <h2 id="confirmation-title" className="pr-12 text-2xl font-bold">{title}</h2>
        <p id="confirmation-description" className="mt-3 leading-7 text-foreground/60">{description}</p>
        {error && <p role="alert" className="mt-4 flex gap-2 text-sm font-semibold text-accent"><CircleAlert className="size-5 shrink-0" />{error}</p>}
        <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <button ref={cancelRef} type="button" disabled={loading} onClick={onClose} className="h-12 rounded-xl bg-muted/20 px-5 text-sm font-bold transition hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50">{cancelLabel}</button>
          <button type="button" disabled={loading} onClick={() => void onConfirm()} className={`h-12 rounded-xl px-5 text-sm font-bold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variant === "danger" ? "bg-accent hover:bg-accent/85 focus-visible:outline-accent" : "bg-primary hover:bg-primary/85 focus-visible:outline-primary"}`}>{loading ? loadingLabel : confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
