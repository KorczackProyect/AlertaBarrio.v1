/* Coordina los cuatro pasos y el envío simulado del reporte. */
(function (app) {
  'use strict';
  if (!app.AccesoController.autorizado) return;

  let paso = 0;
  let folio = '';
  const borrador = app.BorradorModel;
  const vista = app.Vista;
  const evidencia = document.getElementById('evidencia');

  function guardarPaso() {
    if (paso === 1) borrador.actualizar({
      descripcion: document.getElementById('descripcion').value,
      evidencia: Array.from(evidencia.files).map(archivo => archivo.name).join(', ')
    });
    if (paso === 2) borrador.actualizar({
      direccion: document.getElementById('direccion').value.trim(),
      nombreOculto: document.getElementById('nombre-oculto').checked
    });
  }

  function actualizarVista() {
    vista.seleccionarTipo(borrador.obtener().tipo);
    vista.paso(paso, borrador.obtener(), folio);
  }

  vista.tipos(app.IncidenciaModel.tipos);
  document.getElementById('lista-tipos').addEventListener('click', evento => {
    const boton = evento.target.closest('[data-tipo]');
    if (!boton) return;
    borrador.actualizar({ tipo: boton.dataset.tipo });
    vista.seleccionarTipo(boton.dataset.tipo);
  });
  document.getElementById('continuar').addEventListener('click', () => {
    guardarPaso();
    if (paso === 2 && !borrador.obtener().direccion) {
      vista.avisar('Indica la dirección del incidente antes de continuar.', true);
      document.getElementById('direccion').focus();
      return;
    }
    if (paso === 3) {
      try {
        folio = app.ReporteModel.crear(borrador.obtener()).id;
      } catch (error) {
        vista.avisar(error.message, true);
        return;
      }
    }
    if (paso === 4) {
      borrador.reiniciar();
      document.getElementById('formulario-reporte').reset();
      folio = '';
      paso = 0;
    } else {
      paso++;
    }
    document.getElementById('aviso-global').hidden = true;
    actualizarVista();
  });
  document.getElementById('volver').addEventListener('click', () => {
    guardarPaso();
    paso = Math.max(0, paso - 1);
    document.getElementById('aviso-global').hidden = true;
    actualizarVista();
  });
  document.getElementById('formulario-reporte').addEventListener('submit', evento => evento.preventDefault());

  actualizarVista();
})(window.AlertaBarrio);
