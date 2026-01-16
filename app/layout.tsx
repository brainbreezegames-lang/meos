import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Code_Pro, Averia_Serif_Libre, Instrument_Sans, Gochi_Hand } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CommentProvider } from "@/contexts/CommentContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeOS — Portfolio Operating System",
  description: "Create an explorable desktop experience for your portfolio, links, or personal brand. Beautiful, memorable, and uniquely yours.",
  keywords: ["portfolio", "personal website", "link in bio", "desktop", "web OS"],
  authors: [{ name: "MeOS" }],
  openGraph: {
    title: "MeOS - Your Personal Web Desktop",
    description: "Create an explorable desktop experience for your portfolio, links, or personal brand.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeOS - Your Personal Web Desktop",
    description: "Create an explorable desktop experience for your portfolio, links, or personal brand.",
  },
};

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

const sourceCodePro = Source_Code_Pro({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

// Sketch theme fonts
const averiaSerifLibre = Averia_Serif_Libre({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-averia",
});

const instrumentSans = Instrument_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

// Handwritten font for sticky notes
const gochiHand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gochi",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${sourceCodePro.variable} ${averiaSerifLibre.variable} ${instrumentSans.variable} ${gochiHand.variable} font-sans bg-[var(--bg-app)] text-[var(--text-primary)] antialiased overflow-hidden`}>


        <SessionProvider>
          <CommentProvider>{children}</CommentProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// Vercel trigger update
// Forced Deploy: 1768128661
