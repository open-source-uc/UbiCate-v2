import { useState } from "react";

import type { MapRef } from "react-map-gl/maplibre";

import InteractiveRouteProposalForm from "./InteractiveRouteProposalForm";
import RouteProposalVisualization from "./RouteProposalVisualization";

interface InteractiveProposalButtonProps {
  mapRef?: React.RefObject<MapRef | null>;
  campus?: string;
  className?: string;
  onProposalStateChange?: (isActive: boolean) => void;
}

export default function InteractiveProposalButton({
  mapRef,
  campus,
  className = "",
  onProposalStateChange,
}: InteractiveProposalButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [visualizationData, setVisualizationData] = useState<{
    selectedPoints: [number, number][];
    proposalType: "node" | "edge";
    selectionMode: "none" | "first_point" | "second_point";
    currentMousePosition?: [number, number];
  }>({
    selectedPoints: [],
    proposalType: "edge",
    selectionMode: "none",
  });

  const handleClick = () => {
    setShowForm(true);
    onProposalStateChange?.(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setVisualizationData({
      selectedPoints: [],
      proposalType: "edge",
      selectionMode: "none",
    });
    onProposalStateChange?.(false);
  };

  if (showForm) {
    return (
      <>
        {/* Map visualization overlay */}
        <RouteProposalVisualization {...visualizationData} />

        {/* Form modal */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <InteractiveRouteProposalForm
              mapRef={mapRef}
              campus={campus}
              onClose={handleClose}
              onStateChange={setVisualizationData}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-3 text-sm font-medium 
        text-blue-700 bg-blue-50 border-2 border-blue-300 rounded-lg 
        hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800
        active:bg-blue-200 active:border-blue-500
        transition-all duration-200 shadow-sm hover:shadow-md
        ${className}
      `}
      title="Proponer una nueva ruta o punto de interés en el mapa"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>Proponer ruta</span>
      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Interactivo</div>
    </button>
  );
}
