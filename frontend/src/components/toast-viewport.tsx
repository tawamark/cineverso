"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { subscribeToToasts, type ToastMessage } from "@/lib/toast";

const styles = {
  success: { icon: CheckCircle2, color: "text-[#149447]", bar: "bg-[#149447]" },
  error: { icon: CircleAlert, color: "text-accent", bar: "bg-accent" },
  info: { icon: Info, color: "text-primary", bar: "bg-primary" },
};

export function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => subscribeToToasts((message) => {
    setMessages((current) => [...current.slice(-3), message]);
    window.setTimeout(() => setMessages((current) => current.filter((item) => item.id !== message.id)), message.duration);
  }), []);

  function dismiss(id: string) {
    setMessages((current) => current.filter((item) => item.id !== id));
  }

  return <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed inset-x-4 top-4 z-[250] flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm">
    {messages.map((message) => {
      const style = styles[message.variant];
      const Icon = style.icon;
      return <div key={message.id} role={message.variant === "error" ? "alert" : "status"} className="pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white p-4 pr-12 shadow-[0_18px_55px_rgba(23,27,49,0.2)] motion-safe:animate-[toast-in_180ms_ease-out]"><div className="flex gap-3"><Icon className={`mt-0.5 size-5 shrink-0 ${style.color}`} /><div className="min-w-0"><p className="text-sm font-bold text-foreground">{message.title}</p>{message.description && <p className="mt-1 text-xs leading-5 text-foreground/55">{message.description}</p>}</div></div><button type="button" aria-label="Fechar notificação" onClick={() => dismiss(message.id)} className="absolute right-2.5 top-2.5 rounded-md p-1.5 text-foreground/40 transition hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"><X className="size-4" /></button><span aria-hidden="true" style={{ animation: `toast-progress ${message.duration}ms linear forwards` }} className={`absolute inset-x-0 bottom-0 h-1 origin-left ${style.bar}`} /></div>;
    })}
  </div>;
}
