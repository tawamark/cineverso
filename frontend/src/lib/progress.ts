const EVENT = "cineverso:progress";
let pending = 0;
function emit() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: pending > 0 })); }
export function startProgress() { pending += 1; emit(); }
export function stopProgress() { pending = Math.max(0, pending - 1); emit(); }
export async function withProgress<T>(operation: () => Promise<T>): Promise<T> { startProgress(); try { return await operation(); } finally { stopProgress(); } }
export function subscribeProgress(callback: (active: boolean) => void) { const listener = (event: Event) => callback((event as CustomEvent<boolean>).detail); window.addEventListener(EVENT, listener); return () => window.removeEventListener(EVENT, listener); }
