// Graph-based routing system for campus navigation
// Implements campus-specific routing using nodes and edges

export interface GraphNode {
  id: string;
  coordinates: [number, number];
  name?: string;
  type: 'building_entrance' | 'path_intersection' | 'landmark' | 'custom';
  campus: string;
}

export interface GraphEdge {
  id: string;
  from: string; // node id
  to: string; // node id
  weight: number; // distance in meters
  type: 'walkway' | 'stairs' | 'elevator' | 'covered_path' | 'outdoor_path';
  bidirectional: boolean;
  userProposed?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard'; // accessibility consideration
}

export interface CampusGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacencyList: Map<string, string[]>; // node id -> connected edge ids
}

export interface RouteResult {
  path: GraphNode[];
  totalDistance: number;
  estimatedTime: number; // in minutes
  edges: GraphEdge[];
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (coord1[1] * Math.PI) / 180;
  const lat2Rad = (coord2[1] * Math.PI) / 180;
  const deltaLatRad = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const deltaLonRad = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the closest node to given coordinates
export function findClosestNode(
  coordinates: [number, number], 
  graph: CampusGraph
): GraphNode | null {
  let closestNode: GraphNode | null = null;
  let minDistance = Infinity;

  for (const node of graph.nodes.values()) {
    const distance = calculateDistance(coordinates, node.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode;
}

// Dijkstra's algorithm for finding shortest path
export function findShortestPath(
  startNodeId: string,
  endNodeId: string,
  graph: CampusGraph
): RouteResult | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const queue = new Set<string>();

  // Initialize distances
  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    previous.set(nodeId, null);
    queue.add(nodeId);
  }

  while (queue.size > 0) {
    // Find unvisited node with minimum distance
    let currentNode: string | null = null;
    let minDistance = Infinity;
    
    for (const nodeId of queue) {
      const distance = distances.get(nodeId) || Infinity;
      if (distance < minDistance) {
        minDistance = distance;
        currentNode = nodeId;
      }
    }

    if (!currentNode || minDistance === Infinity) break;

    queue.delete(currentNode);
    visited.add(currentNode);

    if (currentNode === endNodeId) break;

    // Check all neighbors
    const connectedEdges = graph.adjacencyList.get(currentNode) || [];
    
    for (const edgeId of connectedEdges) {
      const edge = graph.edges.get(edgeId);
      if (!edge) continue;

      const neighborId = edge.from === currentNode ? edge.to : edge.from;
      
      // Skip if not bidirectional and direction is wrong
      if (!edge.bidirectional && edge.from !== currentNode) continue;
      
      if (visited.has(neighborId)) continue;

      const newDistance = (distances.get(currentNode) || 0) + edge.weight;
      
      if (newDistance < (distances.get(neighborId) || Infinity)) {
        distances.set(neighborId, newDistance);
        previous.set(neighborId, currentNode);
      }
    }
  }

  // Reconstruct path
  if (!previous.get(endNodeId)) return null;

  const path: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let currentId: string | null = endNodeId;

  while (currentId) {
    const node = graph.nodes.get(currentId);
    if (node) path.unshift(node);

    const prevId = previous.get(currentId);
    if (prevId) {
      // Find the edge between prevId and currentId
      const connectedEdges = graph.adjacencyList.get(prevId) || [];
      for (const edgeId of connectedEdges) {
        const edge = graph.edges.get(edgeId);
        if (edge && ((edge.from === prevId && edge.to === currentId) || 
                     (edge.to === prevId && edge.from === currentId && edge.bidirectional))) {
          edges.unshift(edge);
          break;
        }
      }
    }

    currentId = prevId || null;
  }

  const totalDistance = distances.get(endNodeId) || 0;
  const estimatedTime = Math.ceil(totalDistance / 80); // Assuming 80m/min walking speed

  return {
    path,
    totalDistance,
    estimatedTime,
    edges
  };
}

// Create a graph from JSON data
export function createGraphFromData(graphData: any): CampusGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const adjacencyList = new Map<string, string[]>();

  // Load nodes
  if (graphData.nodes) {
    for (const nodeData of graphData.nodes) {
      nodes.set(nodeData.id, nodeData);
      adjacencyList.set(nodeData.id, []);
    }
  }

  // Load edges
  if (graphData.edges) {
    for (const edgeData of graphData.edges) {
      edges.set(edgeData.id, edgeData);
      
      // Update adjacency list
      if (!adjacencyList.has(edgeData.from)) {
        adjacencyList.set(edgeData.from, []);
      }
      adjacencyList.get(edgeData.from)!.push(edgeData.id);

      if (edgeData.bidirectional) {
        if (!adjacencyList.has(edgeData.to)) {
          adjacencyList.set(edgeData.to, []);
        }
        adjacencyList.get(edgeData.to)!.push(edgeData.id);
      }
    }
  }

  return { nodes, edges, adjacencyList };
}

// Convert route to GeoJSON LineString for map display
export function routeToGeoJSON(route: RouteResult) {
  const coordinates = route.path.map(node => node.coordinates);
  
  return {
    type: "Feature",
    properties: {
      distance: route.totalDistance,
      estimatedTime: route.estimatedTime
    },
    geometry: {
      type: "LineString",
      coordinates
    }
  };
}