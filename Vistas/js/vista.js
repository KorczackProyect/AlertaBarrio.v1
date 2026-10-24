/* Presentación del DOM. Las plantillas están declaradas en los archivos HTML. */
(function (app) {
  'use strict';

  function texto(raiz, selector, valor) {
    const elemento = raiz.querySelector(selector);
    if (elemento) elemento.textContent = valor;
  }

  function plantilla(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  app.Vista = Object.freeze({
    avisar(mensaje, error = false) {
      const aviso = document.getElementById('aviso-global');
      aviso.hidden = false;
      aviso.textContent = mensaje;
      aviso.classList.toggle('error', error);
      aviso.setAttribute('role', error ? 'alert' : 'status');
    },
    opciones(elemento, opciones, inicial) {
      elemento.replaceChildren();
      if (inicial) elemento.add(new Option(inicial, ''));
      opciones.forEach(opcion => {
        elemento.add(new Option(opcion.nombre || opcion, opcion.id || opcion));
      });
    },
    reportes(reportes, seleccionado) {
      const lista = document.getElementById('lista-reportes');
      lista.replaceChildren();
      reportes.forEach(reporte => {
        const nodo = plantilla('plantilla-reporte');
        nodo.dataset.reporte = reporte.id;
        nodo.classList.toggle('seleccionado', reporte.id === seleccionado);
        nodo.setAttribute('aria-pressed', String(reporte.id === seleccionado));
        texto(nodo, '[data-prioridad]', reporte.prioridad);
        nodo.querySelector('[data-prioridad]').classList.add(reporte.prioridad === 'Alta' ? 'alta' : 'advertencia');
        texto(nodo, '[data-titulo]', app.IncidenciaModel.nombre(reporte.tipo) + ' · ' + reporte.id);
        texto(nodo, '[data-lugar]', 'Sector ' + reporte.sector + ' · ' + reporte.direccion);
        texto(nodo, '[data-tiempo]', reporte.fechaTexto + ' · ' + reporte.estado);
        lista.append(nodo);
      });
      document.getElementById('lista-vacia').hidden = reportes.length !== 0;
      texto(document, '#cantidad-reportes', reportes.length);
    },
    detalle(reporte) {
      document.getElementById('detalle-vacio').hidden = Boolean(reporte);
      document.getElementById('detalle-reporte').hidden = !reporte;
      if (!reporte) return;
      const raiz = document.getElementById('detalle-reporte');
      texto(raiz, '[data-folio]', reporte.id + ' · ' + reporte.fechaTexto);
      texto(raiz, '[data-tipo]', app.IncidenciaModel.nombre(reporte.tipo));
      texto(raiz, '[data-prioridad]', 'Prioridad ' + reporte.prioridad.toLowerCase());
      raiz.querySelector('[data-prioridad]').classList.toggle('alta', reporte.prioridad === 'Alta');
      texto(raiz, '[data-lugar]', 'Sector ' + reporte.sector + ' · ' + reporte.direccion);
      texto(raiz, '[data-descripcion]', reporte.descripcion);
      texto(raiz, '[data-evidencia]', reporte.evidencia);
      document.getElementById('estado-reporte').value = reporte.estado;
      document.getElementById('nota-interna').value = reporte.nota;
    },
    resumen(resumen) {
      texto(document, '#total-reportes', resumen.total);
      texto(document, '#pendientes-reportes', resumen.pendientes + ' pendientes de revisión');
      texto(document, '#resumen-sectores', Object.entries(resumen.sectores).map(([sector, cantidad]) => sector + ' ' + cantidad).join(' / '));
    },
    municipalidades(items) {
      const lista = document.getElementById('lista-municipalidades');
      lista.replaceChildren();
      items.forEach(item => {
        const nodo = plantilla('plantilla-municipalidad');
        texto(nodo, '[data-nombre]', item.nombre);
        texto(nodo, '[data-usuarios]', item.usuarios + ' usuarios');
        texto(nodo, '[data-estado]', item.estado);
        lista.append(nodo);
      });
      texto(document, '#total-municipalidades', items.length);
    },
    tipos(items) {
      const lista = document.getElementById('lista-tipos');
      lista.replaceChildren();
      items.forEach(item => {
        const boton = plantilla('plantilla-tipo');
        boton.dataset.tipo = item.id;
        boton.textContent = item.nombre;
        lista.append(boton);
      });
    },
    seleccionarTipo(id) {
      document.querySelectorAll('[data-tipo]').forEach(boton => {
        boton.setAttribute('aria-pressed', String(boton.dataset.tipo === id));
      });
    },
    paso(numero, borrador, folio) {
      document.querySelectorAll('[data-paso]').forEach(seccion => { seccion.hidden = Number(seccion.dataset.paso) !== numero; });
      document.querySelectorAll('[data-progreso]').forEach(barra => { barra.classList.toggle('activo', Number(barra.dataset.progreso) <= numero); });
      texto(document, '#tipo-evidencia', 'Paso 2 de 4 · ' + app.IncidenciaModel.nombre(borrador.tipo));
      texto(document, '#resumen-tipo', app.IncidenciaModel.nombre(borrador.tipo));
      texto(document, '#resumen-direccion', borrador.direccion);
      texto(document, '#resumen-descripcion', borrador.descripcion || 'Sin descripción adicional');
      texto(document, '#resumen-evidencia', borrador.evidencia || 'Sin evidencia adjunta');
      texto(document, '#resumen-privacidad', borrador.nombreOculto ? 'Nombre oculto al público' : 'Nombre visible en el seguimiento');
      texto(document, '#folio-enviado', folio || '');
      document.getElementById('descripcion').value = borrador.descripcion;
      document.getElementById('direccion').value = borrador.direccion;
      document.getElementById('nombre-oculto').checked = borrador.nombreOculto;
      document.getElementById('volver').hidden = numero === 0 || numero === 4;
      texto(document, '#continuar', numero < 3 ? 'Continuar' : numero === 3 ? 'Enviar reporte' : 'Hacer otro reporte');
      const encabezado = document.querySelector('[data-paso="' + numero + '"] h1');
      if (encabezado) encabezado.focus({ preventScroll: true });
    }
  });
})(window.AlertaBarrio = window.AlertaBarrio || {});
