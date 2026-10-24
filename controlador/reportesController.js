/* Coordina los filtros y la gestión; no contiene HTML, CSS ni los datos de ejemplo. */
(function (app) {
  'use strict';
  if (!app.AccesoController.autorizado) return;

  const modelo = app.ReporteModel;
  const vista = app.Vista;
  const tipo = document.getElementById('filtro-tipo');
  const estado = document.getElementById('filtro-estado');
  const busqueda = document.getElementById('buscar-reporte');
  let seleccionado = null;

  vista.opciones(tipo, app.IncidenciaModel.tipos, 'Todos');
  if (estado) vista.opciones(estado, app.IncidenciaModel.estados, 'Todos');
  vista.opciones(document.getElementById('estado-reporte'), app.IncidenciaModel.estados);

  function actualizarVista() {
    const reportes = modelo.listar({ tipo: tipo.value, estado: estado?.value || '', busqueda: busqueda?.value || '' });
    if (!reportes.some(reporte => reporte.id === seleccionado)) seleccionado = reportes[0]?.id || null;
    vista.reportes(reportes, seleccionado);
    vista.detalle(modelo.obtener(seleccionado));
    vista.resumen(modelo.resumen());
  }

  tipo.addEventListener('change', actualizarVista);
  estado?.addEventListener('change', actualizarVista);
  busqueda?.addEventListener('input', actualizarVista);
  document.getElementById('lista-reportes').addEventListener('click', evento => {
    const boton = evento.target.closest('[data-reporte]');
    if (!boton) return;
    seleccionado = boton.dataset.reporte;
    actualizarVista();
  });
  document.getElementById('gestion-reporte').addEventListener('submit', evento => {
    evento.preventDefault();
    try {
      const reporte = modelo.actualizar(seleccionado, {
        estado: document.getElementById('estado-reporte').value,
        nota: document.getElementById('nota-interna').value
      });
      actualizarVista();
      vista.avisar(reporte.id + ' actualizado a ' + reporte.estado + ' en esta demostración.');
    } catch (error) {
      vista.avisar(error.message, true);
    }
  });
  document.getElementById('exportar')?.addEventListener('click', () => {
    const sectores = modelo.resumen().sectores;
    const contenido = ['Sector,Reportes', ...Object.entries(sectores).map(([sector, total]) => sector + ',' + total)].join('\r\n');
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8' }));
    enlace.href = url;
    enlace.download = 'resumen-demo.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    vista.avisar('Resumen de demostración exportado.');
  });

  actualizarVista();
})(window.AlertaBarrio);
