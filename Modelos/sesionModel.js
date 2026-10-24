/* Sesión de demostración por pestaña. Sus datos son modificables en el navegador;
 * no reemplaza una sesión autenticada y autorizada por un servidor. */
(function (app) {
  'use strict';

  const claveSesion = 'alertabarrio.sesion.demo';

  function identidadValida(identidad) {
    return identidad !== null && typeof identidad === 'object' && !Array.isArray(identidad) && (
      (identidad.usuario === 'admin1' && identidad.rol === 'admin') ||
      (identidad.usuario === 'testmuni' && identidad.rol === 'muni')
    );
  }

  function copiarIdentidad(identidad) {
    return { usuario: identidad.usuario, rol: identidad.rol };
  }

  app.SesionModel = Object.freeze({
    iniciar(identidad) {
      if (!identidadValida(identidad)) {
        throw new Error('No se puede iniciar la sesión: el usuario o su rol no son válidos.');
      }
      const sesion = copiarIdentidad(identidad);
      try {
        window.sessionStorage.setItem(claveSesion, JSON.stringify(sesion));
      } catch (error) {
        throw new Error('No se pudo guardar la sesión. Habilita el almacenamiento de sesión del navegador e inténtalo nuevamente.');
      }
      return copiarIdentidad(sesion);
    },
    obtener() {
      try {
        const texto = window.sessionStorage.getItem(claveSesion);
        if (texto === null) return null;
        const identidad = JSON.parse(texto);
        if (!identidadValida(identidad) || Object.keys(identidad).length !== 2) return null;
        return copiarIdentidad(identidad);
      } catch (error) {
        return null;
      }
    },
    cerrar() {
      try {
        window.sessionStorage.removeItem(claveSesion);
      } catch (error) {
        // Si el almacenamiento está bloqueado, obtener() también falla cerrado.
      }
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
