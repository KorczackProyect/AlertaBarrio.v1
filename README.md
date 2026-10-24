# AlertaBarrio.v1

Prototipo estático de reportes ciudadanos y gestión municipal con datos ficticios. Incluye vistas de Admin, centro de gestión municipal, reportes y un formulario móvil con VIF — Violencia intrafamiliar.

## Abrir la demostración

Abre [index.html](index.html) en un navegador con almacenamiento de sesión habilitado. También puede publicarse con GitHub Pages desde la raíz del repositorio; no requiere compilación ni dependencias. Conserva las carpetas y sus mayúsculas al copiarlo.

## Estructura

| Ruta | Contenido |
|---|---|
| HTML de la raíz | Accesos que redirigen a las vistas. |
| [Vistas/](Vistas/) | HTML de las pantallas, CSS en `css/` y presentación en `js/`. |
| [Modelos/](Modelos/) | Datos ficticios y operaciones de la demostración. |
| [controlador/](controlador/) | Acciones de cada pantalla, navegación y acceso por rol. |
| [database/](database/) | Diseño lógico de datos y permisos; aún no contiene una base de datos implementada. |
| [docs/](docs/README.md) | Índice de la documentación del proyecto. |
| [tests/](tests/) | Pruebas de modelos y acceso de demostración. |

Los HTML referencian los estilos y scripts externos mediante rutas relativas. Los controladores coordinan los modelos y las vistas; esta organización MVC se ejecuta por ahora en el navegador.

## Cuentas de prueba

- `admin1` / `demo-admin`: acceso a todas las vistas.
- `testmuni` / `demo-muni`: centro de gestión y reportes municipales.
- Sin sesión: formulario móvil anónimo y login.

Estas contraseñas son expresamente públicas y exclusivas de la maqueta: no corresponden a cuentas reales. Están definidas en [Modelos/usuarioModel.js](Modelos/usuarioModel.js). El login y los permisos se controlan únicamente en el navegador y pueden modificarse desde él: no proporcionan autenticación ni autorización seguras.

## Alcance actual

No hay servidor Express, conexión a PostgreSQL ni servicio de emergencias. Los reportes usan datos ficticios en memoria y los cambios se reinician al recargar o cambiar de página. La sesión dura en la pestaña mediante `sessionStorage`. Los adjuntos sólo se representan por sus nombres, la ubicación es simulada y no se envían reportes ni notificaciones reales. La publicación está destinada a revisar la maqueta; no debe recibir información real de incidencias.

El diseño acordado para Yungay está en [database/diseno-datos-permisos.md](database/diseno-datos-permisos.md). Las reglas futuras allí descritas no están todas implementadas en estas pantallas.

## Pruebas locales

Con Node.js instalado, ejecuta desde la carpeta del proyecto:

```sh
node --test tests/modelos.test.cjs tests/autenticacion.test.cjs
```
