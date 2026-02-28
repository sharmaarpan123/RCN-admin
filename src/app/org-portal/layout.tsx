"use client";

import { authLogoutApi } from "@/apis/ApiCalls";
import { logout } from "@/apis/Axios";
import { ConfirmModal } from "@/components";
import { logoutSuccess } from "@/store/slices/Auth/authSlice";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const NAV = [
  { href: "/org-portal/users", label: "User Manage" },
  { href: "/org-portal/branches", label: "Branch" },
  { href: "/org-portal/departments", label: "Department" },
  { href: "/org-portal/organization-settings", label: "Organization Settings" },
  { href: "/org-portal/referral-dashboard", label: "Referral Dashboard" },
  { href: "/org-portal/wallet", label: "Wallet & Credits" },
] as const;

function OrgPortalSidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleLogoutConfirm = async () => {
    try {
      await authLogoutApi();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      setShowLogoutModal(false);
      setSidebarOpen(false);
      logout();
      dispatch(logoutSuccess());
      router.push("/login");
      return;
    }
  };

  return (
    <>
      <aside
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-[280px] shrink-0 h-screen overflow-auto flex flex-col
        bg-rcn-dark-bg text-rcn-dark-text p-4 border-r border-white/10
        transition-transform duration-200 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:top-0
      `}
        aria-label="Organization portal navigation"
      >
        <div className="relative flex flex-col gap-2.5 px-2.5 py-3 border-b border-white/10 mb-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg text-rcn-dark-text/80 hover:bg-white/10"
          >
            ✕
          </button>
          <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
            <Image src="/logo.jpeg" alt="RCN Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-semibold m-0 leading-tight">Referral Coordination Network</h1>
            <p className="text-xs text-rcn-dark-text/80 m-0">Organization Portal</p>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,.10)] rounded-xl p-2.5 border border-white/10">

          <nav className="space-y-1 flex-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all ${pathname === href ? "bg-white/15" : "hover:bg-white/10"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>


        <div className="border-t border-white/10 pt-3 mt-2">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-left mx-1.5 transition-all text-rcn-dark-text hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>


      </aside>
      <ConfirmModal
        type="logout"
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

function OrgPortalLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-rcn-dark-bg text-rcn-dark-text border-b border-white/10 flex items-center gap-3 px-4 z-30">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-rcn-dark-text hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-semibold text-sm">Organization Portal</span>
      </header>
      <OrgPortalSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto p-4 pt-14 lg:p-6 lg:pt-6">{children}</main>
    </div>
  );
}

export default function OrgPortalLayout({ children }: { children: React.ReactNode }) {
  return <OrgPortalLayoutInner>{children}</OrgPortalLayoutInner>;
}

