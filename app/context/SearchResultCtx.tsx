"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchResultProviderProps {
  children: ReactNode;
}

interface SearchResultContextValue {
  searchResult: string;
  setSearchResult: (value: string) => void;
  initialLat: number;
  setInitialLat: (value: number) => void;
  initialLng: number;
  setInitialLng: (value: number) => void;
}

const SearchResultCtx = createContext<SearchResultContextValue | undefined>(undefined);

export function SearchResultProvider({ children }: SearchResultProviderProps) {
  const [searchResult, setSearchResult] = useState<string>("");
  const [initialLng, setInitialLng] = useState(-70.6109);
  const [initialLat, setInitialLat] = useState(-33.4983);

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
