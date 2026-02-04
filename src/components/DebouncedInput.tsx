"use client";

import { useState, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export type DebouncedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
};

const defaultClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

export function DebouncedInput({
  value,
  onChange,
  debounceMs = 300,
  className,
  ...rest
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      queueMicrotask(() => setLocalValue(value));
    }
  }, [value]);



  useEffect(() => {
    if (localValue === value) return;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onChange(localValue.trim());
    }, debounceMs);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, value, debounceMs, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };



  return (
    <input
      {...rest}
      type={rest.type ?? "search"}
      value={localValue}
      onChange={handleChange}
      className={twMerge(defaultClass, className ?? "")}
    />
  );
}

export default DebouncedInput;
