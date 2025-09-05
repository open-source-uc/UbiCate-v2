import { useState } from "react";

import RouteProposalForm from "./RouteProposalForm";

interface ProposeRouteButtonProps {
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  campus?: string;
  className?: string;
}

export default function ProposeRouteButton({
  startCoordinates,
  endCoordinates,
  campus,
  className = "",
}: ProposeRouteButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const handleClick = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <RouteProposalForm
            startCoordinates={startCoordinates}
            endCoordinates={endCoordinates}
            campus={campus}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!startCoordinates || !endCoordinates}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium 
        text-blue-600 bg-blue-50 border border-blue-200 rounded-md 
        hover:bg-blue-100 hover:border-blue-300 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      title="Proponer una nueva ruta para esta ubicación"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Proponer ruta
    </button>
  );
}
