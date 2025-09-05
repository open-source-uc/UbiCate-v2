interface RoutingSourceIndicatorProps {
  source: "internal_graph" | "mapbox_api" | undefined;
  className?: string;
}

export default function RoutingSourceIndicator({ source, className = "" }: RoutingSourceIndicatorProps) {
  if (!source) return null;

  const isInternal = source === "internal_graph";

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full
        ${
          isInternal
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-blue-100 text-blue-700 border border-blue-200"
        }
        ${className}
      `}
    >
      <div className={`w-2 h-2 rounded-full ${isInternal ? "bg-green-500" : "bg-blue-500"}`} />
      {isInternal ? "Ruta optimizada UC" : "Ruta externa"}
    </div>
  );
}
