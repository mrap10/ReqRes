import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeProvider from "@/lib/providers/ThemeProvider";
import AuthProvider from "@/lib/providers/AuthProvider";
import UserSubmissionsProvider from "@/lib/providers/UserSubmissionsProvider";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "ReqRes",
  description:
    "Prove your backend logic skills with real-world Express.js easy, medium and hard challenges.",
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${JetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserSubmissionsProvider>
            <ThemeProvider>
              {children}
              <Toaster position="bottom-right" theme="dark" richColors />
            </ThemeProvider>
          </UserSubmissionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
