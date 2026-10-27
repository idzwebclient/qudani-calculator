import type { Metadata } from "next";
import { SimpleReport } from "@/components/simple-report";

export const metadata: Metadata = { title: "Report" };

export default function SimpleClosingPage() {
  return <SimpleReport />;
}
