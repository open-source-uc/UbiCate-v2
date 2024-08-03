import React from "react";

import Pill from "./pill";

function PillFilter() {
  return (
    <section className="relative h-6 z-50 mt-4 flex justify-items-center align-middle justify-center">
      <Pill title="Comida" />
      <Pill title="Baños" />
      <Pill title="Salas" />
      <Pill title="Bibliotecas" />
    </section>
  );
}

export default PillFilter;
