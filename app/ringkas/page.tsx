import type { Metadata } from "next";
import { SimpleReport } from "@/components/simple-report";

export const metadata: Metadata = { title: "Closing Ringkas" };

export default function SimpleClosingPage() {
  return <SimpleReport />;
}
