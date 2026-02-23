"use client";

import { getBannersApi } from "@/apis/ApiCalls";
import CustomNextLink from "@/components/CustomNextLink";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

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

const PLACEMENT_SIDEBAR = "right_sidebar";

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

function AdBannerSkeleton() {
  return (
    <aside className="hidden 2xl:block fixed right-4 top-28 w-[300px] z-60" aria-label="Sponsored banner loading">
      <div className="bg-[rgba(255,255,255,0.86)] border border-rcn-border-light rounded-rcn-lg shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden animate-pulse" role="presentation">
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-3 border-b border-rcn-border-light bg-slate-100">
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
        <div className="p-3.5">
          <div className="h-40 rounded-[18px] bg-slate-200" />
          <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
          <div className="mt-3 h-9 w-24 rounded-full bg-slate-200" />
        </div>
        <div className="px-3.5 py-3 border-t border-dashed border-slate-200 bg-slate-50">
          <div className="h-3 w-full rounded bg-slate-100" />
        </div>
      </div>
    </aside>
  );
}

export default function AdBanner({ placement }: { placement?: "right_sidebar" | "top_banner" }) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const { data: apiBanners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await getBannersApi();
      return parseBannersResponse(res.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const ads = Array.isArray(apiBanners) && apiBanners.length > 0 ? apiBanners : [];

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (isLoading) return <AdBannerSkeleton />;
  if (ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <aside className="hidden 2xl:block fixed right-4 top-28 w-[300px] z-60" aria-label="Sponsored banner">
      <div className="bg-[rgba(255,255,255,0.86)] border border-rcn-border-light rounded-rcn-lg shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden" role="complementary">
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-3 border-b border-rcn-border-light bg-linear-to-br from-[rgba(15,107,58,0.10)] to-[rgba(31,138,76,0.08)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-rcn-muted font-black">
            Sponsored
          </div>
        </div>

        <div className="p-3.5">
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
        </div>

        <div className="px-3.5 py-3 border-t border-dashed border-[rgba(15,107,58,0.22)] bg-[rgba(15,107,58,0.05)] text-rcn-muted text-xs leading-snug">
          {currentAd.notes ?? ""}
        </div>
      </div>
    </aside>
  );
}
