"use client";

import type { AxiosResponse } from "axios";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, ConfirmModal, TableLayout, type TableColumn } from "@/components";
import Image from "next/image";
import {
  getAdminBannersApi,
  deleteAdminBannerApi,
  getAdminOrganizationsApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastWarning } from "@/utils/toast";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";
import {
  BannerModal,
  type ApiBanner,
  getBannerId,
  isInDateRange,
  placementLabel,
  INPUT_CLASS,
  PLACEMENT_OPTIONS,
  SCOPE_OPTIONS,
} from "@/components/MasterAdmin/Banner";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

type BannersApiResponse = { success?: boolean; data?: ApiBanner[] };
type OrganizationsApiResponse = { success?: boolean; data?: AdminOrganizationListItem[] };

const Banners: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const [previewPlacement, setPreviewPlacement] = useState<string>("right_sidebar");

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiBanner | null>(null);

  const { data: bannersResponse, isLoading } = useQuery({
    queryKey: defaultQueryKeys.bannersList,
    queryFn: async () => {
      const res = await getAdminBannersApi();
      if (!checkResponse({ res })) return { data: [] } as BannersApiResponse;
      return res.data as BannersApiResponse;
    },
  });

  const { data: orgsResponse } = useQuery({
    queryKey: defaultQueryKeys.organizationsList,
    queryFn: async () => {
      const res = await getAdminOrganizationsApi();
      if (!checkResponse({ res })) return { data: [] } as OrganizationsApiResponse;
      return res.data as OrganizationsApiResponse;
    },
  });

  const banners = useMemo(() => bannersResponse?.data ?? [], [bannersResponse?.data]);

  const orgsList = useMemo(() => {
    const list = orgsResponse?.data ?? [];
    const seen = new Set<string>();
    return list.filter((row) => {
      const id = row.organization_id ?? row._id ?? "";
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [orgsResponse?.data]);

  const invalidateBanners = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.bannersList });

  const filtered = useMemo(() => {
    return banners.filter((b: ApiBanner) => {
      const searchLower = safeLower(search);
      const hay = safeLower((b.name ?? "") + " " + (b.link_url ?? ""));
      if (search && !hay.includes(searchLower)) return false;
      if (placementFilter && b.placement !== placementFilter) return false;
      if (statusFilter === "active" && b.status !== 1) return false;
      if (statusFilter === "inactive" && b.status === 1) return false;
      if (scopeFilter && b.scope !== scopeFilter) return false;
      if (orgFilter) {
        if (b.scope !== "organization_specific") return false;
        if (b.organization_id !== orgFilter) return false;
      }
      return true;
    });
  }, [banners, search, placementFilter, statusFilter, scopeFilter, orgFilter]);

  const previewBanners = useMemo(() => {
    return banners.filter((b: ApiBanner) => {
      if (b.status !== 1) return false;
      if (!isInDateRange(b)) return false;
      if (b.placement !== previewPlacement) return false;
      if (b.scope === "global") return true;
      if (b.scope === "organization_specific" && orgFilter && b.organization_id === orgFilter)
        return true;
      return false;
    });
  }, [banners, previewPlacement, orgFilter]);

  const editingBanner = useMemo(
    () =>
      editingBannerId
        ? banners.find((b: ApiBanner) => getBannerId(b) === editingBannerId) ?? null
        : null,
    [banners, editingBannerId]
  );

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBannerId(null);
  };

  const openBannerModal = (bannerId?: string) => {
    setEditingBannerId(bannerId ?? null);
    setIsBannerModalOpen(true);
  };

  const deleteMutation = useMutation<AxiosResponse | void, Error, string>({
    mutationFn: catchAsync(async (bannerId) => {
      return deleteAdminBannerApi(bannerId, { organization_id: orgFilter || undefined });
    }),
    onSuccess: (res, bannerId) => {
      if (res && checkResponse({ res, showSuccess: true })) {
        invalidateBanners();
        setDeleteTarget(null);
        if (editingBannerId === bannerId) closeBannerModal();
      }
    },
  });

  const handleDeleteClick = (b: ApiBanner) => setDeleteTarget(b);
  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(getBannerId(deleteTarget));
  };

  const bannerColumns: TableColumn<ApiBanner>[] = [
    {
      head: "Name / Link",
      component: (b) => (
        <>
          <div><strong>{b.name}</strong></div>
          <div className="text-rcn-muted text-xs break-all">{b.link_url || "—"}</div>
        </>
      ),
    },
    { head: "Placement", component: (b) => placementLabel(b.placement) },
    {
      head: "Scope",
      component: (b) => {
        const org = b.organization_id
          ? orgsList.find((o) => (o.organization_id ?? o._id) === b.organization_id)
          : null;
        return (
          <>
            {b.scope === "global" ? "Global" : "Organization"}
            {b.scope === "organization_specific" && org && (
              <div className="text-rcn-muted text-xs">
                {org.organization?.name} ({org.organization?.state} {org.organization?.zip_code})
              </div>
            )}
          </>
        );
      },
    },
    {
      head: "Status",
      component: (b) => {
        const inRange = isInDateRange(b);
        return (
          <>
            {b.status === 1 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]">
                Inactive
              </span>
            )}
            {!inRange && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00] ml-1"
                title="Outside date range"
              >
                Out of range
              </span>
            )}
          </>
        );
      },
    },
    {
      head: "Date Range",
      component: (b) => (
        <>
          {b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"} →{" "}
          {b.end_date ? new Date(b.end_date).toLocaleDateString() : "—"}
        </>
      ),
    },
    {
      head: "Actions",
      thClassName: "text-right",
      tdClassName: "text-right",
      component: (b) => (
        <div className="flex gap-1 justify-end flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              b.link_url ? window.open(b.link_url, "_blank") : toastWarning("No link URL set")
            }
          >
            Preview
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openBannerModal(getBannerId(b))}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(b)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <p className="text-sm text-rcn-muted">Loading banners…</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold m-0 mb-1">Banner Management</h3>
            <p className="text-xs text-rcn-muted m-0">
              Create and manage advertising banners. Banners can be Global (all organizations) or
              scoped to a specific organization.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => openBannerModal()}>
            + New Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Search (Name / Link)</label>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Placement</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">All Placements</option>
              {PLACEMENT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Scope</label>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">All Scopes</option>
              {SCOPE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Organization (if scoped)</label>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">— Select Organization —</option>
              {orgsList.map((o) => (
                <option key={o.organization_id ?? o._id} value={o.organization_id ?? o._id}>
                  {o.organization?.name ?? o._id} ({o.organization?.state} {o.organization?.zip_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5" />

        <h4 className="text-xs font-semibold text-rcn-muted uppercase tracking-wider m-0 mb-2">
          Banner list
        </h4>
        <div className="overflow-auto">
          <TableLayout<ApiBanner>
            columns={bannerColumns}
            data={filtered}
            variant="bordered"
            size="sm"
            emptyMessage="No banners found."
            getRowKey={(b) => getBannerId(b)}
            tableClassName="[&_td:last-child]:text-right"
          />
        </div>
      </div>

      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={closeBannerModal}
        editingBanner={editingBanner}
        orgsList={orgsList}
        onSuccess={() => {
          invalidateBanners();
          closeBannerModal();
        }}
        onDeleteClick={(b) => {
          setDeleteTarget(b);
          closeBannerModal();
        }}
      />

      <ConfirmModal
        type="delete"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete banner"
        message="Delete this banner? This cannot be undone."
        confirmLabel="Delete"
        confirmDisabled={deleteMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mt-3.5">
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Live Preview</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Preview uses the selected Organization filter (if any) and the placement below.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PLACEMENT_OPTIONS.map((p) => (
              <Button
                key={p.value}
                variant="tab"
                size="sm"
                active={previewPlacement === p.value}
                onClick={() => setPreviewPlacement(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="h-px bg-rcn-border my-3" />
          <div className="min-h-[160px]">
            {previewBanners.length === 0 ? (
              <p className="text-xs text-rcn-muted m-0">
                No active banners match the current preview filters.
              </p>
            ) : (
              <div className="space-y-3">
                {previewBanners.slice(0, 3).map((b) => {
                  const org = b.organization_id
                    ? orgsList.find((o) => (o.organization_id ?? o._id) === b.organization_id)
                    : null;
                  return (
                    <div key={getBannerId(b)} className="bg-white border border-rcn-border rounded-xl p-3">
                      <div className="text-xs text-rcn-muted mb-2">
                        {b.name} •{" "}
                        {b.scope === "global" ? "Global" : org?.organization?.name ?? "Organization"}
                      </div>
                      {b.image_url ? (
                        <a
                          href={b.link_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Image
                            width={320}
                            height={180}
                            src={b.image_url}
                            alt={b.alt_text || b.name}
                            className="w-full rounded-xl"
                            style={{
                              maxWidth: previewPlacement === "right_sidebar" ? "320px" : "100%",
                            }}
                          />
                        </a>
                      ) : (
                        <div className="bg-rcn-bg border border-rcn-border rounded-xl p-4 text-center text-xs text-rcn-muted">
                          No image
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Notes</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Banners are stored in the database and can be Global or organization-specific.
          </p>
          <div className="h-px bg-rcn-border my-3" />
          <ul className="text-xs text-rcn-text space-y-2 m-0 pl-4">
            <li>
              <strong>Global</strong> banners apply to all organizations.
            </li>
            <li>
              <strong>Organization-specific</strong> banners apply only to that organization.
            </li>
            <li>
              Start/End dates are optional; active banners outside the date range will{" "}
              <strong>not</strong> render.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Banners;
