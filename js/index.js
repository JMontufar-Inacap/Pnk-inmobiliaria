const ses      = PNK_DB.getSession();
const navLinks = document.getElementById('navLinks');

if (ses) {
  const dashLinks = {
    admin:       'pages/dashboard.html',
    propietario: 'pages/dashboard-propietario.html',
    gestor:      'pages/dashboard-gestor.html'
  };

  navLinks.innerHTML = `
    <li><a href="index.html" class="active">Inicio</a></li>
    <li><a href="pages/propiedades.html">Propiedades</a></li>
    <li>
      <span style="color:var(--dark-soft);font-size:.85rem;font-weight:500;padding:.5rem 0;display:block;">
        Hola, ${ses.nombre.split(' ')[0]}
        ${ses.penka_id ? `<small style="color:var(--gold);font-size:.7rem;display:block;">${ses.penka_id}</small>` : ''}
      </span>
    </li>
    <li><a href="${dashLinks[ses.rol] ?? '#'}" class="btn-nav">Dashboard</a></li>
    <li><a href="#" onclick="PNK_DB.clearSession();location.reload();" class="btn-nav btn-nav-alt">Cerrar sesión</a></li>`;

  document.getElementById('mobilePropLink').style.display = 'none';
  document.getElementById('mobileGestLink').style.display = 'none';
  document.getElementById('mobileLoginLink').textContent  = 'Cerrar sesión';
  document.getElementById('mobileLoginLink').href         = '#';
  document.getElementById('mobileLoginLink').onclick      = () => { PNK_DB.clearSession(); location.reload(); };
}

const usuarios    = PNK_DB.getUsuarios();
const propiedades = PNK_DB.getPropiedades({ estado: 'activa' });

document.getElementById('statProps').textContent        = propiedades.length;
document.getElementById('statGestores').textContent     = usuarios.filter(u => u.rol === 'gestor'      && u.estado === 'activo').length;
document.getElementById('statPropietarios').textContent = usuarios.filter(u => u.rol === 'propietario' && u.estado === 'activo').length;

const heroProps  = propiedades.slice(0, 3);
const claseThumb = ['t1', 't2', 't3'];
const claseCard  = ['card1', 'card2', 'card3'];

if (heroProps.length) {
  document.getElementById('heroCards').innerHTML = heroProps.map((p, i) => `
    <div class="hero-img-card ${claseCard[i]}">
      <div class="prop-thumb ${claseThumb[i]}"></div>
      <div class="prop-info">
        <span class="prop-tipo">${p.tipo}</span>
        <p class="prop-lugar">${p.sector}, ${p.comuna}</p>
        <strong class="prop-precio">${PNK_DB.fmtClp(p.precio_clp)}</strong>
      </div>
    </div>`).join('');
}

const clasesPi = ['pi1', 'pi2', 'pi3', 'pi4', 'pi5', 'pi6'];

if (propiedades.length) {
  document.getElementById('propsDestacadas').innerHTML = propiedades.slice(0, 3).map((p, i) => `
    <div class="prop-card">
      <div class="pc-img ${clasesPi[i]}">
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
        </div>
        <div class="pc-footer">
          <div>
            <p class="pc-price">${PNK_DB.fmtClp(p.precio_clp)}</p>
            <p class="pc-uf">${Number(p.precio_uf).toLocaleString('es-CL')} UF</p>
          </div>
          <a href="pages/propiedades.html" class="btn-ver">Quiero saber más</a>
        </div>
      </div>
    </div>`).join('');
}

function irBuscar() {
  const p = document.getElementById('sbProvincia').value;
  const c = document.getElementById('sbComuna').value;
  const t = document.getElementById('sbTipo').value;
  const params = new URLSearchParams();
  if (p) params.set('provincia', p);
  if (c) params.set('comuna', c);
  if (t) params.set('tipo', t);
  window.location.href = 'pages/propiedades.html' + ([...params].length ? '?' + params : '');
}
