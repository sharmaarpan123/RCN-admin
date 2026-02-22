"use client";

import { authLogoutApi } from "@/apis/ApiCalls";
import CustomNextLink from "@/components/CustomNextLink";
import { RootState } from "@/store";
import { logoutSuccess } from "@/store/slices/Auth/authSlice";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import router from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { loginUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const element = document.querySelector(href);
      if (!element) return;

      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      await authLogoutApi();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      dispatch(logoutSuccess());
      router.push("/login");
    }
  };

  return (
    <>
      <ConfirmModal
        type="logout"
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        confirmDisabled={isLoggingOut}
      />

      {/* <div className="bg-linear-to-r from-[rgba(15,107,58,0.12)] to-[rgba(31,138,76,0.10)] border-b border-rcn-border-light">
        <div className="container mx-auto px-[18px] flex items-center justify-between py-2.5 gap-3 text-[13px] text-rcn-muted">
          <div>Streamline referrals across clinics, hospitals, imaging centers, and specialty practices—without delays.</div>
          <div>
            <CustomNextLink href="#get-started" variant="text" size="sm">
              Get started
            </CustomNextLink>
          </div>
        </div>
      </div> */}


      <header className="sticky top-0 z-50 bg-[rgba(244,251,246,0.76)] backdrop-blur-[10px] ">
        <div className="container mx-auto px-[18px]">
          <div className="flex items-center justify-between py-3 gap-3.5">
            <NextLink href="/" className="flex items-center gap-3 no-underline">
              <div className="w-[70px] h-[70px] rounded-[14px] relative shrink-0 overflow-hidden shadow-[0_10px_22px_rgba(15,107,58,0.18)]">
                <Image
                  src="/logo.jpeg"
                  alt="RCN Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <strong className="block text-sm tracking-wide">
                  Referral Coordination Network
                </strong>
                <span className="block text-xs text-rcn-muted">
                  Connect. Refer. Coordinate.
                </span>
              </div>
            </NextLink>

            <div className="hidden md:flex gap-4 items-center">
              <CustomNextLink
                href="/"
                variant="text"
                className={`font-[550] ${pathname === "/" ? "text-rcn-accent-dark" : "text-rcn-muted"}`}
                size="md"
              >
                Home
              </CustomNextLink>
              <CustomNextLink
                href="/about-us"
                variant="text"
                className={` font-[550] ${pathname === "/about-us" ? "text-rcn-accent-dark" : "text-rcn-muted"}`}
                size="md"
              >
                About Us
              </CustomNextLink>
              <CustomNextLink
                href="/contact-us"
                variant="text"
                className={` font-[550] ${pathname === "/contact-us" ? "text-rcn-accent-dark" : "text-rcn-muted"}`}
                size="md"
              >
                Contact Us
              </CustomNextLink>
            </div>

            <div className="flex gap-2.5 items-center">
              {/* <div className="hidden md:inline-flex gap-2.5 items-center"> */}

              {loginUser ? (
                <>
                  <CustomNextLink
                    href={loginUser.role_id === 1 ? "/staff-portal" : loginUser.role_id === 2 ? "/org-portal" : "/master-admin/dashboard"}
                    variant="primary"
                    className="hidden md:inline-flex"
                  >
                    Dashboard
                  </CustomNextLink>
                  <Button
                    onClick={handleLogoutClick}
                    variant="secondary"
                    className="hidden md:inline-flex"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <CustomNextLink
                    href="/login"
                    variant="secondary"
                    className="hidden md:inline-flex"
                  >
                    User Login
                  </CustomNextLink>

                  <CustomNextLink
                    href="/org-signup"
                    variant="primary"
                    className="hidden md:inline-flex"
                  >
                    Register Company
                  </CustomNextLink>
                </>
              )}
              <button
                className="md:hidden w-11 h-11 rounded-xl border border-rcn-border-light bg-[rgba(255,255,255,0.88)] cursor-pointer flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
              >
                <span className="w-[18px] h-0.5 bg-rcn-muted block relative">
                  <span className="absolute left-0 w-[18px] h-0.5 bg-rcn-muted -top-1.5" />
                  <span className="absolute left-0 w-[18px] h-0.5 bg-rcn-muted top-1.5" />
                </span>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div
              className="md:hidden border-t border-rcn-border-light py-2.5 px-0"
              aria-label="Mobile menu"
            >
              <CustomNextLink
                href="/contact-us"
                variant="text"
                className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text"
              >
                About us
              </CustomNextLink>
              <CustomNextLink
                href="/about-us"
                variant="text"
                className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text"
              >
                About Us
              </CustomNextLink>
              <CustomNextLink
                href="/contact-us"
                variant="text"
                className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text"
              >
                Contact us
              </CustomNextLink>
              <div className="flex gap-2.5 flex-wrap px-2.5 pt-1.5">
                <CustomNextLink href="/login" variant="ghost">
                  User Login
                </CustomNextLink>

                <CustomNextLink href="/org-signup" variant="primary">
                  Register Company
                </CustomNextLink>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
