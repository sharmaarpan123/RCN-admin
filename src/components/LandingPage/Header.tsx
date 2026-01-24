"use client";

import CustomNextLink from '@/components/CustomNextLink';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Handle smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      
      const element = document.querySelector(href);
      if (!element) return;
      
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <>
      <div className="bg-linear-to-r from-[rgba(15,107,58,0.12)] to-[rgba(31,138,76,0.10)] border-b border-rcn-border-light">
        <div className="max-w-[1120px] mx-auto px-[18px] flex items-center justify-between py-2.5 gap-3 text-[13px] text-rcn-muted">
          <div>Streamline referrals across clinics, hospitals, imaging centers, and specialty practices—without delays.</div>
          <div>
            <CustomNextLink href="#get-started" variant="text" size="sm">
              Get started
            </CustomNextLink>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[rgba(244,251,246,0.76)] backdrop-blur-[10px] border-b border-[rgba(220,239,227,0.85)]">
        <div className="max-w-[1120px] mx-auto px-[18px]">
          <div className="flex items-center justify-between py-3 gap-3.5">
            <NextLink href="#top" className="flex items-center gap-3 no-underline">
              <div className="w-[42px] h-[42px] rounded-[14px] bg-linear-to-br from-rcn-brand to-rcn-brand-light shadow-[0_10px_22px_rgba(15,107,58,0.18)] relative shrink-0">
                <div className="absolute inset-[10px] rounded-xl border-2 border-[rgba(255,255,255,0.75)] opacity-90" />
              </div>
              <div>
                <strong className="block text-sm tracking-wide">Referral Coordination Network</strong>
                <span className="block text-xs text-rcn-muted">Send & Receive Referrals • Track • Secure Documents</span>
              </div>
            </NextLink>

            <nav className="hidden md:flex items-center gap-4.5" aria-label="Site">
              <a href="#features" className="no-underline text-rcn-muted text-sm font-[650] px-2 py-2.5 rounded-[10px] hover:text-rcn-text hover:bg-[rgba(255,255,255,0.75)]">
                Features
              </a>
              <a href="#how-it-works" className="no-underline text-rcn-muted text-sm font-[650] px-2 py-2.5 rounded-[10px] hover:text-rcn-text hover:bg-[rgba(255,255,255,0.75)]">
                How it works
              </a>
              <a href="#security" className="no-underline text-rcn-muted text-sm font-[650] px-2 py-2.5 rounded-[10px] hover:text-rcn-text hover:bg-[rgba(255,255,255,0.75)]">
                Security
              </a>
              <a href="#faq" className="no-underline text-rcn-muted text-sm font-[650] px-2 py-2.5 rounded-[10px] hover:text-rcn-text hover:bg-[rgba(255,255,255,0.75)]">
                FAQ
              </a>
              <a href="#contact" className="no-underline text-rcn-muted text-sm font-[650] px-2 py-2.5 rounded-[10px] hover:text-rcn-text hover:bg-[rgba(255,255,255,0.75)]">
                Contact
              </a>
            </nav>

            <div className="flex gap-2.5 items-center">
            {/* <div className="hidden md:inline-flex gap-2.5 items-center"> */}

              <CustomNextLink href="/login" variant="secondary" className="hidden md:inline-flex">
                User Login
              </CustomNextLink>
              
              <CustomNextLink href="/org-signup" variant="primary" className="hidden md:inline-flex">
                Register Company
              </CustomNextLink>
            {/* </div> */}

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
            <div className="md:hidden border-t border-rcn-border-light py-2.5 px-0" aria-label="Mobile menu">
              <a href="#features" className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text">
                Features
              </a>
              <a href="#how-it-works" className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text">
                How it works
              </a>
              <a href="#security" className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text">
                Security
              </a>
              <a href="#faq" className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text">
                FAQ
              </a>
              <a href="#contact" className="block px-2.5 py-3 rounded-xl no-underline text-rcn-muted font-[750] hover:bg-[rgba(255,255,255,0.85)] hover:text-rcn-text">
                Contact
              </a>
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
