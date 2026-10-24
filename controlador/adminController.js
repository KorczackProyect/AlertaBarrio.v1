/* Operaciones de la pantalla de administración. */
(function (app) {
  'use strict';
  if (!app.AccesoController.autorizado) return;

  const dialogo = document.getElementById('nueva-municipalidad');
  const formulario = document.getElementById('formulario-municipalidad');
  const actualizar = () => app.Vista.municipalidades(app.MunicipalidadModel.listar());

  document.getElementById('abrir-municipalidad').addEventListener('click', () => dialogo.showModal());
  document.getElementById('cancelar-municipalidad').addEventListener('click', () => dialogo.close());
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    try {
      const municipalidad = app.MunicipalidadModel.crear({
        nombre: formulario.elements.nombre.value,
        correo: formulario.elements.correo.value
      });
      actualizar();
      dialogo.close();
      formulario.reset();
      app.Vista.avisar(municipalidad.nombre + ' creada en la demostración. No se enviaron invitaciones.');
    } catch (error) {
      app.Vista.avisar(error.message, true);
    }
  });

  actualizar();
})(window.AlertaBarrio);
