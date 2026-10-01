import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

type AdminPanelLayoutProps = {
  children: ReactNode;
};

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
