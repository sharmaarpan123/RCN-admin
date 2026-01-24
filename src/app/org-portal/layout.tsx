"use client";

import { OrgPortalProvider, useOrgPortal } from "@/context/OrgPortalContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components";

const NAV = [
  { href: "/org-portal/users", label: "User Manage" },
  { href: "/org-portal/branches", label: "Branch" },
  { href: "/org-portal/departments", label: "Department" },
  { href: "/org-portal/organization-settings", label: "Organization Settings" },
  { href: "/org-portal/referral-dashboard", label: "Referral Dashboard" },
] as const;

function OrgPortalSidebar() {
  const pathname = usePathname();
  const { org, saveOrgName } = useOrgPortal();
  const [orgNameInput, setOrgNameInput] = useState(org.name);

  useEffect(() => {
    setOrgNameInput(org.name);
  }, [org.name]);

  return (
    <aside className="w-[280px] bg-rcn-dark-bg text-rcn-dark-text p-4 border-r border-white/10 h-screen overflow-auto shrink-0 sticky top-0">
      <div className="flex flex-col gap-2.5 px-2.5 py-3 border-b border-white/10 mb-3">
        <div className="w-10 h-10 rounded-xl logo-gradient shadow-[0_8px_18px_rgba(0,0,0,0.25)]" aria-hidden="true" />
        <div>
          <h1 className="text-sm font-semibold m-0 leading-tight">Referral Coordination Network</h1>
          <p className="text-xs text-rcn-dark-text/80 m-0">Organization Portal</p>
        </div>
      </div>

     

      <nav className="space-y-1">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all ${
              pathname === href ? "bg-white/15" : "hover:bg-white/10"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function OrgPortalToast() {
  const { setToast } = useOrgPortal();
  const [state, setState] = useState<{ show: boolean; title: string; body: string }>({
    show: false,
    title: "",
    body: "",
  });

  useEffect(() => {
    setToast((title, body) => {
      setState({ show: true, title, body });
      setTimeout(() => setState((s) => ({ ...s, show: false })), 2200);
    });
  }, [setToast]);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 min-w-[280px] max-w-[440px] bg-rcn-dark-bg text-white rounded-2xl px-4 py-3 shadow-rcn border border-white/10 transition-all duration-200 ${
        state.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="font-bold text-sm m-0">{state.title}</p>
      <p className="text-xs m-0 mt-1 opacity-90">{state.body}</p>
    </div>
  );
}

function OrgPortalLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <OrgPortalSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
      <OrgPortalToast />
    </div>
  );
}

export default function OrgPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgPortalProvider>
      <OrgPortalLayoutInner>{children}</OrgPortalLayoutInner>
    </OrgPortalProvider>
  );
}
