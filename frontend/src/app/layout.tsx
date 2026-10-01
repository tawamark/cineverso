import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { GlobalProgress } from "@/components/global-progress";
import { RouteScrollReset } from "@/components/route-scroll-reset";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineVerso",
  description: "Venda de ingressos e gerenciamento de cinema.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><GlobalProgress /><RouteScrollReset />{children}</body>
    </html>
  );
}
