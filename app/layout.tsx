import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
