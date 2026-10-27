import type { Metadata } from "next";
import { ReportBuilder } from "@/components/report-builder";

export const metadata: Metadata = { title: "Staff Closing" };

export default function ClosingPage() {
  return <ReportBuilder />;
}
