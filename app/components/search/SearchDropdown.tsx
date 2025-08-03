import { useState, useMemo, useRef, useEffect } from "react";

import Fuse from "fuse.js";

import { useSidebar } from "@/app/context/sidebarCtx";
import { getCategoryColor } from "@/utils/categoryToColors";
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
    return new Fuse(PlacesJSON.features, {
      keys: ["properties.name"],
      threshold: 0.3,
    });
  }, []);

  const matchingFeatures = useMemo((): Feature[] => {
    if (!query.trim()) return [];

    const results = fuse.search(query);
    return results.slice(0, 20).map((result) => result.item);
  }, [query, fuse]);

  // Calcular la altura dinámica basada en numberOfShowResults
  const dropdownHeight = useMemo(() => {
    const itemHeight = 56; // Altura aproximada de cada item en pixels
    const maxHeight = numberOfShowResults * itemHeight;
    return `${maxHeight}px`;
  }, [numberOfShowResults]);

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

  // Auto-scroll para mantener el elemento seleccionado visible
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

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

  // Función para determinar el tamaño del ícono basado en la longitud del texto
  const getIconSize = (text: string) => {
    if (text.length > 50) return "w-4 h-4"; // Texto muy largo
    if (text.length > 30) return "w-5 h-5"; // Texto largo
    return "w-6 h-6"; // Texto normal
  };

  // Función para determinar el tamaño del contenedor del ícono
  const getIconContainerSize = (text: string) => {
    if (text.length > 50) return "w-6 h-6"; // Más pequeño para texto muy largo
    if (text.length > 30) return "w-7 h-7"; // Mediano para texto largo
    return "w-8 h-8"; // Normal
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Contenedor principal del geocoder */}
      <div className="relative bg-secondary outline-1 outline-secondary rounded-2xl z-10 border-none w-full min-w-60 max-w-md">
        {/* Input */}
        <div className="relative text-ring font-medium">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full border-none bg-transparent m-0 h-12 px-11 text-ellipsis whitespace-nowrap overflow-hidden rounded-2xl outline-none focus:z-20 focus:outline-blue-600 focus:outline-1 focus:outline-offset-[-1px] focus:shadow-[0_0_0_2px_#015FFF]"
            placeholder="Buscar lugares por nombre..."
            autoComplete="off"
          />

          {/* Ícono de búsqueda */}
          <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 24 24">
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
              className="absolute right-2 top-2 z-20 p-0 m-0 border-none cursor-pointer bg-secondary leading-none"
            >
              <svg className="w-5 h-5 mt-2 mr-1" viewBox="0 0 24 24">
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
          <div
            className="bg-secondary rounded-xl rounded-t-lg overflow-hidden text-base border border-secondary"
            style={{ maxHeight: dropdownHeight }}
          >
            <ul ref={listRef} className="list-none m-0 p-0 overflow-y-auto" style={{ maxHeight: dropdownHeight }}>
              {matchingFeatures.map((feature, index) => {
                const primaryCategory = feature.properties.categories[0];
                const color = getCategoryColor(primaryCategory as CATEGORIES);
                const placeName = feature.properties.name;
                const campusName = siglas.get(feature.properties.campus);

                // Determinar si necesita texto más pequeño
                const needsSmallText = placeName.length > 30;
                const needsVerySmallText = placeName.length > 50;

                return (
                  <li
                    key={index}
                    className={`
                      ${index === selectedIndex ? "bg-secundary" : "hover:bg-secundary/50"}
                    `}
                  >
                    <a
                      className="cursor-pointer block py-2 px-3 no-underline"
                      onClick={() => handleSelect(feature)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Contenedor del ícono con tamaño adaptativo */}
                        <div
                          className={`${getIconContainerSize(
                            placeName,
                          )} flex items-center justify-center rounded text-xs flex-shrink-0 mt-1 ${color}`}
                        >
                          <MarkerIcon
                            classname={getIconSize(placeName)}
                            label={feature.properties.categories[0] as CATEGORIES}
                          />
                        </div>

                        {/* Contenedor de texto */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-bold text-left leading-tight ${
                              needsVerySmallText
                                ? "text-xs break-words"
                                : needsSmallText
                                ? "text-sm break-words"
                                : "text-base"
                            }`}
                          >
                            {placeName}
                          </div>
                          <div
                            className={`text-left leading-tight mt-0.5 ${
                              needsVerySmallText
                                ? "text-xs break-words opacity-75"
                                : needsSmallText
                                ? "text-xs break-words opacity-75"
                                : "text-sm opacity-75"
                            }`}
                          >
                            {campusName}
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
    </div>
  );
}
