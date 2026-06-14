import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Finanças",
  description:
    "Controle suas finanças, projete os próximos meses e saiba quando vai atingir suas metas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
