import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeProvider from "@/lib/providers/ThemeProvider";
import AuthProvider from "@/lib/providers/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const JetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReqRes",
  description:
    "Prove your backend logic skills with real-world Express.js easy, medium and hard challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${JetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute={"class"} defaultTheme="dark" disableTransitionOnChange>
            {children}
            <Toaster position="bottom-right" theme="dark" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
