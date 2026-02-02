
import type { Metadata } from "next";
import "./globals.css";
import CommonProvider from "@/Providers";

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
        <CommonProvider>
          {children}
        </CommonProvider>
      </body>
    </html>
  );
}
