import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "../context/auth-context";
import SwCleanup from "../components/SwCleanup";
import { SW_CLEANUP_INLINE_SCRIPT } from "../lib/sw-cleanup";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nodue-platform.vercel.app";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Vcet No Due Clearance Portal",
    template: "%s | Vcet No Due Clearance Portal",
  },
  description:
    "Vcet No Due Clearance Portal — Official academic no due clearance portal for Velalar College of Engineering and Technology (VCET). Automate student clearances, departmental sign-offs, fee verifications, and hall ticket approvals online.",
  applicationName: "Vcet No Due Clearance Portal",
  keywords: [
    "VCET",
    "VCET No Due",
    "Vcet No Due Clearance Portal",
    "Velalar College of Engineering and Technology",
    "Velalar College No Due",
    "Velalar College of Engineering and Technology No Due Portal",
    "VCET portal",
    "VCET clearance",
    "VCET student clearance",
    "VCET nodue login",
    "VCET hall ticket clearance",
    "No Due Clearance Portal",
    "online student no due clearance",
    "college no due certificate online",
    "academic clearance system",
    "university clearance portal",
    "departmental sign-off system",
    "hall ticket clearance portal",
    "One Portal Zero Pending",
  ],
  authors: [{ name: "VCET Team" }],
  creator: "Velalar College of Engineering and Technology",
  publisher: "VCET",
  verification: {
    google: "7mRLU3RClqs7gIZx9zoQL6DrMrjfo__SR5zfr_-5Om8",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Vcet No Due Clearance Portal",
    title: "Vcet No Due Clearance Portal",
    description:
      "Vcet No Due Clearance Portal — Automate student clearances, departmental sign-offs, and academic administrative workflows online. One Portal. Zero Pending.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vcet No Due Clearance Portal",
    description:
      "Vcet No Due Clearance Portal — Automate student clearances, departmental sign-offs, and academic administrative workflows online.",
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
  alternates: {
    canonical: APP_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Vcet No Due Clearance Portal",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: APP_URL,
  description:
    "Vcet No Due Clearance Portal — One Portal. Zero Pending. Next-generation academic clearance and management platform for VCET to automate student sign-offs and approvals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="7mRLU3RClqs7gIZx9zoQL6DrMrjfo__SR5zfr_-5Om8"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {/* Parse-time stale-SW cleanup: runs before Next.js chunks so a broken
            worker cannot prevent this very cleanup from booting. */}
        <script dangerouslySetInnerHTML={{ __html: SW_CLEANUP_INLINE_SCRIPT }} />
        <AuthProvider>
          <SwCleanup />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
