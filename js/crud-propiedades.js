if (!PNK_DB.requireAdmin('../index.html')) throw '';

let editandoId = null;
document.getElementById('sidebarNombre').textContent = PNK_DB.getSession().nombre;

function cerrarSesion() {
  PNK_DB.clearSession();
  window.location.href = 'login.html';
}

function render() {
  const tipo      = document.getElementById('fTipo').value;
  const provincia = document.getElementById('fProvincia').value;
  const estado    = document.getElementById('fEstado').value;
  const buscar    = document.getElementById('fBuscar').value.toLowerCase().trim();

  let props = PNK_DB.getPropiedades({ tipo, provincia, estado });
  if (buscar) props = props.filter(p =>
    p.codigo.toLowerCase().includes(buscar) ||
    p.sector.toLowerCase().includes(buscar) ||
    p.comuna.toLowerCase().includes(buscar)
  );

  props = [...props].reverse();
  document.getElementById('totalLabel').textContent = `Total: ${props.length}`;

  if (!props.length) {
    document.getElementById('tablaProps').innerHTML =
      '<p style="text-align:center;padding:2rem;color:var(--dark-soft);">No se encontraron propiedades.</p>';
    return;
  }

  const usuarios = PNK_DB.getUsuarios();

  document.getElementById('tablaProps').innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Código</th><th>Tipo</th><th>Provincia</th><th>Sector / Comuna</th>
          <th>Precio $</th><th>UF</th><th>Propietario</th><th>Estado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${props.map(p => {
          const propNombre = p.propietario_id
            ? (usuarios.find(u => u.id === p.propietario_id)?.nombre || '–')
            : '–';
          return `<tr>
            <td><code>${p.codigo}</code></td>
            <td>${p.tipo}</td>
            <td>${p.provincia}</td>
            <td>${p.sector}, ${p.comuna}</td>
            <td>${PNK_DB.fmtClp(p.precio_clp)}</td>
            <td>${Number(p.precio_uf).toLocaleString('es-CL')}</td>
            <td>${propNombre}</td>
            <td>
              <select onchange="cambiarEstado(${p.id}, this.value)"
                style="padding:.25rem .5rem;border:1px solid var(--cream-dark);border-radius:4px;font-size:.78rem;background:var(--cream);">
                <option value="activa"   ${p.estado === 'activa'   ? 'selected' : ''}>Activa</option>
                <option value="revision" ${p.estado === 'revision' ? 'selected' : ''}>En Revisión</option>
                <option value="inactiva" ${p.estado === 'inactiva' ? 'selected' : ''}>Inactiva</option>
              </select>
            </td>
            <td class="tbl-actions">
              <button class="btn-tbl btn-view" onclick="verPropiedad(${p.id})">Ver</button>
              <button class="btn-tbl btn-edit" onclick="editarPropiedad(${p.id})">Editar</button>
              <button class="btn-tbl btn-del"  onclick="eliminar(${p.id},'${p.codigo}')">Eliminar</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function verPropiedad(id) {
  const p = PNK_DB.getPropiedadById(id);
  if (!p) return;

  document.getElementById('vCod').textContent    = 'Cód: ' + p.codigo;
  document.getElementById('vTitle').textContent  = `${p.tipo} ${p.sector}`;
  document.getElementById('vLoc').textContent    = `📍 ${p.sector}, ${p.comuna} – Provincia ${p.provincia}`;
  document.getElementById('vPrecio').textContent = `${PNK_DB.fmtClp(p.precio_clp)} · ${Number(p.precio_uf).toLocaleString('es-CL')} UF`;
  document.getElementById('vDesc').textContent   = p.descripcion || 'Sin descripción.';

  document.getElementById('vFeatures').innerHTML = [
    p.dormitorios    ? `<div class="modal-feat"><strong>Dormitorios</strong>${p.dormitorios}</div>`       : '',
    p.banos          ? `<div class="modal-feat"><strong>Baños</strong>${p.banos}</div>`                   : '',
    p.area_terreno   ? `<div class="modal-feat"><strong>Área Terreno</strong>${p.area_terreno} m²</div>`  : '',
    p.area_construida? `<div class="modal-feat"><strong>Área Construida</strong>${p.area_construida} m²</div>` : '',
  ].join('');

  const amen = [
    ['Bodega',          'bodega'],
    ['Estacionamiento', 'estacionamiento'],
    ['Logia',           'logia'],
    ['Cocina amoblada', 'cocina_amoblada'],
    ['Antejardín',      'antejardin'],
    ['Patio trasero',   'patio_trasero'],
    ['Piscina',         'piscina'],
  ];
  document.getElementById('vAmen').innerHTML = amen.map(([l, k]) =>
    `<span class="amenidad ${p[k] ? 'yes' : ''}">${p[k] ? '✅' : '❌'} ${l}</span>`
  ).join('');

  document.getElementById('modalVer').classList.add('open');
}

function poblarSelectPropietarios(selId = 'fmPropietario') {
  const propietarios = PNK_DB.getUsuarios().filter(u => u.rol === 'propietario' && u.estado === 'activo');
  const sel = document.getElementById(selId);
  sel.innerHTML = '<option value="">Sin asignar</option>' +
    propietarios.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
}

function limpiarForm() {
  ['fmComuna', 'fmSector', 'fmDireccion', 'fmDesc'].forEach(id =>
    document.getElementById(id).value = ''
  );
  ['fmDorm', 'fmBanos', 'fmTerreno', 'fmConstruida', 'fmPrecioClp', 'fmPrecioUf'].forEach(id =>
    document.getElementById(id).value = 0
  );
  ['fmBodega', 'fmEstac', 'fmLogia', 'fmCocina', 'fmAnte', 'fmPatio', 'fmPiscina'].forEach(id =>
    document.getElementById(id).checked = false
  );
  document.getElementById('fmTipo').value        = 'Casa';
  document.getElementById('fmProvincia').value   = 'Elqui';
  document.getElementById('fmEstado').value      = 'activa';
  document.getElementById('fmPropietario').value = '';
  document.getElementById('modalFormMsg').style.display = 'none';
}

function abrirModalNuevo() {
  editandoId = null;
  document.getElementById('modalFormTitle').textContent = 'Nueva Propiedad';
  document.getElementById('modalFormBtn').textContent   = 'Publicar Propiedad';
  poblarSelectPropietarios();
  limpiarForm();
  document.getElementById('modalForm').classList.add('open');
}

function editarPropiedad(id) {
  const p = PNK_DB.getPropiedadById(id);
  if (!p) return;
  editandoId = id;

  document.getElementById('modalFormTitle').textContent = `Editar ${p.codigo}`;
  document.getElementById('modalFormBtn').textContent   = 'Guardar Cambios';
  poblarSelectPropietarios();

  document.getElementById('fmTipo').value        = p.tipo;
  document.getElementById('fmEstado').value      = p.estado;
  document.getElementById('fmProvincia').value   = p.provincia;
  document.getElementById('fmComuna').value      = p.comuna;
  document.getElementById('fmSector').value      = p.sector;
  document.getElementById('fmDireccion').value   = p.direccion    || '';
  document.getElementById('fmDesc').value        = p.descripcion  || '';
  document.getElementById('fmDorm').value        = p.dormitorios;
  document.getElementById('fmBanos').value       = p.banos;
  document.getElementById('fmTerreno').value     = p.area_terreno;
  document.getElementById('fmConstruida').value  = p.area_construida;
  document.getElementById('fmPrecioClp').value   = p.precio_clp;
  document.getElementById('fmPrecioUf').value    = p.precio_uf;
  document.getElementById('fmBodega').checked    = p.bodega;
  document.getElementById('fmEstac').checked     = p.estacionamiento;
  document.getElementById('fmLogia').checked     = p.logia;
  document.getElementById('fmCocina').checked    = p.cocina_amoblada;
  document.getElementById('fmAnte').checked      = p.antejardin;
  document.getElementById('fmPatio').checked     = p.patio_trasero;
  document.getElementById('fmPiscina').checked   = p.piscina;
  document.getElementById('fmPropietario').value = p.propietario_id || '';
  document.getElementById('modalFormMsg').style.display = 'none';

  document.getElementById('modalForm').classList.add('open');
}

function guardarPropiedad() {
  const comuna    = document.getElementById('fmComuna').value.trim();
  const precioClp = document.getElementById('fmPrecioClp').value;
  const precioUf  = document.getElementById('fmPrecioUf').value;
  const msg       = document.getElementById('modalFormMsg');

  if (!comuna || !precioClp || !precioUf) {
    msg.style.cssText = 'display:block;padding:.65rem 1rem;border-radius:6px;font-size:.85rem;margin-bottom:1rem;background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;';
    msg.textContent   = 'Comuna, precio $ y precio UF son obligatorios.';
    return;
  }

  const data = {
    tipo:            document.getElementById('fmTipo').value,
    estado:          document.getElementById('fmEstado').value,
    provincia:       document.getElementById('fmProvincia').value,
    comuna,
    sector:          document.getElementById('fmSector').value.trim(),
    direccion:       document.getElementById('fmDireccion').value.trim(),
    descripcion:     document.getElementById('fmDesc').value.trim(),
    dormitorios:     Number(document.getElementById('fmDorm').value),
    banos:           Number(document.getElementById('fmBanos').value),
    area_terreno:    Number(document.getElementById('fmTerreno').value),
    area_construida: Number(document.getElementById('fmConstruida').value),
    precio_clp:      Number(precioClp),
    precio_uf:       Number(precioUf),
    bodega:          document.getElementById('fmBodega').checked,
    estacionamiento: document.getElementById('fmEstac').checked,
    logia:           document.getElementById('fmLogia').checked,
    cocina_amoblada: document.getElementById('fmCocina').checked,
    antejardin:      document.getElementById('fmAnte').checked,
    patio_trasero:   document.getElementById('fmPatio').checked,
    piscina:         document.getElementById('fmPiscina').checked,
    propietario_id:  Number(document.getElementById('fmPropietario').value) || null,
  };

  if (editandoId) {
    PNK_DB.actualizarPropiedad(editandoId, data);
    PNK_DB.toast('Propiedad actualizada correctamente.', 'success');
  } else {
    PNK_DB.crearPropiedad(data);
    PNK_DB.toast('Propiedad publicada correctamente.', 'success');
  }

  cerrarModal('modalForm');
  render();
}

function cambiarEstado(id, estado) {
  PNK_DB.actualizarPropiedad(id, { estado });
  PNK_DB.toast(`Estado actualizado: ${estado}`, 'success');
}

function eliminar(id, codigo) {
  if (!confirm(`¿Eliminar la propiedad ${codigo}?`)) return;
  PNK_DB.eliminarPropiedad(id);
  PNK_DB.toast('Propiedad eliminada.', 'warning');
  render();
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
}

render();