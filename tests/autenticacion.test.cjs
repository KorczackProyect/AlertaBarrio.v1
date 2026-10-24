'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const claveSesion = 'alertabarrio.sesion.demo';

function crearEntorno(almacenamiento) {
  const valores = new Map();
  const storage = almacenamiento || {
    getItem(clave) { return valores.has(clave) ? valores.get(clave) : null; },
    setItem(clave, valor) { valores.set(clave, String(valor)); },
    removeItem(clave) { valores.delete(clave); }
  };
  const window = { sessionStorage: storage };
  const contexto = vm.createContext({ window });
  for (const nombre of ['usuarioModel.js', 'sesionModel.js']) {
    const ruta = path.join(__dirname, '..', 'Modelos', nombre);
    vm.runInContext(fs.readFileSync(ruta, 'utf8'), contexto, { filename: nombre });
  }
  return { app: window.AlertaBarrio, storage, window };
}

function plano(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

test('las dos cuentas permiten autenticar y devuelven únicamente su identidad', () => {
  const { app } = crearEntorno();
  const admin = app.UsuarioModel.autenticar('admin1', 'demo-admin');
  const muni = app.UsuarioModel.autenticar('testmuni', 'demo-muni');
  assert.deepEqual(plano(admin), { usuario: 'admin1', rol: 'admin' });
  assert.deepEqual(plano(muni), { usuario: 'testmuni', rol: 'muni' });
  assert.deepEqual(Object.keys(app.UsuarioModel), ['autenticar']);
  assert.deepEqual(plano(app.UsuarioModel.autenticar('  admin1  ', 'demo-admin')), plano(admin));
  admin.rol = 'muni';
  assert.equal(app.UsuarioModel.autenticar('admin1', 'demo-admin').rol, 'admin');
});

test('rechaza contraseñas incorrectas, cuentas desconocidas y entradas inválidas', () => {
  const { app } = crearEntorno();
  for (const [usuario, clave] of [
    ['admin1', 'incorrecta'], ['testmuni', 'demo-admin'], ['Admin1', 'demo-admin'],
    ['nadie', 'demo-muni'], ['', ''], ['admin1', 'demo-admin '],
    [null, 'demo-admin'], ['admin1', null], [undefined, undefined], [{}, []]
  ]) {
    assert.equal(app.UsuarioModel.autenticar(usuario, clave), null);
  }
});

test('guarda solo usuario y rol en sessionStorage y devuelve copias independientes', () => {
  const { app, storage } = crearEntorno();
  assert.equal(app.SesionModel.obtener(), null);
  const identidad = { usuario: 'admin1', rol: 'admin', clave: 'no guardar', otro: 'descartar' };
  const resultado = app.SesionModel.iniciar(identidad);
  assert.deepEqual(JSON.parse(storage.getItem(claveSesion)), { usuario: 'admin1', rol: 'admin' });
  assert.deepEqual(plano(resultado), { usuario: 'admin1', rol: 'admin' });
  identidad.rol = 'muni';
  resultado.usuario = 'testmuni';
  const lectura = app.SesionModel.obtener();
  assert.deepEqual(plano(lectura), { usuario: 'admin1', rol: 'admin' });
  lectura.rol = 'muni';
  assert.equal(app.SesionModel.obtener().rol, 'admin');
  app.SesionModel.iniciar({ usuario: 'testmuni', rol: 'muni' });
  assert.deepEqual(plano(app.SesionModel.obtener()), { usuario: 'testmuni', rol: 'muni' });
});

test('no inicia sesiones con combinaciones de usuario y rol no permitidas', () => {
  const { app, storage } = crearEntorno();
  for (const identidad of [
    null, undefined, [], {}, { usuario: 'admin1', rol: 'muni' },
    { usuario: 'testmuni', rol: 'admin' }, { usuario: 'otro', rol: 'admin' },
    { usuario: 'admin1', rol: 'desconocido' }, { usuario: ' admin1', rol: 'admin' }
  ]) {
    assert.throws(() => app.SesionModel.iniciar(identidad), /usuario o su rol no son válidos/);
    assert.equal(storage.getItem(claveSesion), null);
  }
});

test('la lectura rechaza datos corruptos, campos extra y roles alterados', () => {
  const { app, storage } = crearEntorno();
  for (const texto of [
    '{', '', 'null', 'true', '42', '"admin1"', '[]', '{}',
    '{"usuario":"admin1","rol":"muni"}',
    '{"usuario":"otro","rol":"admin"}',
    '{"usuario":"testmuni","rol":"admin"}',
    '{"usuario":"admin1"}',
    '{"usuario":"admin1","rol":"admin","clave":"sobra"}'
  ]) {
    storage.setItem(claveSesion, texto);
    assert.equal(app.SesionModel.obtener(), null);
  }
});

test('cerrar elimina solamente la sesión de la demostración', () => {
  const { app, storage } = crearEntorno();
  storage.setItem('otra.clave', 'conservar');
  app.SesionModel.iniciar({ usuario: 'admin1', rol: 'admin' });
  app.SesionModel.cerrar();
  assert.equal(storage.getItem(claveSesion), null);
  assert.equal(storage.getItem('otra.clave'), 'conservar');
  assert.equal(app.SesionModel.obtener(), null);
  assert.doesNotThrow(() => app.SesionModel.cerrar());
});

test('almacenamiento bloqueado produce un mensaje claro al iniciar y falla cerrado al leer', () => {
  const denegar = () => { throw new Error('almacenamiento bloqueado'); };
  const { app } = crearEntorno({ getItem: denegar, setItem: denegar, removeItem: denegar });
  assert.throws(() => app.SesionModel.iniciar({ usuario: 'admin1', rol: 'admin' }), /No se pudo guardar la sesión/);
  assert.equal(app.SesionModel.obtener(), null);
  assert.doesNotThrow(() => app.SesionModel.cerrar());
});

test('tolera también el bloqueo de la propiedad sessionStorage del navegador', () => {
  const { app, window } = crearEntorno();
  Object.defineProperty(window, 'sessionStorage', {
    get() { throw new Error('SecurityError'); }
  });
  assert.throws(() => app.SesionModel.iniciar({ usuario: 'testmuni', rol: 'muni' }), /Habilita el almacenamiento de sesión/);
  assert.equal(app.SesionModel.obtener(), null);
  assert.doesNotThrow(() => app.SesionModel.cerrar());
});
