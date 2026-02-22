"use client";

import { getBannersApi } from "@/apis/ApiCalls";
import CustomNextLink from "@/components/CustomNextLink";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/** API banner item from GET /api/banners */
export interface BannerApi {
  _id: string;
  name: string;
  link_url: string;
  placement: string;
  scope?: string;
  organization_id?: string | null;
  status?: number;
  start_date?: string;
  end_date?: string;
  image_url: string;
  alt_text?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Display shape for API banner (right_sidebar, active, in date). */
export interface ApiBannerDisplay {
  type: "api";
  imageUrl: string;
  linkUrl: string;
  name: string;
  altText: string;
  notes?: string;
}

/** Fallback ad when API is unavailable or returns no right_sidebar banners. */
export interface FallbackAd {
  type: "fallback";
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

export type BannerItem = ApiBannerDisplay | FallbackAd;

function isApiBanner(item: BannerItem): item is ApiBannerDisplay {
  return item.type === "api";
}

const PLACEMENT_SIDEBAR = "right_sidebar";

/** Fallback ads when API is unavailable or returns empty. */
const FALLBACK_ADS: FallbackAd[] = [
  {
    type: "fallback",
    label: "Sponsored",
    media: "Partner Spotlight",
    title: "List your organization in the RCN directory",
    text: "Help senders find you faster by highlighting your services, intake requirements, and availability.",
    primaryText: "Register Company",
    primaryHref: "/company-register",
    secondaryText: "Advertise Here",
    secondaryHref: "/contact",
    footer: "Want this space for your brand? Use \"Advertise Here\" to request placement. (Demo banner)",
  },
  {
    type: "fallback",
    label: "Sponsored",
    media: "Faster Intake",
    title: "Reduce referral delays with structured updates",
    text: "Keep senders informed with clear accept/decline decisions, status updates, and document tracking.",
    primaryText: "See Features",
    primaryHref: "#features",
    secondaryText: "How it works",
    secondaryHref: "#how-it-works",
    footer: "Tip: Replace these demo ads with partner offers or internal announcements.",
  },
  {
    type: "fallback",
    label: "Sponsored",
    media: "Security & Audit",
    title: "Built for privacy-first coordination",
    text: "Role-based access and an audit-friendly workflow to support accountability and compliance reviews.",
    primaryText: "Security",
    primaryHref: "#security",
    secondaryText: "Support",
    secondaryHref: "/support",
    footer: "Demo banner • Not a medical or legal notice.",
  },
];

function isWithinDateRange(start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const now = Date.now();
  if (start && new Date(start).getTime() > now) return false;
  if (end && new Date(end).getTime() < now) return false;
  return true;
}

function parseBannersResponse(body: unknown): ApiBannerDisplay[] {
  const raw = body as { success?: boolean; data?: unknown[] };
  const list = Array.isArray(raw?.data) ? raw.data : [];
  return list
    .filter((item): item is BannerApi => item != null && typeof item === "object" && "placement" in item)
    .filter(
      (b) =>
        b.placement === PLACEMENT_SIDEBAR &&
        (b.status === 1 || b.status === undefined) &&
        isWithinDateRange(b.start_date, b.end_date)
    )
    .map((b) => ({
      type: "api" as const,
      imageUrl: typeof b.image_url === "string" ? b.image_url : "",
      linkUrl: typeof b.link_url === "string" ? b.link_url : "",
      name: typeof b.name === "string" ? b.name : "",
      altText: typeof b.alt_text === "string" ? b.alt_text : b.name ?? "",
      notes: typeof b.notes === "string" ? b.notes : undefined,
    }))
    .filter((b) => b.imageUrl);
}

export default function AdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rcn_hide_adRail") !== "1";
    }
    return true;
  });

  const { data: apiBanners } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await getBannersApi();
      return parseBannersResponse(res.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const ads = useMemo((): BannerItem[] => {
    if (Array.isArray(apiBanners) && apiBanners.length > 0) return apiBanners;
    return FALLBACK_ADS;
  }, [apiBanners]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible && ads.length > 0) {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isVisible, ads.length]);

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rcn_hide_adRail', '1');
    }
  };

  if (!isVisible) return null;

  const currentAd = ads[currentAdIndex];
  const isApi = isApiBanner(currentAd);

  return (
    <aside className="hidden 2xl:block fixed right-4 top-28 w-[300px] z-60" aria-label="Sponsored banner">
      <div className="bg-[rgba(255,255,255,0.86)] border border-rcn-border-light rounded-rcn-lg shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden" role="complementary">
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-3 border-b border-rcn-border-light bg-linear-to-br from-[rgba(15,107,58,0.10)] to-[rgba(31,138,76,0.08)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-rcn-muted font-black">
            {isApi ? "Sponsored" : currentAd.label}
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
          {isApi ? (
            <>
              <div className="h-40 rounded-[18px] border border-[rgba(15,107,58,0.14)] bg-slate-100 relative overflow-hidden">
                {currentAd.linkUrl ? (
                  <CustomNextLink href={currentAd.linkUrl} className="block w-full h-full" target="_blank" rel="noopener noreferrer">
                    <Image
                      src={currentAd.imageUrl}
                      alt={currentAd.altText || currentAd.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                      unoptimized
                    />
                  </CustomNextLink>
                ) : (
                  <Image
                    src={currentAd.imageUrl}
                    alt={currentAd.altText || currentAd.name}
                    fill
                    className="object-cover"
                    sizes="300px"
                    unoptimized
                  />
                )}
              </div>
              <div className="mt-3 mb-1.5 text-base font-black tracking-tight">
                {currentAd.name}
              </div>
              {currentAd.altText && (
                <p className="m-0 text-rcn-muted text-[13px] leading-snug">
                  {currentAd.altText}
                </p>
              )}
              {currentAd.linkUrl && (
                <div className="mt-3">
                  <CustomNextLink
                    href={currentAd.linkUrl}
                    variant="primary"
                    size="sm"
                    className="rounded-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </CustomNextLink>
                </div>
              )}
            </>
          ) : (
            <>
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
                <CustomNextLink href={currentAd.primaryHref} variant="primary" size="sm" className="rounded-full">
                  {currentAd.primaryText}
                </CustomNextLink>
                <CustomNextLink href={currentAd.secondaryHref} variant="secondary" size="sm" className="rounded-full">
                  {currentAd.secondaryText}
                </CustomNextLink>
              </div>
            </>
          )}
        </div>

        <div className="px-3.5 py-3 border-t border-dashed border-[rgba(15,107,58,0.22)] bg-[rgba(15,107,58,0.05)] text-rcn-muted text-xs leading-snug">
          {isApi ? currentAd.notes ?? "" : currentAd.footer}
        </div>
      </div>
    </aside>
  );
}
