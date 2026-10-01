"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";

type AdminNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
};

export function AdminNumberInput({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  required = false,
  disabled = false,
}: AdminNumberInputProps) {
  const parsed = Number(value);
  const hasValue = value !== "" && Number.isFinite(parsed);
  const currentValueRef = useRef(hasValue ? parsed : null);
  const delayRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    currentValueRef.current = hasValue ? parsed : null;
  }, [hasValue, parsed]);

  function changeBy(direction: -1 | 1) {
    const current = currentValueRef.current;
    const base = current ?? min;
    const next = Math.min(max, Math.max(min, base + (current === null ? 0 : direction * step)));
    currentValueRef.current = next;
    onChange(String(next));
  }

  function stopChanging() {
    if (delayRef.current !== null) window.clearTimeout(delayRef.current);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    delayRef.current = null;
    intervalRef.current = null;
  }

  function startChanging(direction: -1 | 1) {
    stopChanging();
    changeBy(direction);
    delayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => changeBy(direction), 85);
    }, 400);
  }

  useEffect(() => stopChanging, []);

  function normalize() {
    if (!hasValue) return;
    onChange(String(Math.min(max, Math.max(min, parsed))));
  }

  return <div className="mt-2 flex h-12 w-full overflow-hidden rounded-xl border border-muted/60 bg-white transition focus-within:border-2 focus-within:border-primary">
    <button type="button" disabled={disabled || (hasValue && parsed <= min)} aria-label="Diminuir valor" onPointerDown={() => startChanging(-1)} onPointerUp={stopChanging} onPointerCancel={stopChanging} onPointerLeave={stopChanging} onClick={(event) => { if (event.detail === 0) changeBy(-1); }} className="grid w-12 shrink-0 place-items-center border-r border-muted/40 text-foreground/55 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"><Minus className="size-4" /></button>
    <input type="text" inputMode="numeric" required={required} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))} onBlur={normalize} className="min-w-0 flex-1 bg-transparent px-3 text-center font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60" />
    <button type="button" disabled={disabled || (hasValue && parsed >= max)} aria-label="Aumentar valor" onPointerDown={() => startChanging(1)} onPointerUp={stopChanging} onPointerCancel={stopChanging} onPointerLeave={stopChanging} onClick={(event) => { if (event.detail === 0) changeBy(1); }} className="grid w-12 shrink-0 place-items-center border-l border-muted/40 text-foreground/55 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"><Plus className="size-4" /></button>
  </div>;
}
