if (!PNK_DB.requireAdmin('../index.html')) throw '';

const ses = PNK_DB.getSession();
document.getElementById('sidebarNombre').textContent = ses.nombre;

function cerrarSesion() { PNK_DB.clearSession(); window.location.href = 'login.html'; }

function render() {
  const usuarios    = PNK_DB.getUsuarios();
  const propiedades = PNK_DB.getPropiedades();
  const pendientes  = usuarios.filter(u => u.estado === 'pendiente');
  const propsRecientes = [...propiedades].reverse().slice(0, 8);

  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi-card highlight">
      <span class="kpi-icon">🏠</span>
      <span class="kpi-label">Propiedades Activas</span>
      <span class="kpi-val">${propiedades.filter(p=>p.estado==='activa').length}</span>
      <span class="kpi-sub">${propiedades.filter(p=>p.estado==='revision').length} en revisión</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">👤</span>
      <span class="kpi-label">Propietarios</span>
      <span class="kpi-val">${usuarios.filter(u=>u.rol==='propietario').length}</span>
      <span class="kpi-sub">${usuarios.filter(u=>u.rol==='propietario'&&u.estado==='activo').length} activos</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">💼</span>
      <span class="kpi-label">Gestores</span>
      <span class="kpi-val">${usuarios.filter(u=>u.rol==='gestor').length}</span>
      <span class="kpi-sub">${usuarios.filter(u=>u.rol==='gestor'&&u.estado==='activo').length} activos</span>
    </div>
    <div class="kpi-card" style="${pendientes.length?'border:2px solid var(--terracotta);':''}">
      <span class="kpi-icon">⏳</span>
      <span class="kpi-label">Pendientes</span>
      <span class="kpi-val" style="${pendientes.length?'color:var(--terracotta);':''}">${pendientes.length}</span>
      <span class="kpi-sub">Requieren revisión</span>
    </div>`;

  if (!pendientes.length) {
    document.getElementById('tablaPendientes').innerHTML =
      '<p style="text-align:center;padding:1.5rem;color:var(--dark-soft);">No hay cuentas pendientes.</p>';
  } else {
    document.getElementById('tablaPendientes').innerHTML = `
      <table class="data-table">
        <thead><tr><th>Nombre</th><th>Tipo</th><th>Correo</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          ${pendientes.map(u => `
            <tr id="row-${u.id}">
              <td><strong>${u.nombre}</strong></td>
              <td>${u.rol === 'propietario' ? 'Propietario' : 'Gestor Free'}</td>
              <td>${u.correo}</td>
              <td>${u.fecha_registro?.slice(0,10) || '–'}</td>
              <td><span class="status-badge status-pending" id="badge-${u.id}">Pendiente</span></td>
              <td class="tbl-actions">
                <button class="btn-tbl btn-edit" onclick="activar(${u.id})">Activar</button>
                <button class="btn-tbl btn-del" onclick="rechazar(${u.id})">Rechazar</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  document.getElementById('tablaProps').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Código</th><th>Tipo</th><th>Ubicación</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        ${propsRecientes.map(p => `
          <tr>
            <td><code>${p.codigo}</code></td>
            <td>${p.tipo}</td>
            <td>${p.sector}, ${p.comuna}</td>
            <td>${PNK_DB.fmtClp(p.precio_clp)}</td>
            <td><span class="status-badge status-${p.estado}">${p.estado}</span></td>
            <td class="tbl-actions">
              <a href="crud-propiedades.html" class="btn-tbl btn-view">Gestionar</a>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function activar(id) {
  const u = PNK_DB.activarUsuario(id);
  PNK_DB.toast(`✅ ${u.nombre} activado${u.penka_id ? '. PENKA_ID: ' + u.penka_id : ''}`, 'success');
  render();
}

function rechazar(id) {
  PNK_DB.actualizarUsuario(id, { estado: 'inactivo' });
  PNK_DB.toast('Cuenta rechazada.', 'warning');
  render();
}


function renderPanelImagenes() {
  const items = [
    { clave: 'casa1',    label: 'Casa 1',    desc: 'Hero card + .pi1 + .t1' },
    { clave: 'depto1',   label: 'Depto 1',   desc: 'Hero card + .pi2 + .t2' },
    { clave: 'terreno1', label: 'Terreno 1', desc: 'Hero card + .pi3 + .t3' },
    { clave: 'casa2',    label: 'Casa 2',    desc: '.pi4' },
    { clave: 'depto2',   label: 'Depto 2',   desc: '.pi5' },
    { clave: 'terreno2', label: 'Terreno 2', desc: '.pi6' },
    { clave: 'Lobby',    label: 'Lobby',     desc: 'Fondo formularios de registro' },
  ];
  document.getElementById('panelImagenes').innerHTML = items.map(({ clave, label, desc }) => `
    <div style="background:var(--cream);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);">
      <div id="prev-${clave}" style="height:120px;background-size:cover;background-position:center;background-color:#ddd;
        display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#888;"></div>
      <div style="padding:.85rem;">
        <p style="font-weight:700;font-size:.9rem;margin-bottom:.2rem;">${label}</p>
        <p style="font-size:.72rem;color:var(--dark-soft);margin-bottom:.75rem;">${desc}</p>
        <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;
          background:var(--terracotta);color:white;border-radius:6px;padding:.45rem .9rem;
          font-size:.8rem;font-weight:600;width:fit-content;">
          Subir foto
          <input type="file" accept="image/*" style="display:none;"
            onchange="subirImagen(this,'${clave}',actualizarPreview)"/>
        </label>
        <button onclick="resetImagen('${clave}')"
          style="margin-top:.5rem;background:none;border:none;cursor:pointer;font-size:.72rem;color:var(--dark-soft);padding:0;">
          ↺ Restaurar placeholder
        </button>
      </div>
    </div>`).join('');

  items.forEach(({ clave }) => actualizarPreview(clave, PNK_IMAGES[clave]));
}

function actualizarPreview(clave, uri) {
  const el = document.getElementById('prev-' + clave);
  if (!el) return;
  if (uri) {
    el.style.backgroundImage = `url("${uri}")`;
    el.textContent = '';
  } else {
    el.textContent = 'Sin imagen';
  }
}

function resetImagen(clave) {
  localStorage.removeItem('pnk_img_' + clave);
  cargarImagenesGuardadas();
  inyectarImagenes();
  actualizarPreview(clave, PNK_IMAGES[clave]);
  PNK_DB.toast('Imagen restaurada al placeholder.', 'info');
}

render();
renderPanelImagenes();