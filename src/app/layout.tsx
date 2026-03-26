import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { NextAuthProvider } from "@/components/NextAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TT-Tournament 2026",
  description:
    "Das offizielle Tischtennis-Turnier 2026 – meld dich an, verfolge die Gruppenphase und fieber beim Turnierfinale mit!",
  icons: {
    icon: "/LogoTTT.png",
    apple: "/LogoTTT.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Decorative background blobs */}
        <div
          className="blob"
          style={{
            width: "500px",
            height: "500px",
            top: "-120px",
            right: "-100px",
            background:
              "radial-gradient(circle, #fdba74 0%, #fb923c 60%, transparent 100%)",
          }}
        />
        <div
          className="blob"
          style={{
            width: "400px",
            height: "400px",
            bottom: "10%",
            left: "-80px",
            background:
              "radial-gradient(circle, #fde68a 0%, #fbbf24 60%, transparent 100%)",
          }}
        />
        <div
          className="blob"
          style={{
            width: "300px",
            height: "300px",
            top: "40%",
            right: "20%",
            background:
              "radial-gradient(circle, #fed7aa 0%, #f97316 70%, transparent 100%)",
          }}
        />

        <NextAuthProvider>
          <Navbar />
          <div className="relative z-10 flex flex-col flex-1">{children}</div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
