"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { ConfirmationModal } from "@/components/confirmation-modal";

export function AdminDeleteAction({ label, onDelete, onDeleted, onOpen }: {
  label: string;
  onDelete: () => Promise<void>;
  onDeleted: () => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    setError(null); setDeleting(true);
    try { await onDelete(); setOpen(false); onDeleted(); toast.success("Exclusão concluída", `${label} foi excluído com sucesso.`); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível excluir."); }
    finally { setDeleting(false); }
  }
  return <>
    <button type="button" aria-label={`Excluir ${label}`} onClick={() => { onOpen?.(); setOpen(true); }} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"><Trash2 aria-hidden="true" className="size-4" />Excluir</button>
    <ConfirmationModal open={open} title="Confirmar exclusão" description={`Tem certeza de que deseja excluir “${label}”? Esta ação não pode ser desfeita.`} confirmLabel="Excluir" loadingLabel="Excluindo..." variant="danger" loading={deleting} error={error} onConfirm={confirm} onClose={() => { if (!deleting) setOpen(false); }} />
  </>;
}
