/**
 * useBrowsingTracker
 *
 * Tracks which school types, regions, and session types the user has been
 * interacting with.  Scores are stored in localStorage and synced to the DB
 * (via tRPC) whenever the user has a chat session ID.
 *
 * Usage:
 *   const { profile, trackSchoolType, trackRegion, trackSessionType } = useBrowsingTracker();
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface BrowsingProfile {
  schoolTypes: Record<string, number>;
  regions: Record<string, number>;
  sessionTypes: Record<string, number>;
}

const STORAGE_KEY = "jingshen_browsing_profile";

function loadProfile(): BrowsingProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BrowsingProfile;
  } catch {
    // ignore
  }
  return { schoolTypes: {}, regions: {}, sessionTypes: {} };
}

function saveProfile(p: BrowsingProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function increment(
  record: Record<string, number>,
  key: string
): Record<string, number> {
  return { ...record, [key]: (record[key] ?? 0) + 1 };
}

export function useBrowsingTracker() {
  const [profile, setProfile] = useState<BrowsingProfile>(loadProfile);

  // Persist on every change
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const trackSchoolType = useCallback((type: string) => {
    setProfile((p) => ({
      ...p,
      schoolTypes: increment(p.schoolTypes, type),
    }));
  }, []);

  const trackRegion = useCallback((region: string) => {
    setProfile((p) => ({
      ...p,
      regions: increment(p.regions, region),
    }));
  }, []);

  const trackSessionType = useCallback((sessionType: string) => {
    setProfile((p) => ({
      ...p,
      sessionTypes: increment(p.sessionTypes, sessionType),
    }));
  }, []);

  /** Returns the top-N keys by score */
  function topKeys(record: Record<string, number>, n = 2): string[] {
    return Object.entries(record)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);
  }

  return { profile, trackSchoolType, trackRegion, trackSessionType, topKeys };
}
