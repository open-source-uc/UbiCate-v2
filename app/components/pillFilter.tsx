import React from "react";

import Pill from "./pill";

function PillFilter() {
  return (
    <section className="pointer-events-none relative pe-64 max-map-sm:pe-2 max-map-sm:top-36 h-6 z-50 top-4 flex justify-items-center align-middle justify-center max-map-sm:flex-col">
      <Pill title="Comida" iconPath="/food.svg" />
      <Pill title="Bibliotecas" iconPath="/library.svg" />
      <Pill title="Baños" iconPath="/toilet.svg" />
    </section>
  );
}

export default PillFilter;
