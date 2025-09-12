# Crear y Personalizar Estilos de Mapas

Para crear un estilo de mapa personalizado, puedes usar [Maputnik](https://github.com/maplibre/maputnik), un editor visual para estilos MapLibre.

## Pasos Básicos

1. **Abrir Maputnik**
   Accede a Maputnik y selecciona un estilo existente que quieras usar como base.

2. **Importar el estilo**

   - Haz clic en "Open Style" y carga el archivo JSON de tu estilo base.

3. **Editar fuentes y tiles**

   - Cambia los `sources` de **fuentes (fonts)** y **tiles** para que apunten a la API de **Ubicate**:

     ```
     https://ubicate.osuc.dev
     ```

4. **Guardar y exportar**

   - Una vez realizados los cambios, guarda el estilo y úsalo en tu proyecto MapLibre.
