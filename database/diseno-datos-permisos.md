# Prioridad 1 — Definición de datos y permisos

Estado: diseño lógico del piloto, actualizado con las respuestas del usuario. No crea tablas ni modifica las pantallas de la maqueta. Los scripts y la conexión con PostgreSQL corresponden a la etapa de implementación siguiente.

Documentos complementarios:

- [Diccionario de datos](diccionario-datos.md).
- [Modelo de relaciones](modelo-relaciones.md).

## Alcance territorial y cuentas

- El piloto corresponde a Yungay y los sectores atendidos por su municipalidad; no se incorporan otras comunas en este piloto.
- Se comienza con una cuenta Muni, además de la cuenta Admin ya existente.
- Cada usuario Muni se asocia a su municipalidad. El modelo permite añadir funcionarios más adelante sin cambiar las tablas.
- Los sectores se mantienen como un catálogo ampliable. No se fija una cantidad ni se inventan nombres de sectores reales.
- Cada incidencia pertenece a la municipalidad de Yungay y, cuando se identifique, a un sector de su catálogo. Propuesta técnica: admitir sector pendiente de identificar para que una persona pueda reportar sin conocer su nombre administrativo.

## Reportante anónimo

- El formulario no exige cuenta ciudadana, nombre, RUT, teléfono ni correo.
- No se incorpora una entidad de ciudadano identificado al diseño inicial.
- El selector de la maqueta «ocultar mi nombre» no corresponde al flujo definitivo, porque el formulario ya será anónimo.
- El anonimato se refiere a los campos solicitados en la aplicación. Las políticas de registros técnicos y acceso a infraestructura se definirán al implementar el servidor.
- El folio sirve como referencia del reporte; no concede acceso público a su información.

## Datos de una incidencia

- Tipo de incidencia: Robo, Asalto, Actividad sospechosa, Vandalismo o VIF — Violencia intrafamiliar.
- Municipalidad/comuna: Yungay para el piloto, determinada por la configuración del sistema.
- Sector: referencia al catálogo de sectores de Yungay; ampliable sin cambios estructurales.
- Dirección o referencia: calle, intersección o domicilio cercano. También puede existir una posición GPS estimada.
- Propuesta de validación mínima: disponer de una referencia textual o de coordenadas válidas. Si existen ambas, se conservan ambas.
- Observaciones opcionales: relato adicional y hora del hecho indicada por la persona, cuando sea distinta del momento de envío.
- Fecha y hora de recepción: automáticas en el servidor al recibir el reporte. Se presentan en horario de Chile, `America/Santiago`.
- Evidencia: opcional y con varios archivos por incidencia; fotografías, videos o audios.
- Estado, prioridad de gestión, notas internas e historial: administrados por el equipo de gestión según los permisos establecidos.

## Ubicación y precisión

Se conserva la dirección de referencia junto a las coordenadas, cuando existan. Las coordenadas deben corresponder al incidente, con posibilidad de corregir la ubicación sugerida por el teléfono.

El radio visual solicitado es de aproximadamente 20 metros como referencia. Se almacenará por separado la precisión que informe el dispositivo; no se afirmará una precisión de 20 metros si la medición informa un margen mayor. Para la implementación se propone que el radio visual nunca oculte una incertidumbre superior a la referencia solicitada.

La precisión del dispositivo no representa por sí sola un límite de privacidad o de anonimización. El mapa de gestión es de acceso restringido y no se propone publicar ubicaciones de los reportes.

Referencia técnica: [GeolocationCoordinates.accuracy](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy).

## Estados acordados

| Código propuesto | Nombre visible | Uso |
|---|---|---|
| `nuevo` | Nuevo | Asignado automáticamente al recibir una incidencia |
| `abierto` | Abierto | Reporte abierto para gestión |
| `en_curso` | En curso | Caso que está siendo trabajado |
| `cerrado` | Cerrado | Gestión cerrada por un funcionario |
| `no_concluido` | No concluido | Resultado alternativo, distinto de Cerrado |

Estos estados sustituyen el catálogo anterior de la maqueta, que incluía En revisión, Derivado y No verificable. No concluido no debe contarse como un caso resuelto.

El usuario municipal puede cambiar estados y agregar notas internas. Cada cambio conserva actor, fecha y valores anterior/nuevo en el historial. Como propuesta de flujo se considera Nuevo → Abierto → En curso → Cerrado, con No concluido como alternativa; las transiciones permitidas, la reapertura y la obligatoriedad de un motivo se concretarán al implementar la gestión, sin considerarlas aprobadas automáticamente por este documento.

## VIF

- VIF es un tipo de incidencia del catálogo y debe identificarse de manera visual destacada en la gestión.
- La cuenta Muni puede consultar el reporte VIF, su ubicación y sus adjuntos con el mismo alcance territorial de los otros reportes.
- Admin mantiene acceso total.
- La marca destacada no asigna por sí sola prioridad crítica automática ni dispara acciones externas. Una regla de priorización específica puede definirse después.
- No hay acceso público a reportes, direcciones o evidencias VIF.

## Matriz de permisos

| Operación | Admin | Usuario Muni de Yungay | Reportante anónimo |
|---|---|---|---|
| Abrir administración | Sí | No | No |
| Consultar panel e incidencias | Todas las municipalidades que existan | Su municipalidad | No |
| Consultar ubicación y evidencia | Sí | Reportes de su municipalidad, incluida VIF | No |
| Cambiar estados y agregar notas | Sí | Reportes de su municipalidad | No |
| Consultar historial | Sí | Reportes de su municipalidad | No |
| Enviar incidencia pública y adjuntar archivos | Disponible en la vista móvil | Su menú se limita a la gestión | Sí |
| Administrar municipalidades, sectores y cuentas | Propuesta de implementación para Admin | No se ha solicitado delegación | No |
| Borrar definitivamente reportes o evidencias | Política pendiente; no se define una operación de borrado en esta etapa | Política pendiente | No |

Los permisos se deberán validar en el servidor. El login del prototipo solo simula la navegación por rol.

## Reportes individuales e informes estadísticos

- Un reporte individual es la incidencia enviada por una persona.
- Los informes estadísticos agrupan incidencias por períodos semanal, mensual o trimestral.
- El informe anual queda para una etapa posterior.
- Propuesta: agrupar inicialmente por la fecha de recepción automática. La hora del hecho relatada en observaciones no se interpretará automáticamente como una fecha verificada.
- No se necesita una tabla distinta por período: los informes podrán generarse consultando las incidencias y su historial.
- Antes de implementar esos informes se precisarán rangos calendario, métricas y formato de exportación.

## Políticas que pueden concretarse en las siguientes etapas

El diseño base ya puede avanzar sin más datos personales ni nombres definitivos de sectores. Quedan para la implementación de cada función:

- Tamaño máximo, formatos específicos y cantidad máxima de adjuntos por incidencia.
- Plazo de conservación y criterio de eliminación de archivos y reportes.
- Lista inicial de sectores atendidos por Yungay, cuando esté disponible.
- Motivos de cierre/no conclusión, reapertura y eventuales reglas de prioridad.
- Límites territoriales para validar coordenadas y asignar sectores automáticamente.
- Detalle de métricas y períodos de los informes estadísticos.

Estos puntos no activan borrados, alertas ni procesos automáticos. Se resolverán antes de poner en uso la función correspondiente.

## Próximo paso

Preparar los scripts de PostgreSQL y los datos de prueba de Yungay, luego conectar el servidor y el login real. Los modelos y las pantallas actuales siguen siendo una maqueta y deberán sincronizarse con este diseño durante esa implementación.
