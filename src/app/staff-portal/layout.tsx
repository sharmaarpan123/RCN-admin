"use client";

import { getAuthProfileApi, getBannersApi } from "@/apis/ApiCalls";
import { ConfirmModal, CustomNextLink } from "@/components";
import { parseBannersResponse, type ApiBannerDisplay } from "@/components/LandingPage/AdBanner";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { updateLoginUser } from "@/store/slices/Auth/authSlice";
import defaultStaffQueryKeys from "@/utils/staffQueryKeys";
import { checkResponse } from "@/utils/commonFunc";
import { StaffProfileData } from "@/app/staff-portal/types/profile";
import { useDispatch } from "react-redux";

const NAV = [
  { href: "/staff-portal/profile", label: "Profile" },
  { href: "/staff-portal/branches", label: "Branches" },
  { href: "/staff-portal/departments", label: "Departments" },
  { href: "/staff-portal/inbox", label: "Inbox" },
  { href: "/staff-portal/chat", label: "Chat" },
  { href: "/staff-portal/new-referral", label: "New Referral" },
  { href: "/staff-portal/wallet", label: "Wallet" },
] as const;

/** Fetches same banners API as AdBanner, renders one card at bottom of sidebar (not fixed). */
function StaffPortalSidebarBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const { data: ads = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await getBannersApi();
      return parseBannersResponse(res.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useQuery({
    queryKey: defaultStaffQueryKeys.profile,
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      const raw = res.data as { data?: StaffProfileData; success?: boolean };
      const profile = raw?.data ?? null;
      dispatch(updateLoginUser(profile as StaffProfileData));
      return profile && typeof profile === "object" ? profile : null;
    },
  });

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % ads.length), 10000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const current: ApiBannerDisplay = ads[currentIndex];

  return (
    <div className="mt-3 pt-3 border-t border-white/10" aria-label="Sponsored banner">
      <div className="rounded-xl border border-white/15 bg-[rgba(255,255,255,0.08)] overflow-hidden">
        <div className="px-2.5 py-2 border-b border-white/10">
          <span className="text-[10px] tracking-widest uppercase text-rcn-dark-text/70 font-black">Sponsored</span>
        </div>
        <div className="p-2.5">
          <div className="h-[220px] rounded-lg border border-white/10 bg-white/5 relative overflow-hidden">
            {current.linkUrl ? (
              <CustomNextLink href={current.linkUrl} className="block w-full h-full" target="_blank" rel="noopener noreferrer">
                <Image
                  src={current.imageUrl}
                  alt={current.altText || current.name}
                  fill
                  className="object-contain"
                  sizes="260px"
                  unoptimized
                />
              </CustomNextLink>
            ) : (
              <Image
                src={current.imageUrl}
                alt={current.altText || current.name}
                fill
                className="object-contain"
                sizes="260px"
                unoptimized
              />
            )}
          </div>

          <div className="text-center text-xs mt-2 line-clamp-2">{current.altText} </div>



        </div>

      </div>
    </div>
  );
}

function StaffPortalSidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setSidebarOpen(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    document.cookie =
      "authorization=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
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
        aria-label="Staff portal navigation"
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
            <p className="text-xs text-rcn-dark-text/80 m-0">Staff Portal</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-[rgba(255,255,255,.10)] rounded-xl p-2.5 border border-white/10 flex-1">
            <nav className="space-y-1">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all ${pathname === href || pathname?.startsWith(href + "/") ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/10 pt-3 mt-2 shrink-0 pb-4">
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
            <StaffPortalSidebarBanner />
          </div>
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

function StaffPortalLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-rcn-bg text-rcn-text">
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
        <span className="font-semibold text-sm">Staff Portal</span>
      </header>
      <StaffPortalSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1  p-4 pt-14 lg:p-6 lg:pt-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  return <StaffPortalLayoutInner>{children}</StaffPortalLayoutInner>;
}

