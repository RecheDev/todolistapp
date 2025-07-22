import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeScript } from "@/components/ui/ThemeScript";

export const metadata: Metadata = {
  title: "ToDoAPP By RecheDev | Portfolio Demo",
  description: "Demo portfolio application built with Next.js 15 and TypeScript. Interactive demo with localStorage.",
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
