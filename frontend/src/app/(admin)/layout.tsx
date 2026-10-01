import type { ReactNode } from "react";
import { ToastViewport } from "@/components/toast-viewport";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <ToastViewport />
    </div>
  );
}
