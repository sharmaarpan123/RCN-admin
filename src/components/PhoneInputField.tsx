"use client";

import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string, country: { dialCode: string }) => void;
  hasError?: boolean;
  country?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  containerClass?: string;
  inputClass?: string;
  buttonClass?: string;
  dropdownClass?: string;
  placeholder?: string;
}

const baseInputClass =
  "!w-full !h-[42px] !rounded-xl !border !border-rcn-border !bg-white !text-sm outline-none focus:!border-[#b9d7c5] focus:!shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
const baseButtonClass = "!border-rcn-border !rounded-l-xl !bg-white";
const baseDropdownClass = "!border-rcn-border";
const errorInputClass = "!border-red-500";
const errorContainerClass = "border-red-500 rounded-xl";

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  hasError = false,
  country = "us",
  inputProps,
  containerClass = "",
  inputClass = "",
  buttonClass = "",
  dropdownClass = "",
  placeholder,
}) => {
  return (
    <PhoneInput
      country={country}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputProps={inputProps}
      containerClass={`${hasError ? errorContainerClass : ""} ${containerClass}`.trim()}
      inputClass={`${baseInputClass} ${hasError ? errorInputClass : ""} ${inputClass}`.trim()}
      buttonClass={buttonClass || baseButtonClass}
      dropdownClass={dropdownClass || baseDropdownClass}
    />
  );
};

export default PhoneInputField;
