import type { Metadata } from "next";
import ClaimForm from "@/forms/claim-form/ClaimForm";

export const metadata: Metadata = { title: "Claim Form" };

export default function ClaimFormPage() {
  return <ClaimForm />;
}
