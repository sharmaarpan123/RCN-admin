"use client";

import React from "react";
import Button from "@/components/Button";
import { SectionHeader } from "./SectionHeader";

const moveBtnBase =
  "min-w-[44px] min-h-[44px] w-12 h-12 md:w-10 md:h-10 !p-0 flex items-center justify-center text-lg md:text-base touch-manipulation active:scale-95";
const moveBtnActive =
  "!bg-rcn-bg !border-rcn-border hover:!border-rcn-brand/50 hover:!bg-[#e5f2ea] hover:!ring-2 hover:!ring-rcn-brand/15";

interface ServicesRequestedSectionProps {
  availableServices: string[];
  setAvailableServices: React.Dispatch<React.SetStateAction<string[]>>;
  requestedServices: string[];
  setRequestedServices: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAvailableServices: string[];
  setSelectedAvailableServices: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRequestedServices: string[];
  setSelectedRequestedServices: React.Dispatch<React.SetStateAction<string[]>>;
  otherServices: string;
  setOtherServices: (v: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (v: string) => void;
}

export function ServicesRequestedSection({
  availableServices,
  setAvailableServices,
  requestedServices,
  setRequestedServices,
  selectedAvailableServices,
  setSelectedAvailableServices,
  selectedRequestedServices,
  setSelectedRequestedServices,
  otherServices,
  setOtherServices,
  additionalNotes,
  setAdditionalNotes,
}: ServicesRequestedSectionProps) {
  const toggleAvailableService = (service: string) => {
    setSelectedAvailableServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const toggleRequestedService = (service: string) => {
    setSelectedRequestedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const moveService = (direction: "right" | "left" | "allRight" | "allLeft") => {
    if (direction === "right" || direction === "allRight") {
      const toAdd = direction === "allRight" ? availableServices : selectedAvailableServices;
      if (toAdd.length === 0) return;
      setAvailableServices((prev) => prev.filter((s) => !toAdd.includes(s)));
      setRequestedServices((prev) => [...new Set([...prev, ...toAdd])]);
      setSelectedAvailableServices([]);
    } else {
      const toRemove = direction === "allLeft" ? requestedServices : selectedRequestedServices;
      if (toRemove.length === 0) return;
      setRequestedServices((prev) => prev.filter((s) => !toRemove.includes(s)));
      setAvailableServices((prev) => [...new Set([...prev, ...toRemove])]);
      setSelectedRequestedServices([]);
    }
  };

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
            {availableServices.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">No available services.</p>
            ) : (
              availableServices.map((service) => {
                const isSelected = selectedAvailableServices.includes(service);
                return (
                  <div
                    key={service}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleAvailableService(service)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                    }`}
                  >
                    <p className="m-0 text-sm font-normal break-words">{service}</p>
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
              disabled={selectedAvailableServices.length === 0}
              className={`${moveBtnBase} ${selectedAvailableServices.length !== 0 ? moveBtnActive : ""}`}
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
              disabled={availableServices.length === 0}
              className={`${moveBtnBase} ${availableServices.length !== 0 ? moveBtnActive : ""}`}
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
              disabled={selectedRequestedServices.length === 0}
              className={`${moveBtnBase} ${selectedRequestedServices.length !== 0 ? moveBtnActive : ""}`}
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
              disabled={requestedServices.length === 0}
              className={`${moveBtnBase} ${requestedServices.length !== 0 ? moveBtnActive : ""}`}
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
            {requestedServices.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">
                None selected. Use the move buttons.
              </p>
            ) : (
              requestedServices.map((service) => {
                const isSelected = selectedRequestedServices.includes(service);
                return (
                  <div
                    key={service}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleRequestedService(service)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                    }`}
                  >
                    <p className="m-0 text-sm font-normal break-words">{service}</p>
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
          value={otherServices}
          onChange={(e) => setOtherServices(e.target.value)}
          placeholder="Type any additional services needed..."
          className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
        />
      </div>

      <div>
        <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
          Other Information
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any additional referral notes..."
          className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
        />
      </div>
    </section>
  );
}
