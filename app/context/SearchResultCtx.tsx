"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchResultProviderProps {
  children: ReactNode;
}

interface SearchResultContextValue {
  searchResult: string;
  setSearchResult: (value: string) => void;
}

const SearchResultCtx = createContext<SearchResultContextValue | undefined>(undefined);

export function SearchResultProvider({ children }: SearchResultProviderProps) {
  const [searchResult, setSearchResult] = useState<string>("Initial Value");

  return <SearchResultCtx.Provider value={{ searchResult, setSearchResult }}>{children}</SearchResultCtx.Provider>;
}

export const useSearchResultCtx = () => {
  const context = useContext(SearchResultCtx);
  if (!context) {
    throw new Error("useSearchResultCtx must be used within a SeaProvider");
  }
  return context;
};
