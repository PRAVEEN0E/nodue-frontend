import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nodue-platform.vercel.app";

export const metadata: Metadata = {
  title: "Sign In | Vcet No Due Clearance Portal",
  description:
    "Sign in to Vcet No Due Clearance Portal — One Portal. Zero Pending. Secure clearance access for students, staff, advisors, HODs, and cashier.",
  alternates: {
    canonical: `${APP_URL}/login`,
  },
  openGraph: {
    title: "Sign In | Vcet No Due Clearance Portal",
    description:
      "Vcet No Due Clearance Portal — One Portal. Zero Pending. Secure sign-in for students, faculty advisors, department heads, cashier, and academic staff.",
    url: `${APP_URL}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
