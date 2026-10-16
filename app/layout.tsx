import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/nav" // adjust path if needed
import "./globals.css";

export const metadata: Metadata = {
  title: "Electrical Tools — Quadri Adisa",
  description: "Electrical and agricultural engineering calculator tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-bold text-sm sm:text-base tracking-tight shrink-0"
              style={{ color: "var(--accent)" }}
            >
              Electrical Tools
            </Link>

            <Nav />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}