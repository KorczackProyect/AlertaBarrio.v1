# Diccionario lógico de datos — AlertaBarrio

Diseño propuesto para PostgreSQL; no crea tablas ni cambia la aplicación. Ver [relaciones](modelo-relaciones.md) y [acuerdos y permisos](diseno-datos-permisos.md).

## Convenciones propuestas

Cada tabla tiene `id uuid` como clave primaria, obligatoria y generada por el servidor. `FK` significa referencia a otra tabla; `?` permite nulos. Todo campo sin `?` es obligatorio. Textos obligatorios no admiten sólo espacios. UUID, nombres técnicos y tipos son propuestas; no son requisitos nuevos del usuario.

Las fechas usan `timestamptz` y se generan en el servidor; se muestran en `America/Santiago`. Desactivar catálogos o cuentas no debe borrar reportes ni su historial.

## municipalidades

| Campo | Tipo | Regla |
|---|---|---|
| `nombre`, `comuna` | text | Municipalidad y comuna receptora; Yungay en el piloto. |
| `activa` | boolean | Habilitación de la municipalidad. |
| `creada_en` | timestamptz | Fecha de creación. |

## sectores

| Campo | Tipo | Regla |
|---|---|---|
| `municipalidad_id` | uuid, FK | A municipalidades; sólo sectores atendidos por Yungay en el piloto. |
| `nombre` | text | Catálogo ampliable; nombre normalizado único dentro de la municipalidad, como propuesta. Sin nombres o cantidades inventados. |
| `activo` | boolean | Disponible para clasificar nuevos reportes. |

## usuarios

| Campo | Tipo | Regla |
|---|---|---|
| `usuario` | text | Único, con normalización consistente. |
| `password_hash` | text | Hash; nunca contraseña en texto claro. |
| `rol` | text | `admin` o `muni`. |
| `municipalidad_id` | uuid?, FK | Obligatoria para Muni; nula para Admin. |
| `activo`, `creado_en` | boolean, timestamptz | Habilitación y fecha de creación. |

Una cuenta Muni inicial y una Admin aparte; la estructura permite añadir funcionarios. No existe cuenta de reportante.

## tipos_incidencia

| Campo | Tipo | Regla |
|---|---|---|
| `codigo`, `nombre` | text | Código único y nombre visible. |
| `destacado_visual`, `activo` | boolean | VIF se destaca; esto no asigna una prioridad automática. |

Tipos actuales: Robo, Asalto, Actividad sospechosa, Vandalismo y VIF — Violencia intrafamiliar.

## estados_reporte

| Campo | Tipo | Regla |
|---|---|---|
| `codigo`, `nombre` | text | Código único y nombre visible. |
| `orden_visual` | integer | Presentación; no representa transiciones válidas. |

Cinco estados: **Nuevo**, **Abierto**, **En curso**, **Cerrado**, **No concluido**. Nuevo se asigna al recibir. No concluido es distinto de Cerrado y no cuenta como resuelto. Transiciones, reapertura y reglas de cierre quedan pendientes; no se añade un indicador de resolución ni de estado final.

## reportes

Cada registro representa una incidencia enviada, no un informe estadístico.

| Campo | Tipo | Regla |
|---|---|---|
| `folio` | text | Único, generado por el servidor; formato pendiente. |
| `municipalidad_id` | uuid, FK | Municipalidad receptora obligatoria; Yungay en el piloto. La comuna se obtiene de su registro. |
| `sector_id` | uuid?, FK | Debe pertenecer a esa municipalidad. Dejarlo pendiente cuando no se reconoce es una propuesta para no bloquear el envío. |
| `tipo_incidencia_id`, `estado_id` | uuid, FK | A tipos_incidencia y estados_reporte, respectivamente. |
| `direccion_referencia` | text? | Calle, intersección, domicilio o referencia cercana; obligatoria si no hay coordenadas válidas. |
| `observaciones` | text? | Descripción opcional y hora relatada del hecho si difiere de la recepción. |
| `latitud`, `longitud` | double precision? | Ambas presentes o ambas nulas; latitud entre −90 y 90, longitud entre −180 y 180; valores finitos. |
| `precision_gps_m` | double precision? | Precisión informada por el dispositivo, finita y mayor que cero; no se completa con 20 por defecto. |
| `recibido_en`, `actualizado_en` | timestamptz | Recepción y última modificación del reporte, generadas por el servidor. |

Se exige dirección/referencia no vacía o un par válido de coordenadas; pueden existir ambos. El círculo visual de aproximadamente 20 m es configuración de la vista, separado de la precisión GPS: no garantiza exactitud real de 20 m.

No se incluyen nombre, RUT, correo, teléfono, cuenta de reportante ni `nombreOculto`. Tampoco se exige un campo adicional de hora del hecho. La prioridad y sus niveles siguen pendientes.

## evidencias

| Campo | Tipo | Regla |
|---|---|---|
| `reporte_id` | uuid, FK | A reportes. Un reporte admite cero o varios archivos. |
| `nombre_original` | text | Nombre del archivo mostrado en la maqueta; metadato, no una URL pública. |
| `referencia_almacenamiento` | text | Identificador o ruta interna del archivo; no requiere URL pública. |
| `tipo_mime` | text | Tipo de contenido verificado por el servidor. |
| `tamano_bytes` | bigint | Tamaño real, mayor que cero. |
| `creada_en` | timestamptz | Fecha de incorporación. |

Foto, video y audio previstos. Formatos, límites por archivo/reporte y conservación siguen pendientes; la evidencia es opcional.

## notas_internas

| Campo | Tipo | Regla |
|---|---|---|
| `reporte_id`, `usuario_id` | uuid, FK | A reportes y usuarios; autor con permiso de acceso. |
| `texto` | text | Contenido interno, distinto de observaciones del envío. |
| `creada_en` | timestamptz | Fecha de incorporación. |

Se proponen notas sucesivas en vez de sobrescribir una única nota.

## historial

| Campo | Tipo | Regla |
|---|---|---|
| `reporte_id` | uuid, FK | A reportes. |
| `usuario_id` | uuid?, FK | A usuarios; nulo en recepción anónima o acción del sistema. |
| `actor_tipo` | text | Propuesta: `usuario`, `envio_anonimo` o `sistema`; el primero exige usuario_id y los demás lo dejan nulo. |
| `accion` | text | Evento registrado; catálogo técnico pendiente. |
| `estado_anterior_id`, `estado_nuevo_id` | uuid?, FK | A estados_reporte; opcionales cuando el evento no afecta estado. |
| `detalle` | text? | Descripción o motivo; obligatoriedad por operación pendiente. |
| `creado_en` | timestamptz | Momento de la acción. |

Se propone registrar recepción y cambios relevantes. El cambio de estado y su historial deben guardarse juntos. Esto no identifica al reportante ni sustituye las notas internas.

## Integridad, acceso e informes

Admin tiene acceso total. Muni accede sólo a su municipalidad, incluyendo VIF, ubicación y evidencia; las comprobaciones corresponden al servidor. La decisión de envío anónimo no define aún los registros técnicos del servidor.

Los informes semanales, mensuales y trimestrales serán consultas sobre `recibido_en`, con períodos en `America/Santiago`; no requieren tablas por período. El inicio de semana y contenido exacto se definirán al implementarlos. Anual postergado. Ninguna métrica debe considerar No concluido como resuelto.
