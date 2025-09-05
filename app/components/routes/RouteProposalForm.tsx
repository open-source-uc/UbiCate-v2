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
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Proponer nueva ruta</h3>

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
          <label className="block text-sm font-semibold text-gray-900 mb-1">Tipo de ruta</label>
          <select
            value={formData.routeType}
            onChange={(e) => setFormData((prev) => ({ ...prev, routeType: e.target.value as any }))}
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
            placeholder="Describe la ruta propuesta, puntos de referencia, etc."
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

        {startCoordinates && endCoordinates ? (
          <div className="text-sm text-gray-800 bg-gray-100 p-3 rounded border">
            <div className="font-medium mb-1">Coordenadas seleccionadas:</div>
            <div>
              <strong>Inicio:</strong> {startCoordinates[0].toFixed(6)}, {startCoordinates[1].toFixed(6)}
            </div>
            <div>
              <strong>Fin:</strong> {endCoordinates[0].toFixed(6)}, {endCoordinates[1].toFixed(6)}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !startCoordinates || !endCoordinates}
            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-500 disabled:cursor-not-allowed font-medium transition-colors duration-200"
          >
            {isSubmitting ? "Enviando..." : "Proponer ruta"}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
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
