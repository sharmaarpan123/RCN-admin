"use client";

import React from "react";
import NextLink from "next/link";
import Image from "next/image";

const SERVICES_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/about-us#process" },
  { label: "Security", href: "/about-us#security" },
  { label: "Pricing", href: "/#pricing" },
];

const QUICK_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "Our Doctor", href: "/#doctors" },
  { label: "Appointments", href: "/#appointments" },
  { label: "Contact us", href: "/contact-us" },
  { label: "FAQs", href: "/#faqs" },
];

const LEGAL_LINKS = [
  { label: "Terms & Condition", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const CONTACT_EMAIL = "support@rcn.com";

export function ContentPageFooter() {
  return (
    <footer className="bg-white  border-rcn-border">
      {/* Upper section - white */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Company */}
          <div className="lg:col-span-1">
            <NextLink href="/" className="inline-flex flex-col mb-3">
              <Image src="/logo.jpeg" alt="RCN" width={48} height={48} className="rounded-lg" />
              <span className="text-lg font-bold text-rcn-brand mt-1">RCN</span>
            </NextLink>
            <p className="text-sm font-medium text-rcn-text mb-0.5">Referral Communication Network</p>
            <p className="text-xs text-rcn-text-faded mb-3">Unified. Secure. Simple. Reliable.</p>
            <p className="text-sm text-rcn-text-faded leading-relaxed">
              One secure workflow to send, receive, route, and track referrals—so patients get the right care, in the right place, at the right time.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-rcn-text text-sm uppercase tracking-wide mb-4">Services</h3>
            <ul className="space-y-2.5">
              {SERVICES_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <NextLink href={href} className="text-sm text-rcn-text hover:text-rcn-brand transition-colors">
                    {label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-rcn-text text-sm uppercase tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <NextLink href={href} className="text-sm text-rcn-text hover:text-rcn-brand transition-colors">
                    {label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-rcn-text text-sm uppercase tracking-wide mb-4">Contact</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-rcn-text hover:text-rcn-brand transition-colors"
            >
              <svg className="w-5 h-5 text-rcn-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* Lower bar - green */}
      <div
        className="border-t border-rcn-brand/20"
        style={{ backgroundColor: "var(--color-rcn-brand)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1">
              {LEGAL_LINKS.map(({ label, href }) => (
                <NextLink
                  key={label}
                  href={href}
                  className="text-sm text-white hover:text-white/90 transition-colors"
                >
                  {label}
                </NextLink>
              ))}
            </div>
            <p className="text-sm text-white shrink-0">
              © {new Date().getFullYear()} RCN, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
