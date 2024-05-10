"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchResultProviderProps {
  children: ReactNode;
}

interface SearchResultContextValue {
  searchResult: string;
  setSearchResult: (value: string) => void;
  initialLat: number | null;
  setInitialLat: (value: number | null) => void;
  initialLng: number | null;
  setInitialLng: (value: number | null) => void;
}

const SearchResultCtx = createContext<SearchResultContextValue | undefined>(undefined);

export function SearchResultProvider({ children }: SearchResultProviderProps) {
  const [searchResult, setSearchResult] = useState<string>("");
  const [initialLng, setInitialLng] = useState<number | null>(null);
  const [initialLat, setInitialLat] = useState<number | null>(null);

  return (
    <SearchResultCtx.Provider
      value={{ searchResult, setSearchResult, initialLat, setInitialLat, initialLng, setInitialLng }}
    >
      {children}
    </SearchResultCtx.Provider>
  );
}

export const useSearchResultCtx = () => {
  const context = useContext(SearchResultCtx);
  if (!context) {
    throw new Error("useSearchResultCtx must be used within a SearchProvider");
  }
  return context;
};
