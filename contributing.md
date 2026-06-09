# Contributing

## Avisos importantes

- La rama oficial para contribuir es `DTFD`.
- `main` no estará activa por algunos meses, así que no la uses como base ni como destino de PR.
- Todo PR debe ser aprobado por la universidad antes de integrarse.
- Las contribuciones que agreguen funcionalidades pueden quedar en espera hasta esa aprobación.
- No modifiques `places.json`.
- Sigue `conventional commits` para los mensajes de commit.
- Sigue `conventional branches` para el nombre de tus branches, por ejemplo `feat/...`, `fix/...` o `docs/...`.

## Flujo de trabajo

1. (Opcional) Abre una issue antes de trabajar en cambios grandes.
2. Haz fork del repositorio, o crea una branch si tienes permisos sobre el repo.
3. Sincroniza tu fork con `upstream` y toma `DTFD` como base.
4. Crea una branch descriptiva desde `DTFD`, siguiendo `conventional branches`, por ejemplo `feat/add-project-images`.
5. Sube tus cambios a tu fork y abre un PR contra `DTFD`.
6. Mantén el PR en borrador si todavía está en revisión o le faltan ajustes.
7. Describe claramente qué cambiaste, riesgos conocidos y cualquier dependencia externa.
8. Solicita review al equipo del proyecto.
9. Cuando el PR sea aprobado y mergeado, puedes borrar tu branch.

## Checklist antes de abrir un PR

- El cambio está basado en `DTFD`.
- No tocaste `places.json`.
- Tus commits siguen `conventional commits`.
- Tu branch sigue `conventional branches`.
- El PR explica el problema, la solución y posibles impactos.
- Probaste localmente lo suficiente como para validar el cambio.
- Si agregas una feature, entiendes que puede esperar aprobación de la universidad.

## Referencia rápida

```sh
git remote add upstream <repo-url>
git fetch upstream
git switch DTFD
git switch -c mi-cambio
git push -u origin mi-cambio
```
