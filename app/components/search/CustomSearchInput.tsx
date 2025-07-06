"use client";

import { useEffect, useRef, useState } from "react";

import placesData from "../../../data/places.json";
import { Feature } from "../../../utils/types";
import * as Icons from "../icons/icons";

interface SearchResult {
  id: string;
  name: string;
  campus: string;
  category?: string;
  feature: Feature;
}

interface CustomSearchInputProps {
  onResult?: (result: SearchResult) => void;
  onResults?: (results: SearchResult[]) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function CustomSearchInput({
  onResult,
  onResults,
  onClear,
  placeholder = "Buscar lugares en UC",
  className = "",
  disabled = false,
  autoFocus = false,
}: CustomSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchController, setSearchController] = useState<AbortController | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      onClear?.();
      return;
    }

    // Cancel previous search
    if (searchController) {
      searchController.abort();
    }

    const controller = new AbortController();
    setSearchController(controller);
    setIsLoading(true);

    try {
      // Use local search instead of API
      const filteredFeatures = placesData.features.filter((feature: any) => {
        const name = feature.properties.name.toLowerCase();
        const campus = feature.properties.campus.toLowerCase();
        const query = searchQuery.toLowerCase();

        // Only show approved places
        if (feature.properties.needApproval === true) {
          return false;
        }

        return name.includes(query) || campus.includes(query);
      });

      const searchResults: SearchResult[] = filteredFeatures.map((feature: any) => ({
        id: feature.properties.identifier,
        name: feature.properties.name,
        campus: feature.properties.campus,
        category: feature.properties.categories?.[0],
        feature: feature as Feature,
      }));

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(-1);
      onResults?.(searchResults);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Search error:", error);
        setResults([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
      setSearchController(null);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.name);
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onResult?.(result);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleResultSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && resultsRef.current) {
      const highlightedElement = resultsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.Search className="h-5 w-5 text-foreground" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 
            bg-card/50 backdrop-blur-sm 
            border border-border 
            rounded-lg 
            text-foreground placeholder-muted-foreground 
            focus:outline-none focus:inset-ring-2 focus:inset-ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
          autoComplete="off"
        />

        {/* Loading or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 text-muted-foreground">
              <Icons.Search className="h-5 w-5" />
            </div>
          ) : query ? (
            <button onClick={handleClear} className="p-1 hover:bg-accent rounded-full transition-colors" type="button">
              <Icons.Close className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 ? (
        <div className="absolute z-50 w-full mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
          <ul ref={resultsRef} className="max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <li key={result.id}>
                <button
                  onClick={() => handleResultSelect(result)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-accent/20 focus:bg-accent/20 focus:outline-none
                    border-b border-border/50 last:border-b-0
                    transition-colors duration-150
                    ${index === highlightedIndex ? "bg-accent/20" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">📍</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{result.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {result.campus}
                        {result.category ? ` • ${result.category}` : ""}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* No Results Message */}
      {isOpen && !isLoading && query && results.length === 0 ? (
        <div className="absolute z-50 w-full mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
          <div className="text-center text-muted-foreground">
            <Icons.Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No se encontraron resultados para &quot;{query}&quot;</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
