"use client";

import React from "react";
import AsyncSelect, { type MultiValue } from "react-select/async";
import { twMerge } from "tailwind-merge";

export interface RcnSelectOption {
  value: string;
  label: string;
}

const RCN_SELECT_CLASSES = {
  control:
    "!min-h-[42px] !rounded-xl !border-rcn-border !shadow-none !border",
  menu: "!rounded-xl !border !border-rcn-border",
};

export interface CustomAsyncSelectProps {
  /** Currently selected options (for multi) */
  value: RcnSelectOption[];
  /** Called when selection changes */
  onChange: (options: RcnSelectOption[]) => void;
  /** Load options from API/search. Return promise of options. */
  loadOptions: (inputValue: string) => Promise<RcnSelectOption[]>;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Accessible label */
  "aria-label"?: string;
  /** Allow clearing selection */
  isClearable?: boolean;
  /** Max height of dropdown in px */
  maxMenuHeight?: number;
  /** Disable the control */
  isDisabled?: boolean;
  /** Optional className for the outer wrapper */
  className?: string;
  controlClassName?: string;
  menuClassName?: string;
  /** Load initial options on focus (e.g. when state is set). If true, loadOptions("") is called on focus. */
  defaultOptions?: boolean | RcnSelectOption[];
}

const CustomAsyncSelect: React.FC<CustomAsyncSelectProps> = ({
  value,
  onChange,
  loadOptions,
  placeholder = "Type to search...",
  "aria-label": ariaLabel,
  isClearable = true,
  maxMenuHeight = 280,
  isDisabled = false,
  className,
  controlClassName = "",
  menuClassName = "",
  defaultOptions = true,
}) => {
  const handleChange = (opts: MultiValue<RcnSelectOption>) => {
    onChange(opts ? [...opts] : []);
  };

  return (
    <div className={className}>
      <AsyncSelect<RcnSelectOption, true>
        isMulti
        value={value}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
        isClearable={isClearable}
        isDisabled={isDisabled}
        maxMenuHeight={maxMenuHeight}
        placeholder={placeholder}
        aria-label={ariaLabel}
        classNames={{
          control: () => twMerge(RCN_SELECT_CLASSES.control, controlClassName),
          menu: () => twMerge(RCN_SELECT_CLASSES.menu, menuClassName),
        }}
      />
    </div>
  );
};

export default CustomAsyncSelect;
