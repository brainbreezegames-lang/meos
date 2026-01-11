import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeOS - Your Personal Web Desktop",
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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased font-sans bg-[#FAFAF9] text-stone-800 selection:bg-stone-200 overflow-hidden`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
