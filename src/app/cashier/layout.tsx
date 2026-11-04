"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { LayoutDashboard, Wallet, School, UserCheck } from "lucide-react";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      allowedRoles={["CASHIER"]}
      workspace="Cashier"
      tagline="Fees & Accounts"
      nav={[
        { href: "/cashier", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/cashier/classrooms", label: "Classes & Verification", icon: School },
      ]}
    >
      {children}
    </AppShell>
  );
}

