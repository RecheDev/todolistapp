import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeScript } from "@/components/ui/ThemeScript";

export const metadata: Metadata = {
  title: "SenseiNotes - Master Your Productivity",
  description: "Master your tasks and notes with SenseiNotes. Intelligent task management with calendar integration, analytics, and workflow optimization.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased text-xl leading-relaxed">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}


