export type BasemapObject = {
  body: BodyInit;
  size: number;
  etag: string;
};

// Dos topologías de deploy: en Cloudflare Workers los .pbf viven en el bucket R2, y en un self-host
// (next start en un VPS/Docker) no hay binding posible, así que salen del disco. La presencia de
// MAP_TILES_DIR es el interruptor; el deploy de Cloudflare no la define y sigue yendo a R2.
const tilesDir = process.env.MAP_TILES_DIR;

async function getFromFilesystem(dir: string, key: string): Promise<BasemapObject | null> {
  // Import dinámico y dentro de la rama: así el bundle del Worker nunca evalúa node:fs.
  const { readFile, stat } = await import("node:fs/promises");
  const path = await import("node:path");

  const root = path.resolve(dir);
  const filePath = path.resolve(root, key);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return null;

  try {
    const [data, stats] = await Promise.all([readFile(filePath), stat(filePath)]);
    return {
      body: new Uint8Array(data),
      size: data.byteLength,
      etag: `W/"${data.byteLength}-${Math.trunc(stats.mtimeMs)}"`,
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    // Un archivo que no está significa lo mismo que un R2.get() que devuelve null.
    if (code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR") return null;
    throw error;
  }
}

async function getFromR2(key: string): Promise<BasemapObject | null> {
  // Import dinámico por el mismo motivo que node:fs, y por uno más: @opennextjs/cloudflare es una
  // devDependency, así que un `npm ci --omit=dev` en el VPS no lo tiene instalado.
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const object = await env.R2.get(key);
  if (!object) return null;
  if (!object.body) return null;

  return { body: object.body, size: object.size, etag: object.httpEtag };
}

export async function getBasemapObject(key: string): Promise<BasemapObject | null> {
  return tilesDir ? getFromFilesystem(tilesDir, key) : getFromR2(key);
}
