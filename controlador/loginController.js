/* El rol se obtiene del modelo de usuarios; el formulario no permite elegirlo. */
(function (app) {
  'use strict';
  if (!app.AccesoController.autorizado) return;

  const formulario = document.getElementById('formulario-login');
  const usuario = document.getElementById('usuario-login');
  const clave = document.getElementById('clave-login');
  const error = document.getElementById('error-login');
  const mostrar = document.getElementById('mostrar-clave');

  mostrar.addEventListener('click', () => {
    const visible = clave.type === 'password';
    clave.type = visible ? 'text' : 'password';
    mostrar.textContent = visible ? 'Ocultar' : 'Mostrar';
    mostrar.setAttribute('aria-pressed', String(visible));
  });
  formulario.addEventListener('input', () => { error.hidden = true; });
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    const identidad = app.UsuarioModel.autenticar(usuario.value, clave.value);
    if (!identidad) {
      error.textContent = 'Usuario o contraseña incorrectos.';
      error.hidden = false;
      clave.value = '';
      clave.focus();
      return;
    }
    try {
      app.SesionModel.iniciar(identidad);
      clave.value = '';
      window.location.replace(app.AccesoController.inicio(identidad.rol));
    } catch (problema) {
      error.textContent = problema.message;
      error.hidden = false;
    }
  });
})(window.AlertaBarrio);
