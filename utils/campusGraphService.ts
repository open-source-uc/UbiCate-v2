import { 
  CampusGraph, 
  GraphNode, 
  RouteResult, 
  createGraphFromData, 
  findClosestNode, 
  findShortestPath,
  calculateDistance,
  routeToGeoJSON 
} from './campusGraph';

// Import the campus graphs data
import campusGraphsData from '@/data/campusGraphs.json';

class CampusGraphService {
  private graphs: Map<string, CampusGraph> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load all campus graphs
      for (const [campusCode, graphData] of Object.entries(campusGraphsData.graphs)) {
        const graph = createGraphFromData(graphData);
        this.graphs.set(campusCode, graph);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize campus graphs:', error);
      throw error;
    }
  }

  // Get graph for a specific campus
  getGraph(campus: string): CampusGraph | null {
    return this.graphs.get(campus) || null;
  }

  // Find route within a campus using the graph
  async findInternalRoute(
    startCoordinates: [number, number],
    endCoordinates: [number, number],
    campus: string
  ): Promise<RouteResult | null> {
    await this.initialize();

    const graph = this.getGraph(campus);
    if (!graph) {
      console.log(`No graph available for campus: ${campus}`);
      return null;
    }

    // Find closest nodes to start and end points
    const startNode = findClosestNode(startCoordinates, graph);
    const endNode = findClosestNode(endCoordinates, graph);

    if (!startNode || !endNode) {
      console.log('Could not find close nodes for routing');
      return null;
    }

    // Check if the closest nodes are reasonably close (within 200m)
    const startDistance = calculateDistance(startCoordinates, startNode.coordinates);
    const endDistance = calculateDistance(endCoordinates, endNode.coordinates);

    if (startDistance > 200 || endDistance > 200) {
      console.log('Start or end point too far from graph nodes');
      return null;
    }

    // Find the shortest path
    const route = findShortestPath(startNode.id, endNode.id, graph);
    if (!route) {
      console.log('No route found in graph');
      return null;
    }

    // Add the actual start and end coordinates to the route
    // Insert start coordinates if different from first node
    if (startDistance > 10) {
      route.path.unshift({
        id: 'start_point',
        coordinates: startCoordinates,
        type: 'custom',
        campus
      });
      route.totalDistance += startDistance;
    }

    // Add end coordinates if different from last node
    if (endDistance > 10) {
      route.path.push({
        id: 'end_point',
        coordinates: endCoordinates,
        type: 'custom',
        campus
      });
      route.totalDistance += endDistance;
    }

    // Recalculate estimated time
    route.estimatedTime = Math.ceil(route.totalDistance / 80); // 80m/min walking speed

    return route;
  }

  // Check if internal routing is available for given coordinates
  async isInternalRoutingAvailable(
    startCoordinates: [number, number],
    endCoordinates: [number, number],
    campus: string
  ): Promise<boolean> {
    await this.initialize();

    const graph = this.getGraph(campus);
    if (!graph) return false;

    const startNode = findClosestNode(startCoordinates, graph);
    const endNode = findClosestNode(endCoordinates, graph);

    if (!startNode || !endNode) return false;

    const startDistance = calculateDistance(startCoordinates, startNode.coordinates);
    const endDistance = calculateDistance(endCoordinates, endNode.coordinates);

    // Both points should be within 200m of graph nodes
    return startDistance <= 200 && endDistance <= 200;
  }

  // Convert internal route to format compatible with existing components
  routeToLineFeature(route: RouteResult) {
    return routeToGeoJSON(route);
  }

  // Get all available campus codes with graphs
  getAvailableCampuses(): string[] {
    return Array.from(this.graphs.keys());
  }

  // Add a new edge (for user-proposed routes)
  async proposeRoute(
    campusCode: string,
    startCoordinates: [number, number],
    endCoordinates: [number, number],
    routeType: 'walkway' | 'stairs' | 'elevator' | 'covered_path' | 'outdoor_path' = 'walkway'
  ): Promise<{ edgeId: string; weight: number } | null> {
    const graph = this.getGraph(campusCode);
    if (!graph) return null;

    // Find or create nodes for the coordinates
    let startNode = findClosestNode(startCoordinates, graph);
    let endNode = findClosestNode(endCoordinates, graph);

    const nodeCreationThreshold = 50; // 50m threshold for creating new nodes

    // Create start node if too far from existing
    if (!startNode || calculateDistance(startCoordinates, startNode.coordinates) > nodeCreationThreshold) {
      const nodeId = `user_node_${Date.now()}_start`;
      startNode = {
        id: nodeId,
        coordinates: startCoordinates,
        type: 'custom',
        campus: campusCode
      };
      graph.nodes.set(nodeId, startNode);
      graph.adjacencyList.set(nodeId, []);
    }

    // Create end node if too far from existing
    if (!endNode || calculateDistance(endCoordinates, endNode.coordinates) > nodeCreationThreshold) {
      const nodeId = `user_node_${Date.now()}_end`;
      endNode = {
        id: nodeId,
        coordinates: endCoordinates,
        type: 'custom',
        campus: campusCode
      };
      graph.nodes.set(nodeId, endNode);
      graph.adjacencyList.set(nodeId, []);
    }

    // Calculate distance for the new edge
    const weight = calculateDistance(startNode.coordinates, endNode.coordinates);

    // Create the new edge
    const edgeId = `user_edge_${Date.now()}`;
    const newEdge = {
      id: edgeId,
      from: startNode.id,
      to: endNode.id,
      weight,
      type: routeType,
      bidirectional: true,
      userProposed: true
    };

    // Add edge to graph
    graph.edges.set(edgeId, newEdge);
    graph.adjacencyList.get(startNode.id)!.push(edgeId);
    graph.adjacencyList.get(endNode.id)!.push(edgeId);

    return { edgeId, weight };
  }
}

// Singleton instance
export const campusGraphService = new CampusGraphService();