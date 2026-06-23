(function renderNavbar() {
  const page = window.location.pathname.split('/').pop();
  const ses  = PNK_DB.getSession();

  const dashLinks = {
    admin:       'dashboard.html',
    propietario: 'dashboard-propietario.html',
    gestor:      'dashboard-gestor.html'
  };

  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  let html = `
    <li><a href="../index.html" ${page === '' || page === 'index.html' ? 'class="active"' : ''}>Inicio</a></li>
    <li><a href="propiedades.html" ${page === 'propiedades.html' ? 'class="active"' : ''}>Propiedades</a></li>`;

  if (ses) {
    const miDash = dashLinks[ses.rol] ?? '../index.html';

    html += `
      <li>
        <a href="${miDash}" style="display:flex;flex-direction:column;gap:2px;">
          <span style="color:var(--dark-soft);font-size:.85rem;font-weight:500;">
            Hola, ${ses.nombre.split(' ')[0]}
          </span>
          ${ses.rol === 'gestor' && ses.penka_id
            ? `<small style="color:var(--gold);font-size:.7rem;">${ses.penka_id}</small>`
            : ''}
        </a>
      </li>
      <li>
        <a href="#"
           onclick="PNK_DB.clearSession();window.location.href='login.html';"
           class="btn-nav btn-nav-alt">Cerrar sesión</a>
      </li>`;

    const mLogin = document.getElementById('mobileLoginLink');
    const mProp  = document.getElementById('mobilePropLink');
    const mGest  = document.getElementById('mobileGestLink');

    if (mLogin) {
      mLogin.textContent = 'Mi cuenta';
      mLogin.href        = miDash;
      mLogin.onclick     = null;
    }
    if (mProp) mProp.style.display = 'none';
    if (mGest) mGest.style.display = 'none';

  } else {
    html += `
      <li><a href="login.html" ${page === 'login.html' ? 'class="active"' : ''}>Ingresar</a></li>
      <li><a href="registro-propietario.html" class="btn-nav ${page === 'registro-propietario.html' ? 'active' : ''}">Soy Propietario</a></li>
      <li><a href="registro-gestor.html" class="btn-nav btn-nav-alt ${page === 'registro-gestor.html' ? 'active' : ''}">Soy Gestor</a></li>`;
  }

  navLinks.innerHTML = html;
})();