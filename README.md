# AlertaBarrio.v1

Prototipo estático de reportes ciudadanos y gestión municipal con datos ficticios. Incluye vistas de Admin, centro de gestión municipal, reportes y un formulario móvil.

## Estructura

| Ruta | Contenido |
|---|---|
| HTML de la raíz | Accesos que redirigen a las vistas. |
| [Vistas/](Vistas/) | HTML de las pantallas, CSS en `css/` y presentación en `js/`. |
| [Modelos/](Modelos/) | Datos ficticios y operaciones de la demostración. |
| [controlador/](controlador/) | Acciones de cada pantalla, navegación y acceso por rol. |
| [database/](database/) | Diseño lógico de datos y permisos.|
| [docs/](docs/README.md) | Índice de la documentación del proyecto. |
| [tests/](tests/) | Pruebas de modelos y acceso de demostración. |

Los HTML referencian los estilos y scripts externos mediante rutas relativas. Los controladores coordinan los modelos y las vistas; esta organización MVC se ejecuta por ahora en el navegador.

## Cuentas de prueba

- `admin1` / `demo-admin`: acceso a todas las vistas.
- `testmuni` / `demo-muni`: centro de gestión y reportes municipales.
- Sin sesión: formulario móvil anónimo y login.

Estas contraseñas son expresamente públicas y exclusivas de la maqueta: no corresponden a cuentas reales. Están definidas en [Modelos/usuarioModel.js](Modelos/usuarioModel.js). El login y los permisos se controlan únicamente en el navegador y pueden modificarse desde él: no proporcionan autenticación ni autorización seguras.
