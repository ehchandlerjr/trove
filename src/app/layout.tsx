import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider, themeScript } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trove - Remember what they love",
  description: "Keep track of what the people in your life would love. Share your own list. Never forget a perfect gift.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1714' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents iOS zoom on input focus
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        
        {/* Google Fonts for theme variety - with preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@400;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Fallback font display strategy */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Inter';
            font-display: swap;
          }
          @font-face {
            font-family: 'Nunito';
            font-display: swap;
          }
        ` }} />
      </head>
      <body className="antialiased">
        {/* Skip link for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-surface)] focus:text-[var(--color-text)] focus:rounded-lg focus:shadow-lg focus:border focus:border-[var(--color-border)]"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            },
          }}
        />
      </body>
    </html>
  );
}
