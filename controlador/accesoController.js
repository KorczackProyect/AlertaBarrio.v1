/* Acceso de demostración. Los permisos reales deberán verificarse en el servidor. */
(function (app) {
  'use strict';

  const raiz = document.documentElement;
  const pagina = raiz.dataset.vista;
  let autorizado = false;
  const inicio = rol => rol === 'admin' ? 'admin.html' : 'usuario-muni.html';

  function redirigir(ruta) {
    autorizado = false;
    delete raiz.dataset.autorizado;
    window.location.replace(ruta);
  }

  function verificar() {
    if (!['login', 'admin', 'muni', 'mobile'].includes(pagina)) {
      redirigir('login.html');
      return;
    }
    const sesion = app.SesionModel.obtener();
    if (pagina === 'login' && sesion) {
      redirigir(inicio(sesion.rol));
      return;
    }
    if (['admin', 'muni'].includes(pagina) && !sesion) {
      redirigir('login.html');
      return;
    }
    if (sesion?.rol === 'muni' && ['admin', 'mobile'].includes(pagina)) {
      redirigir(inicio(sesion.rol));
      return;
    }

    document.querySelectorAll('[data-roles]').forEach(enlace => {
      enlace.hidden = !sesion || !enlace.dataset.roles.split(' ').includes(sesion.rol);
    });
    document.querySelectorAll('[data-publico]').forEach(elemento => { elemento.hidden = Boolean(sesion); });
    document.querySelectorAll('[data-con-sesion]').forEach(elemento => { elemento.hidden = !sesion; });
    document.querySelectorAll('[data-usuario-sesion]').forEach(elemento => { elemento.textContent = sesion?.usuario || ''; });
    document.querySelectorAll('[data-rol-sesion]').forEach(elemento => {
      elemento.textContent = sesion?.rol === 'admin' ? 'Admin' : 'Muni';
    });
    autorizado = true;
    raiz.dataset.autorizado = 'true';
  }

  app.AccesoController = Object.freeze({
    get autorizado() { return autorizado; },
    inicio
  });

  document.querySelectorAll('[data-cerrar-sesion]').forEach(boton => {
    boton.addEventListener('click', () => {
      app.SesionModel.cerrar();
      redirigir('login.html');
    });
  });
  window.addEventListener('pageshow', verificar);
  window.addEventListener('pagehide', () => {
    autorizado = false;
    delete raiz.dataset.autorizado;
  });
  verificar();
})(window.AlertaBarrio = window.AlertaBarrio || {});
