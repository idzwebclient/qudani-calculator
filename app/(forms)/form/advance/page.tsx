import type { Metadata } from "next";
import AdvanceForm from "@/forms/advance-form/AdvanceForm";

export const metadata: Metadata = { title: "Advance Form" };

export default function AdvanceFormPage() {
  return <AdvanceForm />;
}
