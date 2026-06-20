"use client";

import * as React from "react";
import type { SelectedLocation } from "@/types";
import { DEFAULT_PINCODE } from "@/lib/site-config";

const STORAGE_KEY = "lanbel_location";
const DISMISS_KEY = "lanbel_location_dismissed";

interface LocationContextValue {
  location: SelectedLocation | null;
  isModalOpen: boolean;
  isDetecting: boolean;
  openModal: () => void;
  closeModal: () => void;
  saveLocation: (location: SelectedLocation) => void;
  clearLocation: () => void;
  detectLocation: () => Promise<void>;
}

const LocationContext = React.createContext<LocationContextValue | null>(null);

function persist(location: SelectedLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    /* storage may be unavailable (private mode) */
  }
  const value = encodeURIComponent(JSON.stringify(location));
  document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = React.useState<SelectedLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDetecting, setIsDetecting] = React.useState(false);

  // Hydrate from storage; prompt on first visit if nothing saved.
  React.useEffect(() => {
    let stored: SelectedLocation | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as SelectedLocation;
    } catch {
      stored = null;
    }

    if (stored) {
      setLocation(stored);
      return;
    }

    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed) setIsModalOpen(true);
  }, []);

  const openModal = React.useCallback(() => setIsModalOpen(true), []);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const saveLocation = React.useCallback((next: SelectedLocation) => {
    setLocation(next);
    persist(next);
    setIsModalOpen(false);
  }, []);

  const clearLocation = React.useCallback(() => {
    setLocation(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
  }, []);

  const detectLocation = React.useCallback(async () => {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    setIsDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10_000,
            maximumAge: 0,
          }),
      );

      saveLocation({
        label: "Your current location",
        pincode: location?.pincode || DEFAULT_PINCODE,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } finally {
      setIsDetecting(false);
    }
  }, [location?.pincode, saveLocation]);

  const value = React.useMemo<LocationContextValue>(
    () => ({
      location,
      isModalOpen,
      isDetecting,
      openModal,
      closeModal,
      saveLocation,
      clearLocation,
      detectLocation,
    }),
    [
      location,
      isModalOpen,
      isDetecting,
      openModal,
      closeModal,
      saveLocation,
      clearLocation,
      detectLocation,
    ],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = React.useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}
