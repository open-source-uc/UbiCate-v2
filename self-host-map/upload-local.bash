#!/bin/bash

LOCAL_TILES="./ubicate-tiles"
LOCAL_GLYPHS="./glyphs"
BUCKET="v2-ubicate"

echo "Seleccione opción de subida:"
echo "1) --local"
echo "2) --remote"

read -p "Ingrese opción (1 o 2): " opcion

case "$opcion" in
  1)
    OPCION_FLAG="--local"
    ;;
  2)
    OPCION_FLAG="--remote"
    ;;
  *)
    echo "Opción inválida."
    exit 1
    ;;
esac

# Función para subir archivos con content-type específico
upload_files() {
  local local_dir=$1
  local bucket_path=$2
  local content_type=$3
  local content_encoding=$4
  
  if [ ! -d "$local_dir" ]; then
    echo "⚠️  Directorio $local_dir no existe, saltando..."
    return
  fi
  
  echo "📁 Subiendo archivos desde $local_dir..."
  
  find "$local_dir" -type f | while read -r FILE; do
    REL="${FILE#$local_dir/}"
    echo "📤 Subiendo $REL con content-type: $content_type..."
    
    if [ -n "$content_encoding" ]; then
      wrangler r2 object put "$BUCKET/$bucket_path/$REL" \
        --file="$FILE" \
        --content-type="$content_type" \
        --content-encoding="$content_encoding" \
        $OPCION_FLAG
    else
      wrangler r2 object put "$BUCKET/$bucket_path/$REL" \
        --file="$FILE" \
        --content-type="$content_type" \
        $OPCION_FLAG
    fi
    
    if [ $? -eq 0 ]; then
      echo "✅ $REL subido correctamente"
    else
      echo "❌ Error subiendo $REL"
    fi
  done
}

echo "🚀 Iniciando subida con flag $OPCION_FLAG..."
echo "=================================="

# Subir tiles
upload_files "$LOCAL_TILES" "ubicate-tiles" "application/x-protobuf" ""

echo "=================================="

# Subir glyphs (sin gzip, ya que los PBF de glyphs suelen ser pequeños)
upload_files "$LOCAL_GLYPHS" "glyphs" "application/x-protobuf" ""

echo "=================================="
echo "🎉 Subida completada!"
echo "Revisa los logs para verificar el estado de cada archivo."
echo "=================================="