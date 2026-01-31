"use client";

import React from "react";
import Select, { type SingleValue } from "react-select";
import { twMerge } from "tailwind-merge";

export interface RcnSelectOption {
  value: string;
  label: string;
}

export interface RcnSelectProps {
  /** Current value (option value string) */
  value: string;
  /** Called with the selected option's value string */
  onChange: (value: string) => void;
  /** Options in { value, label } form */
  options: RcnSelectOption[];
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Accessible label */
  "aria-label"?: string;
  /** Allow clearing selection (default false) */
  isClearable?: boolean;
  /** Max height of dropdown in px (default 200) */
  maxMenuHeight?: number;
  /** Disable the control */
  isDisabled?: boolean;
  /** Optional className for the outer wrapper */
  className?: string;
  controlClassName?: string;
  menuClassName?: string;
}

const RCN_SELECT_CLASSES = {
  control:
    "!min-h-[42px] !rounded-xl !border-rcn-border !shadow-none !border",
  menu: "!rounded-xl !border !border-rcn-border",
};

const CustomReactSelect: React.FC<RcnSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  "aria-label": ariaLabel,
  isClearable = false,
  maxMenuHeight,
  isDisabled = false,
  className,
  controlClassName = "",
  menuClassName = "",
}) => {
  const selectedOption =
    options.find((o) => o.value === value) ?? null;

  const handleChange = (opt: SingleValue<RcnSelectOption>) => {
    onChange(opt?.value ?? "");
  };

  return (
    <div className={className}>
      <Select<RcnSelectOption>
        options={options}
        value={selectedOption}
        onChange={handleChange}
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

export function optionsFromStrings(
  items: string[],
  emptyLabel = "All"
): RcnSelectOption[] {
  return items.map((s) => ({
    value: s,
    label: s === "" ? emptyLabel : s,
  }));
}

export default CustomReactSelect;
