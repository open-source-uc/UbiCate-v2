# Contributors Data Management

Este archivo documenta cómo administrar la información de contribuidores en la página de créditos.

## Estructura de Datos

Los datos de contribuidores se almacenan en `/data/contributors.json` con la siguiente estructura:

```json
{
  "osuc_contributors": [
    {
      "id": "unique-id",
      "firstName": "Nombre",
      "lastName": "Apellido",
      "githubUsername": "github-username",
      "githubUrl": "https://github.com/username",
      "linkedinUrl": "https://linkedin.com/in/username", // Opcional
      "avatarUrl": "https://github.com/username.png",
      "role": "Descripción del rol"
    }
  ],
  "uc_contributors": [
    // Misma estructura para contribuidores UC
  ]
}
```

## Cómo Agregar un Nuevo Contribuidor

### Para Open Source eUC (`osuc_contributors`)
1. Abrir `/data/contributors.json`
2. Agregar un nuevo objeto al array `osuc_contributors`
3. Completar todos los campos requeridos
4. El `linkedinUrl` es opcional y puede omitirse si no está disponible

### Para Contribuidores UC (`uc_contributors`)
1. Abrir `/data/contributors.json`
2. Agregar un nuevo objeto al array `uc_contributors`
3. Completar todos los campos requeridos

## Campos Requeridos

- **id**: Identificador único (usar el username de GitHub en minúsculas)
- **firstName**: Nombre real del contribuidor
- **lastName**: Apellido real del contribuidor
- **githubUsername**: Username exacto de GitHub
- **githubUrl**: URL completa del perfil de GitHub
- **avatarUrl**: URL de la imagen de perfil (usar `https://github.com/username.png`)
- **role**: Descripción del rol o posición

## Campos Opcionales

- **linkedinUrl**: URL del perfil de LinkedIn (se puede omitir si no está disponible)

## Ejemplo de Contribuidor Completo

```json
{
  "id": "nuevousuario",
  "firstName": "Ana",
  "lastName": "García",
  "githubUsername": "nuevousuario",
  "githubUrl": "https://github.com/nuevousuario",
  "linkedinUrl": "https://linkedin.com/in/ana-garcia",
  "avatarUrl": "https://github.com/nuevousuario.png",
  "role": "Frontend Developer"
}
```

## Notas Importantes

- Los cambios en este archivo se reflejan automáticamente en la página `/creditos`
- Verificar que las URLs sean válidas antes de hacer commit
- Mantener el formato JSON correcto (comas, llaves, etc.)
- Los contribuidores se muestran en el orden que aparecen en el archivo