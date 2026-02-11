"use client";

import type { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal } from "@/components";
import {
  createAdminBannerApi,
  updateAdminBannerApi,
  uploadProfilePictureApi,
} from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError } from "@/utils/toast";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";
import {
  type ApiBanner,
  type BannerFormValues,
  bannerFormSchema,
  bannerToFormValues,
  defaultFormValues,
  INPUT_CLASS,
  PLACEMENT_OPTIONS,
  SCOPE_OPTIONS,
} from "./types";

export interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner: ApiBanner | null;
  orgsList: AdminOrganizationListItem[];
  onSuccess: () => void;
  onDeleteClick?: (banner: ApiBanner) => void;
}

export function BannerModal({
  isOpen,
  onClose,
  editingBanner,
  orgsList,
  onSuccess,
  onDeleteClick,
}: BannerModalProps) {
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

  useEffect(() => {
    if (!isOpen) return;
    if (editingBanner) {
      reset(bannerToFormValues(editingBanner));
    } else {
      reset(defaultFormValues);
    }
  }, [isOpen, editingBanner, reset]);

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
        onSuccess();
      }
    },
  });

  const updateMutation = useMutation<AxiosResponse | void, Error, BannerFormValues>({
    mutationFn: catchAsync(async (data) => {
      if (!editingBanner) throw new Error("No banner selected.");
      const id = editingBanner._id ?? editingBanner.id ?? "";
      return updateAdminBannerApi(id, {
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
        onSuccess();
      }
    },
  });

  const onBannerFormSubmit = (data: BannerFormValues) => {
    if (editingBanner) updateMutation.mutate(data);
    else createMutation.mutate(data);
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="720px">
      <form onSubmit={handleSubmit(onBannerFormSubmit)}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">
            {editingBanner ? "Edit Banner" : "New Banner"}
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
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
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Placement</label>
            <select {...register("placement")} className={INPUT_CLASS}>
              {PLACEMENT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Scope</label>
            <select {...register("scope")} className={INPUT_CLASS}>
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
            <select {...register("organization_id")} className={INPUT_CLASS}>
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
            <select {...register("status", { valueAsNumber: true })} className={INPUT_CLASS}>
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
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
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
                className={INPUT_CLASS}
              />
            </div>
            <input
              type="url"
              {...register("image_url")}
              placeholder="https://... or upload above"
              className={INPUT_CLASS + " mt-1.5"}
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
              className={INPUT_CLASS}
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
            className={INPUT_CLASS}
            placeholder="Internal notes..."
          />
        </div>

        <div className="h-px bg-rcn-border my-4" />
        <div className="flex justify-between items-center">
          <p className="text-xs text-rcn-muted m-0">Changes apply after Save.</p>
          <div className="flex gap-2">
            {editingBanner && onDeleteClick && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  onDeleteClick(editingBanner);
                  onClose();
                }}
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
