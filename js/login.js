if (PNK_DB.isLoggedIn()) {
  const ses = PNK_DB.getSession();
  const destinos = {
    admin:       'dashboard.html',
    propietario: 'dashboard-propietario.html',
    gestor:      'dashboard-gestor.html'
  };
  window.location.href = destinos[ses.rol] ?? '../index.html';
}

document.getElementById('cntProps').textContent =
  PNK_DB.getPropiedades({ estado: 'activa' }).length;

document.getElementById('cntGestores').textContent =
  PNK_DB.getUsuarios().filter(u => u.rol === 'gestor' && u.estado === 'activo').length;

function showView(id) {
  ['viewLogin', 'viewRecover', 'viewRecoverOk'].forEach(v =>
    document.getElementById(v).style.display = v === id ? 'block' : 'none'
  );
}

function showMsg(msg) {
  const el = document.getElementById('loginMsg');
  el.style.cssText = `
    display:block;padding:.75rem 1rem;border-radius:6px;
    font-size:.88rem;margin-bottom:1rem;
    background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444;
  `;
  el.textContent = msg;
}

function doLogin() {
  const correo   = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;

  if (!correo || !password) {
    showMsg('Completa todos los campos.');
    return;
  }

  const res = PNK_DB.login(correo, password);
  if (!res.ok) { showMsg(res.msg); return; }

  const destinos = {
    admin:       'dashboard.html',
    propietario: 'dashboard-propietario.html',
    gestor:      'dashboard-gestor.html'
  };
  window.location.href = destinos[res.user.rol] ?? '../index.html';
}

function doRecover() {
  const correo = document.getElementById('recoverCorreo').value.trim();
  if (!correo) return;
  PNK_DB.recuperarPassword(correo);
  showView('viewRecoverOk');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

const CAMPO_MAX = {
  correo:        50,
  password:      50,
  recoverCorreo: 50,
};

function aplicarLimite(id, max) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('keydown', function (e) {
    const permitidas = [
      'Backspace','Delete','ArrowLeft','ArrowRight',
      'ArrowUp','ArrowDown','Tab','Home','End','Enter'
    ];
    if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;

    const sinSeleccion = this.selectionStart === this.selectionEnd;
    if (this.value.length >= max && sinSeleccion) {
      e.preventDefault();
    }
  });

  el.addEventListener('input', function () {
    if (this.value.length > max) {
      this.value = this.value.slice(0, max);
    }
  });
}

Object.entries(CAMPO_MAX).forEach(([id, max]) => aplicarLimite(id, max));