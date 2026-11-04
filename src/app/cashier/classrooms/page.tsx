"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getCashierClassrooms,
  getCashierClassroomStudents,
  approveCashierStudentFee,
  approveCashierClassroomAll,
  CashierClassroom,
  CashierStudentFeeRow,
} from "@/lib/cashier-api";
import { getDepartmentsList, AdvisorDepartmentOption } from "@/lib/advisor-api";
import { ApiError } from "@/lib/api";
import { Search, RefreshCw, Check, ArrowLeft, School, CheckCheck } from "lucide-react";
import { PageHeader, Badge, Button } from "@/components/ui/controls";
import { TableSkeleton, EmptyState, ErrorState, Pagination, ButtonSpinner } from "@/components/ui/feedback";

export default function CashierClassroomsPage() {
  const [classrooms, setClassrooms] = useState<CashierClassroom[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [departments, setDepartments] = useState<AdvisorDepartmentOption[]>([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected classroom drill-down state
  const [selectedClassroom, setSelectedClassroom] = useState<CashierClassroom | null>(null);
  const [students, setStudents] = useState<CashierStudentFeeRow[]>([]);
  const [studentsMeta, setStudentsMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Action states
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Load departments once
  useEffect(() => {
    getDepartmentsList().then(setDepartments).catch(() => {});
  }, []);

  // Load classrooms across all departments
  const loadClassrooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCashierClassrooms({
        page: currentPage,
        limit: 20,
        search: search.trim() || undefined,
        departmentId: deptFilter || undefined,
      });
      setClassrooms(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load classrooms.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, deptFilter]);

  useEffect(() => {
    if (!selectedClassroom) {
      const t = setTimeout(loadClassrooms, search ? 300 : 0);
      return () => clearTimeout(t);
    }
  }, [loadClassrooms, search, selectedClassroom]);

  // Load students of selected classroom
  const loadStudents = useCallback(async () => {
    if (!selectedClassroom) return;
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const res = await getCashierClassroomStudents(selectedClassroom.id, {
        page: 1,
        limit: 100,
        search: studentSearch.trim() || undefined,
        status: studentStatusFilter,
      });
      setStudents(res.data);
      setStudentsMeta(res.meta);
    } catch (err) {
      setStudentsError(err instanceof ApiError ? err.message : "Failed to load students.");
    } finally {
      setStudentsLoading(false);
    }
  }, [selectedClassroom, studentSearch, studentStatusFilter]);

  useEffect(() => {
    if (selectedClassroom) {
      const t = setTimeout(loadStudents, studentSearch ? 300 : 0);
      return () => clearTimeout(t);
    }
  }, [loadStudents, studentSearch, selectedClassroom]);

  const handleApproveStudent = async (student: CashierStudentFeeRow) => {
    setApprovingId(student.id);
    setStudentsError(null);
    try {
      await approveCashierStudentFee(student.id);
      setNotice(`Fee approved for ${student.studentName} (${student.registerNumber}).`);
      setTimeout(() => setNotice(null), 5000);
      await loadStudents();
      // Also update counts in the parent list in background
      loadClassrooms();
    } catch (err) {
      setStudentsError(err instanceof ApiError ? err.message : "Failed to approve fee.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveAllPending = async () => {
    if (!selectedClassroom) return;
    setApprovingAll(true);
    setStudentsError(null);
    try {
      const res = await approveCashierClassroomAll(selectedClassroom.id);
      setNotice(`Successfully approved fees for ${res.approvedCount} pending student(s).`);
      setTimeout(() => setNotice(null), 5000);
      await loadStudents();
      loadClassrooms();
    } catch (err) {
      setStudentsError(err instanceof ApiError ? err.message : "Failed to approve all fees.");
    } finally {
      setApprovingAll(false);
    }
  };

  const pendingCount = students.filter((s) => !s.verified).length;

  return (
    <div>
      <PageHeader
        breadcrumb={
          selectedClassroom
            ? `Cashier / Classes / ${selectedClassroom.name}`
            : "Cashier / Classes"
        }
        title={
          selectedClassroom
            ? `${selectedClassroom.name} — Student Fee Approval`
            : "All Department Classes"
        }
        description={
          selectedClassroom
            ? `${selectedClassroom.department.name} (${selectedClassroom.department.code}) · Batch ${selectedClassroom.batch} · Semester ${selectedClassroom.semester} Section ${selectedClassroom.section}`
            : "Classes across all departments. Click any class to review and approve student fees."
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {selectedClassroom ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedClassroom(null);
                    setStudentSearch("");
                    setStudentStatusFilter("ALL");
                  }}
                >
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                  Back to Classes
                </Button>
                {pendingCount > 0 && (
                  <Button
                    onClick={handleApproveAllPending}
                    disabled={approvingAll}
                  >
                    {approvingAll ? <ButtonSpinner /> : <CheckCheck style={{ width: 14, height: 14 }} />}
                    {approvingAll ? "Approving…" : `Approve All Pending (${pendingCount})`}
                  </Button>
                )}
              </>
            ) : (
              <Button variant="secondary" onClick={loadClassrooms}>
                <RefreshCw style={{ width: 14, height: 14 }} />
                Refresh
              </Button>
            )}
          </div>
        }
      />

      {notice && (
        <div className="nd-alert nd-alert-success" role="status" style={{ marginBottom: 16 }}>
          <Check style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {/* ─── VIEW 1: CLASSROOMS DIRECTORY (ALL DEPARTMENTS) ─── */}
      {!selectedClassroom ? (
        <>
          <div className="nd-filter-bar" role="search">
            <div className="nd-search-wrap">
              <Search className="nd-search-icon" style={{ width: 16, height: 16 }} />
              <input
                className="nd-input nd-search-input"
                placeholder="Search class, reg no, batch, or dept…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search classes"
              />
            </div>

            <select
              className="nd-select"
              style={{ width: "auto", minWidth: 180 }}
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.name}
                </option>
              ))}
            </select>
          </div>

          {error && !loading && (
            <div className="nd-card" style={{ marginBottom: 16 }}>
              <ErrorState message={error} onRetry={loadClassrooms} />
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : classrooms.length === 0 ? (
            <div className="nd-table-card">
              <EmptyState
                title="No classes found"
                description={
                  deptFilter
                    ? "No classrooms found for the selected department filter."
                    : "There are currently no classrooms configured."
                }
              />
            </div>
          ) : (
            <div className="nd-table-card">
              <div className="nd-table-scroll">
                <table className="nd-table">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Department</th>
                      <th>Semester & Batch</th>
                      <th>Total Students</th>
                      <th>Fees Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map((c) => (
                      <tr key={c.id}>
                        <td className="nd-cell-primary">
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        </td>
                        <td>
                          <Badge tone="info">{c.department.code}</Badge>
                          <span className="nd-cell-secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {c.department.name}
                          </span>
                        </td>
                        <td>
                          <span>Sem {c.semester}</span>
                          <span className="nd-cell-secondary"> · {c.batch} (Sec {c.section})</span>
                        </td>
                        <td className="nd-cell-num">{c.totalStudents}</td>
                        <td>
                          {c.totalStudents === 0 ? (
                            <span className="nd-cell-secondary">No students</span>
                          ) : c.pendingCount === 0 ? (
                            <Badge tone="success">All Verified ({c.verifiedCount}/{c.totalStudents})</Badge>
                          ) : (
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              <Badge tone="warning">{c.pendingCount} Pending</Badge>
                              <span className="nd-cell-secondary" style={{ fontSize: 12 }}>
                                ({c.verifiedCount} verified)
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedClassroom(c);
                              setStudentSearch("");
                              setStudentStatusFilter("ALL");
                            }}
                          >
                            Open Class
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                unit="classes"
                onChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        /* ─── VIEW 2: CLASSROOM STUDENTS FEE APPROVAL ─── */
        <>
          <div className="nd-filter-bar" role="search">
            <div className="nd-search-wrap">
              <Search className="nd-search-icon" style={{ width: 16, height: 16 }} />
              <input
                className="nd-input nd-search-input"
                placeholder="Search student name or register number…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                aria-label="Search students"
              />
            </div>

            <select
              className="nd-select"
              style={{ width: "auto", minWidth: 150 }}
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as "ALL" | "PENDING" | "VERIFIED")}
              aria-label="Filter by verification status"
            >
              <option value="ALL">All Students</option>
              <option value="PENDING">Pending Only</option>
              <option value="VERIFIED">Verified Only</option>
            </select>
          </div>

          {studentsError && !studentsLoading && (
            <div className="nd-card" style={{ marginBottom: 16 }}>
              <ErrorState message={studentsError} onRetry={loadStudents} />
            </div>
          )}

          {studentsLoading ? (
            <TableSkeleton rows={8} cols={3} />
          ) : students.length === 0 ? (
            <div className="nd-table-card">
              <EmptyState
                title="No students found"
                description={
                  studentSearch || studentStatusFilter !== "ALL"
                    ? "No students match your search criteria in this class."
                    : "No students are currently enrolled in this classroom."
                }
              />
            </div>
          ) : (
            <div className="nd-table-card">
              <div className="nd-table-scroll">
                <table className="nd-table">
                  <thead>
                    <tr>
                      <th>Register No</th>
                      <th>Student</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.id}>
                        <td>
                          <span className="nd-code">{st.registerNumber}</span>
                        </td>
                        <td>
                          <div className="nd-cell-primary">{st.studentName}</div>
                          <div className="nd-cell-secondary">{st.email}</div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {st.verified ? (
                            <span className="nd-cell-secondary" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Check style={{ width: 14, height: 14, color: "var(--nd-success, #16a34a)" }} />
                              Done
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApproveStudent(st)}
                              disabled={approvingId === st.id}
                            >
                              {approvingId === st.id && <ButtonSpinner />}
                              Approve Fee
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

