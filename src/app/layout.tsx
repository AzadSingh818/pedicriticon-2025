import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pedicriticon 2025",
  description: "IAP Karnataka State Intensive Care Chapter Conference 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
