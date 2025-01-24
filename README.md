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

## Query Params

Para centrar el mapa o la ubicación en el formulario en un campus específico, se puede agregar un parámetro en la URL con el nombre del campus:

```
https://ubicate.osuc.dev/map?campus={Nombre campus}
https://ubicate.osuc.dev/form-geo?campus={Nombre campus}
```

Donde `{Nombre campus}` puede ser:
- SanJoaquin
- CasaCentral
- Oriente
- LoContador
- Villarrica


Además se puede centrar el mapa en la ubicación de una sala dado su identificador

```
https://ubicate.osuc.dev/map?place={Id sala}
```

Donde `{Id sala}` puede ser:
- B12

## Developing

### Instalación

Agregar Api Key pública de Mapbox a variable de entorno en archivo ``.env.local``
Agregar la URL base del proyecto, actualmente es `https://ubicate.osuc.dev/`
> [!IMPORTANT]  
> Debe **llamarse** `.env.local`
```shell
NEXT_PUBLIC_MAPBOX_TOKEN = <API_KEY>
NEXT_PUBLIC_BASE_URL = <BASE_URL> // Opcional, en producción obligatorio
GITHUB_TOKEN_USER = <TOKEN_USER> // Opcional, en producción obligatorio
GITHUB_USER_EMAIL = <EMAIL> // Opcional, en producción obligatorio
GITHUB_BRANCH_NAME = <EXISTING_BRANCH> // Opcional, en producción obligatorio
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

## Deployment

### Cloudflare (automatic)

Es necesario que el proyecto pueda realizar correctamente un `build` para poder ser desplegado en Cloudflare

```shell
npm run build:cloudflare
```

### Linux VM (manual)

1. Crear un usuario dedicado.

```
useradd ubicate
```

2. Clonar el repositorio.

```
git clone https://github.com/open-source-uc/UbiCate-v2 /usr/local/ubicate
```

3. Entrar al directorio

```
cd /usr/local/ubicate
```

4. [Agregar Environmental Variables](#instalación)

5. [Install npm dependencies](#instalar-dependencias)

6. [Ejecutar Linter](#linter)

7. Hacer una build.

```
npm run build
```

8. Crear la Systemd Unit

```
touch /etc/systemd/system/ubicate.service
```

```
[Unit]
Description=Ubicate
After=multi-user.target
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/npm --prefix /usr/local/ubicate run start
User=ubicate
Group=ubicate
Type=idle
Restart=on-abnormal
RestartSec=15
TimeoutStopSec=10

[Install]
WantedBy=multi-user.target
```

9. Reload Units

```
systemctl daemon-reload
```

10. Start y enable el servicio

```
systemctl enable --now ubicate.service
```

11. Reverse proxy con Apache

> Reemplazar `domain.tld` con su dominio.

```
<VirtualHost *:80>
    ServerAdmin webmaster@domain.tld
    ServerName ubicate.domain.tld
    ErrorLog "/var/log/httpd/ubicate.domain.tld-error_log"
    CustomLog "/var/log/httpd/ubicate.domain.tld-access_log" common


    <Location / >
        RequestHeader set X-SCRIPT-NAME /
        RequestHeader set X-SCHEME https
        ProxyPass http://localhost:3000/
        ProxyPassReverse http://localhost:3000/
        ProxyPassReverseCookiePath  /  /
    </Location>

</VirtualHost>
```

####


## Agregar Nuevas Salas y Áreas

Las salas subidas a través del formulario se cargan automáticamente a una rama de Git especificada en el archivo `.env.local`, bajo la variable `GITHUB_BRANCH_NAME`. Estas salas se añaden al archivo `data/places.json`. 
> [!IMPORTANT]  
> La rama de Git debe existir antes de usar el formulario. Además, asegúrate de configurar el token de GitHub en `GITHUB_TOKEN_USER` y el correo asociado a la cuenta en `GITHUB_USER_EMAIL`. Es fundamental que cualquier ubicación agregada manualmente se realice en la rama especificada para evitar conflictos.

### Añadir Ubicaciones de Forma Manual

Es posible agregar ubicaciones manualmente siguiendo el **formato GeoJSON**. Además, las áreas que tengan una geometría de tipo "Polygon" también deben agregarse en este archivo.

En caso de querer agregar campus, estos deben incluirse en el archivo `campus.json`.

> [!CAUTION] 
> Es fundamental que cualquier ubicación agregada manualmente se realice en la rama especificada para evitar conflictos.

> [!NOTE]
> Los puntos o áreas que no tengan el campo `needApproval` establecido en `false`, o que no incluyan este campo, no serán mostrados en el mapa.

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

## Bugs

### Error del servidor 500
Si este error ocurre en Cloudflare, es muy probable que se deba a uno de los siguientes motivos:

Versión incorrecta de Node.js: Asegúrate de que la versión de Node.js configurada sea compatible con tu aplicación.

Fecha de compatibilidad obsoleta (Compatibility Date): Una fecha de compatibilidad muy antigua puede causar problemas con el entorno de ejecución de Cloudflare.

![alt text](image/image.png)


## Créditos.
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
