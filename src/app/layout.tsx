import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { NavShell } from "@/components/layout/nav-shell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROBOT_STORE // Deterministic Procurement Engine",
  description:
    "Guided procurement system for autonomous hardware. Run a 30-second diagnostic, compare systems side-by-side, and deploy — or submit an RFQ — in one flow. Not a catalog. A decision engine.",
  keywords: [
    "robotics procurement",
    "autonomous systems",
    "industrial robots",
    "robot marketplace",
    "AI procurement",
    "deterministic recommendation engine",
  ],
  openGraph: {
    type: "website",
    title: "ROBOT_STORE // Deterministic Procurement Engine",
    description:
      "Not a catalog. A guided procurement engine for autonomous hardware — diagnostic, compare, deploy or quote in one flow.",
    siteName: "RobotStore",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ROBOT_STORE — Deterministic Procurement Engine for Autonomous Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROBOT_STORE // Deterministic Procurement Engine",
    description:
      "Not a catalog. A guided procurement engine for autonomous hardware — diagnostic, compare, deploy or quote in one flow.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
