"use client";

import React, { useCallback, useRef, useState } from "react";
import { Autocomplete as GoogleAutocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

export interface AddressResult {
  street: string;
  suite: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  formatted_address: string;
}

export interface AutocompleteProps {
  /** Called when user selects a place; receives parsed address fields */
  onPlaceSelect?: (address: AddressResult) => void;
  /** Controlled value for the input (e.g. from react-hook-form) */
  value?: string;
  /** Called when input text changes (for controlled usage) */
  onInputChange?: (value: string) => void;
  /** Restrict predictions to a country code, e.g. "us" */
  countryRestriction?: string;
  /** Placeholder for the input */
  placeholder?: string;
  /** Error state styling */
  hasError?: boolean;
  /** Additional class for the wrapper */
  className?: string;
  /** Additional class for the input */
  inputClassName?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Input id for labels */
  id?: string;
}

function getComponent(
  place: google.maps.places.PlaceResult,
  type: string
): string {
  const comp = place.address_components?.find((c) => c.types.includes(type));
  return comp?.long_name ?? "";
}

function getShortComponent(
  place: google.maps.places.PlaceResult,
  type: string
): string {
  const comp = place.address_components?.find((c) => c.types.includes(type));
  return comp?.short_name ?? "";
}

function parsePlaceResult(place: google.maps.places.PlaceResult): AddressResult {
  console.log(place, "place")
  const streetNumber = getComponent(place, "street_number");
  const route = getComponent(place, "route");
  const street = [streetNumber, route].filter(Boolean).join(" ").trim() ?? "";
  const suite = getComponent(place, "subpremise");
  const city =
    getComponent(place, "locality") ||
    getComponent(place, "postal_town") ||
    getComponent(place, "sublocality");
  const state = getShortComponent(place, "administrative_area_level_1");
  const zip_code = getComponent(place, "postal_code");
  const country = getShortComponent(place, "country") || getComponent(place, "country");
  const lat = place.geometry?.location?.lat?.() ?? null;
  const lng = place.geometry?.location?.lng?.() ?? null;
  const formatted =
    place.formatted_address ??
    [street, city, state, zip_code, country]
      .filter(Boolean)
      .join(", ");
  return {
    street,
    suite,
    city,
    state,
    zip_code,
    country,
    latitude: lat != null ? lat : null,
    longitude: lng != null ? lng : null,
    formatted_address: formatted,
  };
}

const defaultInputClass =
  "w-full px-3 py-2.5 rounded-xl border bg-white text-sm outline-none focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all border-rcn-border focus:border-[#b9d7c5]";

const Autocomplete: React.FC<AutocompleteProps> = ({
  onPlaceSelect,
  value = "",
  onInputChange,
  placeholder = "Search address",
  hasError = false,
  className = "",
  inputClassName = "",
  disabled = false,
  id,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  const handleLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const handlePlaceChanged = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place?.address_components) return;
    const parsed = parsePlaceResult(place);
    onPlaceSelect?.(parsed);
    const addr = place.formatted_address ?? "";
    setInputValue(addr);
    onInputChange?.(addr);
  }, [onPlaceSelect, onInputChange]);

  const handleInputChangeLocal = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      onInputChange?.(v);
    },
    [onInputChange]
  );

  const displayValue = value !== undefined && value !== "" ? value : inputValue;
  const inputClass = `${defaultInputClass} ${hasError ? "border-red-500" : ""} ${inputClassName}`.trim();

  if (loadError) {
    return (
      <div className={`text-sm text-amber-600 ${className}`.trim()}>
        Unable to load address search. Please check your connection.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <input
        type="text"
        placeholder={placeholder}
        className={inputClass}
        disabled
        aria-busy
        id={id}
      />
    );
  }

  return (
    <div className={className}>
      <GoogleAutocomplete
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
        // options={{
        //   types: ["address"],
        //   fields: ["address_components", "formatted_address", "geometry"],
        // }}
      >
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChangeLocal}
          className={inputClass}
          disabled={disabled}
          autoComplete="off"
        />
      </GoogleAutocomplete>
    </div>
  );
};

export default Autocomplete;
