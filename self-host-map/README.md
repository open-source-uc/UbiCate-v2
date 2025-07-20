###

Los mapas usados actualmente y la font estan en los zip, usar unzip

###

Para ver si un archivo es gzip
file nombre_archivo

### Tiles

Al sacarlos del mbtiles sale en gzip por lo que hay descomprimir, pues la basura de nextjs xd, no deja poner ese header

find ./ubicate-tiles -type f -name "\*.pbf" -exec bash -c 'mv "$0" "${0%.pbf}.pbf.gz"' {} \;

find ./ubicate-tiles -type f -name "\*.pbf.gz" -exec gunzip -k {} \;

find ./ubicate-tiles -type f -name "\*.pbf.gz" -delete

### Fuente para glyphs

Para la fuente usar
npm install -g fontnik

build-glyphs fuente.ttf ./glyphs

Subir en local:
bash upload-local.bash

Subir a R2 en produccion (tiles):
rclone copy ./ubicate-tiles ubicate:ubicate-tiles

Subir a R2 en produccion (font):
rclone copy ./glyphs ubicate:glyphs
