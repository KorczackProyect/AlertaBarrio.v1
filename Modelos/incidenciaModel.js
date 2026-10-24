/* Catálogo común a las vistas municipales y al formulario móvil. */
(function (app) {
  'use strict';

  const tipos = Object.freeze([
    Object.freeze({ id: 'robo', nombre: 'Robo' }),
    Object.freeze({ id: 'asalto', nombre: 'Asalto' }),
    Object.freeze({ id: 'sospechosa', nombre: 'Actividad sospechosa' }),
    Object.freeze({ id: 'vandalismo', nombre: 'Vandalismo' }),
    Object.freeze({ id: 'vif', nombre: 'VIF — Violencia intrafamiliar' })
  ]);
  const estados = Object.freeze(['Nuevo', 'En revisión', 'Derivado', 'Cerrado', 'No verificable']);

  app.IncidenciaModel = Object.freeze({
    tipos,
    estados,
    nombre(id) {
      return tipos.find(tipo => tipo.id === id)?.nombre || id;
    },
    existe(id) {
      return tipos.some(tipo => tipo.id === id);
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
