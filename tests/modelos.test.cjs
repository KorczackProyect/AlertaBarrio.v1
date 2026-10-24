const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function cargarModelos() {
  const contexto = vm.createContext({ window: {} });
  for (const file of ['incidenciaModel.js', 'reporteModel.js', 'municipalidadModel.js', 'borradorModel.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Modelos', file), 'utf8'), contexto);
  }
  return contexto.window.AlertaBarrio;
}

test('VIF está disponible y permite crear reportes', () => {
  const app = cargarModelos();
  assert.equal(app.IncidenciaModel.nombre('vif'), 'VIF — Violencia intrafamiliar');
  const reporte = app.ReporteModel.crear({ tipo: 'vif', direccion: 'Dirección de ejemplo', nombreOculto: true });
  assert.equal(reporte.estado, 'Nuevo');
  assert.equal(app.ReporteModel.listar({ tipo: 'vif' }).length, 1);
});

test('los filtros se combinan y buscan por tipo o lugar', () => {
  const app = cargarModelos();
  assert.equal(app.ReporteModel.listar({ tipo: 'vandalismo', estado: 'En revisión', busqueda: 'aromos' })[0].id, 'AB-1041');
  assert.equal(app.ReporteModel.listar({ tipo: 'robo', estado: 'Cerrado' }).length, 0);
  assert.equal(app.ReporteModel.listar({ busqueda: 'actividad' })[0].id, 'AB-1040');
});

test('guardar estado y nota rechaza estados inválidos y protege los datos de cambios por referencia', () => {
  const app = cargarModelos();
  const copia = app.ReporteModel.obtener('AB-1041');
  copia.estado = 'Cerrado';
  assert.equal(app.ReporteModel.obtener('AB-1041').estado, 'En revisión');
  app.ReporteModel.actualizar('AB-1041', { estado: 'Cerrado', nota: ' Nota interna ' });
  assert.equal(app.ReporteModel.obtener('AB-1041').nota, 'Nota interna');
  assert.throws(() => app.ReporteModel.actualizar('AB-1041', { estado: 'Desconocido', nota: '' }));
  assert.equal(app.ReporteModel.obtener('AB-1041').estado, 'Cerrado');
});

test('crear exige tipo y dirección válidos, respeta la privacidad y genera folios únicos', () => {
  const app = cargarModelos();
  assert.throws(() => app.ReporteModel.crear({ tipo: 'vif', direccion: ' ' }));
  assert.throws(() => app.ReporteModel.crear({ tipo: 'inexistente', direccion: 'Ejemplo' }));
  const primero = app.ReporteModel.crear({ tipo: 'robo', direccion: 'Ejemplo', nombreOculto: false });
  const segundo = app.ReporteModel.crear({ tipo: 'asalto', direccion: 'Ejemplo 2', nombreOculto: true });
  assert.equal(primero.nombreOculto, false);
  assert.notEqual(primero.id, segundo.id);
});

test('el borrador conserva lo escrito y se puede reiniciar', () => {
  const app = cargarModelos();
  app.BorradorModel.actualizar({ tipo: 'vif', descripcion: 'Texto de ejemplo', nombreOculto: false, campoNoPermitido: 'x' });
  assert.equal(app.BorradorModel.obtener().descripcion, 'Texto de ejemplo');
  assert.equal(app.BorradorModel.obtener().nombreOculto, false);
  assert.equal(app.BorradorModel.obtener().campoNoPermitido, undefined);
  app.BorradorModel.reiniciar();
  assert.equal(app.BorradorModel.obtener().tipo, 'robo');
  assert.equal(app.BorradorModel.obtener().descripcion, '');
});

test('crear una municipalidad valida los datos antes de modificar la lista', () => {
  const app = cargarModelos();
  assert.throws(() => app.MunicipalidadModel.crear({ nombre: '', correo: 'sin-correo' }));
  assert.equal(app.MunicipalidadModel.listar().length, 3);
  const item = app.MunicipalidadModel.crear({ nombre: 'Comuna de ejemplo', correo: 'demo@example.com' });
  assert.equal(item.estado, 'Piloto creado');
  assert.equal(app.MunicipalidadModel.listar().length, 4);
});
