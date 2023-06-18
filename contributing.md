# Contributing

## Workflow (Flujo de trabajo)
1. (Opcional) Discutir tu propuesta previamente creando una issue.
2. Hacer _fork_ del repositorio para hacer tus cambios, o si tienes los permisos, crear una nueva branch bajo el mismo repositorio.
   <details><summary>Si ya tienes un fork, debes sincronizar tu repositorio con upstream:</summary>
   <ul>
    <li>Hacer un pull request y merge desde la branch `development` de este repositorio hacia `development` de tu fork</li>
    O
    <li>Desde github, usar "fetch upstream" y "fetch and merge" para hacer lo mismo pero con menos pasos</li>
    </ul>
</details>

3. Crear una branch basada en la branch `development`, en lo posible dale un nombre significativo a tu nueva branch, ej `add-project-images`.

4. Crear un Pull Request (PR) a `development`, manteniéndolo como "borrador" (draft) hasta que esté listo para ser incorporado.
5. Explicar brevemente los cambios, siguiendo el formato de Pull Requests, especificando posibles problemas o puntos de discusión.
6. Solicitar una revisión de pares (*review*) a los integrantes del equipo del proyecto (los encuentras en la seccion de Maintainers del readme).
7. Una vez aprobada la PR, un maintainer miembro del proyecto hará merge del código a `development`, una vez hecho el merge puedes eliminar tu branch.


## Tutorial
### Como hacer Pull Requests
Primero debe crear un `fork` del repositorio para poder realizar cambios en él.Se pueden encontrar mas detalles en [GitHub Documentation](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

Luego agrega tu fork como un proyecto local:

```sh
# Using HTTPS
git clone https://github.com/YOUR-USERNAME/REPOSITORY-NAME

# Using SSH
git clone git@github.com:YOUR-USERNAME/REPOSITORY-NAME
```

> [Which remote URL should be used ?](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories)

Luego, ve a tu carpeta local

```sh
cd github-issue-template
```

Agregue git remote controls:

```sh
# Using HTTPS
git remote add fork https://github.com/YOUR-USERNAME/REPOSITORY-NAME
git remote add upstream https://github.com/YOUR-USERNAME/REPOSITORY-NAME


# Using SSH
git remote add fork git@github.com:YOUR-USERNAME/REPOSITORY-NAME
git remote add upstream git@github.com/YOUR-USERNAME/REPOSITORY-NAME
```

Ahora puede verificar que tienes dos remote controls:

```sh
git remote -v
```

### Realizar actualizaciones remotas
Para mantenerse al día con el repositorio central:

```sh
git pull upstream main # or master
```

### Elija una branch de base
Antes de comenzar el desarrollo, debe saber en qué branch basar sus modificaciones/adiciones. En caso de duda, use main o master.

```sh
# Cambiar a la branch deseada
git switch main # master

# Hacer pull de los cambios
git pull

# Crear una nueva branch para trabajar
git switch --create patch/1234-name-issue
```

Comprometa tus cambios, luego realiza push a la rama a tu fork con `git push -u fork` y abra una pull request con la plantilla proporcionada.

## Más información

Puedes encontrar mas detalles sobre este proceso [aquí](https://docs.github.com/es/github/collaborating-with-issues-and-pull-requests/proposing-changes-to-your-work-with-pull-requests).