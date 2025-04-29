"use client";

import { CategoryOptions, CategoryToDisplayName } from "@/utils/types";
import { useState } from "react";

export default function Formulario() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{
    name: string;
    information: string;
    categories: string[];
    floors: number[];
  }>({
    name: "",
    information: "",
    categories: [],
    floors: [1],
  });

  const toggleOption = (value: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(opt => opt !== value)
        : [...prev.categories, value],
    }));
  };

  const handleFloorChange = (index: number, value: number) => {
    const newFloors = [...data.floors];
    newFloors[index] = value;
    setData(prev => ({
      ...prev,
      floors: newFloors,
    }));
  };

  const addFloor = () => {
    setData(prev => ({
      ...prev,
      floors: [...prev.floors, 1],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(data);
    // Aquí podrías mandar `data` a tu API
  };

  return (
    <form
      className="flex flex-col gap-6 h-full"
      onSubmit={handleSubmit}
      onClick={() => setOpen(false)}
    >
      <h1 className="text-2xl font-bold text-gray-800">¡Nueva Ubicación!</h1>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Nombre del lugar</span>
        <input
          type="text"
          value={data.name}
          onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: K203, Biblioteca, Sala Álvaro Campos..."
        />
      </label>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <span className="font-semibold mb-1 block">Categorías</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full border rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {data.categories.length > 0
            ? `${data.categories.length} seleccionadas`
            : "Seleccionar opciones"}
        </button>

        {open && (
          <div className="absolute mt-2 w-full rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto bg-brown-light">
            {CategoryOptions.map(option => (
              <label
                key={option}
                className="flex items-center px-4 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={data.categories.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2"
                />
                {CategoryToDisplayName.get(option)}
              </label>
            ))}
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Descripción (opcional)</span>
        <textarea
          value={data.information}
          onChange={e =>
            setData(prev => ({ ...prev, information: e.target.value }))
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Puedes usar Markdown aquí..."
          rows={4}
        ></textarea>
      </label>

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Piso/s</label>
        <div className="flex flex-col gap-2">
          {data.floors.map((floor, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFloorChange(index, floor - 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                −
              </button>
              <input
                type="number"
                value={floor}
                onChange={e =>
                  handleFloorChange(index, parseInt(e.target.value) || 0)
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Piso ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleFloorChange(index, floor + 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFloor}
          className="text-sm text-blue-600 hover:underline self-start"
        >
          + Agregar otro piso
        </button>
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
      >
        Crear ubicación
      </button>
    </form>
  );
}
