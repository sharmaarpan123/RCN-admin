"use client";

import type { AxiosResponse } from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, ConfirmModal, TableLayout, type TableColumn, Modal } from "@/components";
import Image from "next/image";
import {
  getAdminBannersApi,
  createAdminBannerApi,
  updateAdminBannerApi,
  deleteAdminBannerApi,
  getAdminOrganizationsApi,
  uploadProfilePictureApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError, toastWarning } from "@/utils/toast";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";

const PLACEMENTS = ["right_sidebar", "header_strip", "login_right"] as const;
const PLACEMENT_OPTIONS = [
  { value: "right_sidebar", label: "Right Sidebar" },
  { value: "header_strip", label: "Header Strip" },
  { value: "login_right", label: "Login Right" },
];

const SCOPES = ["organization_specific", "global"] as const;
const SCOPE_OPTIONS = [
  { value: "organization_specific", label: "Organization-specific" },
  { value: "global", label: "Global" },
];

/** Banner as returned from API (use as-is). */
type ApiBanner = {
  _id?: string;
  id?: string;
  name: string;
  link_url?: string;
  placement: string;
  scope: string;
  organization_id?: string | null;
  status: number;
  start_date?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

const todayEnd = () => new Date(new Date().setHours(23, 59, 59, 999));

const bannerFormSchema = yup.object({
  name: yup.string().trim().required("Banner name is required."),
  link_url: yup.string().trim().optional().default(""),
  placement: yup.string().oneOf([...PLACEMENTS]).required().default("right_sidebar"),
  scope: yup.string().oneOf([...SCOPES]).required().default("global"),
  organization_id: yup.string().trim().optional().default(""),
  status: yup.number().oneOf([0, 1]).required().default(1),
  start_date: yup
    .string()
    .trim()
    .optional()
    .default("")
    .test(
      "start-after-today",
      "Start date must be after today.",
      (value) => !value || new Date(value) > todayEnd()
    ),
  end_date: yup
    .string()
    .trim()
    .optional()
    .default("")
    .test(
      "end-after-start",
      "End date must be after start date.",
      function (value) {
        if (!value) return true;
        const start = this.parent.start_date as string | undefined;
        if (!start) return true;
        return new Date(value) > new Date(start);
      }
    ),
  image_url: yup.string().trim().optional().default(""),
  alt_text: yup.string().trim().optional().default(""),
  notes: yup.string().trim().optional().default(""),
});

type BannerFormValues = yup.InferType<typeof bannerFormSchema>;

const defaultFormValues: BannerFormValues = {
  name: "",
  link_url: "",
  placement: "right_sidebar",
  scope: "global",
  organization_id: "",
  status: 1,
  start_date: "",
  end_date: "",
  image_url: "",
  alt_text: "",
  notes: "",
};

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: yupResolver(bannerFormSchema),
    defaultValues: defaultFormValues,
  });

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

  const placementLabel = (p: string) => {
    const o = PLACEMENT_OPTIONS.find((x) => x.value === p);
    return o ? o.label : p.replace(/_/g, " ");
  };

  const getBannerId = (b: ApiBanner) => b._id ?? b.id ?? "";

  const isInDateRange = (b: ApiBanner) => {
    const now = new Date();
    if (b.start_date) {
      const start = new Date(b.start_date);
      if (now < start) return false;
    }
    if (b.end_date) {
      const end = new Date(b.end_date);
      if (now > end) return false;
    }
    return true;
  };

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

  const bannerToFormValues = (b: ApiBanner): BannerFormValues => ({
    name: b.name ?? "",
    link_url: b.link_url ?? "",
    placement: (b.placement ?? "right_sidebar") as BannerFormValues["placement"],
    scope: (b.scope ?? "global") as BannerFormValues["scope"],
    organization_id: b.organization_id ?? "",
    status: b.status ?? 1,
    start_date: b.start_date ? String(b.start_date).slice(0, 16) : "",
    end_date: b.end_date ? String(b.end_date).slice(0, 16) : "",
    image_url: b.image_url ?? "",
    alt_text: b.alt_text ?? "",
    notes: b.notes ?? "",
  });

  useEffect(() => {
    if (!isBannerModalOpen) return;
    if (editingBanner) {
      reset(bannerToFormValues(editingBanner));
    } else {
      reset(defaultFormValues);
    }
  }, [isBannerModalOpen, editingBanner, reset]);

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBannerId(null);
  };

  const openBannerModal = (bannerId?: string) => {
    setEditingBannerId(bannerId ?? null);
    setIsBannerModalOpen(true);
  };

  const createMutation = useMutation<AxiosResponse | void, Error, BannerFormValues>({
    mutationFn: catchAsync(async (data) => {
      return createAdminBannerApi({
        name: data.name.trim(),
        link_url: data.link_url?.trim() ?? "",
        placement: data.placement,
        scope: data.scope,
        organization_id:
          data.scope === "organization_specific" && data.organization_id
            ? data.organization_id
            : null,
        status: data.status,
        start_date: data.start_date?.trim() || undefined,
        end_date: data.end_date?.trim() || undefined,
        image_url: data.image_url?.trim() || undefined,
        alt_text: data.alt_text?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      });
    }),
    onSuccess: (res) => {
      if (res && checkResponse({ res, showSuccess: true })) {
        invalidateBanners();
        closeBannerModal();
      }
    },
  });

  const updateMutation = useMutation<AxiosResponse | void, Error, BannerFormValues>({
    mutationFn: catchAsync(async (data) => {
      if (!editingBannerId) throw new Error("No banner selected.");
      return updateAdminBannerApi(editingBannerId, {
        name: data.name.trim(),
        link_url: data.link_url?.trim() ?? "",
        placement: data.placement,
        scope: data.scope,
        organization_id:
          data.scope === "organization_specific" && data.organization_id
            ? data.organization_id
            : null,
        status: data.status,
        start_date: data.start_date?.trim() || undefined,
        end_date: data.end_date?.trim() || undefined,
        image_url: data.image_url?.trim() || undefined,
        alt_text: data.alt_text?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      });
    }),
    onSuccess: (res) => {
      if (res && checkResponse({ res, showSuccess: true })) {
        invalidateBanners();
        closeBannerModal();
      }
    },
  });

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

  const onBannerFormSubmit = (data: BannerFormValues) => {
    if (editingBannerId) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const handleDeleteClick = (b: ApiBanner) => setDeleteTarget(b);
  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(getBannerId(deleteTarget));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadProfilePictureApi(file);
      const url =
        (res?.data as { data?: { url?: string }; url?: string })?.data?.url ??
        (res?.data as { url?: string })?.url ??
        "";
      if (url) setValue("image_url", url);
      else toastError("Upload succeeded but no image URL returned.");
    } catch {
      // catchAsync/toast handled by upload
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Placement</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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

      <Modal isOpen={isBannerModalOpen} onClose={closeBannerModal} maxWidth="720px">
        <form onSubmit={handleSubmit(onBannerFormSubmit)}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold m-0">
              {editingBanner ? "Edit Banner" : "New Banner"}
            </h3>
            <Button type="button" variant="secondary" size="sm" onClick={closeBannerModal}>
              Close
            </Button>
          </div>
          <div className="h-px bg-rcn-border mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Banner Name *</label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Summer Promo"
                className={inputClass}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Link URL</label>
              <input
                type="url"
                {...register("link_url")}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Placement</label>
              <select {...register("placement")} className={inputClass}>
                {PLACEMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Scope</label>
              <select {...register("scope")} className={inputClass}>
                {SCOPE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Organization (if scoped)
              </label>
              <select {...register("organization_id")} className={inputClass}>
                <option value="">— None (Global) —</option>
                {orgsList.map((o) => (
                  <option key={o.organization_id ?? o._id} value={o.organization_id ?? o._id}>
                    {o.organization?.name} ({o.organization?.state} {o.organization?.zip_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Status</label>
              <select {...register("status", { valueAsNumber: true })} className={inputClass}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Start Date (optional)
              </label>
              <input
                type="datetime-local"
                {...register("start_date")}
                className={inputClass}
              />
              {errors.start_date && (
                <p className="text-xs text-red-600 mt-1">{errors.start_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                {...register("end_date")}
                className={inputClass}
              />
              {errors.end_date && (
                <p className="text-xs text-red-600 mt-1">{errors.end_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Image (upload or URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className={inputClass}
                />
              </div>
              <input
                type="url"
                {...register("image_url")}
                placeholder="https://... or upload above"
                className={inputClass + " mt-1.5"}
              />
              {uploadingImage && (
                <p className="text-xs text-rcn-muted mt-1">Uploading…</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Alt Text (optional)
              </label>
              <input
                type="text"
                {...register("alt_text")}
                placeholder="Accessibility description"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              {...register("notes")}
              className={inputClass}
              placeholder="Internal notes..."
            />
          </div>

          <div className="h-px bg-rcn-border my-4" />
          <div className="flex justify-between items-center">
            <p className="text-xs text-rcn-muted m-0">Changes apply after Save.</p>
            <div className="flex gap-2">
              {editingBanner && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeleteTarget(editingBanner);
                    closeBannerModal();
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

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
