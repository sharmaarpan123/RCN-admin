"use client";

import React, { createContext, useMemo, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("places")[] = ["places"];

export interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_MAP_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-autocomplete",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const value = useMemo<GoogleMapsContextValue>(
    () => ({ isLoaded, loadError }),
    [isLoaded, loadError]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps(): GoogleMapsContextValue {
  const ctx = React.useContext(GoogleMapsContext);
  if (ctx == null) {
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  }
  return ctx;
}

export { GoogleMapsContext };
