import { useState } from "react";

interface RouteProposalFormProps {
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  campus?: string;
  onClose?: () => void;
}

export default function RouteProposalForm({
  startCoordinates,
  endCoordinates,
  campus,
  onClose,
}: RouteProposalFormProps) {
  const [formData, setFormData] = useState({
    campus: campus || "",
    routeType: "walkway" as const,
    description: "",
    userEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startCoordinates || !endCoordinates) {
      setMessage({ type: "error", text: "Se requieren coordenadas de inicio y fin" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/routes/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startCoordinates,
          endCoordinates,
        }),
      });

      const result = (await response.json()) as { message: string };

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        // Reset form
        setFormData({
          campus: campus || "",
          routeType: "walkway",
          description: "",
          userEmail: "",
        });
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

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Proponer nueva ruta</h3>

      {message ? (
        <div
          className={`p-3 rounded mb-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campus</label>
          <input
            type="text"
            value={formData.campus}
            onChange={(e) => setFormData((prev) => ({ ...prev, campus: e.target.value }))}
            placeholder="Código del campus (ej: SJ, LC)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de ruta</label>
          <select
            value={formData.routeType}
            onChange={(e) => setFormData((prev) => ({ ...prev, routeType: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {routeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe la ruta propuesta, puntos de referencia, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email (opcional)</label>
          <input
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
            placeholder="tu@email.com (para seguimiento)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {startCoordinates && endCoordinates ? (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div>
              Inicio: {startCoordinates[0].toFixed(6)}, {startCoordinates[1].toFixed(6)}
            </div>
            <div>
              Fin: {endCoordinates[0].toFixed(6)}, {endCoordinates[1].toFixed(6)}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !startCoordinates || !endCoordinates}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Proponer ruta"}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
