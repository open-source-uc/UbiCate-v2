"use client";

import { useQuery } from "@tanstack/react-query";

import type { ChangelogEntry } from "@/lib/changelog/types";

const CHANGELOGS_STALE_MS = 60 * 60 * 1000;

export function useChangelogs() {
  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: ["changelogs"],
    queryFn: () =>
      fetch("/api/changelogs").then((r) => r.json()) as Promise<{ changelogs: ChangelogEntry[]; message: string }>,
    staleTime: CHANGELOGS_STALE_MS,
    gcTime: Infinity,
    networkMode: "offlineFirst",
    refetchOnWindowFocus: false,
  });

  return {
    entries: data?.changelogs ?? [],
    isLoading,
    isError,
    isFetched,
  };
}
