# Configuración de Mapas Auto-hospedados

Este directorio contiene los tiles de mapas auto-hospedados y los glyphs de fuentes para el proyecto UbiCate. Incluye tiles de mapas pre-construidos y glyphs de fuente OpenSans para despliegues offline o auto-hospedados.

## 📁 Estructura del Directorio

- `ubicate-tiles/` - Tiles de mapas en formato Protobuf (.pbf)
- `glyphs/` - Glyphs de fuente para renderizado de mapas
- `OpenSans-Regular.ttf` - Archivo fuente original
- `upload-local.bash` - Script de subida para Cloudflare R2
- `*.zip` - Archivos comprimidos de tiles y glyphs

## 🚀 Inicio Rápido

### Configuración Inicial

1. **Extraer archivos comprimidos:**
   ```bash
   unzip ubicate-tiles.zip
   unzip glyphs.zip
   ```

2. **Verificar compresión de archivos:**
   ```bash
   file nombre_archivo
   ```

## 🗺️ Trabajando con Tiles de Mapas

### Entendiendo el Formato de Tiles

Los tiles de mapas se extraen del formato MBTiles y vienen comprimidos con gzip. Debido a las limitaciones de Next.js con headers personalizados, los tiles necesitan ser descomprimidos para ser servidos correctamente.

### Comandos de Procesamiento de Tiles

1. **Renombrar archivos .pbf a .pbf.gz:**
   ```bash
   find ./ubicate-tiles -type f -name "*.pbf" -exec bash -c 'mv "$0" "${0%.pbf}.pbf.gz"' {} \;
   ```

2. **Descomprimir archivos gzipeados:**
   ```bash
   find ./ubicate-tiles -type f -name "*.pbf.gz" -exec gunzip -k {} \;
   ```

3. **Limpiar archivos comprimidos:**
   ```bash
   find ./ubicate-tiles -type f -name "*.pbf.gz" -delete
   ```

### Pipeline Completo de Procesamiento de Tiles

```bash
# Procesar todos los tiles de una vez
find ./ubicate-tiles -type f -name "*.pbf" -exec bash -c 'mv "$0" "${0%.pbf}.pbf.gz"' {} \; && \
find ./ubicate-tiles -type f -name "*.pbf.gz" -exec gunzip -k {} \; && \
find ./ubicate-tiles -type f -name "*.pbf.gz" -delete
```

## 🔤 Generación de Glyphs de Fuente

### Prerequisitos

Instalar el paquete fontnik globalmente:
```bash
npm install -g fontnik
```

### Generar Glyphs

Crear glyphs de fuente desde archivo TrueType:
```bash
build-glyphs OpenSans-Regular.ttf ./glyphs
```

Esto generará glyphs en formato Protocol Buffer en el directorio `./glyphs`.

## 📤 Opciones de Despliegue

### Desarrollo Local

Subir al entorno de desarrollo local:
```bash
bash upload-local.bash
```

El script te pedirá elegir entre:
- `--local` - Subir a desarrollo local
- `--remote` - Subir al entorno remoto

### Despliegue en Producción

#### Usando rclone (Método Alternativo)

1. **Subir tiles a Cloudflare R2:**
   ```bash
   rclone copy ./ubicate-tiles ubicate:ubicate-tiles
   ```

2. **Subir glyphs de fuente a Cloudflare R2:**
   ```bash
   rclone copy ./glyphs ubicate:glyphs
   ```

#### Usando Wrangler (Recomendado)

El script `upload-local.bash` usa Wrangler CLI para subir archivos con los tipos de contenido apropiados:
- Tiles: `application/x-protobuf`
- Glyphs: `application/x-protobuf`

## 🔧 Solución de Problemas

### Problemas Comunes

1. **Problemas de Compresión Gzip:**
   - Asegurar que los tiles estén correctamente descomprimidos antes de servir
   - Verificar que Next.js esté configurado para manejar archivos .pbf

2. **Problemas de Renderizado de Fuente:**
   - Verificar que los glyphs estén correctamente generados con fontnik
   - Asegurar que los headers de content-type estén configurados correctamente

3. **Fallas de Subida:**
   - Verificar autenticación de Wrangler
   - Verificar permisos del bucket R2
   - Asegurar que las rutas de archivos sean correctas

### Verificación de Archivos

Verificar si un archivo está comprimido con gzip:
```bash
file nombre_archivo
```

## 🔗 Documentación Relacionada

- [Convertir Fuentes a PBF](https://maplibre.org/font-maker/)
