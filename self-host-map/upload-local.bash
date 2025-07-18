#!/bin/bash

LOCAL="./ubicate-tiles"
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

find "$LOCAL" -type f | while read -r FILE; do
  REL="${FILE#$LOCAL/}"
  echo "Subiendo $REL con metadata y flag $OPCION_FLAG..."
  wrangler r2 object put "$BUCKET/ubicate-tiles/$REL" \
    --file="$FILE" \
    --content-type=application/x-protobuf \
    --content-encoding=gzip \
    $OPCION_FLAG
done
