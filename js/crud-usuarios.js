if (!PNK_DB.requireAdmin('../index.html')) throw '';

let editandoId = null;
document.getElementById('sidebarNombre').textContent = PNK_DB.getSession().nombre;

function cerrarSesion() {
  PNK_DB.clearSession();
  window.location.href = 'login.html';
}

function render() {
  const rol    = document.getElementById('fRol').value;
  const estado = document.getElementById('fEstado').value;
  const buscar = document.getElementById('fBuscar').value.toLowerCase().trim();

  let usuarios = PNK_DB.getUsuarios().filter(u => u.rol !== 'admin');
  if (rol)    usuarios = usuarios.filter(u => u.rol === rol);
  if (estado) usuarios = usuarios.filter(u => u.estado === estado);
  if (buscar) usuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(buscar) ||
    u.correo.toLowerCase().includes(buscar)
  );

  document.getElementById('totalLabel').textContent = `Total: ${usuarios.length}`;

  if (!usuarios.length) {
    document.getElementById('tablaUsuarios').innerHTML =
      '<p style="text-align:center;padding:2rem;color:var(--dark-soft);">No se encontraron usuarios.</p>';
    return;
  }

  document.getElementById('tablaUsuarios').innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>RUT</th><th>Nombre</th><th>Tipo</th><th>Correo</th>
          <th>Teléfono</th><th>Registro</th><th>Estado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${usuarios.map(u => `
          <tr>
            <td>${u.rut}</td>
            <td>
              <strong>${u.nombre}</strong>
              ${u.penka_id ? `<br/><span style="font-size:.7rem;color:var(--gold);font-weight:600;">${u.penka_id}</span>` : ''}
            </td>
            <td>${u.rol === 'propietario' ? 'Propietario' : 'Gestor Free'}</td>
            <td>${u.correo}</td>
            <td>${u.telefono || '–'}</td>
            <td>${u.fecha_registro?.slice(0, 10) || '–'}</td>
            <td><span class="status-badge status-${u.estado}">${u.estado.charAt(0).toUpperCase() + u.estado.slice(1)}</span></td>
            <td class="tbl-actions">
              <button class="btn-tbl btn-view" onclick="verUsuario(${u.id})">Ver</button>
              <button class="btn-tbl btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
              ${u.estado === 'pendiente'
                ? `<button class="btn-tbl btn-edit" style="background:rgba(72,187,120,.15);color:#2F855A;" onclick="cambiarEstado(${u.id},'activo')">Activar</button>
                   <button class="btn-tbl btn-del" onclick="cambiarEstado(${u.id},'inactivo')">Rechazar</button>`
                : u.estado === 'activo'
                ? `<button class="btn-tbl btn-del" onclick="cambiarEstado(${u.id},'inactivo')">Dar baja</button>`
                : `<button class="btn-tbl btn-edit" style="background:rgba(72,187,120,.15);color:#2F855A;" onclick="cambiarEstado(${u.id},'activo')">Reactivar</button>`
              }
              <button class="btn-tbl btn-del" onclick="eliminar(${u.id},'${u.nombre}')">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function verUsuario(id) {
  const u = PNK_DB.findUserById(id);
  if (!u) return;

  document.getElementById('verAvatar').textContent = u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('');
  document.getElementById('verNombre').textContent = u.nombre;
  document.getElementById('verRolEstado').innerHTML = `
    ${u.rol === 'propietario' ? 'Propietario' : 'Gestor Free'}
    ${u.penka_id ? `· <strong style="color:var(--gold)">${u.penka_id}</strong>` : ''}
    · <span class="status-badge status-${u.estado}">${u.estado}</span>`;

  document.getElementById('verDatos').innerHTML = [
    `<div class="modal-feat"><strong>RUT</strong>${u.rut}</div>`,
    `<div class="modal-feat"><strong>Correo</strong>${u.correo}</div>`,
    `<div class="modal-feat"><strong>Teléfono</strong>${u.telefono || '–'}</div>`,
    `<div class="modal-feat"><strong>Fecha Nac.</strong>${u.fecha_nac || '–'}</div>`,
    u.num_bienes_raices ? `<div class="modal-feat"><strong>Bienes Raíces</strong>${u.num_bienes_raices}</div>` : '',
    `<div class="modal-feat"><strong>Registro</strong>${u.fecha_registro?.slice(0, 10) || '–'}</div>`,
  ].join('');

  document.getElementById('modalVer').classList.add('open');
}

function abrirModalNuevo() {
  editandoId = null;
  document.getElementById('modalFormTitle').textContent = 'Nuevo Usuario';
  document.getElementById('modalFormBtn').textContent   = 'Crear Usuario';
  document.getElementById('campoRut').style.display      = '';
  document.getElementById('campoPassword').style.display = '';

  ['fmRut', 'fmNombre', 'fmCorreo', 'fmTelefono', 'fmPassword'].forEach(id =>
    document.getElementById(id).value = ''
  );
  document.getElementById('fmRol').value    = 'propietario';
  document.getElementById('fmEstado').value = 'activo';
  document.getElementById('fmSexo').value   = '';
  document.getElementById('modalFormMsg').style.display = 'none';

  document.getElementById('modalForm').classList.add('open');
}

function editarUsuario(id) {
  const u = PNK_DB.findUserById(id);
  if (!u) return;
  editandoId = id;

  document.getElementById('modalFormTitle').textContent  = 'Editar Usuario';
  document.getElementById('modalFormBtn').textContent    = 'Guardar Cambios';
  document.getElementById('campoRut').style.display      = 'none';
  document.getElementById('campoPassword').style.display = 'none';

  document.getElementById('fmNombre').value   = u.nombre;
  document.getElementById('fmCorreo').value   = u.correo;
  document.getElementById('fmTelefono').value = u.telefono || '';
  document.getElementById('fmRol').value      = u.rol;
  document.getElementById('fmSexo').value     = u.sexo || '';
  document.getElementById('fmEstado').value   = u.estado;
  document.getElementById('modalFormMsg').style.display = 'none';

  document.getElementById('modalForm').classList.add('open');
}

function guardarUsuario() {
  const nombre   = document.getElementById('fmNombre').value.trim();
  const correo   = document.getElementById('fmCorreo').value.trim();
  const telefono = document.getElementById('fmTelefono').value.trim();
  const rol      = document.getElementById('fmRol').value;
  const sexo     = document.getElementById('fmSexo').value;
  const estado   = document.getElementById('fmEstado').value;
  const msg      = document.getElementById('modalFormMsg');

  function showModalMsg(txt) {
    msg.style.cssText = 'display:block;padding:.65rem 1rem;border-radius:6px;font-size:.85rem;margin-bottom:1rem;background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;';
    msg.textContent = txt;
  }

  if (!nombre || !correo) return showModalMsg('Nombre y correo son obligatorios.');

  if (editandoId) {
    PNK_DB.actualizarUsuario(editandoId, { nombre, correo, telefono, rol, sexo, estado });
    if (estado === 'activo' && rol === 'gestor') {
      const u = PNK_DB.findUserById(editandoId);
      if (!u.penka_id) PNK_DB.activarUsuario(editandoId);
    }
    PNK_DB.toast('Usuario actualizado correctamente.', 'success');
  } else {
    const rut      = document.getElementById('fmRut').value.trim();
    const password = document.getElementById('fmPassword').value;
    if (!rut || !password) return showModalMsg('RUT y contraseña son obligatorios para nuevos usuarios.');
    const res = PNK_DB.registrarUsuario({ rut, nombre, correo, password, rol, sexo, telefono, num_bienes_raices: null, penka_id: null });
    if (!res.ok) return showModalMsg(res.msg);
    const newU = PNK_DB.findUserByCorreo(correo);
    if (newU) PNK_DB.actualizarUsuario(newU.id, { estado });
    PNK_DB.toast('Usuario creado correctamente.', 'success');
  }

  cerrarModal('modalForm');
  render();
}

function cambiarEstado(id, estado) {
  if (estado === 'activo') {
    const u = PNK_DB.activarUsuario(id);
    PNK_DB.toast(`✅ ${u.nombre} activado${u.penka_id ? ' · PENKA_ID: ' + u.penka_id : ''}`, 'success');
  } else {
    PNK_DB.actualizarUsuario(id, { estado });
    PNK_DB.toast(estado === 'inactivo' ? 'Usuario dado de baja.' : 'Estado actualizado.', 'warning');
  }
  render();
}

function eliminar(id, nombre) {
  if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
  PNK_DB.eliminarUsuario(id);
  PNK_DB.toast('Usuario eliminado.', 'warning');
  render();
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
}

render();