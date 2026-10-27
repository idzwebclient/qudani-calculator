import type { Metadata } from "next";
import BranchPurchaseForm from "@/forms/branch-purchase/BranchPurchaseForm";

export const metadata: Metadata = { title: "Branch Purchase Form" };

export default function BranchPurchasePage() {
  return <BranchPurchaseForm />;
}
