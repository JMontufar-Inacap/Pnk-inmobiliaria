let propActual = null;

const IMG_MAP = {
  'Casa':         ['casa1', 'casa2'],
  'Departamento': ['depto1', 'depto2'],
  'Terreno':      ['terreno1', 'terreno2'],
};

function getImgProp(p) {
  if (p.fotos && p.fotos.length) {
    const principal = p.fotoPrincipal || p.fotos[0];
    return `linear-gradient(rgba(0,0,0,.30),rgba(0,0,0,.30)) center/cover, url('${principal}') center/cover`;
  }
  const claves = IMG_MAP[p.tipo] || ['casa1'];
  const clave  = claves[p.id % claves.length];
  const src    = PNK_IMAGES[clave] || '';
  return `linear-gradient(rgba(0,0,0,.30),rgba(0,0,0,.30)) center/cover, url('${src}') center/cover`;
}

function poblarComunas() {
  const prov = document.getElementById('fProvincia').value;
  const mapa = {
    Elqui:  ['La Serena','Coquimbo','Andacollo','La Higuera','Paiguano','Vicuña'],
    Limarí: ['Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado'],
    Choapa: ['Illapel','Canela','Los Vilos','Salamanca'],
  };
  const sel = document.getElementById('fComuna');
  sel.innerHTML = '<option value="">Todas</option>';
  (mapa[prov] || []).forEach(c => {
    const o = document.createElement('option');
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
}

function buscar() {
  const filtros = {
    estado:    'activa',
    provincia: document.getElementById('fProvincia').value,
    comuna:    document.getElementById('fComuna').value,
    sector:    document.getElementById('fSector').value.trim(),
    tipo:      document.getElementById('fTipo').value,
  };
  const props = PNK_DB.getPropiedades(filtros);
  renderProps(props);
  const n = props.length;
  document.getElementById('resultCount').textContent =
    `${n} propiedad${n !== 1 ? 'es' : ''} encontrada${n !== 1 ? 's' : ''}`;
}

function limpiar() {
  ['fProvincia','fComuna','fTipo'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fSector').value = '';
  poblarComunas();
  buscar();
}

function renderProps(props) {
  const grid = document.getElementById('propsGrid');

  if (!props.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:5rem 2rem;color:var(--dark-soft);">
        <p style="font-size:3rem;margin-bottom:1rem;">🏠</p>
        <p style="font-size:1.2rem;">No se encontraron propiedades con esos filtros.</p>
        <button onclick="limpiar()" class="btn-ver" style="margin-top:1rem;">Ver todas</button>
      </div>`;
    return;
  }

  grid.innerHTML = props.map(p => `
    <div class="prop-card">
      <div class="pc-img" style="background:${getImgProp(p)}">
        <span class="pc-badge">${p.tipo}</span>
        <span class="pc-cod">Cód: ${p.codigo}</span>
      </div>
      <div class="pc-body">
        <h4>${p.tipo} ${p.sector}</h4>
        <p class="pc-loc">📍 ${p.sector}, ${p.comuna} – Prov. ${p.provincia}</p>
        <div class="pc-features">
          ${p.dormitorios     ? `<span>🛏 ${p.dormitorios} dorm.</span>`   : ''}
          ${p.banos           ? `<span>🚿 ${p.banos} baños</span>`         : ''}
          ${p.area_construida ? `<span>📐 ${p.area_construida} m²</span>`  : ''}
          ${p.estacionamiento ? `<span>🅿 Estac.</span>`                   : ''}
          ${p.piscina         ? `<span>🏊 Piscina</span>`                  : ''}
        </div>
        <div class="pc-footer">
          <div>
            <p class="pc-price">${PNK_DB.fmtClp(p.precio_clp)}</p>
            <p class="pc-uf">${p.precio_uf.toLocaleString('es-CL')} UF</p>
          </div>
          <button class="btn-ver" onclick="abrirDetalle(${p.id})">Quiero saber más</button>
        </div>
      </div>
    </div>`).join('');
}

function abrirDetalle(id) {
  const p = PNK_DB.getPropiedadById(id);
  if (!p) return;
  propActual = p;

  document.getElementById('mCod').textContent    = 'Cód: ' + p.codigo;
  document.getElementById('mTitle').textContent  = `${p.tipo} ${p.sector}`;
  document.getElementById('mLoc').textContent    = `📍 ${p.sector}, ${p.comuna} – Provincia ${p.provincia}`;
  document.getElementById('mPrecio').textContent = `${PNK_DB.fmtClp(p.precio_clp)} · ${p.precio_uf.toLocaleString('es-CL')} UF`;
  document.getElementById('mFecha').textContent  = '📅 Publicada: ' + p.fecha_publicacion.slice(0, 10);
  document.getElementById('mDesc').textContent   = p.descripcion || '';

  const fotos   = p.fotos || [];
  const fotosEl = document.getElementById('mFotos');
  if (fotos.length) {
    fotosEl.innerHTML = fotos.map(uri =>
      `<img src="${uri}"
        style="width:150px;height:110px;object-fit:cover;border-radius:8px;
               flex-shrink:0;cursor:pointer;border:2px solid transparent;
               transition:border-color .2s;"
        onclick="ampliarFoto(this)"
        onmouseover="this.style.borderColor='var(--terracotta)'"
        onmouseout="this.style.borderColor='transparent'"/>`
    ).join('');
    fotosEl.style.display = 'flex';
  } else {
    fotosEl.innerHTML = '';
    fotosEl.style.display = 'none';
  }
  document.getElementById('mFeatures').innerHTML = [
    p.dormitorios     ? `<div class="modal-feat"><strong>Dormitorios</strong>${p.dormitorios}</div>`          : '',
    p.banos           ? `<div class="modal-feat"><strong>Baños</strong>${p.banos}</div>`                      : '',
    p.area_terreno    ? `<div class="modal-feat"><strong>Área Terreno</strong>${p.area_terreno} m²</div>`     : '',
    p.area_construida ? `<div class="modal-feat"><strong>Área Construida</strong>${p.area_construida} m²</div>` : '',
  ].join('');

  const amenidades = [
    ['Bodega',          'bodega'],
    ['Estacionamiento', 'estacionamiento'],
    ['Logia',           'logia'],
    ['Cocina amoblada', 'cocina_amoblada'],
    ['Antejardín',      'antejardin'],
    ['Patio trasero',   'patio_trasero'],
    ['Piscina',         'piscina'],
  ];
  document.getElementById('mAmen').innerHTML = amenidades.map(([label, key]) =>
    `<span class="amenidad ${p[key] ? 'yes' : ''}">${p[key] ? '✅' : '❌'} ${label}</span>`
  ).join('');

  const mapaEl = document.getElementById('mMapa');
  if (p.latitud && p.longitud) {
    const bbox = `${p.longitud - .012},${p.latitud - .010},${p.longitud + .012},${p.latitud + .010}`;
    mapaEl.style.display = 'block';
    mapaEl.innerHTML = `
      <iframe
        width="100%" height="220" frameborder="0" scrolling="no"
        marginheight="0" marginwidth="0"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.latitud},${p.longitud}"
        style="border:0;display:block;"></iframe>
      <p style="font-size:.75rem;color:var(--dark-soft);padding:.4rem .6rem;">
        <a href="https://www.openstreetmap.org/?mlat=${p.latitud}&mlon=${p.longitud}"
           target="_blank" style="color:var(--terracotta);">Ver en mapa completo →</a>
      </p>`;
  } else {
    const dir = p.direccion || `${p.sector}, ${p.comuna}`;
    mapaEl.style.display = 'block';
    mapaEl.innerHTML = `
      <div style="background:var(--cream-dark);padding:1.1rem 1.25rem;font-size:.88rem;
                  color:var(--dark-soft);display:flex;align-items:center;gap:.5rem;">
        🗺 <span>${dir}</span>
      </div>`;
  }

  document.getElementById('visitaForm').innerHTML = `
    <input type="text"  id="vNombre"   placeholder="Tu nombre"       style="padding:.65rem;border:1.5px solid var(--cream-dark);border-radius:6px;font-family:inherit;font-size:.9rem;background:white;"/>
    <input type="email" id="vCorreo"   placeholder="Tu correo"       style="padding:.65rem;border:1.5px solid var(--cream-dark);border-radius:6px;font-family:inherit;font-size:.9rem;background:white;"/>
    <input type="tel"   id="vTelefono" placeholder="Tu teléfono"     style="padding:.65rem;border:1.5px solid var(--cream-dark);border-radius:6px;font-family:inherit;font-size:.9rem;background:white;"/>
    <input type="text"  id="vFecha"    placeholder="Fecha preferida" style="padding:.65rem;border:1.5px solid var(--cream-dark);border-radius:6px;font-family:inherit;font-size:.9rem;background:white;"/>
    <textarea id="vMensaje" placeholder="Mensaje opcional…" rows="2"
      style="grid-column:1/-1;padding:.65rem;border:1.5px solid var(--cream-dark);border-radius:6px;font-family:inherit;font-size:.9rem;resize:vertical;background:white;"></textarea>
    <button onclick="enviarVisita()" class="btn-submit" style="grid-column:1/-1;margin:0;">Enviar solicitud</button>`;

  document.getElementById('propModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function ampliarFoto(imgEl) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;
    display:flex;align-items:center;justify-content:center;cursor:zoom-out;`;
  const img = document.createElement('img');
  img.src = imgEl.src;
  img.style.cssText = 'max-width:90vw;max-height:88vh;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.5);';
  overlay.appendChild(img);
  overlay.addEventListener('click', () => document.body.removeChild(overlay));
  document.body.appendChild(overlay);
}

function cerrarModal() {
  document.getElementById('propModal').classList.remove('open');
  document.body.style.overflow = '';
  propActual = null;
}

document.getElementById('propModal').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

function enviarVisita() {
  const nombre   = document.getElementById('vNombre').value.trim();
  const correo   = document.getElementById('vCorreo').value.trim();
  const telefono = document.getElementById('vTelefono').value.trim();
  const mensaje  = document.getElementById('vMensaje').value.trim();

  if (!nombre || !correo) {
    PNK_DB.toast('Ingresa tu nombre y correo.', 'error');
    return;
  }

  PNK_DB.registrarVisita({ propiedad_id: propActual.id, nombre, correo, telefono, mensaje });

  document.getElementById('visitaForm').innerHTML =
    `<p style="grid-column:1/-1;text-align:center;color:#065F46;font-weight:600;">
       ¡Solicitud enviada! Te contactaremos pronto.
     </p>`;

  PNK_DB.toast('¡Solicitud de visita registrada!', 'success');
}

function compartir(red) {
  const url    = encodeURIComponent(window.location.href);
  const texto  = encodeURIComponent(
    `Mira esta propiedad en PNK Inmobiliaria: ${propActual?.tipo} ${propActual?.sector}`
  );
  if (red === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${texto}%20${url}`);
  if (red === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
}

function copiarLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => PNK_DB.toast('Enlace copiado al portapapeles', 'success'));
}

(function leerParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('provincia')) document.getElementById('fProvincia').value = p.get('provincia');
  if (p.get('comuna'))    document.getElementById('fComuna').value    = p.get('comuna');
  if (p.get('tipo'))      document.getElementById('fTipo').value      = p.get('tipo');
})();

poblarComunas();
buscar();
