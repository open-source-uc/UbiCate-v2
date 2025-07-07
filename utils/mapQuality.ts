/* Map Quality Enhancement Script */
// This script should be loaded after the map is initialized

export function enhanceMapQuality(map: mapboxgl.Map) {
  if (!map) return;

  // Force high-quality rendering
  const canvas = map.getCanvas();
  const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
  
  if (gl) {
    // Ensure high pixel ratio for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size based on pixel ratio
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;
    
    // Apply CSS styles for crisp rendering
    canvas.style.imageRendering = "auto";
    canvas.style.imageRendering = "-webkit-optimize-contrast";
    
    // Force a repaint
    map.triggerRepaint();
  }
  
  // Handle dynamic pixel ratio changes (e.g., moving between displays)
  const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  mediaQuery.addEventListener("change", () => {
    setTimeout(() => {
      enhanceMapQuality(map);
      map.resize();
    }, 100);
  });
}

export function setupMapQualityObserver(map: mapboxgl.Map) {
  // Observer to maintain quality when DOM changes
  const observer = new MutationObserver(() => {
    enhanceMapQuality(map);
  });
  
  observer.observe(map.getContainer(), {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  
  return observer;
}
