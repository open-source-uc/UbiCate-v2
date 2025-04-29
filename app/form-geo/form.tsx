"use client";

import { use, useActionState, useState } from "react";

import MarkDownComponent from "@/app/components/markDown";
import { CategoryOptions, CategoryToDisplayName } from "@/utils/types";

import { pinsContext } from "../context/pinsCtx";

import { SubmitButton } from "./submitButton";

export default function Formulario() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    visible: boolean;
  } | null>(null);
  const [data, setData] = useState<{
    name: string;
    information: string;
    categories: string[];
    floors: (number | "")[];
  }>({
    name: "",
    information: "",
    categories: [""],
    floors: [1],
  });
  const { pins } = use(pinsContext);

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...data.categories];
    newCategories[index] = value;
    setData((prev) => ({
      ...prev,
      categories: newCategories,
    }));
  };

  // Función para añadir una nueva categoría
  const addCategory = () => {
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, ""],
    }));
  };

  // Función para eliminar una categoría
  const removeCategory = (index: number) => {
    if (data.categories.length > 1) {
      const newCategories = [...data.categories];
      newCategories.splice(index, 1);
      setData((prev) => ({
        ...prev,
        categories: newCategories,
      }));
    }
  };

  const handleFloorChange = (index: number, value: number | "") => {
    const newFloors = [...data.floors];
    newFloors[index] = value;
    setData((prev) => ({
      ...prev,
      floors: newFloors,
    }));
  };

  const addFloor = () => {
    setData((prev) => ({
      ...prev,
      floors: [...prev.floors, 1],
    }));
  };

  // Función para eliminar un piso
  const removeFloor = (index: number) => {
    if (data.floors.length > 1) {
      const newFloors = [...data.floors];
      newFloors.splice(index, 1);
      setData((prev) => ({
        ...prev,
        floors: newFloors,
      }));
    }
  };

  const [state, action, pending] = useActionState(async (_) => {
    console.log(pins);
    try {
      const response = await fetch("/api/ubicate", {
        method: "POST",
        body: JSON.stringify({
          data: data,
          points: pins,
        }),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Ubicación creada",
          visible: true,
        });
      } else {
        const errorData = await response.json();
        setNotification({
          type: "error",
          message: `${errorData.message || "Ha ocurrido un error"}`,
          visible: true,
        });
      }

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification((prev) => (prev ? { ...prev, visible: false } : null));
      }, 5000);
    } catch (error) {
      setNotification({
        type: "error",
        message: "Error: Ha ocurrido un error de conexión",
        visible: true,
      });

      setTimeout(() => {
        setNotification((prev) => (prev ? { ...prev, visible: false } : null));
      }, 5000);
    }
  }, {});

  return (
    <>
      {notification && notification.visible ? (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-4 text-center ${
            notification.type === "success" ? "bg-success" : "bg-error"
          } text-white`}
        >
          {notification.message}
        </div>
      ) : null}

      <form className="space-y-4 text-md px-3 py-5" action={action}>
        <h1 className="text-2xl font-bold text-center text-white-ubi">¡Nueva Ubicación!</h1>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-white-ubi" htmlFor="placeName">
            Nombre de la Ubicación
          </label>
          <p className="text-xs text-white-ubi italic text-center">
            Ejemplo: &quot;Sala de Estudio&quot;, &quot;Fork&quot;, &quot;Departamento de Ciencia de la
            Computación&quot;
          </p>
          <input
            id="placeName"
            type="text"
            value={data.name}
            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
            className="block p-3 w-full text-sm rounded-lg border border-brown-light dark:text-light-4 focus:ring-blue-location focus:outline-hidden focus:ring-2"
            placeholder="Ej: K203, Biblioteca, Sala Álvaro Campos..."
            max={20}
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-white-ubi" htmlFor="categories">
            Categorías
          </label>
          <p className="text-xs text-white-ubi text-center italic">
            Selecciona las categorías que consideres que corresponden
          </p>

          {data.categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2 w-full">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                className="block p-3 w-full text-sm rounded-lg border border-brown-light focus:ring-blue-location focus:outline-hidden focus:ring-2 bg-brown-dark"
              >
                <option value="">Seleccionar categoría</option>
                {CategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {CategoryToDisplayName.get(option)}
                  </option>
                ))}
              </select>

              {data.categories.length > 1 && (
                <button
                  type="button"
                  className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  onClick={() => removeCategory(index)}
                >
                  x
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addCategory} className="text-sm text-blue-location hover:underline self-start">
            + Agregar otra categoría
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-white-ubi" htmlFor="floor">
            Piso/s
          </label>
          <p className="text-xs text-white-ubi text-center italic">
            Si corresponde, selecciona el piso en el que se encuentra la ubicación
          </p>
          {data.floors.map((floor, index) => (
            <div key={index} className="flex items-center gap-2 w-full">
              <input
                type="number"
                value={floor}
                onChange={(e) => handleFloorChange(index, parseInt(e.target.value) || "")}
                className="block p-3 w-full text-sm rounded-lg border border-brown-light focus:ring-blue-location focus:outline-hidden focus:ring-2"
                placeholder={`Piso ${index + 1}`}
                min={-10}
                max={20}
              />
              <button
                type="button"
                className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                onClick={() => handleFloorChange(index, (floor || 1) - 1 === 0 ? -1 : (floor || 1) - 1)}
              >
                -
              </button>
              <button
                type="button"
                className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                onClick={() => handleFloorChange(index, (floor || 1) + 1 === 0 ? 1 : (floor || 1) + 1)}
              >
                +
              </button>

              {data.floors.length > 1 && (
                <button
                  type="button"
                  className="w-12 h-12 bg-transparent border border-brown-light text-white-ubi rounded-full focus:ring-blue-location focus:outline-hidden focus:ring-2 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  onClick={() => removeFloor(index)}
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addFloor} className="text-sm text-blue-location hover:underline self-start">
            + Agregar otro piso
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-center text-md font-medium text-white-ubi" htmlFor="information">
            Descripción (Opcional)
          </label>
          <p className="text-xs text-white-ubi text-center italic">
            ¡Cuéntanos más sobre esta ubicación!
            <br />- Soporta markdown -
          </p>

          <div className="flex justify-end mb-2 space-x-2">
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm ${
                !isPreviewMode
                  ? "bg-blue-location text-white"
                  : "bg-transparent border border-brown-light text-white-ubi"
              }`}
              onClick={() => setIsPreviewMode(false)}
            >
              Editar
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm ${
                isPreviewMode
                  ? "bg-blue-location text-white"
                  : "bg-transparent border border-brown-light text-white-ubi"
              }`}
              onClick={() => setIsPreviewMode(true)}
            >
              Vista Previa
            </button>
          </div>

          {isPreviewMode ? (
            <div className="bg-brown-medium rounded-md p-4 min-[h-20]">
              <MarkDownComponent>{data.information}</MarkDownComponent>
            </div>
          ) : (
            <textarea
              value={data.information}
              onChange={(e) => setData((prev) => ({ ...prev, information: e.target.value }))}
              className="w-full field-sizing-content text-sm resize-none min-h-20 p-2 rounded-lg border border-brown-light dark:text-light-4 focus:ring-blue-location focus:outline-hidden focus:ring-2"
              placeholder="Puedes usar Markdown aquí..."
              rows={4}
              maxLength={1024}
            />
          )}
        </div>
        <SubmitButton fallback="Procesando...">Crear Ubicacion</SubmitButton>
      </form>
    </>
  );
}
