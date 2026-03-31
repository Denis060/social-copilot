import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Social-Copilot — AI-Powered Social Media Management",
    template: "%s | Social-Copilot",
  },
  description:
    "Schedule posts, generate AI captions, auto-reply to comments, and track analytics across 9 social platforms. All from one dashboard.",
  keywords: [
    "social media management",
    "AI captions",
    "post scheduler",
    "auto reply",
    "analytics dashboard",
  ],
  openGraph: {
    title: "Social-Copilot — AI-Powered Social Media Management",
    description:
      "Schedule posts, generate AI captions, auto-reply to comments, and track analytics across 9 social platforms.",
    url: "https://spcial-copilot.vercel.app",
    siteName: "Social-Copilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social-Copilot — AI-Powered Social Media Management",
    description:
      "Schedule posts, generate AI captions, auto-reply to comments, and track analytics across 9 social platforms.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider serverSession={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
