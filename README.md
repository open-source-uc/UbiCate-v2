<h1 align="center">
  <br>
  <a href=# name="readme-top"><img src="https://raw.githubusercontent.com/open-source-uc/UbiCate/7da46a5fe0f10a794a3b7477bb7103017bc5dfdc/static/assets/logo-dark.svg" width="90px" alt="banner"></a>
</h1>

<h4 align="center"> Ubícate UC </h4>

<p align="center">
  <a href="#Descripción">Descripción</a> •
  <a href="#Uso">Uso</a> •
  <a href="#Contribuir">Contribuir</a> •
  <a href="#Créditos">Créditos</a> •
  <a href="#Soporte">Soporte</a> •
  <a href="#licencia">Licencia</a>
</p>

---

## Descripción

Proyecto Open Source desarrollado como un buscador de salas en los campus de la Pontificia Universidad Católica de Chile, que permite a los estudiantes encontrar y localizar rápidamente en un mapa dinámico.

Los datos iniciales del proyecto son sacados de [almapp/uc-maps-seeds](https://github.com/almapp/uc-maps-seeds)

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Centrado del mapa en base a parámetros en links

Para centrar el mapa o la ubicación en el formulario en un campus específico, se puede agregar un parámetro en la URL con el nombre del campus:

```
https://v2.ubicate.osuc.dev/map?campus={Nombre campus}
https://v2.ubicate.osuc.dev/form-geo?campus={Nombre campus}
```

Donde `{Nombre campus}` puede ser:
- SanJoaquin
- CasaCentral
- Oriente
- LoContador
- Villarrica


Además se puede centrar el mapa en la ubicación de una sala dado su identificador

```
https://v2.ubicate.osuc.dev/map?place={Id sala}
```

Donde `{Id sala}` puede ser:
- B12

## Developing

### Instalación

Agregar Api Key pública de Mapbox a variable de entorno en archivo ``.env.local``

```shell
NEXT_PUBLIC_MAPBOX_TOKEN = <API_KEY>
```

### Instalar dependencias

```shell
npm install
```

### Ejecutar servidor de desarrollo

```shell
npm run dev
```

## Linter

Es necesario resolver los errores y warnings de linter en cada pull request, estos errores se muestran (y se resuelven la mayoría de errores) ejecutando:

```
npm run lint:fix
```

## Building

Es necesario que el proyecto pueda realizar correctamente un `build` para poder ser desplegado en Cloudflare

```shell
npm run build:cloudflare
```


<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Contribuir

### Bug Reports & Feature Requests

Utilice las **issues** para informar cualquier bug o solicitud.

### Workflow

> PR a development -> Revisar preview y checks -> Asignar reviewers -> Aprobación -> Merge a development

La información detallada sobre cómo contribuir se puede encontrar en [contributing.md](contributing.md).


## Necesitas contactarnos
Comuníquese con nosotros a traves de [osuc.dev](https://links.osuc.dev/)

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Créditos

### Mantenedores

- [MrBased](https://github.com/MrBased)
- [mc-cari](https://github.com/mc-cari)
- [ooscarr](https://github.com/ooscarr)
- [vlermandac](https://github.com/vlermandac)
- [dvictorerol](https://github.com/dvictorerol)

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>
## Licencia

[![License: GNU](https://img.shields.io/badge/License-GNU-yellow.svg)](./license.md)

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>
