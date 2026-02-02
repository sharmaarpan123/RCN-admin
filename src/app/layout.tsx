import { ToastProvider } from "@/components/ToastProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RCN",
  description: "RCN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
