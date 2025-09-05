import { Source, Layer } from "react-map-gl/maplibre";

interface RouteProposalVisualizationProps {
  selectedPoints: [number, number][];
  proposalType: "node" | "edge";
  selectionMode: "none" | "first_point" | "second_point";
  currentMousePosition?: [number, number];
}

export default function RouteProposalVisualization({
  selectedPoints,
  proposalType,
  selectionMode,
  currentMousePosition,
}: RouteProposalVisualizationProps) {
  // Create separate GeoJSON collections for different point types
  const startPointsGeoJSON = {
    type: "FeatureCollection" as const,
    features: selectedPoints.slice(0, 1).map((point) => ({
      type: "Feature" as const,
      properties: { type: "start" },
      geometry: {
        type: "Point" as const,
        coordinates: point,
      },
    })),
  };

  const endPointsGeoJSON = {
    type: "FeatureCollection" as const,
    features: selectedPoints.slice(1, 2).map((point) => ({
      type: "Feature" as const,
      properties: { type: "end" },
      geometry: {
        type: "Point" as const,
        coordinates: point,
      },
    })),
  };

  const nodePointsGeoJSON = {
    type: "FeatureCollection" as const,
    features:
      proposalType === "node"
        ? selectedPoints.map((point) => ({
            type: "Feature" as const,
            properties: { type: "node" },
            geometry: {
              type: "Point" as const,
              coordinates: point,
            },
          }))
        : [],
  };

  // Create separate GeoJSON for completed and preview routes
  const completedRouteGeoJSON = {
    type: "FeatureCollection" as const,
    features:
      proposalType === "edge" && selectedPoints.length === 2
        ? [
            {
              type: "Feature" as const,
              properties: { type: "completed_route" },
              geometry: {
                type: "LineString" as const,
                coordinates: selectedPoints,
              },
            },
          ]
        : [],
  };

  const previewRouteGeoJSON = {
    type: "FeatureCollection" as const,
    features:
      proposalType === "edge" && selectedPoints.length === 1 && selectionMode === "second_point" && currentMousePosition
        ? [
            {
              type: "Feature" as const,
              properties: { type: "preview_route" },
              geometry: {
                type: "LineString" as const,
                coordinates: [selectedPoints[0], currentMousePosition],
              },
            },
          ]
        : [],
  };

  const startPointLayerStyle = {
    id: "route-proposal-start-points",
    type: "circle" as const,
    paint: {
      "circle-radius": 8,
      "circle-color": "#10B981", // Green for start
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
    },
  } as const;

  const endPointLayerStyle = {
    id: "route-proposal-end-points",
    type: "circle" as const,
    paint: {
      "circle-radius": 8,
      "circle-color": "#EF4444", // Red for end
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
    },
  } as const;

  const nodePointLayerStyle = {
    id: "route-proposal-node-points",
    type: "circle" as const,
    paint: {
      "circle-radius": 8,
      "circle-color": "#3B82F6", // Blue for nodes
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
    },
  } as const;

  const completedRouteLayerStyle = {
    id: "route-proposal-line",
    type: "line" as const,
    paint: {
      "line-color": "#3B82F6",
      "line-width": 4,
      "line-opacity": 0.8,
    },
  } as const;

  const previewRouteLayerStyle = {
    id: "route-proposal-preview",
    type: "line" as const,
    paint: {
      "line-color": "#9CA3AF",
      "line-width": 3,
      "line-opacity": 0.6,
      "line-dasharray": [2, 2] as number[],
    },
  } as const;

  return (
    <>
      {/* Start points (green) */}
      {proposalType === "edge" && startPointsGeoJSON.features.length > 0 && (
        <Source id="route-proposal-start-points" type="geojson" data={startPointsGeoJSON}>
          <Layer {...startPointLayerStyle} />
        </Source>
      )}

      {/* End points (red) */}
      {proposalType === "edge" && endPointsGeoJSON.features.length > 0 && (
        <Source id="route-proposal-end-points" type="geojson" data={endPointsGeoJSON}>
          <Layer {...endPointLayerStyle} />
        </Source>
      )}

      {/* Node points (blue) */}
      {proposalType === "node" && nodePointsGeoJSON.features.length > 0 && (
        <Source id="route-proposal-node-points" type="geojson" data={nodePointsGeoJSON}>
          <Layer {...nodePointLayerStyle} />
        </Source>
      )}

      {/* Completed route lines */}
      {proposalType === "edge" && completedRouteGeoJSON.features.length > 0 && (
        <Source id="route-proposal-completed-lines" type="geojson" data={completedRouteGeoJSON}>
          <Layer {...completedRouteLayerStyle} />
        </Source>
      )}

      {/* Preview route lines */}
      {proposalType === "edge" && previewRouteGeoJSON.features.length > 0 && (
        <Source id="route-proposal-preview-lines" type="geojson" data={previewRouteGeoJSON}>
          <Layer {...previewRouteLayerStyle} />
        </Source>
      )}
    </>
  );
}
