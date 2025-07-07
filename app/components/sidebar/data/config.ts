// Campus configuration data
export const campuses = [
  {
    key: "SanJoaquin",
    name: "San Joaquín",
    imageSrc: "/images/campus/san_joaquin.webp",
    className: "",
  },
  {
    key: "CasaCentral",
    name: "Casa Central",
    imageSrc: "/images/campus/casa_central.webp",
    className: "",
  },
  {
    key: "Oriente",
    name: "Oriente",
    imageSrc: "/images/campus/oriente.webp",
    className: "",
  },
  {
    key: "LoContador",
    name: "Lo Contador",
    imageSrc: "/images/campus/lo_contador.webp",
    className: "",
  },
  {
    key: "Villarrica",
    name: "Villarrica",
    imageSrc: "/images/campus/villarrica.webp",
    className: "col-span-2 md:col-span-1",
  },
] as const;

// Type for campus keys
export type CampusKey = (typeof campuses)[number]["key"];

// Navigation items configuration
export const navigationItems = [
  {
    id: "buscar",
    label: "Buscar",
    icon: "Search",
  },
  {
    id: "campus",
    label: "Campus",
    icon: "Map",
  },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]["id"];
