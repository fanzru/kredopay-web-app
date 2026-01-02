import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientWalletProvider } from "@/components/providers/ClientWalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kredo App | Authorization-Based Financial OS",
  description:
    "Kredo is the first financial system where you never hold money. No accounts, no wallets, no balances. Just cryptographic permission. Join the post-account economy.",
  applicationName: "Kredo App",
  keywords: [
    "Kredo",
    "Accountless Banking",
    "Zero Knowledge Proofs",
    "Authorization Finance",
    "DeFi",
    "Crypto",
    "Privacy",
    "Web3",
    "Spendability",
  ],
  authors: [{ name: "Kredo Team", url: "https://kredopay.com" }],
  openGraph: {
    title: "Kredo App | Authorization-Based Financial OS",
    description:
      "Experience banking without ownership. No wallets to secure, no balances to expose. Just pure cryptographic permission.",
    type: "website",
    locale: "en_US",
    siteName: "Kredo App",
    // images: [
    //   {
    //     url: '/og-image.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Kredo App Interface',
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kredo App",
    description:
      "Banking without accounts. Spendability without ownership. The future of on-chain finance.",
    creator: "@kredopay",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
