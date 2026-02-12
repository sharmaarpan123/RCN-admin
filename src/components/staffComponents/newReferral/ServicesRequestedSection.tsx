"use client";

import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getStaffSpecialitiesApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { SectionHeader } from "./SectionHeader";
import type { ReferralFormValues } from "./referralFormSchema";

const moveBtnBase =
  "min-w-[44px] min-h-[44px] w-12 h-12 md:w-10 md:h-10 !p-0 flex items-center justify-center text-lg md:text-base touch-manipulation active:scale-95";
const moveBtnActive =
  "!bg-rcn-bg !border-rcn-border hover:!border-rcn-brand/50 hover:!bg-[#e5f2ea] hover:!ring-2 hover:!ring-rcn-brand/15";

type SpecialityItem = { _id: string; name: string; user_id: string | null };

export function ServicesRequestedSection() {
  const { watch, setValue } = useFormContext<ReferralFormValues>();
  const speciality_ids = watch("speciality_ids") ?? [];
  const additional_speciality = watch("additional_speciality") ?? "";
  const additional_notes = watch("additional_notes") ?? "";

  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>([]);
  const [selectedRequestedIds, setSelectedRequestedIds] = useState<string[]>([]);

  const { data: specialitiesResponse } = useQuery({
    queryKey: defaultQueryKeys.specialitiesList,
    queryFn: async () => {
      const res = await getStaffSpecialitiesApi({ page: 1, limit: 100 });
      if (!checkResponse({ res })) return null;
      return res.data;
    },
  });

  const specialitiesList = useMemo(() => {
    const raw = specialitiesResponse as { data?: SpecialityItem[] } | undefined;
    return Array.isArray(raw?.data) ? raw.data : [];
  }, [specialitiesResponse]);

  const availableItems = useMemo(
    () => specialitiesList.filter((item) => !speciality_ids.includes(item._id)),
    [specialitiesList, speciality_ids]
  );

  const requestedItems = useMemo(
    () => specialitiesList.filter((item) => speciality_ids.includes(item._id)),
    [specialitiesList, speciality_ids]
  );

  const toggleAvailable = (id: string) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleRequested = (id: string) => {
    setSelectedRequestedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const moveService = (direction: "right" | "left" | "allRight" | "allLeft") => {
    if (direction === "right" || direction === "allRight") {
      const toAddIds =
        direction === "allRight"
          ? availableItems.map((s) => s._id)
          : selectedAvailableIds;
      if (toAddIds.length === 0) return;
      setValue("speciality_ids", [...new Set([...speciality_ids, ...toAddIds])], {
        shouldValidate: true,
      });
      setSelectedAvailableIds([]);
    } else {
      const toRemoveIds =
        direction === "allLeft"
          ? requestedItems.map((s) => s._id)
          : selectedRequestedIds;
      if (toRemoveIds.length === 0) return;
      setValue(
        "speciality_ids",
        speciality_ids.filter((id) => !toRemoveIds.includes(id as string)),
        { shouldValidate: true }
      );
      setSelectedRequestedIds([]);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

  return (
    <section
      id="services-requested"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Services Requested"
        subtitle='Move services into "Requested Services"'
        badge="Multi-select"
      />

      <p className="text-xs text-rcn-muted mb-3">
        Use the buttons to move services between Available and Requested.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-stretch mb-3">
        <div className="min-w-0 flex flex-col">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Available services (multi-select)
          </label>
          <div
            className="w-full min-h-[240px] max-h-[280px] min-w-0 px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-y-auto overflow-x-hidden"
            role="listbox"
            aria-multiselectable
            aria-label="Available services"
          >
            {availableItems.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">No available services.</p>
            ) : (
              availableItems.map((item) => {
                const isSelected = selectedAvailableIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleAvailable(item._id)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                      }`}
                  >
                    <p className="m-0 text-sm font-normal break-words">{item.name}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-row flex-wrap justify-center items-center gap-2 py-2 md:py-0 md:flex-col md:justify-center md:gap-2 order-2 md:order-none">
          <span className="w-full md:hidden text-[11px] text-rcn-muted font-semibold text-center mb-0.5">
            Move
          </span>
          <div className="w-full md:w-auto flex flex-row justify-center items-center gap-2 md:flex-col">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveService("right")}
              disabled={selectedAvailableIds.length === 0}
              className={`${moveBtnBase} ${selectedAvailableIds.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move selected to requested"
              title="Add selected"
            >
              →
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveService("allRight")}
              disabled={availableItems.length === 0}
              className={`${moveBtnBase} ${availableItems.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move all to requested"
              title="Add all"
            >
              ≫
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveService("left")}
              disabled={selectedRequestedIds.length === 0}
              className={`${moveBtnBase} ${selectedRequestedIds.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move selected to available"
              title="Remove selected"
            >
              ←
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveService("allLeft")}
              disabled={requestedItems.length === 0}
              className={`${moveBtnBase} ${requestedItems.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move all to available"
              title="Remove all"
            >
              ≪
            </Button>
          </div>
        </div>

        <div className="min-w-0 flex flex-col">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Requested services
          </label>
          <div
            className="w-full min-h-[240px] max-h-[280px] min-w-0 px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-y-auto overflow-x-hidden"
            role="listbox"
            aria-multiselectable
            aria-label="Requested services"
          >
            {requestedItems.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">
                None selected. Use the move buttons.
              </p>
            ) : (
              requestedItems.map((item) => {
                const isSelected = selectedRequestedIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleRequested(item._id)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                      }`}
                  >
                    <p className="m-0 text-sm font-normal break-words">{item.name}</p>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-rcn-muted mt-2">
            This list will be submitted as Services Requested.
          </p>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
          Other services: Please type
        </label>
        <textarea
          value={additional_speciality}
          onChange={(e) => setValue("additional_speciality", e.target.value, { shouldValidate: true })}
          placeholder="Type any additional services needed..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
          Additional notes
        </label>
        <textarea
          value={additional_notes}
          onChange={(e) => setValue("additional_notes", e.target.value, { shouldValidate: true })}
          placeholder="Any additional referral notes..."
          className={inputClass}
        />
      </div>
    </section>
  );
}
