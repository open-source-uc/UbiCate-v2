import { useState, useMemo, useRef, useEffect } from "react";

import Fuse from "fuse.js";

import { useSidebar } from "@/app/context/sidebarCtx";
import PlacesJSON from "@/utils/places";
import { CATEGORIES, Feature, siglas } from "@/utils/types";

import MarkerIcon from "../icons/markerIcon";

interface SearchDropdownProps {
  numberOfShowResults?: number;
}

export function SearchDropdown({ numberOfShowResults = 8 }: SearchDropdownProps) {
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const x = useRef<null | string>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedPlace, setPlaces } = useSidebar();

  const fuse = useMemo(() => {
    const filteredFeatures = PlacesJSON.features.filter(
      (result) => result.properties.needApproval === false || result.properties.needApproval === undefined,
    );

    return new Fuse(filteredFeatures, {
      keys: ["properties.name"],
      threshold: 0.3,
    });
  }, []);

  const matchingFeatures = useMemo((): Feature[] => {
    if (!query.trim()) return [];

    const results = fuse.search(query);
    return results.slice(0, numberOfShowResults).map((result) => result.item);
  }, [query, fuse]);

  useEffect(() => {
    setIsOpen(query.trim().length > 0 && matchingFeatures.length > 0);
    if (!x.current) setPlaces(matchingFeatures);
    x.current = null;
    setSelectedIndex(-1);
  }, [query, matchingFeatures]);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    // Input siempre expandido
  };

  const handleInputBlur = () => {
    // Pequeño delay para permitir clicks en las sugerencias
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingFeatures.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < matchingFeatures.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingFeatures.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(matchingFeatures[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (feature: Feature) => {
    setQuery(feature.properties.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSelectedPlace(feature);
    setPlaces([feature]);
    x.current = feature.properties.identifier;
  };

  const handleClearInput = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => (regex.test(part) ? <span key={index}>{part}</span> : part));
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Contenedor principal del geocoder */}
      <div className="relative bg-brown-medium outline-1 outline-brown-dark rounded-2xl z-10 border-none w-full min-w-60 max-w-md">
        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full border-none bg-transparent m-0 h-12 text-brown-light px-11 text-ellipsis whitespace-nowrap overflow-hidden rounded-2xl outline-none focus:z-20 focus:text-white focus:outline-blue-600 focus:outline-1 focus:outline-offset-[-1px] focus:shadow-[0_0_0_2px_#015FFF]"
            placeholder="Buscar lugares por nombre..."
            autoComplete="off"
          />

          {/* Ícono de búsqueda */}
          <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none">
            <svg className="w-full h-full text-brown-light" viewBox="0 0 24 24">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Botón de limpiar */}
          {query ? (
            <button
              onClick={handleClearInput}
              className="absolute right-2 top-2 z-20 p-0 m-0 border-none cursor-pointer bg-brown-medium leading-none"
            >
              <svg
                className="w-5 h-5 mt-2 mr-1 text-brown-light hover:text-white transition-colors"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Sugerencias */}
      {isOpen && matchingFeatures.length > 0 ? (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[1000]">
          <div className="bg-brown-medium rounded-xl rounded-t-lg overflow-hidden text-base border border-brown-dark">
            <ul ref={listRef} className="list-none m-0 p-0">
              {matchingFeatures.map((feature, index) => {
                return (
                  <li
                    key={index}
                    className={`
                    ${index === selectedIndex ? "bg-brown-dark" : "hover:bg-brown-dark/50"}
                  `}
                  >
                    <a
                      className="cursor-pointer block py-1.5 px-3 text-brown-light no-underline"
                      onClick={() => handleSelect(feature)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded text-brown-light text-sm">
                          <MarkerIcon classname="w-8 h-8" label={feature.properties.categories[0] as CATEGORIES} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                            {highlightMatch(feature.properties.name, query)}
                          </div>
                          <div className="text-sm text-brown-light/60 text-ellipsis overflow-hidden whitespace-nowrap">
                            {siglas.get(feature.properties.campus)}
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Estado sin resultados */}
      {isOpen && query && matchingFeatures.length === 0 ? (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[1000]">
          <div className="bg-brown-medium rounded-xl rounded-t-lg overflow-hidden border border-brown-dark">
            <div className="text-brown-light py-1.5 px-3 text-base text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm">No se encontraron resultados</div>
              <div className="text-xs text-brown-light/60 mt-1">Intenta con otros términos de búsqueda</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
