/* Datos de demostración en memoria. No hay conexión a PostgreSQL todavía. */
(function (app) {
  'use strict';

  let siguienteFolio = 1043;
  const reportes = [
    {
      id: 'AB-1042', tipo: 'robo', sector: 'Centro', direccion: 'Av. Central 420',
      fechaTexto: 'Hace 8 min', prioridad: 'Alta', estado: 'Nuevo', nota: '',
      descripcion: 'Se informa el robo de una bicicleta frente a un local.',
      evidencia: 'Fotografía de ejemplo', nombreOculto: true
    },
    {
      id: 'AB-1041', tipo: 'vandalismo', sector: 'Norte', direccion: 'Plaza Los Aromos',
      fechaTexto: 'Hace 24 min', prioridad: 'Media', estado: 'En revisión', nota: '',
      descripcion: 'Reporte ciudadano de daños en mobiliario de la plaza.',
      evidencia: 'Sin evidencia adjunta', nombreOculto: true
    },
    {
      id: 'AB-1040', tipo: 'sospechosa', sector: 'Sur', direccion: 'Pasaje Las Flores',
      fechaTexto: 'Hace 36 min', prioridad: 'Por evaluar', estado: 'Derivado', nota: '',
      descripcion: 'Antecedentes enviados al equipo municipal para su revisión.',
      evidencia: 'Sin evidencia adjunta', nombreOculto: true
    }
  ];

  const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const copiar = reporte => reporte ? { ...reporte } : null;

  app.ReporteModel = Object.freeze({
    listar({ tipo = '', estado = '', busqueda = '' } = {}) {
      const texto = normalizar(busqueda);
      return reportes.filter(reporte =>
        (!tipo || reporte.tipo === tipo) &&
        (!estado || reporte.estado === estado) &&
        normalizar([reporte.id, app.IncidenciaModel.nombre(reporte.tipo), reporte.sector, reporte.direccion].join(' ')).includes(texto)
      ).map(copiar);
    },
    obtener(id) {
      return copiar(reportes.find(reporte => reporte.id === id));
    },
    actualizar(id, { estado, nota }) {
      const reporte = reportes.find(item => item.id === id);
      if (!reporte) throw new Error('El reporte no existe.');
      if (!app.IncidenciaModel.estados.includes(estado)) throw new Error('Selecciona un estado válido.');
      reporte.estado = estado;
      reporte.nota = String(nota || '').trim();
      return copiar(reporte);
    },
    crear(datos) {
      if (!app.IncidenciaModel.existe(datos.tipo)) throw new Error('Selecciona un tipo de incidencia válido.');
      if (!String(datos.direccion || '').trim()) throw new Error('Indica la dirección del incidente.');
      const reporte = {
        id: 'AB-' + siguienteFolio++, tipo: datos.tipo, sector: 'Por confirmar',
        direccion: String(datos.direccion).trim(), descripcion: String(datos.descripcion || '').trim(),
        evidencia: String(datos.evidencia || 'Sin evidencia adjunta'), nombreOculto: Boolean(datos.nombreOculto),
        fechaTexto: 'Ahora', prioridad: 'Por evaluar', estado: 'Nuevo', nota: ''
      };
      reportes.unshift(reporte);
      return copiar(reporte);
    },
    resumen() {
      const sectores = {};
      reportes.forEach(reporte => { sectores[reporte.sector] = (sectores[reporte.sector] || 0) + 1; });
      return {
        total: reportes.length,
        pendientes: reportes.filter(reporte => ['Nuevo', 'En revisión'].includes(reporte.estado)).length,
        sectores
      };
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
