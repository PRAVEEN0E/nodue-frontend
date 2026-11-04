// ─── VCET PDF Export Utility ────────────────────────────────────────────────
// Generates branded, properly-formatted PDF reports using jsPDF + jspdf-autotable.
// All generation happens client-side — no backend changes required.

import jsPDF from "jspdf";
import autoTable, { RowInput, CellDef } from "jspdf-autotable";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PdfReportOptions {
  /** PDF file name (without .pdf extension) */
  filename: string;
  /** Report title, e.g. "Classroom Defaulters List" */
  title: string;
  /** Subtitle line, e.g. "CS-A · Batch 2022 · Semester 6" */
  subtitle: string;
  /** Column headers */
  headers: string[];
  /** Data rows — each cell is a string */
  rows: string[][];
  /** Report type flavour for colour accents */
  type: "defaulters" | "clearance";
}

// ─── Colour palette ──────────────────────────────────────────────────────────

const PALETTE = {
  navy: [15, 23, 42] as [number, number, number],         // #0f172a
  navyLight: [30, 41, 59] as [number, number, number],    // #1e293b
  blue: [29, 78, 216] as [number, number, number],        // #1d4ed8
  blueLight: [239, 246, 255] as [number, number, number], // #eff6ff
  red: [220, 38, 38] as [number, number, number],         // #dc2626
  redLight: [254, 242, 242] as [number, number, number],  // #fef2f2
  green: [22, 163, 74] as [number, number, number],       // #16a34a
  greenLight: [240, 253, 244] as [number, number, number],// #f0fdf4
  amber: [217, 119, 6] as [number, number, number],       // #d97706
  amberLight: [254, 243, 199] as [number, number, number],// #fef3c7
  slate: [100, 116, 139] as [number, number, number],     // #64748b
  slateDark: [51, 65, 85] as [number, number, number],    // #334155
  border: [226, 232, 240] as [number, number, number],    // #e2e8f0
  rowAlt: [248, 250, 252] as [number, number, number],    // #f8fafc
  white: [255, 255, 255] as [number, number, number],
  gold: [202, 138, 4] as [number, number, number],
};

function statusColor(val: string): [number, number, number] | null {
  const v = val.trim().toUpperCase();
  if (v === "CLEARED" || v === "APPROVED" || v === "YES") return PALETTE.green;
  if (v === "INCOMPLETE" || v === "REJECTED" || v === "NO") return PALETTE.red;
  if (v === "PENDING") return PALETTE.amber;
  return null;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

export function parseCsvText(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 1) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let inQuote = false;
    let cell = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === "," && !inQuote) {
        result.push(cell);
        cell = "";
      } else {
        cell += ch;
      }
    }
    result.push(cell);
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).filter((l) => l.trim()).map(parseRow);
  return { headers, rows };
}

// ─── Main PDF generator ───────────────────────────────────────────────────────

export function generatePdfReport(options: PdfReportOptions): void {
  const { filename, title, subtitle, headers, rows, type } = options;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // 1. Institution Header Bar
  doc.setFillColor(...PALETTE.navy);
  doc.rect(0, 0, pageW, 34, "F");

  // Subtle golden accent stripe below top banner
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 34, pageW, 1.5, "F");

  // College Emblem / Crest Placeholder Badge
  doc.setFillColor(...(type === "defaulters" ? PALETTE.red : PALETTE.blue));
  doc.roundedRect(margin, 6, 22, 22, 3, 3, "F");
  doc.setTextColor(...PALETTE.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VCET", margin + 11, 19, { align: "center" });

  // College Name & University Affiliation
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PALETTE.white);
  doc.text("VELALAR COLLEGE OF ENGINEERING & TECHNOLOGY", margin + 27, 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(191, 219, 254); // blue-200
  doc.text("AUTONOMOUS INSTITUTION · AFFILIATED TO ANNA UNIVERSITY · ACCREDITED BY NAAC & NBA", margin + 27, 17);

  // Document Title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(248, 250, 252);
  doc.text(`${title.toUpperCase()} — NO DUE CLEARANCE PORTAL`, margin + 27, 23);

  // Subtitle / Classroom metadata
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(subtitle, margin + 27, 29);

  // Date and Time (Right aligned in top banner)
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeFormatted = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`DATE: ${dateFormatted}`, pageW - margin, 13, { align: "right" });
  doc.text(`TIME: ${timeFormatted}`, pageW - margin, 18, { align: "right" });

  // Report Category Pill on top right
  const isDefaulters = type === "defaulters";
  const pillColor: [number, number, number] = isDefaulters ? [185, 28, 28] : [30, 64, 175];
  doc.setFillColor(...pillColor);
  doc.roundedRect(pageW - margin - 42, 22, 42, 7, 1.5, 1.5, "F");
  doc.setTextColor(...PALETTE.white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(isDefaulters ? "DEFAULTER AUDIT" : "OFFICIAL CLEARANCE", pageW - margin - 21, 26.6, { align: "center" });

  // 2. Summary KPI Ribbon
  const total = rows.length;
  const cleared = rows.filter((r) => r.some((c) => c.toUpperCase() === "CLEARED" || c.toUpperCase() === "APPROVED")).length;
  const pending = total - cleared;

  doc.setFillColor(...PALETTE.rowAlt);
  doc.setDrawColor(...PALETTE.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, 38, contentW, 11, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(...PALETTE.slateDark);
  doc.setFont("helvetica", "normal");
  doc.text("EXECUTIVE SUMMARY:", margin + 4, 45);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PALETTE.navy);
  doc.text(`Total Students: ${total}`, margin + 42, 45);

  doc.setTextColor(...PALETTE.green);
  doc.text(`Cleared: ${cleared}`, margin + 85, 45);

  doc.setTextColor(...(pending > 0 ? PALETTE.red : PALETTE.slate));
  doc.text(`Pending / Defaulters: ${pending}`, margin + 120, 45);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PALETTE.slate);
  doc.setFontSize(8);
  doc.text("Authority: Faculty Advisor & Head of Department", pageW - margin - 4, 45, { align: "right" });

  // 3. Data Table
  const tableBody: RowInput[] = rows.map((row) =>
    row.map((cell): CellDef => {
      const color = statusColor(cell);
      if (color) {
        return {
          content: cell,
          styles: {
            textColor: color,
            fontStyle: "bold",
          },
        };
      }
      return { content: cell };
    })
  );

  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: 52,
    margin: { left: margin, right: margin, bottom: 22 },
    tableWidth: contentW,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3.2, bottom: 3.2, left: 3.5, right: 3.5 },
      lineColor: PALETTE.border,
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: PALETTE.navy,
      textColor: PALETTE.white,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: PALETTE.rowAlt,
    },
    bodyStyles: {
      textColor: PALETTE.navy,
      halign: "left",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: "auto" },
    },
    didDrawPage: (data) => {
      const pageNum = (doc.internal as unknown as { getCurrentPageInfo: () => { pageNumber: number } }).getCurrentPageInfo().pageNumber;
      const totalPages = doc.getNumberOfPages();

      // Sign-off verification block on the last page
      if (pageNum === totalPages) {
        const signY = pageH - 26;
        doc.setDrawColor(...PALETTE.slate);
        doc.setLineWidth(0.3);

        // Advisor sign line
        doc.line(margin + 10, signY, margin + 70, signY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...PALETTE.navy);
        doc.text("CLASS ADVISOR SIGNATURE", margin + 15, signY + 4);

        // HOD sign line
        doc.line(margin + 105, signY, margin + 165, signY);
        doc.text("HEAD OF THE DEPARTMENT", margin + 110, signY + 4);

        // Principal / Cashier sign line
        doc.line(pageW - margin - 70, signY, pageW - margin - 10, signY);
        doc.text("PRINCIPAL / CASHIER SEAL", pageW - margin - 65, signY + 4);
      }

      // Footer
      doc.setFillColor(...PALETTE.navyLight);
      doc.rect(0, pageH - 8, pageW, 8, "F");

      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240);
      doc.setFont("helvetica", "normal");
      doc.text("VELALAR COLLEGE OF ENGINEERING & TECHNOLOGY — NO DUE CLEARANCE PORTAL (VCET)", margin, pageH - 3);
      doc.text("CONFIDENTIAL ACADEMIC RECORD · GENERATED AUTOMATICALLY", pageW / 2, pageH - 3, { align: "center" });
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, pageH - 3, { align: "right" });

      void data;
    },
  });

  // 4. Save
  const dateStr = now.toISOString().split("T")[0];
  doc.save(`${filename}-${dateStr}.pdf`);
}
