"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Ad {
  label: string;
  media: string;
  title: string;
  text: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
  footer: string;
}

const ads: Ad[] = [
  {
    label: "Sponsored",
    media: "Partner Spotlight",
    title: "List your organization in the RCN directory",
    text: "Help senders find you faster by highlighting your services, intake requirements, and availability.",
    primaryText: "Register Company",
    primaryHref: "/company-register",
    secondaryText: "Advertise Here",
    secondaryHref: "/contact",
    footer: "Want this space for your brand? Use \"Advertise Here\" to request placement. (Demo banner)"
  },
  {
    label: "Sponsored",
    media: "Faster Intake",
    title: "Reduce referral delays with structured updates",
    text: "Keep senders informed with clear accept/decline decisions, status updates, and document tracking.",
    primaryText: "See Features",
    primaryHref: "#features",
    secondaryText: "How it works",
    secondaryHref: "#how-it-works",
    footer: "Tip: Replace these demo ads with partner offers or internal announcements."
  },
  {
    label: "Sponsored",
    media: "Security & Audit",
    title: "Built for privacy-first coordination",
    text: "Role-based access and an audit-friendly workflow to support accountability and compliance reviews.",
    primaryText: "Security",
    primaryHref: "#security",
    secondaryText: "Support",
    secondaryHref: "/support",
    footer: "Demo banner • Not a medical or legal notice."
  }
];

export default function AdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rcn_hide_adRail') !== '1';
    }
    return true;
  });

  useEffect(() => {

    // Rotate ads every 10 seconds
    const interval = setInterval(() => {
      if (isVisible) {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rcn_hide_adRail', '1');
    }
  };

  if (!isVisible) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <aside className="hidden 2xl:block fixed right-4 top-24 w-[300px] z-40" aria-label="Sponsored banner">
      <div className="bg-[rgba(255,255,255,0.86)] border border-rcn-border-light rounded-rcn-lg shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden" role="complementary">
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-3 border-b border-rcn-border-light bg-linear-to-br from-[rgba(15,107,58,0.10)] to-[rgba(31,138,76,0.08)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-rcn-muted font-black">
            {currentAd.label}
          </div>
          <button
            className="w-[34px] h-[34px] rounded-xl border border-rcn-border-light bg-[rgba(255,255,255,0.88)] cursor-pointer grid place-items-center text-rcn-muted shadow-[0_10px_18px_rgba(2,44,22,0.06)] hover:-translate-y-px hover:text-rcn-text"
            onClick={handleClose}
            aria-label="Close sponsored banner"
          >
            ✕
          </button>
        </div>

        <div className="p-3.5">
          <div className="h-40 rounded-[18px] border border-[rgba(15,107,58,0.14)] bg-linear-to-br from-[rgba(244,251,246,0.9)] to-[rgba(255,255,255,0.92)] flex items-end p-3 text-rcn-brand font-black tracking-wide relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-[rgba(31,138,76,0.22)] via-transparent to-transparent opacity-50" />
            {currentAd.media}
          </div>

          <div className="mt-3 mb-1.5 text-base font-black tracking-tight">
            {currentAd.title}
          </div>
          <p className="m-0 text-rcn-muted text-[13px] leading-snug">
            {currentAd.text}
          </p>

          <div className="flex gap-2.5 flex-wrap mt-3">
            <Link
              href={currentAd.primaryHref}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[rgba(255,255,255,0.25)] bg-linear-to-br from-rcn-brand to-rcn-brand-light no-underline font-[850] text-[13px] text-white shadow-[0_10px_18px_rgba(2,44,22,0.06)] cursor-pointer select-none hover:-translate-y-px"
            >
              {currentAd.primaryText}
            </Link>
            <Link
              href={currentAd.secondaryHref}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-rcn-border-light bg-[rgba(255,255,255,0.88)] no-underline font-[850] text-[13px] text-rcn-text shadow-[0_10px_18px_rgba(2,44,22,0.06)] cursor-pointer select-none hover:-translate-y-px"
            >
              {currentAd.secondaryText}
            </Link>
          </div>
        </div>

        <div className="px-3.5 py-3 border-t border-dashed border-[rgba(15,107,58,0.22)] bg-[rgba(15,107,58,0.05)] text-rcn-muted text-xs leading-snug">
          {currentAd.footer}
        </div>
      </div>
    </aside>
  );
}
