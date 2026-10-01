"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { startProgress, stopProgress, subscribeProgress } from "@/lib/progress";
export function GlobalProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  useEffect(() => subscribeProgress(setActive), []);
  useEffect(() => stopProgress(), [pathname]);
  useEffect(() => { function click(event: MouseEvent) { const link = (event.target as Element).closest("a[href]") as HTMLAnchorElement | null; if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey) return; const url = new URL(link.href, location.href); if (url.origin === location.origin && url.pathname !== location.pathname) startProgress(); } document.addEventListener("click", click); return () => document.removeEventListener("click", click); }, []);
  return <div aria-hidden="true" className={`fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden transition-opacity ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}><div className="h-full w-1/3 bg-primary shadow-[0_0_12px_rgba(59,95,164,0.65)] motion-safe:animate-[global-progress_1.1s_ease-in-out_infinite]" /></div>;
}
