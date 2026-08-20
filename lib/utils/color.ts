const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** `"#22c55e"` en minúsculas y con 6 dígitos, o `null` si no es un hex válido. Acepta la forma corta. */
export function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value) return null;

  const match = value.trim().match(HEX_RE);
  if (!match) return null;

  const digits = match[1];
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;

  return `#${full.toLowerCase()}`;
}

/**
 * Tono más oscuro del color dado, para los bordes. Es multiplicativo sobre RGB (no una resta fija) para
 * que el resultado siga la saturación del color elegido: `0.38` sobre el verde histórico de las rutas
 * (#22c55e) devuelve casi exactamente el borde que estaba hardcodeado (#0b7a3b).
 *
 * ⚠️ Un color ya muy oscuro (cercano al negro) da un borde indistinguible de la línea. Es aceptable:
 * el borde solo existe para separar la línea del mapa, y ahí el contraste lo pone el fondo.
 */
export function darkenHex(hex: string, amount = 0.38): string {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return hex;

  const factor = Math.min(Math.max(1 - amount, 0), 1);
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(normalized.slice(start, start + 2), 16);
    return Math.round(value * factor)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${channels.join("")}`;
}
