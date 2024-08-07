import React from "react";

import Pill from "./pill";

function PillFilter() {
  return (
    <section className="pointer-events-none relative right-0 pe-64 max-[800px]:pt-32 h-6 z-50 mt-4 flex justify-items-center align-middle justify-center max-[800px]:flex-col">
      <Pill title="Comida" />
      <Pill title="Baños" />
      <Pill title="Salas" />
      <Pill title="Bibliotecas" />
    </section>
  );
}

export default PillFilter;
