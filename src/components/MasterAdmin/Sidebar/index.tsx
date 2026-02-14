"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import Button from "../../Button";
import ConfirmModal from "../../ConfirmModal";
import { useAdminAuthLoginUser } from "@/store/slices/Auth/hooks";
import { logoutSuccess } from "@/store/slices/Auth/authSlice";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavItem = {
  path: string;
  label: string;
  permissions?: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { loginUser } = useAdminAuthLoginUser();

  const permissionKeys = useMemo(
    () =>
      new Set(
        (loginUser?.permissions ?? [])
          .map((permission) => permission?.key)
          .filter((key): key is string => !!key),
      ),
    [loginUser?.permissions],
  );

  const isSuperAdmin = Number(loginUser?.role_id) === 1;
  const hasPermissionPayload = Array.isArray(loginUser?.permissions);
  const showPermissionSkeleton =
    !!loginUser && !isSuperAdmin && !hasPermissionPayload;

  const canAccess = (permissions?: string[]) => {
    if (!permissions?.length) return true;
    if (!loginUser) return false;
    if (!hasPermissionPayload) return false;
    if (isSuperAdmin) return true;
    return permissions.some((permission) => permissionKeys.has(permission));
  };

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    dispatch(logoutSuccess());
    onClose?.();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  const navSections: NavSection[] = [
    {
      title: "Core",
      items: [
        {
          path: "/master-admin/dashboard",
          label: "Referral Dashboard",
          permissions: [
      "admin.dashboard"
          ],
        },
        {
          path: "/master-admin/organizations",
          label: "Organizations",
          permissions: [
            "org.read",
            "admin.org.user.read",
            "admin.org.branch.read",
            "admin.org.department.read",
          ],
        },
        {
          path: "/master-admin/roles-permissions",
          label: "Roles & Permissions",
          permissions: ["role.read", "permission.read"],
        },
        {
          path: "/master-admin/system-access",
          label: "Master Admin Users",
          permissions: ["admin.read"],
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          path: "/master-admin/payment-settings",
          label: "Payment Adjustment Settings",
          permissions: ["payment.read", "wallet.topup"],
        },
        {
          path: "/master-admin/services",
          label: "Services",
          permissions: ["speciality.read"],
        },
        {
          path: "/master-admin/banners",
          label: "Banner Management",
          permissions: ["banner.read"],
        },
        {
          path: "/master-admin/content-page",
          label: "Content (CMS)",
          permissions: ["cms.read"],
        },
        {
          path: "/master-admin/financial",
          label: "Financials",
          permissions: ["financial_report.read"],
        },
        {
          path: "/master-admin/audit",
          label: "Audit Log",
          permissions: ["auth_logs.read"],
        },
        {
          path: "/master-admin/contact",
          label: "Contact Queries",
          permissions: ["contact.read"],
        },
      ],
    },
    {
      title: "System",
      items: [{ path: "/master-admin/settings", label: "Settings" }],
    },
  ];

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccess(item.permissions)),
    }))
    .filter(
      (section) => section.title === "System" || section.items.length > 0,
    );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <main
        className={`
          w-[280px] bg-rcn-dark-bg text-rcn-dark-text p-4 border-r border-white/10
          h-screen overflow-auto
          md:sticky md:top-0
          fixed top-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex gap-2.5 items-center px-2.5 py-3 border-b border-white/10 mb-3">
          <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
            <Image
              src="/logo.jpeg"
              alt="RCN Logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold m-0 leading-tight">
              RCN Admin
            </h1>
            {loginUser && (
              <div className="text-xs text-rcn-dark-text/70 mt-0.5">
                <span className="font-medium">
                  {loginUser.first_name} {loginUser.last_name}
                </span>
                <span className="mx-1">-</span>
                <span className="truncate">{loginUser.email}</span>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {showPermissionSkeleton ? (
          <div className="mt-3 animate-pulse">
            <div className="h-3 w-20 bg-white/10 rounded mx-2.5 my-3" />
            <div className="space-y-2 px-1.5">
              <div className="h-9 bg-white/10 rounded-xl" />
              <div className="h-9 bg-white/10 rounded-xl" />
              <div className="h-9 bg-white/10 rounded-xl" />
              <div className="h-3 w-24 bg-white/10 rounded mx-1 my-3" />
              <div className="h-9 bg-white/10 rounded-xl" />
              <div className="h-9 bg-white/10 rounded-xl" />
            </div>
          </div>
        ) : (
          visibleSections.map((section) => (
            <div key={section.title} className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-rcn-dark-text/65 px-2.5 py-2.5">
                {section.title}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      onClose?.();
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-inherit mx-1.5 transition-all cursor-pointer ${
                      isActive(item.path) ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {section.title === "System" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="w-full justify-start px-3 py-2.5 rounded-xl text-rcn-dark-text hover:bg-white/10"
                  >
                    Logout
                  </Button>
                )}
              </nav>
            </div>
          ))
        )}
      </main>

      <ConfirmModal
        type="logout"
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;
