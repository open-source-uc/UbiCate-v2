// Campus configuration data
export const campuses = [
  {
    key: "SanJoaquin",
    name: "San Joaquín",
    imageSrc: "/images/campus/san_joaquin.jpg",
    className: "",
  },
  {
    key: "CasaCentral",
    name: "Casa Central",
    imageSrc: "/images/campus/casa_central.jpg",
    className: "",
  },
  {
    key: "Oriente",
    name: "Oriente",
    imageSrc: "/images/campus/oriente.jpg",
    className: "",
  },
  {
    key: "LoContador",
    name: "Lo Contador",
    imageSrc: "/images/campus/lo_contador.jpg",
    className: "",
  },
  {
    key: "Villarrica",
    name: "Villarrica",
    imageSrc: "/images/campus/villarrica.png",
    className: "col-span-2 md:col-span-1",
  },
] as const;

// Type for campus keys
export type CampusKey = typeof campuses[number]['key'];

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
  {
    id: "guías",
    label: "Guías",
    icon: "MenuBook",
    disabled: true,
  },
] as const;

export type NavigationItemId = typeof navigationItems[number]['id'];
