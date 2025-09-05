import { useState } from "react";

import type { MapRef } from "react-map-gl/maplibre";

import InteractiveRouteProposalForm from "./InteractiveRouteProposalForm";
import RouteProposalForm from "./RouteProposalForm";
import RouteProposalVisualization from "./RouteProposalVisualization";

interface ProposeRouteButtonProps {
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  campus?: string;
  className?: string;
  mapRef?: React.RefObject<MapRef | null>;
  interactive?: boolean; // Whether to use interactive mode
}

export default function ProposeRouteButton({
  startCoordinates,
  endCoordinates,
  campus,
  className = "",
  mapRef,
  interactive = false,
}: ProposeRouteButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [visualizationData, setVisualizationData] = useState<{
    selectedPoints: [number, number][];
    proposalType: "node" | "edge";
    selectionMode: "none" | "first_point" | "second_point";
    currentMousePosition?: [number, number];
  }>({
    selectedPoints: startCoordinates && endCoordinates ? [startCoordinates, endCoordinates] : [],
    proposalType: "edge",
    selectionMode: "none",
  });

  const handleClick = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setVisualizationData({
      selectedPoints: startCoordinates && endCoordinates ? [startCoordinates, endCoordinates] : [],
      proposalType: "edge",
      selectionMode: "none",
    });
  };

  if (showForm) {
    return (
      <>
        {/* Map visualization overlay - only show when using interactive mode */}
        {interactive === true && <RouteProposalVisualization {...visualizationData} />}

        {/* Form modal */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {interactive ? (
              <InteractiveRouteProposalForm
                mapRef={mapRef}
                campus={campus}
                onClose={handleClose}
                onStateChange={setVisualizationData}
              />
            ) : (
              // Legacy form for backward compatibility
              <LegacyRouteProposalForm
                startCoordinates={startCoordinates}
                endCoordinates={endCoordinates}
                campus={campus}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!interactive && (!startCoordinates || !endCoordinates)}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium 
        text-blue-600 bg-blue-50 border border-blue-200 rounded-md 
        hover:bg-blue-100 hover:border-blue-300 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${interactive ? "border-2 border-blue-300 hover:border-blue-400" : ""}
        ${className}
      `}
      title={
        interactive ? "Proponer una nueva ruta de forma interactiva" : "Proponer una nueva ruta para esta ubicación"
      }
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>Proponer ruta</span>
      {interactive === true && (
        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Interactivo</div>
      )}
    </button>
  );
}

// Legacy form component for backward compatibility
interface LegacyRouteProposalFormProps {
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  campus?: string;
  onClose?: () => void;
}

function LegacyRouteProposalForm({ startCoordinates, endCoordinates, campus, onClose }: LegacyRouteProposalFormProps) {
  return (
    <RouteProposalForm
      startCoordinates={startCoordinates}
      endCoordinates={endCoordinates}
      campus={campus}
      onClose={onClose}
    />
  );
}
