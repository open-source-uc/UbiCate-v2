import { useState, useEffect, useCallback } from "react";

import type { MapRef } from "react-map-gl/maplibre";

interface InteractiveRouteProposalFormProps {
  mapRef?: React.RefObject<MapRef | null>;
  campus?: string;
  onClose?: () => void;
  onStateChange?: (state: {
    selectedPoints: [number, number][];
    proposalType: "node" | "edge";
    selectionMode: "none" | "first_point" | "second_point";
    currentMousePosition?: [number, number];
  }) => void;
}

type ProposalType = "node" | "edge";
type SelectionMode = "none" | "first_point" | "second_point";

interface ProposalFormData {
  campus: string;
  proposalType: ProposalType;
  routeType: string;
  description: string;
  userEmail: string;
}

export default function InteractiveRouteProposalForm({
  mapRef,
  campus,
  onClose,
  onStateChange,
}: InteractiveRouteProposalFormProps) {
  const [formData, setFormData] = useState<ProposalFormData>({
    campus: campus || "",
    proposalType: "edge",
    routeType: "walkway",
    description: "",
    userEmail: "",
  });

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([]);
  const [currentMousePosition, setCurrentMousePosition] = useState<[number, number] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Report state changes to parent
  useEffect(() => {
    onStateChange?.({
      selectedPoints,
      proposalType: formData.proposalType,
      selectionMode,
      currentMousePosition,
    });
  }, [selectedPoints, formData.proposalType, selectionMode, currentMousePosition, onStateChange]);

  // Handle mouse movement for preview line
  const handleMouseMove = useCallback(
    (e: any) => {
      if (selectionMode === "second_point" && formData.proposalType === "edge") {
        const { lng, lat } = e.lngLat;
        setCurrentMousePosition([lng, lat]);
      }
    },
    [selectionMode, formData.proposalType],
  );

  // Handle map clicks for point selection
  const handleMapClick = useCallback(
    (e: any) => {
      if (selectionMode === "none") return;

      const { lng, lat } = e.lngLat;
      const point: [number, number] = [lng, lat];

      if (formData.proposalType === "node") {
        setSelectedPoints([point]);
        setSelectionMode("none");
      } else if (formData.proposalType === "edge") {
        if (selectionMode === "first_point") {
          setSelectedPoints([point]);
          setSelectionMode("second_point");
        } else if (selectionMode === "second_point") {
          setSelectedPoints((prev) => [...prev, point]);
          setSelectionMode("none");
        }
      }
    },
    [selectionMode, formData.proposalType],
  );

  // Add event listener to map
  useEffect(() => {
    const map = mapRef?.current?.getMap();
    if (!map) return;

    if (selectionMode !== "none") {
      map.getCanvas().style.cursor = "crosshair";
      map.on("click", handleMapClick);
      map.on("mousemove", handleMouseMove);
    } else {
      map.getCanvas().style.cursor = "";
      map.off("click", handleMapClick);
      map.off("mousemove", handleMouseMove);
      setCurrentMousePosition(undefined);
    }

    return () => {
      map.off("click", handleMapClick);
      map.off("mousemove", handleMouseMove);
      map.getCanvas().style.cursor = "";
    };
  }, [handleMapClick, handleMouseMove, selectionMode, mapRef]);

  const startSelection = () => {
    setSelectedPoints([]);
    setSelectionMode("first_point");
    setMessage(null);
  };

  const clearSelection = () => {
    setSelectedPoints([]);
    setSelectionMode("none");
    setCurrentMousePosition(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.proposalType === "node" && selectedPoints.length !== 1) {
      setMessage({ type: "error", text: "Selecciona un punto en el mapa" });
      return;
    }

    if (formData.proposalType === "edge" && selectedPoints.length !== 2) {
      setMessage({ type: "error", text: "Selecciona dos puntos en el mapa para crear una ruta" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        ...(formData.proposalType === "node"
          ? { coordinates: selectedPoints[0] }
          : {
              startCoordinates: selectedPoints[0],
              endCoordinates: selectedPoints[1],
            }),
      };

      const response = await fetch("/api/routes/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message: string };

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        // Reset form
        setFormData({
          campus: campus || "",
          proposalType: "edge",
          routeType: "walkway",
          description: "",
          userEmail: "",
        });
        setSelectedPoints([]);
        setSelectionMode("none");
      } else {
        setMessage({ type: "error", text: result.message || "Error al enviar propuesta" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const routeTypeOptions = [
    { value: "walkway", label: "Sendero/Camino" },
    { value: "stairs", label: "Escaleras" },
    { value: "elevator", label: "Ascensor" },
    { value: "covered_path", label: "Camino cubierto" },
    { value: "outdoor_path", label: "Camino exterior" },
  ];

  const getSelectionInstructions = () => {
    if (formData.proposalType === "node") {
      return selectionMode === "first_point"
        ? "Haz clic en el mapa para seleccionar la ubicación del punto"
        : "Selecciona un punto en el mapa";
    } else {
      if (selectionMode === "first_point") {
        return "Haz clic en el mapa para seleccionar el punto de inicio de la ruta";
      } else if (selectionMode === "second_point") {
        return "Haz clic en el mapa para seleccionar el punto final de la ruta";
      }
      return "Selecciona dos puntos en el mapa para crear una ruta";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Proponer nueva ruta</h3>

      {message ? (
        <div
          className={`p-3 rounded mb-4 border-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Proposal Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de propuesta</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, proposalType: "node" }));
                clearSelection();
              }}
              className={`p-3 rounded-md border-2 text-sm font-medium transition-colors ${
                formData.proposalType === "node"
                  ? "bg-blue-100 border-blue-600 text-blue-800"
                  : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">Punto individual</div>
              <div className="text-xs">Agregar un nuevo punto de interés</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, proposalType: "edge" }));
                clearSelection();
              }}
              className={`p-3 rounded-md border-2 text-sm font-medium transition-colors ${
                formData.proposalType === "edge"
                  ? "bg-blue-100 border-blue-600 text-blue-800"
                  : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">Ruta/Conexión</div>
              <div className="text-xs">Conectar dos puntos con una ruta</div>
            </button>
          </div>
        </div>

        {/* Point Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Selección de puntos</label>
          <div className="space-y-2">
            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border">{getSelectionInstructions()}</div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startSelection}
                disabled={selectionMode !== "none"}
                className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-500 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {selectionMode !== "none" ? "Seleccionando..." : "Iniciar selección"}
              </button>

              {selectedPoints.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-md hover:bg-gray-100 font-medium transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Show selected points */}
            {selectedPoints.length > 0 && (
              <div className="text-sm text-gray-800 bg-gray-100 p-3 rounded border">
                <div className="font-medium mb-1">Puntos seleccionados:</div>
                {selectedPoints.map((point, index) => (
                  <div key={index}>
                    <strong>{formData.proposalType === "edge" ? (index === 0 ? "Inicio" : "Final") : "Punto"}:</strong>{" "}
                    {point[0].toFixed(6)}, {point[1].toFixed(6)}
                  </div>
                ))}
                {formData.proposalType === "edge" && selectedPoints.length === 1 && (
                  <div className="text-blue-700 mt-1">Selecciona el punto final en el mapa</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Campus</label>
          <input
            type="text"
            value={formData.campus}
            onChange={(e) => setFormData((prev) => ({ ...prev, campus: e.target.value }))}
            placeholder="Código del campus (ej: SJ, LC)"
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            {formData.proposalType === "node" ? "Tipo de punto" : "Tipo de ruta"}
          </label>
          <select
            value={formData.routeType}
            onChange={(e) => setFormData((prev) => ({ ...prev, routeType: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white"
          >
            {routeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Descripción (opcional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={`Describe ${
              formData.proposalType === "node" ? "el punto" : "la ruta"
            } propuesta, puntos de referencia, etc.`}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Email (opcional)</label>
          <input
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
            placeholder="tu@email.com (para seguimiento)"
            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (formData.proposalType === "node" && selectedPoints.length !== 1) ||
              (formData.proposalType === "edge" && selectedPoints.length !== 2)
            }
            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-500 disabled:cursor-not-allowed font-medium transition-colors duration-200"
          >
            {isSubmitting ? "Enviando..." : `Proponer ${formData.proposalType === "node" ? "punto" : "ruta"}`}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={() => {
                clearSelection();
                onClose();
              }}
              className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-md hover:bg-gray-100 hover:border-gray-500 font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
