"use client";

import React from "react";
import Button from "@/components/Button";
import { SectionHeader } from "./SectionHeader";
import { US_STATES } from "./types";
import type { Receiver } from "./types";

const moveBtnBase =
  "min-w-[44px] min-h-[44px] w-12 h-12 md:w-10 md:h-10 !p-0 flex items-center justify-center text-lg md:text-base touch-manipulation active:scale-95";
const moveBtnActive =
  "!bg-rcn-bg !border-rcn-border hover:!border-rcn-brand/50 hover:!bg-[#e5f2ea] hover:!ring-2 hover:!ring-rcn-brand/15";

interface SelectReceiverSectionProps {
  stateFilter: string;
  setStateFilter: (v: string) => void;
  receiverSearch: string;
  setReceiverSearch: (v: string) => void;
  selectedReceivers: string[];
  setSelectedReceivers: React.Dispatch<React.SetStateAction<string[]>>;
  availableReceiversList: string[];
  selectedAvailableReceivers: string[];
  setSelectedAvailableReceivers: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSelectedReceivers: string[];
  setSelectedSelectedReceivers: React.Dispatch<React.SetStateAction<string[]>>;
  filteredReceivers: Receiver[];
  onOpenAddReceiver: () => void;
}

export function SelectReceiverSection({
  stateFilter,
  setStateFilter,
  receiverSearch,
  setReceiverSearch,
  selectedReceivers,
  setSelectedReceivers,
  availableReceiversList,
  selectedAvailableReceivers,
  setSelectedAvailableReceivers,
  selectedSelectedReceivers,
  setSelectedSelectedReceivers,
  filteredReceivers,
  onOpenAddReceiver,
}: SelectReceiverSectionProps) {
  const toggleAvailableReceiver = (name: string) => {
    setSelectedAvailableReceivers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleSelectedReceiver = (name: string) => {
    setSelectedSelectedReceivers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const moveReceiver = (direction: "right" | "left" | "allRight" | "allLeft") => {
    if (direction === "right" || direction === "allRight") {
      const toAdd =
        direction === "allRight" ? availableReceiversList : selectedAvailableReceivers;
      if (toAdd.length === 0) return;
      setSelectedReceivers((prev) => [...new Set([...prev, ...toAdd])]);
      setSelectedAvailableReceivers([]);
    } else {
      const toRemove =
        direction === "allLeft" ? selectedReceivers : selectedSelectedReceivers;
      if (toRemove.length === 0) return;
      setSelectedReceivers((prev) => prev.filter((item) => !toRemove.includes(item)));
      setSelectedSelectedReceivers([]);
    }
  };

  return (
    <section
      id="select-receiver"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Select the Referral Receiver"
        subtitle="Filter by state to narrow receiver list"
        badge="Bulk referrals supported"
      />

      <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
        <p className="m-0 text-sm text-rcn-text">
          Bulk referrals are supported. When a referral is sent to multiple receivers, each
          receiver will only be able to view their own referral and will not be able to see any
          other receivers or recipient details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            State (business location)
          </label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          >
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-rcn-muted mt-1.5">
            Select a state to narrow down available receivers.
          </p>
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Receiver (dropdown)
          </label>
          <select
            onChange={(e) => {
              if (e.target.value && !selectedReceivers.includes(e.target.value)) {
                setSelectedReceivers((prev) => [...prev, e.target.value]);
              }
              e.target.value = "";
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          >
            <option value="" disabled selected>
              Select a receiver
            </option>
            {filteredReceivers.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Search receiver
          </label>
          <input
            type="text"
            value={receiverSearch}
            onChange={(e) => setReceiverSearch(e.target.value)}
            placeholder="Type to search Available Receivers..."
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-stretch">
        <div className="min-w-0 flex flex-col">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Available receivers (multi-select)
          </label>
          <div
            className="w-full min-h-[240px] max-h-[280px] min-w-0 px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-y-auto overflow-x-hidden"
            role="listbox"
            aria-multiselectable
            aria-label="Available receivers"
          >
            {availableReceiversList.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">No available receivers.</p>
            ) : (
              availableReceiversList.map((name) => {
                const isSelected = selectedAvailableReceivers.includes(name);
                return (
                  <div
                    key={name}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleAvailableReceiver(name)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                    }`}
                  >
                    <p className="m-0 text-sm font-normal wrap-break-word">{name}</p>
                  </div>
                );
              })
            )}
          </div>
          <button
            type="button"
            onClick={onOpenAddReceiver}
            className="w-full mt-2.5 flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light text-white border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs hover:brightness-[1.03] hover:-translate-y-px active:translate-y-0 transition-all"
          >
            <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">
              ＋
            </span>
            <span>Add Referral Receiver (if not listed)</span>
          </button>
          <p className="text-xs text-rcn-muted text-center mt-1.5">
            Add a new receiver company to the list.
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center items-center gap-2 py-2 md:py-0 md:flex-col md:justify-center md:gap-2">
          <span className="w-full md:hidden text-[11px] text-rcn-muted font-semibold text-center mb-0.5">
            Move
          </span>
          <div className="w-full md:w-auto flex flex-row justify-center items-center gap-2 md:flex-col">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveReceiver("right")}
              disabled={selectedAvailableReceivers.length === 0}
              className={`${moveBtnBase} ${selectedAvailableReceivers.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move selected to selected receivers"
              title="Add selected"
            >
              →
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveReceiver("allRight")}
              disabled={availableReceiversList.length === 0}
              className={`${moveBtnBase} ${availableReceiversList.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move all to selected receivers"
              title="Add all"
            >
              ≫
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveReceiver("left")}
              disabled={selectedSelectedReceivers.length === 0}
              className={`${moveBtnBase} ${selectedSelectedReceivers.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move selected to available"
              title="Remove selected"
            >
              ←
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => moveReceiver("allLeft")}
              disabled={selectedReceivers.length === 0}
              className={`${moveBtnBase} ${selectedReceivers.length !== 0 ? moveBtnActive : ""}`}
              aria-label="Move all to available"
              title="Remove all"
            >
              ≪
            </Button>
          </div>
        </div>

        <div className="min-w-0 flex flex-col">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Selected receivers
          </label>
          <div
            className="w-full min-h-[240px] max-h-[280px] min-w-0 px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-y-auto overflow-x-hidden"
            role="listbox"
            aria-multiselectable
            aria-label="Selected receivers"
          >
            {selectedReceivers.length === 0 ? (
              <p className="m-0 py-2 text-rcn-muted text-sm">
                None selected. Use the dropdown or move buttons.
              </p>
            ) : (
              selectedReceivers.map((name) => {
                const isSelected = selectedSelectedReceivers.includes(name);
                return (
                  <div
                    key={name}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleSelectedReceiver(name)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? "bg-rcn-brand/15 border-rcn-brand/40 text-rcn-text"
                        : "border-transparent hover:bg-slate-50 text-rcn-text"
                    }`}
                  >
                    <p className="m-0 text-sm font-normal wrap-break-word">{name}</p>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-rcn-muted mt-2">
            This is the final receiver list for the referral.
          </p>
        </div>
      </div>
    </section>
  );
}
