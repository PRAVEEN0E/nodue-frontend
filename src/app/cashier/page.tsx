"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getCashierDashboard,
  getCashierClassrooms,
  CashierDashboardStats,
  CashierClassroom,
} from "@/lib/cashier-api";
import { ApiError } from "@/lib/api";
import {
  School,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Wallet,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { PageHeader, StatCard, Card, Button, Badge, LinkButton } from "@/components/ui/controls";
import { PageLoader, ErrorState } from "@/components/ui/feedback";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function CashierDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CashierDashboardStats | null>(null);
  const [classes, setClasses] = useState<CashierClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, classesData] = await Promise.all([
        getCashierDashboard(),
        getCashierClassrooms({ page: 1, limit: 6 }),
      ]);
      setStats(statsData);
      setClasses(classesData.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader label="Loading cashier dashboard…" />;

  if (error || !stats) {
    return (
      <div>
        <PageHeader breadcrumb="Cashier / Dashboard" title="Dashboard" description="Fee clearance overview" />
        <Card>
          <ErrorState message={error ?? "Failed to load cashier dashboard"} onRetry={load} />
        </Card>
      </div>
    );
  }

  const verifiedPercent =
    stats.totalStudents > 0 ? Math.round((stats.verifiedFees / stats.totalStudents) * 100) : 0;

  return (
    <div>
      <PageHeader
        breadcrumb="Cashier / Dashboard"
        title={`Welcome, ${user ? `${user.firstName} ${user.lastName}` : "Dinesh Prabhu Y"}`}
        description="Institutional fee verification overview across all departments and classrooms."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={load}>
              <RefreshCw style={{ width: 14, height: 14 }} />
              Refresh
            </Button>
            <LinkButton href="/cashier/classrooms">
              <School style={{ width: 14, height: 14 }} />
              Manage All Classes
            </LinkButton>
          </div>
        }
      />

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge tone="success">Cashier Authority Active</Badge>
        <Badge tone={stats.pendingFees > 0 ? "warning" : "success"}>
          {stats.pendingFees > 0 ? `${stats.pendingFees} Students Pending Verification` : "All Fees Cleared"}
        </Badge>
        <Badge tone="info">{stats.totalDepartments} Academic Departments</Badge>
      </div>

      {/* ─── METRIC CARDS ─── */}
      <div className="nd-stat-grid">
        <StatCard
          label="Total Classes"
          value={stats.totalClassrooms}
          sub={`${stats.totalDepartments} departments college-wide`}
          icon={<School style={{ width: 18, height: 18 }} />}
        />
        <StatCard
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          sub="Enrolled active students"
          icon={<Users style={{ width: 18, height: 18 }} />}
        />
        <StatCard
          label="Fee Clearance Rate"
          value={`${verifiedPercent}%`}
          sub={`${stats.verifiedFees} of ${stats.totalStudents} students verified`}
          icon={<CheckCircle2 style={{ width: 18, height: 18, color: "var(--nd-success, #16a34a)" }} />}
        />
        <StatCard
          label="Pending Verification"
          value={stats.pendingFees.toLocaleString()}
          sub={stats.pendingFees > 0 ? "Awaiting cashier / fee clearance" : "All cleared"}
          icon={<Clock style={{ width: 18, height: 18, color: stats.pendingFees > 0 ? "var(--nd-warning, #d97706)" : undefined }} />}
        />
      </div>

      {/* ─── TWO COLUMN OPERATIONS & CLASSROOM SHORTCUTS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }} className="nd-two-col">
        {/* Left Column: Quick Actions & Role Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Quick Actions" description="Fast fee management shortcuts.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <Link
                href="/cashier/classrooms"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  border: "1px solid var(--nd-border, #e2e8f0)",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: "#fff",
                  transition: "background 0.15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="nd-stat-icon" style={{ width: 34, height: 34 }}>
                    <School style={{ width: 16, height: 16 }} />
                  </span>
                  <span>
                    <div className="nd-cell-primary" style={{ fontWeight: 600 }}>All Classes Directory</div>
                    <div className="nd-cell-secondary" style={{ fontSize: 12 }}>Filter and review class rosters</div>
                  </span>
                </span>
                <ChevronRight style={{ width: 16, height: 16, color: "var(--nd-muted)" }} />
              </Link>
            </div>
          </Card>

          <Card title="Cashier Authorization" description="Scope & approval rules.">
            <div style={{ fontSize: 13, color: "var(--nd-muted)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ShieldCheck style={{ width: 16, height: 16, color: "var(--nd-blue)", flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>College-wide Authority:</strong> You can approve student fee clearances across <em>all departments and batches</em>.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: "var(--nd-success)", flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>Instant Clearance:</strong> When you approve a student&apos;s fee, their No-Due fee verification is instantly marked <strong>Verified</strong>.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Classroom Fee Roster Highlights */}
        <Card
          title="Classrooms Requiring Clearance"
          description="Recent classrooms across departments and their current fee verification progress."
          actions={
            <LinkButton href="/cashier/classrooms" variant="ghost" size="sm">
              View All Classes <ArrowRight style={{ width: 14, height: 14 }} />
            </LinkButton>
          }
        >
          {classes.length === 0 ? (
            <p className="nd-cell-secondary" style={{ padding: "16px 0" }}>No classrooms found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {classes.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--nd-border, #e2e8f0)",
                    background: "#fafafa",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                      <Badge tone="info">{c.department.code}</Badge>
                    </div>
                    <div className="nd-cell-secondary" style={{ fontSize: 12, marginTop: 2 }}>
                      Sem {c.semester} (Sec {c.section}) · Batch {c.batch} · {c.totalStudents} Students
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      {c.pendingCount === 0 ? (
                        <Badge tone="success">All Cleared ({c.verifiedCount})</Badge>
                      ) : (
                        <Badge tone="warning">{c.pendingCount} Pending</Badge>
                      )}
                    </div>
                    <Link
                      href="/cashier/classrooms"
                      className="nd-btn nd-btn-secondary nd-btn-sm"
                      style={{ textDecoration: "none" }}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
