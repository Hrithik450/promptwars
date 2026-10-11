import "./globals.css";
import type { Metadata, Viewport } from "next";
import { bricolage } from "@/assets/fonts";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
  SoftwareApplicationJsonLd,
  FAQJsonLd,
} from "./jsonld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://promptwars.io";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SentinAL — AI Defense Firewall for Autonomous Banking Agents",
    template: "%s | SentinAL AI Defense Firewall",
  },
  description:
    "Enterprise-grade deterministic AI security gateway protecting financial agents from prompt injections, canary leaks, multi-turn state drift, and tool hijacking in under 5ms.",
  applicationName: "SentinAL",
  keywords: [
    "AI Firewall",
    "Prompt Injection Defense",
    "Banking Agent Security",
    "LLM Security Proxy",
    "OWASP LLM Top 10",
    "Autonomous Agent Safety",
    "PromptWars",
    "Financial AI Gateway",
    "Heuristic Intent Parser",
    "Canary Token Protection",
    "Real-time Threat Mitigation",
  ],
  authors: [{ name: "SentinAL Security Labs", url: BASE_URL }],
  creator: "SentinAL Security Labs",
  publisher: "SentinAL",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SentinAL AI Banking Firewall",
    title: "SentinAL — Multi-Vector AI Defense Firewall for Financial Agents",
    description:
      "Deterministic four-layer security proxy stopping adversarial jailbreaks, token exfiltration, and tool hijacking with sub-5ms inspection latency.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SentinAL AI Defense Firewall Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SentinAL — Multi-Vector AI Defense Firewall for Financial Agents",
    description:
      "Deterministic four-layer security proxy stopping adversarial jailbreaks, token exfiltration, and tool hijacking with sub-5ms inspection latency.",
    images: ["/og-image.png"],
    creator: "@sentinal_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "security",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} dark h-full antialiased`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
        <FAQJsonLd />
      </head>
      <body className={`${bricolage.className} min-h-full flex flex-col font-sans bg-black text-white selection:bg-white selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
