export type ToastVariant = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

const TOAST_EVENT = "cineverso:toast";

export function showToast({ title, description, variant = "info", duration = 4500 }: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  if (typeof window === "undefined") return;
  const message: ToastMessage = {
    id: crypto.randomUUID(),
    title,
    description,
    variant,
    duration,
  };
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: message }));
}

export const toast = {
  success: (title: string, description?: string) => showToast({ title, description, variant: "success" }),
  error: (title: string, description?: string) => showToast({ title, description, variant: "error" }),
  info: (title: string, description?: string) => showToast({ title, description, variant: "info" }),
};

export function subscribeToToasts(listener: (message: ToastMessage) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<ToastMessage>).detail);
  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}
