// ID de los lugares fijos que siempre deben mostrarse
export const ALWAYS_VISIBLE_IDS = new Set(["OTHER-34012515", "OTHER-32467011", "OTHER-26347017"]);

// Íconos asociados a esos lugares
export const PLACE_ICONS: Record<string, { icon: string; size?: string }> = {
  "OTHER-34012515": { icon: "Baticristo", size: "w-8 h-8" },
  "OTHER-32467011": { icon: "Meones", size: "w-8 h-8" },
  "OTHER-26347017": { icon: "TemploSanJoaquin", size: "w-8 h-8" },
};
