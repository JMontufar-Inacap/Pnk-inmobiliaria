const ses = PNK_DB.getSession();
if (!ses || ses.rol !== 'propietario') {
  window.location.href = 'login.html';
  throw '';
}

document.getElementById('sidebarNombre').textContent = ses.nombre;
function cerrarSesion() { PNK_DB.clearSession(); window.location.href = 'login.html'; }

const COMUNAS = {
  Elqui:  ['La Serena','Coquimbo','Andacollo','La Higuera','Paiguano','Vicuña'],
  Limarí: ['Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado'],
  Choapa: ['Illapel','Canela','Los Vilos','Salamanca']
};

const COORDS = {
  'La Serena':    [-29.9027, -71.2519], 'Coquimbo':     [-29.9533, -71.3406],
  'Andacollo':    [-30.2325, -71.0857], 'Vicuña':       [-30.0333, -70.7167],
  'La Higuera':   [-29.4980, -71.2559], 'Paiguano':     [-30.0333, -70.5667],
  'Ovalle':       [-30.5985, -71.1990], 'Combarbalá':   [-31.1833, -71.0167],
  'Monte Patria': [-30.6939, -70.9643], 'Punitaqui':    [-30.8333, -71.2500],
  'Río Hurtado':  [-30.4667, -70.7167], 'Illapel':      [-31.6356, -71.1685],
  'Canela':       [-31.3978, -71.4500], 'Los Vilos':    [-31.9097, -71.5083],
  'Salamanca':    [-31.7729, -70.9636],
};

function poblarComunasModal(selVal = '') {
  const prov = document.getElementById('fmProvincia').value;
  const sel  = document.getElementById('fmComuna');
  sel.innerHTML = (COMUNAS[prov] || []).map(c =>
    `<option ${c===selVal?'selected':''}>${c}</option>`).join('');
}

let editandoId       = null;
let fotosActuales    = [];
let fotoPrincipalIdx = 0;

// Compresión de imágenes para no agotar localStorage
function comprimirFoto(dataUrl, maxWidth = 1200, quality = 0.78) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ratio  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

function render() {
  const todas = PNK_DB.getPropiedades();
  const mias  = todas.filter(p => p.propietario_id === ses.id);

  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi-card highlight">
      <span class="kpi-icon">🏠</span>
      <span class="kpi-label">Mis Propiedades</span>
      <span class="kpi-val">${mias.length}</span>
      <span class="kpi-sub">${mias.filter(p=>p.estado==='activa').length} activas</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">👁</span>
      <span class="kpi-label">En Revisión</span>
      <span class="kpi-val">${mias.filter(p=>p.estado==='revision').length}</span>
      <span class="kpi-sub">Esperando aprobación</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-icon">📋</span>
      <span class="kpi-label">Inactivas</span>
      <span class="kpi-val">${mias.filter(p=>p.estado==='inactiva').length}</span>
      <span class="kpi-sub">No visibles al público</span>
    </div>`;

  document.getElementById('totalLabel').textContent = `Total: ${mias.length}`;

  if (!mias.length) {
    document.getElementById('tablaProps').innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;color:var(--dark-soft);">
        <p style="font-size:3rem;margin-bottom:1rem;">🏘</p>
        <p style="font-size:1.1rem;margin-bottom:1.5rem;">Aún no tienes propiedades publicadas.</p>
        <button class="btn-action" onclick="abrirModalPropiedad(null)">+ Publicar mi primera propiedad</button>
      </div>`;
    return;
  }

  document.getElementById('tablaProps').innerHTML = `
    <table class="data-table">
      <thead>
        <tr><th>Código</th><th>Tipo</th><th>Ubicación</th><th>Precio $</th><th>UF</th><th>Fotos</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        ${mias.slice().reverse().map(p => `
          <tr>
            <td><code>${p.codigo}</code></td>
            <td>${p.tipo}</td>
            <td>${p.sector||'–'}, ${p.comuna}</td>
            <td>${PNK_DB.fmtClp(p.precio_clp)}</td>
            <td>${Number(p.precio_uf).toLocaleString('es-CL')}</td>
            <td style="text-align:center;">${p.fotos?.length || 0}/10</td>
            <td><span class="status-badge status-${p.estado}">${p.estado}</span></td>
            <td class="tbl-actions">
              <button class="btn-tbl btn-view"  onclick="verPropiedad(${p.id})">Ver</button>
              <button class="btn-tbl btn-edit"  onclick="abrirModalPropiedad(${p.id})">Editar</button>
              <button class="btn-tbl btn-del"   onclick="confirmarEliminar(${p.id},'${p.codigo}')">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function abrirModalPropiedad(id) {
  editandoId       = id;
  fotosActuales    = [];
  fotoPrincipalIdx = 0;

  document.getElementById('modalPropMsg').style.display = 'none';
  document.getElementById('inputFotos').value           = '';
  document.getElementById('fotosError').style.display   = 'none';
  poblarComunasModal();

  if (id) {
    const p = PNK_DB.getPropiedadById(id);
    if (!p || p.propietario_id !== ses.id) return;

    document.getElementById('modalPropTitle').textContent = `Editar ${p.codigo}`;
    document.getElementById('btnGuardarProp').textContent = 'Guardar Cambios';

    document.getElementById('fmTipo').value       = p.tipo;
    document.getElementById('fmEstado').value     = p.estado;
    document.getElementById('fmProvincia').value  = p.provincia;
    poblarComunasModal(p.comuna);
    document.getElementById('fmSector').value     = p.sector    || '';
    document.getElementById('fmDireccion').value  = p.direccion || '';
    document.getElementById('fmDorm').value       = p.dormitorios;
    document.getElementById('fmBanos').value      = p.banos;
    document.getElementById('fmTerreno').value    = p.area_terreno;
    document.getElementById('fmConstruida').value = p.area_construida;
    document.getElementById('fmPrecioClp').value  = p.precio_clp;
    document.getElementById('fmPrecioUf').value   = p.precio_uf;
    document.getElementById('fmDesc').value       = p.descripcion || '';
    document.getElementById('fmBodega').checked   = p.bodega;
    document.getElementById('fmEstac').checked    = p.estacionamiento;
    document.getElementById('fmLogia').checked    = p.logia;
    document.getElementById('fmCocina').checked   = p.cocina_amoblada;
    document.getElementById('fmAnte').checked     = p.antejardin;
    document.getElementById('fmPatio').checked    = p.patio_trasero;
    document.getElementById('fmPiscina').checked  = p.piscina;
    document.getElementById('fmLat').value        = p.latitud  || '';
    document.getElementById('fmLng').value        = p.longitud || '';

    fotosActuales = p.fotos ? [...p.fotos] : [];

    if (p.fotoPrincipal && fotosActuales.length) {
      const idx = fotosActuales.indexOf(p.fotoPrincipal);
      fotoPrincipalIdx = idx >= 0 ? idx : 0;
    } else {
      fotoPrincipalIdx = 0;
    }

    renderFotosPrevias();
  } else {
    document.getElementById('modalPropTitle').textContent = 'Publicar Nueva Propiedad';
    document.getElementById('btnGuardarProp').textContent = 'Publicar Propiedad';

    ['fmSector','fmDireccion','fmDesc','fmLat','fmLng'].forEach(id =>
      document.getElementById(id).value = '');
    ['fmDorm','fmBanos','fmTerreno','fmConstruida','fmPrecioClp','fmPrecioUf'].forEach(id =>
      document.getElementById(id).value = 0);
    ['fmBodega','fmEstac','fmLogia','fmCocina','fmAnte','fmPatio','fmPiscina'].forEach(id =>
      document.getElementById(id).checked = false);

    document.getElementById('fmTipo').value    = 'Casa';
    document.getElementById('fmEstado').value  = 'activa';
    document.getElementById('fotosPrevias').innerHTML = '';
  }

  document.getElementById('modalProp').classList.add('open');
  document.body.style.overflow = 'hidden';
}

async function previsualizarFotos(input) {
  const archivos   = Array.from(input.files);
  const errEl      = document.getElementById('fotosError');
  errEl.style.display = 'none';

  const disponibles = 10 - fotosActuales.length;
  if (disponibles <= 0) {
    errEl.textContent   = 'Ya tienes 10 fotos. Elimina alguna para agregar más.';
    errEl.style.display = 'block';
    input.value = '';
    return;
  }

  const aAgregar = archivos.slice(0, disponibles);
  if (archivos.length > disponibles) {
    errEl.textContent   = `Solo se agregarán ${disponibles} foto(s). Límite máximo: 10.`;
    errEl.style.display = 'block';
  }

  for (const file of aAgregar) {
    if (file.size > 3 * 1024 * 1024) {
      errEl.textContent   = `"${file.name}" supera 3 MB y fue omitida.`;
      errEl.style.display = 'block';
      continue;
    }
    const dataUrl = await new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.readAsDataURL(file);
    });
    const compressed = await comprimirFoto(dataUrl);
    fotosActuales.push(compressed);
  }

  input.value = '';
  renderFotosPrevias();
}

function renderFotosPrevias() {
  document.getElementById('fotosPrevias').innerHTML = fotosActuales.map((uri, i) => {
    const esPrincipal = (i === fotoPrincipalIdx);
    return `
      <div style="position:relative;flex-shrink:0;text-align:center;">
        <img src="${uri}"
          style="width:80px;height:60px;object-fit:cover;border-radius:6px;
                 border:2px solid ${esPrincipal ? 'var(--terracotta)' : 'var(--cream-dark)'};
                 display:block;"/>
        <button onclick="eliminarFoto(${i})"
          title="Eliminar foto"
          style="position:absolute;top:-7px;right:-7px;background:#EF4444;color:white;border:none;
                 border-radius:50%;width:18px;height:18px;font-size:.6rem;cursor:pointer;
                 line-height:18px;text-align:center;padding:0;">✕</button>
        ${esPrincipal
          ? `<span style="display:block;margin-top:.25rem;font-size:.6rem;font-weight:700;
               color:var(--terracotta);letter-spacing:.02em;">★ Portada</span>`
          : `<button onclick="setPrincipal(${i})"
               title="Usar como portada"
               style="display:block;width:100%;margin-top:.25rem;background:none;border:none;
                      font-size:.6rem;color:var(--dark-soft);cursor:pointer;padding:0;
                      text-decoration:underline;">usar portada</button>`
        }
      </div>`;
  }).join('');
}

function setPrincipal(i) {
  fotoPrincipalIdx = i;
  renderFotosPrevias();
}

function eliminarFoto(i) {
  fotosActuales.splice(i, 1);
  if (fotosActuales.length === 0) {
    fotoPrincipalIdx = 0;
  } else if (i < fotoPrincipalIdx) {
    fotoPrincipalIdx--;
  } else if (i === fotoPrincipalIdx) {
    fotoPrincipalIdx = 0;
  }
  renderFotosPrevias();
}

function guardarPropiedad() {
  const comuna    = document.getElementById('fmComuna').value;
  const precioClp = document.getElementById('fmPrecioClp').value;
  const precioUf  = document.getElementById('fmPrecioUf').value;
  const dorm      = Number(document.getElementById('fmDorm').value);
  const banos     = Number(document.getElementById('fmBanos').value);
  const msg       = document.getElementById('modalPropMsg');

  if (!comuna || !precioClp || !precioUf) {
    msg.style.cssText = 'display:block;padding:.65rem 1rem;border-radius:6px;font-size:.85rem;margin-bottom:1rem;background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;';
    msg.textContent   = 'Comuna, precio $ y precio UF son obligatorios.';
    return;
  }

  if (dorm > 9 || banos > 9) {
    msg.style.cssText = 'display:block;padding:.65rem 1rem;border-radius:6px;font-size:.85rem;margin-bottom:1rem;background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;';
    msg.textContent   = 'Dormitorios y baños no pueden superar 9.';
    return;
  }

  const fotoPrincipal = fotosActuales.length > 0
    ? (fotosActuales[fotoPrincipalIdx] || fotosActuales[0])
    : null;

  const data = {
    tipo:            document.getElementById('fmTipo').value,
    estado:          document.getElementById('fmEstado').value,
    provincia:       document.getElementById('fmProvincia').value,
    comuna,
    sector:          document.getElementById('fmSector').value.trim(),
    direccion:       document.getElementById('fmDireccion').value.trim(),
    descripcion:     document.getElementById('fmDesc').value.trim(),
    dormitorios:     dorm,
    banos:           banos,
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
    latitud:         parseFloat(document.getElementById('fmLat').value) || null,
    longitud:        parseFloat(document.getElementById('fmLng').value) || null,
    propietario_id:  ses.id,
    fotos:           fotosActuales,
    fotoPrincipal,
  };

  if (editandoId) {
    PNK_DB.actualizarPropiedad(editandoId, data);
    PNK_DB.toast('Propiedad actualizada correctamente.', 'success');
  } else {
    PNK_DB.crearPropiedad(data);
    PNK_DB.toast('Propiedad publicada correctamente.', 'success');
  }

  cerrarModal('modalProp');
  render();
}

function verPropiedad(id) {
  const p = PNK_DB.getPropiedadById(id);
  if (!p) return;

  document.getElementById('vCod').textContent    = 'Cód: ' + p.codigo;
  document.getElementById('vTitle').textContent  = `${p.tipo} ${p.sector || p.comuna}`;
  document.getElementById('vLoc').textContent    = `📍 ${p.sector||''} ${p.sector?',':''} ${p.comuna} – Provincia ${p.provincia}`;
  document.getElementById('vPrecio').textContent = `${PNK_DB.fmtClp(p.precio_clp)} · ${Number(p.precio_uf).toLocaleString('es-CL')} UF`;
  document.getElementById('vFecha').textContent  = `📅 Publicada: ${p.fecha_publicacion?.slice(0,10)||'–'}`;
  document.getElementById('vDesc').textContent   = p.descripcion || 'Sin descripción.';

  const fotos = p.fotos || [];
  document.getElementById('vFotos').innerHTML = fotos.length
    ? fotos.map((uri) =>
        `<img src="${uri}"
          style="width:150px;height:110px;object-fit:cover;border-radius:8px;flex-shrink:0;
                 border:${uri === p.fotoPrincipal ? '2px solid var(--terracotta)' : '2px solid transparent'};
                 cursor:pointer;"
          title="${uri === p.fotoPrincipal ? '★ Portada' : 'Ver foto'}"
          onclick="ampliarFotoAdmin(this)"/>`).join('')
    : '<p style="color:var(--dark-soft);font-size:.85rem;">Sin fotografías adjuntas.</p>';

  document.getElementById('vFeatures').innerHTML = [
    p.dormitorios    ? `<div class="modal-feat"><strong>Dormitorios</strong>${p.dormitorios}</div>` : '',
    p.banos          ? `<div class="modal-feat"><strong>Baños</strong>${p.banos}</div>` : '',
    p.area_terreno   ? `<div class="modal-feat"><strong>Área Terreno</strong>${p.area_terreno} m²</div>` : '',
    p.area_construida? `<div class="modal-feat"><strong>Área Construida</strong>${p.area_construida} m²</div>` : '',
    `<div class="modal-feat"><strong>Estado</strong><span class="status-badge status-${p.estado}">${p.estado}</span></div>`,
  ].join('');

  const amen = [
    ['Bodega','bodega'],['Estacionamiento','estacionamiento'],['Logia','logia'],
    ['Cocina amoblada','cocina_amoblada'],['Antejardín','antejardin'],
    ['Patio trasero','patio_trasero'],['Piscina','piscina']
  ];
  document.getElementById('vAmen').innerHTML = amen.map(([l,k]) =>
    `<span class="amenidad ${p[k]?'yes':''}">${p[k]?'✅':'❌'} ${l}</span>`).join('');

  // Mapa con fallback por ciudad
  const mapaEl = document.getElementById('vMapa');
  const lat = p.latitud  || (COORDS[p.comuna] ? COORDS[p.comuna][0] : null);
  const lng = p.longitud || (COORDS[p.comuna] ? COORDS[p.comuna][1] : null);

  if (lat && lng) {
    const bbox = `${lng-.012},${lat-.010},${lng+.012},${lat+.010}`;
    mapaEl.innerHTML = `<iframe
      width="100%" height="220" frameborder="0" scrolling="no"
      marginheight="0" marginwidth="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}"
      style="border:0;display:block;"></iframe>
      <p style="font-size:.75rem;color:var(--dark-soft);padding:.4rem;">
        <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}"
           target="_blank" style="color:var(--terracotta);">Ver en mapa completo →</a>
      </p>`;
  } else {
    mapaEl.innerHTML = `<div style="background:var(--cream-dark);border-radius:var(--radius);height:140px;
      display:flex;align-items:center;justify-content:center;color:var(--dark-soft);font-size:.88rem;">
      🗺 ${p.direccion || p.sector + ', ' + p.comuna}</div>`;
  }

  document.getElementById('modalVer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function ampliarFotoAdmin(imgEl) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;
    display:flex;align-items:center;justify-content:center;cursor:zoom-out;`;
  const img = document.createElement('img');
  img.src = imgEl.src;
  img.style.cssText = 'max-width:90vw;max-height:88vh;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.5);';
  overlay.appendChild(img);
  overlay.addEventListener('click', () => document.body.removeChild(overlay));
  document.body.appendChild(overlay);
}

function confirmarEliminar(id, codigo) {
  document.getElementById('msgEliminar').textContent =
    `¿Estás seguro de eliminar la propiedad ${codigo}? Esta acción no se puede deshacer.`;
  document.getElementById('btnConfirmarEliminar').onclick = () => {
    PNK_DB.eliminarPropiedad(id);
    PNK_DB.toast('Propiedad eliminada.', 'warning');
    cerrarModal('modalEliminar');
    render();
  };
  document.getElementById('modalEliminar').classList.add('open');
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

poblarComunasModal();
render();
