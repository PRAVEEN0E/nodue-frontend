import { apiClient } from "./api";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CashierDashboardStats {
  totalClassrooms: number;
  totalDepartments: number;
  totalStudents: number;
  verifiedFees: number;
  pendingFees: number;
}

export interface CashierClassroom {
  id: string;
  name: string;
  batch: string;
  semester: number;
  section: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  totalStudents: number;
  verifiedCount: number;
  pendingCount: number;
}

export interface CashierStudentFeeRow {
  id: string;
  registerNumber: string;
  rollNumber: string | null;
  admissionYear: number;
  firstName: string;
  lastName: string;
  studentName: string;
  email: string;
  advisorApproved: boolean;
  hodApproved: boolean;
  cashierApproved: boolean;
  verified: boolean;
  verifiedAt: string | null;
}

export interface GetCashierClassroomsParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}

export interface GetCashierStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | "PENDING" | "VERIFIED";
}

export async function getCashierDashboard(): Promise<CashierDashboardStats> {
  const res = await apiClient<{ success: boolean; data: CashierDashboardStats }>("/cashier/dashboard");
  return res.data;
}

export async function getCashierClassrooms(
  params?: GetCashierClassroomsParams
): Promise<{ data: CashierClassroom[]; meta: PaginationMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.departmentId) qs.set("departmentId", params.departmentId);
  const q = qs.toString();
  const res = await apiClient<{ success: boolean; data: CashierClassroom[]; meta: PaginationMeta }>(
    `/cashier/classrooms${q ? `?${q}` : ""}`
  );
  return { data: res.data, meta: res.meta };
}

export async function getCashierClassroomById(id: string): Promise<CashierClassroom> {
  const res = await apiClient<{ success: boolean; data: CashierClassroom }>(`/cashier/classrooms/${id}`);
  return res.data;
}

export async function getCashierClassroomStudents(
  classroomId: string,
  params?: GetCashierStudentsParams
): Promise<{
  classroom: CashierClassroom;
  data: CashierStudentFeeRow[];
  meta: PaginationMeta;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  const res = await apiClient<{
    success: boolean;
    classroom: CashierClassroom;
    data: CashierStudentFeeRow[];
    meta: PaginationMeta;
  }>(`/cashier/classrooms/${classroomId}/students${q ? `?${q}` : ""}`);
  return {
    classroom: res.classroom,
    data: res.data,
    meta: res.meta,
  };
}

export async function approveCashierStudentFee(
  studentId: string
): Promise<{ studentId: string; verified: boolean; alreadyVerified: boolean }> {
  const res = await apiClient<{
    success: boolean;
    data: { studentId: string; verified: boolean; alreadyVerified: boolean };
  }>(`/cashier/students/${studentId}/fees/approve`, {
    method: "POST",
  });
  return res.data;
}

export async function approveCashierClassroomAll(
  classroomId: string
): Promise<{ classroomId: string; approvedCount: number }> {
  const res = await apiClient<{
    success: boolean;
    data: { classroomId: string; approvedCount: number };
  }>(`/cashier/classrooms/${classroomId}/fees/approve-all`, {
    method: "POST",
  });
  return res.data;
}

