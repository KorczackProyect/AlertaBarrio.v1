/* Conserva los datos del formulario al avanzar y volver entre sus pasos. */
(function (app) {
  'use strict';

  const valoresIniciales = () => ({
    tipo: 'robo', descripcion: '', evidencia: '', direccion: 'Av. Central 420', nombreOculto: true
  });
  let datos = valoresIniciales();

  app.BorradorModel = Object.freeze({
    obtener() { return { ...datos }; },
    actualizar(cambios) {
      for (const campo of Object.keys(datos)) {
        if (Object.hasOwn(cambios, campo)) datos[campo] = cambios[campo];
      }
      return { ...datos };
    },
    reiniciar() {
      datos = valoresIniciales();
      return { ...datos };
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
