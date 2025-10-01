import { useState, useMemo, useRef, useEffect } from "react";

import Fuse from "fuse.js";

import { useSidebar } from "@/app/context/sidebarCtx";
import { emitPlaceSelectedEvent } from "@/lib/events/customEvents";
import { getCategoryColor } from "@/lib/map/categoryToColors";
import PlacesJSON from "@/lib/places/data";
import { CATEGORIES, Feature, siglas } from "@/lib/types";

import * as Icons from "../../ui/icons/icons";
import MarkerIcon from "../../ui/icons/markerIcon";
import { Close } from "../../ui/icons/icons";

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
  const { setPlaces } = useSidebar();

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
    emitPlaceSelectedEvent(feature); // Emitir el evento personalizado, pues el fly solo se puede hacer desde el mapa, se escuhará en el hook useMapEvents
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
      <div className="relative bg-input outline-1 outline-border rounded-2xl z-10 border-none min-w-60">
        {/* Input */}
        <div className="relative text-secondary-foreground font-regular">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full border-none bg-transparent m-0 h-12 px-11 text-ellipsis whitespace-nowrap overflow-hidden rounded-2xl outline-none focus:z-20 focus:shadow-[0_0_0_2px_var(--color-focus-indicator)]"
            placeholder="Buscar en Ubicate"
            autoComplete="off"
            autoFocus
            aria-label="Buscar lugares en Ubicate"
          />

          {/* Ícono de búsqueda */}
          <div className="absolute top-3 left-3 w-7 h-7 pointer-events-none">
            <Icons.Search className="w-6 h-6 fill-border" />
          </div>

          {/* Botón de limpiar */}
          {query ? (
            <div className="absolute right-0 top-0 z-20 py-[13px] px-3">
              <button
                onClick={handleClearInput}
                className="p-1 bg-destructive border-none cursor-pointer leading-none rounded-full hover:bg-destructive/80 focus:outline-none group"
              >
                <Icons.Close className="w-4 h-4 fill-foreground group-hover:fill-foreground/80" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sugerencias */}
      {isOpen && matchingFeatures.length > 0 ? (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[1000]">
          <div
            className="bg-muted text-muted-foreground rounded-xl rounded-t-lg overflow-hidden text-base border border-border"
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
                      ${index === selectedIndex ? "bg-background/15 " : ""}
                    `}
                  >
                    <a
                      className="cursor-pointer block py-3 px-3 no-underline"
                      onClick={() => handleSelect(feature)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {/* Contenedor del ícono con tamaño adaptativo */}
                        <div
                          className={`${getIconContainerSize(
                            placeName,
                          )} flex items-center justify-center rounded text-xs flex-shrink-0 ${color}`}
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
                                ? "text-xs break-words"
                                : "text-sm"
                            }`}
                          >
                            {placeName}
                          </div>
                          <div
                            className={`text-left leading-tight mt-0.4 ${
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
