/* Entidades de ejemplo; estas operaciones se conectarán al servidor en la siguiente etapa. */
(function (app) {
  'use strict';

  const municipalidades = [
    { id: 1, nombre: 'Comuna Demo', estado: 'Piloto activo', usuarios: 5 },
    { id: 2, nombre: 'Villa Norte', estado: 'Activa', usuarios: 8 },
    { id: 3, nombre: 'Puerto Verde', estado: 'Activa', usuarios: 4 }
  ];

  app.MunicipalidadModel = Object.freeze({
    listar() {
      return municipalidades.map(item => ({ ...item }));
    },
    crear({ nombre, correo }) {
      nombre = String(nombre || '').trim();
      correo = String(correo || '').trim();
      if (!nombre) throw new Error('Indica el nombre de la municipalidad.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error('Indica un correo institucional válido.');
      const item = { id: municipalidades.length + 1, nombre, correo, estado: 'Piloto creado', usuarios: 1 };
      municipalidades.push(item);
      return { ...item };
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
