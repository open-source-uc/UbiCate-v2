// "use client";

// import { useEffect, useState, useCallback } from "react";

// import MarkDownComponent from "../components/markDown";
// import { PointFeature } from "@/utils/types";



// export default function FormComponent({
//   pins
// }: {
//   pins: PointFeature[];
// }) {



//   // const validate = (newPlace: Omit<newPlace, "longitude" | "latitude" | "identifier">) => {
//   //   const errors: errors = {};

//   //   var campus: string | null = null;

//   //   if (!longitude || !latitude) {
//   //     errors.latitude = "Ubicación fuera de algún campus";
//   //     return;
//   //   }

//   //   for (const [boundaryCampus, boundary] of Object.entries(campusBounds)) {
//   //     if (
//   //       longitude >= boundary.longitudeRange[0] &&
//   //       longitude <= boundary.longitudeRange[1] &&
//   //       latitude >= boundary.latitudeRange[0] &&
//   //       latitude <= boundary.latitudeRange[1]
//   //     ) {
//   //       campus = MapSiglas.get(boundaryCampus) || null;
//   //       break;
//   //     }
//   //   }

//   //   if (!campus) {
//   //     errors.latitude = "Ubicación fuera de algún campus";
//   //   } else {
//   //     setCampus(campus);
//   //   }

//   //   if (!newPlace.placeName) {
//   //     errors.placeName = "Requerido";
//   //   } else if (newPlace.placeName.length > 60) {
//   //     errors.placeName = "El nombre es demasiado largo";
//   //   }
//   //   if (newPlace.categories == "") {
//   //     errors.categories = "Debes seleccionar una categoría";
//   //   }

//   //   if (newPlace.information && newPlace.information.length > 200) {
//   //     errors.information = "La descripción es demasiado larga";
//   //   }

//   //   if (newPlace.floor > 20) {
//   //     errors.floor = "Piso inválido";
//   //   }
//   //   if (newPlace.floor < -10) {
//   //     errors.floor = "Piso inválido";
//   //   }

//   //   if (Math.abs(newPlace.floor) == 0) {
//   //     errors.floor = "Piso 0 es inválido";
//   //   }

//   //   return errors;
//   // };
//   return (
//     <form>
//       <input type="text" />
//       <select multiple>
//         <option value="classroom">Sala</option>
//         <option value="bath">Baño</option>
//         <option value="food_lunch">Comida</option>
//         <option value="studyroom">Sala de estudio</option>
//         <option value="library">Biblioteca</option>
//         <option value="trash">Reciclaje</option>
//       </select>

//     </form>
//   );
// }

import { CategoryOptions, CategoryToDisplayName } from "@/utils/types";
import { useState } from "react";

export default function Formulario() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);


  const toggleOption = (value: string) => {
    setSelectedOptions(prev =>
      prev.includes(value)
        ? prev.filter(opt => opt !== value)
        : [...prev, value]
    );
  };

  return (
    <form className="space-y-4">
      <input
        type="text"
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Nombre del lugar"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full border  rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedOptions.length > 0
            ? `${selectedOptions.length} seleccionados`
            : "Seleccionar opciones"}
        </button>

        {open && (
          <div className="absolute mt-2 w-full rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto bg-brown-light">
            {CategoryOptions.map(option => (
              <label
                key={option}
                className="flex items-center px-4 py-2  cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2"
                />
                {CategoryToDisplayName.get(option)}
              </label>
            ))}
          </div>
        )}
      </div>

      <textarea
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Descripción"
        rows={4}
      ></textarea>

      <input
        type="number"
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Piso"
      />

    </form>
  );
}
