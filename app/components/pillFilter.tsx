import React from "react";

import Pill from "./pill";

interface PillFilterProps {
  setFilteredPlaces: ([]) => void;
  geocoder: MapboxGeocoder;
}

function PillFilter({ setFilteredPlaces, geocoder }: PillFilterProps) {
  return (
    <section className="pointer-events-none relative pe-64 max-map-sm:pe-2 max-map-sm:top-36 h-6 z-50 top-4 flex justify-items-center align-middle justify-center max-map-sm:flex-col">
      <Pill title="Comida" iconPath="/food.svg" onClick={() => console.log(1)} />
      <Pill title="Bibliotecas" iconPath="/library.svg" onClick={() => console.log(1)} />
      <Pill title="Baños" iconPath="/toilet.svg" onClick={() => console.log(1)} />
    </section>
  );
}

export default PillFilter;
