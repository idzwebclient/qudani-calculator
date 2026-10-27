"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, ClipboardList, FileText, ListChecks } from "lucide-react";

const tabs = [
  { href: "/", label: "Kalkulator", icon: Calculator },
  { href: "/closing", label: "Closing", icon: FileText },
  { href: "/report", label: "Report", icon: ListChecks },
  { href: "/form", label: "Form", icon: ClipboardList },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="topbar app-header no-print">
      <Link href="/" className="brand" aria-label="Qudani, kalkulator">
        <span className="brand-mark">Q</span>
        <div><strong>Qudani</strong><small>Jewels</small></div>
      </Link>
      <nav className="tabs" aria-label="Navigasi utama">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`tab ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
