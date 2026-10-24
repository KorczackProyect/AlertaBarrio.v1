/* Cuentas de demostración: el navegador puede leer este archivo.
 * En producción, la autenticación y los permisos deben validarse en el servidor. */
(function (app) {
  'use strict';

  const cuentas = Object.freeze([
    Object.freeze({ usuario: 'admin1', clave: 'demo-admin', rol: 'admin' }),
    Object.freeze({ usuario: 'testmuni', clave: 'demo-muni', rol: 'muni' })
  ]);

  app.UsuarioModel = Object.freeze({
    autenticar(usuario, clave) {
      if (typeof usuario !== 'string' || typeof clave !== 'string') return null;
      const cuenta = cuentas.find(item => item.usuario === usuario.trim() && item.clave === clave);
      return cuenta ? { usuario: cuenta.usuario, rol: cuenta.rol } : null;
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
