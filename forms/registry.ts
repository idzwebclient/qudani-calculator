export const FORM_REGISTRY = [
  { id: "branch-purchase", menuLabel: "Branch Purchase", title: "Branch Purchase Form", href: "/form" },
  { id: "claim-form", menuLabel: "Claim", title: "Reimbursement Claim Form", href: "/form/claim" },
  { id: "advance-form", menuLabel: "Advance", title: "Salary / Commission Advance Form", href: "/form/advance" },
] as const;

export type FormId = (typeof FORM_REGISTRY)[number]["id"];
