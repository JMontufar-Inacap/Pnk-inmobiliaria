const ses = PNK_DB.getSession();
if (!ses || ses.rol !== 'gestor') {
  window.location.href = 'login.html';
  throw '';
}

const userActual = PNK_DB.findUserById(ses.id);
document.getElementById('sidebarNombre').textContent = ses.nombre;

function cerrarSesion() {
  PNK_DB.clearSession();
  window.location.href = 'login.html';
}

if (userActual?.penka_id) {
  document.getElementById('penkaIdBox').style.display = 'block';
  document.getElementById('penkaIdVal').textContent   = userActual.penka_id;
}

const COMUNAS = {
  Elqui:  ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña'],
  Limarí: ['Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'],
  Choapa: ['Illapel', 'Canela', 'Los Vilos', 'Salamanca'],
};

function poblarComunasCaptacion() {
  const prov = document.getElementById('cProvincia').value;
  document.getElementById('cComuna').innerHTML =
    (COMUNAS[prov] || []).map(c => `<option>${c}</option>`).join('');
}
poblarComunasCaptacion();

function mostrarTab(tab) {
  ['tabResumen', 'tabCaptacion', 'tabPropiedades'].forEach(id =>
    document.getElementById(id).style.display =
      id === 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1) ? 'block' : 'none'
  );
  if (tab === 'propiedades') renderPropiedades();
  if (tab === 'resumen')     renderResumen();
}

function renderResumen() {
  const captaciones = PNK_DB.getCaptaciones().filter(c => c.gestor_id === ses.id);
  const activo      = userActual?.estado === 'activo';

  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi-card ${activo ? 'highlight' : ''}">
      <span class="kpi-icon">${activo ? '✅' : '⏳'}</span>
      <span class="kpi-label">Estado de cuenta</span>
      <span class="kpi-val" style="font-size:1.5rem;">${activo ? 'Activo' : 'Pendiente'}</span>
      <span class="kpi-sub">${userActual?.penka_id ? 'PENKA_ID: ' + userActual.penka_id : activo ? 'Sin PENKA_ID' : 'Esperando aprobación'}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">🏠</span>
      <span class="kpi-label">Captaciones</span>
      <span class="kpi-val">${captaciones.length}</span>
      <span class="kpi-sub">${captaciones.filter(c => c.estado === 'aprobada').length} aprobadas</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">🏘</span>
      <span class="kpi-label">Propiedades disponibles</span>
      <span class="kpi-val">${PNK_DB.getPropiedades({ estado: 'activa' }).length}</span>
      <span class="kpi-sub">Para ofrecer</span>
    </div>`;

  const estadoBox = document.getElementById('estadoCuenta');

  if (!activo) {
    estadoBox.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <p style="font-size:2.5rem;margin-bottom:.75rem;">⏳</p>
        <h3 style="font-size:1.5rem;margin-bottom:.5rem;">Cuenta pendiente de aprobación</h3>
        <p style="color:var(--dark-soft);max-width:400px;margin:0 auto 1.5rem;">
          El Administrador revisará tus antecedentes y activará tu cuenta a la brevedad.
          Una vez activo recibirás tu <strong>PENKA_ID</strong>.
        </p>
        <p style="font-size:.85rem;color:var(--dark-soft);">Mientras tanto, puedes captar propiedades para la comunidad.</p>
      </div>`;
  } else if (!userActual?.penka_id) {
    estadoBox.innerHTML = `
      <div style="background:rgba(184,150,62,.08);border-radius:var(--radius);padding:1.5rem;border:1px solid rgba(184,150,62,.25);">
        <p style="font-weight:700;color:var(--gold);margin-bottom:.5rem;">🔑 ¡Ya casi tienes tu PENKA_ID!</p>
        <p style="color:var(--dark-soft);font-size:.88rem;">Tu cuenta está activa. Capta al menos una propiedad para que el Administrador te asigne tu PENKA_ID.</p>
      </div>`;
  } else {
    estadoBox.innerHTML = `
      <div style="background:rgba(72,187,120,.08);border-radius:var(--radius);padding:1.5rem;border:1px solid rgba(72,187,120,.25);">
        <p style="font-weight:700;color:#2F855A;margin-bottom:.5rem;">✅ ¡Estás listo para gestionar!</p>
        <p style="color:var(--dark-soft);font-size:.88rem;">
          Tu PENKA_ID es <strong style="color:var(--gold);font-size:1.1rem;">${userActual.penka_id}</strong>.
          Puedes ofrecer cualquier propiedad de la plataforma. Si se vende a través de tu gestión, recibirás una comisión.
        </p>
      </div>`;
  }

  document.getElementById('tablaCaptaciones').innerHTML = captaciones.length
    ? `<table class="data-table">
        <thead>
          <tr><th>Propietario</th><th>Tipo</th><th>Ubicación</th><th>Precio aprox.</th><th>Fecha</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${captaciones.reverse().map(c => `
            <tr>
              <td><strong>${c.nombre_propietario}</strong><br/><small>${c.telefono}</small></td>
              <td>${c.tipo}</td>
              <td>${c.comuna}, ${c.provincia}</td>
              <td>${c.precio_aprox ? PNK_DB.fmtClp(c.precio_aprox) : '–'}</td>
              <td>${c.fecha?.slice(0, 10) || '–'}</td>
              <td><span class="status-badge status-${c.estado === 'aprobada' ? 'activo' : c.estado === 'rechazada' ? 'inactivo' : 'pendiente'}">${c.estado}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : `<p style="text-align:center;padding:1.5rem;color:var(--dark-soft);">
        Aún no has captado propiedades.
        <a href="#" onclick="mostrarTab('captacion')" style="color:var(--terracotta);">Captar ahora →</a>
      </p>`;
}

function enviarCaptacion() {
  const nombre   = document.getElementById('cNombre').value.trim();
  const telefono = document.getElementById('cTelefono').value.trim();
  const msg      = document.getElementById('captMsg');

  if (!nombre || !telefono) {
    msg.style.cssText = 'display:block;padding:.65rem 1rem;border-radius:6px;font-size:.85rem;margin-bottom:1rem;background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;';
    msg.textContent   = 'Nombre del propietario y teléfono son obligatorios.';
    return;
  }

  PNK_DB.crearCaptacion({
    gestor_id:          ses.id,
    nombre_gestor:      ses.nombre,
    nombre_propietario: nombre,
    telefono,
    correo:      document.getElementById('cCorreo').value.trim(),
    rut:         document.getElementById('cRut').value.trim(),
    tipo:        document.getElementById('cTipo').value,
    provincia:   document.getElementById('cProvincia').value,
    comuna:      document.getElementById('cComuna').value,
    direccion:   document.getElementById('cDireccion').value.trim(),
    precio_aprox: Number(document.getElementById('cPrecio').value) || 0,
    notas:       document.getElementById('cNotas').value.trim(),
  });

  PNK_DB.toast('¡Captación enviada! El Administrador la revisará pronto.', 'success');
  ['cNombre', 'cTelefono', 'cCorreo', 'cRut', 'cDireccion', 'cNotas'].forEach(id =>
    document.getElementById(id).value = ''
  );
  document.getElementById('cPrecio').value = 0;
  msg.style.display = 'none';
  mostrarTab('resumen');
}

const COLORES = [
  'linear-gradient(135deg,#C4614A,#8B3A2A)',
  'linear-gradient(135deg,#2D4A6B,#1A2F45)',
  'linear-gradient(135deg,#4A6C4A,#2A4C2A)',
  'linear-gradient(135deg,#5A4A3A,#3A2A2A)',
  'linear-gradient(135deg,#3A5A7A,#1A3A5A)',
];

let propSeleccionada = null;

function renderPropiedades() {
  const tipo      = document.getElementById('fpTipo').value;
  const provincia = document.getElementById('fpProvincia').value;
  const buscar    = document.getElementById('fpBuscar').value.toLowerCase().trim();

  let props = PNK_DB.getPropiedades({ estado: 'activa', tipo, provincia });
  if (buscar) props = props.filter(p =>
    p.sector?.toLowerCase().includes(buscar) ||
    p.comuna?.toLowerCase().includes(buscar)
  );

  const grid = document.getElementById('gridPropiedades');

  if (!props.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--dark-soft);">
        <p style="font-size:2rem;margin-bottom:.5rem;">🏠</p>
        <p>No hay propiedades con esos filtros.</p>
      </div>`;
    return;
  }

  grid.innerHTML = props.map((p, i) => {
    const fotoThumb = p.fotos?.[0]
      ? `background-image:url("${p.fotos[0]}");background-size:cover;background-position:center;`
      : `background:${COLORES[i % COLORES.length]};`;
    return `
      <div class="prop-card">
        <div class="pc-img" style="${fotoThumb}position:relative;">
          <span class="pc-badge">${p.tipo}</span>
          <span class="pc-cod">Cód: ${p.codigo}</span>
        </div>
        <div class="pc-body">
          <h4>${p.tipo} ${p.sector || p.comuna}</h4>
          <p class="pc-loc">📍 ${p.sector || ''}, ${p.comuna} – Prov. ${p.provincia}</p>
          <div class="pc-features">
            ${p.dormitorios    ? `<span>🛏 ${p.dormitorios}</span>`   : ''}
            ${p.banos          ? `<span>🚿 ${p.banos}</span>`         : ''}
            ${p.area_construida? `<span>📐 ${p.area_construida}m²</span>` : ''}
          </div>
          <div class="pc-footer">
            <div>
              <p class="pc-price">${PNK_DB.fmtClp(p.precio_clp)}</p>
              <p class="pc-uf">${Number(p.precio_uf).toLocaleString('es-CL')} UF</p>
            </div>
            <button class="btn-ver" onclick="verPropGestor(${p.id})">Ver detalle</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function verPropGestor(id) {
  const p = PNK_DB.getPropiedadById(id);
  if (!p) return;
  propSeleccionada = p;

  document.getElementById('gpCod').textContent    = 'Cód: ' + p.codigo;
  document.getElementById('gpTitle').textContent  = `${p.tipo} ${p.sector || p.comuna}`;
  document.getElementById('gpLoc').textContent    = `📍 ${p.sector || ''}, ${p.comuna} – Provincia ${p.provincia}`;
  document.getElementById('gpPrecio').textContent = `${PNK_DB.fmtClp(p.precio_clp)} · ${Number(p.precio_uf).toLocaleString('es-CL')} UF`;
  document.getElementById('gpDesc').textContent   = p.descripcion || 'Sin descripción.';

  const fotos = p.fotos || [];
  document.getElementById('gpFotos').innerHTML = fotos.length
    ? fotos.map(u => `<img src="${u}" style="width:140px;height:100px;object-fit:cover;border-radius:8px;flex-shrink:0;"/>`).join('')
    : '';

  document.getElementById('gpFeatures').innerHTML = [
    p.dormitorios    ? `<div class="modal-feat"><strong>Dormitorios</strong>${p.dormitorios}</div>`          : '',
    p.banos          ? `<div class="modal-feat"><strong>Baños</strong>${p.banos}</div>`                      : '',
    p.area_terreno   ? `<div class="modal-feat"><strong>Área Terreno</strong>${p.area_terreno} m²</div>`     : '',
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
  document.getElementById('gpAmen').innerHTML = amen.map(([l, k]) =>
    `<span class="amenidad ${p[k] ? 'yes' : ''}">${p[k] ? '✅' : '❌'} ${l}</span>`
  ).join('');

  const mapaEl = document.getElementById('gpMapa');
  if (p.latitud && p.longitud) {
    mapaEl.innerHTML = `<iframe width="100%" height="200" frameborder="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${p.longitud - .01},${p.latitud - .01},${p.longitud + .01},${p.latitud + .01}&layer=mapnik&marker=${p.latitud},${p.longitud}"
      style="border:0;"></iframe>`;
  } else {
    mapaEl.innerHTML = '';
  }

  document.getElementById('modalPropGestor').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function compartir(red) {
  if (!propSeleccionada) return;
  const p     = propSeleccionada;
  const penka = userActual?.penka_id || '';
  const texto = encodeURIComponent(
    ` ${p.tipo} en ${p.sector || p.comuna}, ${p.provincia}\n` +
    ` ${PNK_DB.fmtClp(p.precio_clp)} (${p.precio_uf} UF)\n` +
    ` ${p.direccion || p.sector || p.comuna}\n` +
    ` Gestionado por ${ses.nombre}${penka ? ' · PENKA_ID: ' + penka : ''}\n` +
    `Ver en: http://localhost:8000/pages/propiedades.html`
  );
  if (red === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${texto}`);
  if (red === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://localhost:8000')}`);
}

function copiarFicha() {
  if (!propSeleccionada) return;
  const p     = propSeleccionada;
  const penka = userActual?.penka_id || 'Pendiente';
  const ficha =
    `FICHA PNK INMOBILIARIA\n${'─'.repeat(30)}\n` +
    `Código: ${p.codigo}\nTipo: ${p.tipo}\n` +
    `Ubicación: ${p.sector || ''} ${p.sector ? ',' : ''} ${p.comuna} – ${p.provincia}\n` +
    `Precio: ${PNK_DB.fmtClp(p.precio_clp)} / ${p.precio_uf} UF\n` +
    `${p.dormitorios ? 'Dormitorios: ' + p.dormitorios + '\n' : ''}` +
    `${p.banos       ? 'Baños: '       + p.banos       + '\n' : ''}` +
    `${p.descripcion ? '\nDescripción:\n' + p.descripcion + '\n' : ''}\n` +
    `${'─'.repeat(30)}\nGestor: ${ses.nombre}\nPENKA_ID: ${penka}`;
  navigator.clipboard.writeText(ficha).then(() =>
    PNK_DB.toast('Ficha copiada al portapapeles ✅', 'success')
  );
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

renderResumen();