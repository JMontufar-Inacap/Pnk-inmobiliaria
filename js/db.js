const PNK_DB = {

  _get(key)      { return JSON.parse(localStorage.getItem(key) || 'null'); },
  _set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`localStorage lleno al guardar "${key}". Reduce el número de fotos.`, e);
    }
  },

  init() {
    if (this._get('pnk_init')) return;

    const usuarios = [
      {
        id: 1, rut: '00.000.000-0', nombre: 'Administrador PNK',
        correo: 'admin@pnk.cl', password: 'admin1234',
        rol: 'admin', sexo: '', telefono: '', fecha_nac: '',
        estado: 'activo', penka_id: null, num_bienes_raices: null,
        fecha_registro: new Date().toISOString()
      },
      {
        id: 2, rut: '12.345.678-9', nombre: 'Carlos González Rojas',
        correo: 'carlos.gonzalez@gmail.com', password: 'Test1234',
        rol: 'propietario', sexo: 'Masculino', telefono: '+56981234567',
        fecha_nac: '1982-06-15', estado: 'activo', penka_id: null,
        num_bienes_raices: 'BR-2024-00123456',
        fecha_registro: new Date().toISOString()
      },
      {
        id: 3, rut: '14.567.890-K', nombre: 'Ana Soto López',
        correo: 'ana.soto@gmail.com', password: 'Test1234',
        rol: 'gestor', sexo: 'Femenino', telefono: '+56976543210',
        fecha_nac: '1990-03-22', estado: 'activo', penka_id: 'PNK-00001',
        num_bienes_raices: null,
        fecha_registro: new Date().toISOString()
      },
      {
        id: 4, rut: '16.789.012-3', nombre: 'Pedro Vargas Méndez',
        correo: 'pedro.vargas@gmail.com', password: 'Test1234',
        rol: 'propietario', sexo: 'Masculino', telefono: '+56998765432',
        fecha_nac: '1975-11-08', estado: 'pendiente', penka_id: null,
        num_bienes_raices: 'BR-2023-00987654',
        fecha_registro: new Date().toISOString()
      },
      {
        id: 5, rut: '18.901.234-5', nombre: 'Laura Pérez González',
        correo: 'laura.perez@gmail.com', password: 'Test1234',
        rol: 'gestor', sexo: 'Femenino', telefono: '+56965432109',
        fecha_nac: '1995-07-30', estado: 'pendiente', penka_id: null,
        num_bienes_raices: null,
        fecha_registro: new Date().toISOString()
      }
    ];

    const propiedades = [
      {
        id: 1, codigo: 'C0125457', tipo: 'Casa',
        provincia: 'Elqui', comuna: 'La Serena', sector: 'El Milagro',
        direccion: 'Av. El Milagro 123',
        descripcion: 'Hermosa casa familiar en sector tranquilo El Milagro, La Serena. Amplio antejardín y patio trasero. Cocina completamente equipada.',
        dormitorios: 3, banos: 2, area_terreno: 250, area_construida: 120,
        precio_clp: 154000000, precio_uf: 3850,
        bodega: false, estacionamiento: true, logia: false,
        cocina_amoblada: true, antejardin: true, patio_trasero: true, piscina: false,
        latitud: -29.9027, longitud: -71.2519,
        estado: 'activa', propietario_id: 2,
        fecha_publicacion: new Date().toISOString()
      },
      {
        id: 2, codigo: 'D0234891', tipo: 'Departamento',
        provincia: 'Elqui', comuna: 'Coquimbo', sector: 'Centro',
        direccion: 'Calle Aldunate 456',
        descripcion: 'Moderno departamento en pleno centro de Coquimbo. Incluye bodega y acceso rápido a todos los servicios.',
        dormitorios: 2, banos: 1, area_terreno: 0, area_construida: 68,
        precio_clp: 112000000, precio_uf: 2800,
        bodega: true, estacionamiento: true, logia: false,
        cocina_amoblada: false, antejardin: false, patio_trasero: false, piscina: false,
        latitud: -29.9533, longitud: -71.3406,
        estado: 'activa', propietario_id: 2,
        fecha_publicacion: new Date().toISOString()
      },
      {
        id: 3, codigo: 'T0389012', tipo: 'Terreno',
        provincia: 'Limarí', comuna: 'Ovalle', sector: 'Centro',
        direccion: 'Calle Vicuña Mackenna 789',
        descripcion: 'Excelente terreno plano en centro de Ovalle. Ideal para construcción de vivienda o inversión.',
        dormitorios: 0, banos: 0, area_terreno: 300, area_construida: 0,
        precio_clp: 38000000, precio_uf: 950,
        bodega: false, estacionamiento: false, logia: false,
        cocina_amoblada: false, antejardin: true, patio_trasero: false, piscina: false,
        latitud: -30.5985, longitud: -71.1990,
        estado: 'activa', propietario_id: 2,
        fecha_publicacion: new Date().toISOString()
      },
      {
        id: 4, codigo: 'C0456123', tipo: 'Casa',
        provincia: 'Choapa', comuna: 'Illapel', sector: 'Centro',
        direccion: 'Calle Constitución 321',
        descripcion: 'Gran casa con piscina, amplio living y comedor. Ideal para familia numerosa en Illapel.',
        dormitorios: 4, banos: 3, area_terreno: 600, area_construida: 200,
        precio_clp: 85000000, precio_uf: 2125,
        bodega: false, estacionamiento: true, logia: false,
        cocina_amoblada: true, antejardin: true, patio_trasero: true, piscina: true,
        latitud: -31.6356, longitud: -71.1685,
        estado: 'activa', propietario_id: 2,
        fecha_publicacion: new Date().toISOString()
      },
      {
        id: 5, codigo: 'D0567234', tipo: 'Departamento',
        provincia: 'Elqui', comuna: 'Coquimbo', sector: 'La Herradura',
        direccion: 'Av. Costanera 890',
        descripcion: 'Departamento con vista al mar en La Herradura. A pasos de la playa y servicios.',
        dormitorios: 3, banos: 2, area_terreno: 0, area_construida: 90,
        precio_clp: 145000000, precio_uf: 3625,
        bodega: false, estacionamiento: true, logia: true,
        cocina_amoblada: false, antejardin: false, patio_trasero: false, piscina: false,
        latitud: -29.9800, longitud: -71.3550,
        estado: 'activa', propietario_id: 2,
        fecha_publicacion: new Date().toISOString()
      }
    ];

    this._set('pnk_usuarios',    usuarios);
    this._set('pnk_propiedades', propiedades);
    this._set('pnk_visitas',     []);
    this._set('pnk_captaciones', []);
    this._set('pnk_session',     null);
    this._set('pnk_init',        true);
    console.log('✅ PNK DB inicializada');
  },

  getSession()       { return this._get('pnk_session'); },
  setSession(user)   { this._set('pnk_session', { id: user.id, nombre: user.nombre, rol: user.rol, correo: user.correo, penka_id: user.penka_id || null }); },
  clearSession()     { this._set('pnk_session', null); },
  isLoggedIn()       { return !!this.getSession(); },
  isAdmin()          { return this.getSession()?.rol === 'admin'; },

  getUsuarios()      { return this._get('pnk_usuarios') || []; },
  _saveUsuarios(arr) { this._set('pnk_usuarios', arr); },

  nextUserId() {
    const users = this.getUsuarios();
    return users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  },

  findUserByCorreo(correo) {
    return this.getUsuarios().find(u => u.correo.toLowerCase() === correo.toLowerCase()) || null;
  },

  findUserById(id) {
    return this.getUsuarios().find(u => u.id === id) || null;
  },

  login(correo, password) {
    const user = this.findUserByCorreo(correo);
    if (!user)                      return { ok: false, msg: 'Correo o contraseña incorrectos.' };
    if (user.password !== password) return { ok: false, msg: 'Correo o contraseña incorrectos.' };
    if (user.estado === 'pendiente') return { ok: false, msg: 'Tu cuenta está pendiente de activación por el Administrador.' };
    if (user.estado === 'inactivo')  return { ok: false, msg: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
    this.setSession(user);
    return { ok: true, user };
  },

  registrarUsuario(data) {
    if (this.findUserByCorreo(data.correo)) return { ok: false, msg: 'Ese correo ya está registrado.' };
    if (this.getUsuarios().find(u => u.rut === data.rut)) return { ok: false, msg: 'Ese RUT ya está registrado.' };
    const user = { id: this.nextUserId(), ...data, estado: 'pendiente', fecha_registro: new Date().toISOString() };
    const arr  = this.getUsuarios();
    arr.push(user);
    this._saveUsuarios(arr);
    return { ok: true };
  },

  actualizarUsuario(id, cambios) {
    const arr = this.getUsuarios().map(u => u.id === id ? { ...u, ...cambios } : u);
    this._saveUsuarios(arr);
  },

  eliminarUsuario(id) {
    this._saveUsuarios(this.getUsuarios().filter(u => u.id !== id));
  },

  activarUsuario(id) {
    const arr = this.getUsuarios();
    const u   = arr.find(u => u.id === id);
    if (!u) return;
    u.estado = 'activo';
    if (u.rol === 'gestor' && !u.penka_id) {
      const lastPenka = arr.filter(x => x.penka_id).map(x => parseInt(x.penka_id.split('-')[1]));
      const next      = lastPenka.length ? Math.max(...lastPenka) + 1 : 1;
      u.penka_id      = `PNK-${String(next).padStart(5,'0')}`;
    }
    this._saveUsuarios(arr);
    return u;
  },

  recuperarPassword(correo) {
    return !!this.findUserByCorreo(correo);
  },

  getPropiedades(filtros = {}) {
    let props = this._get('pnk_propiedades') || [];
    if (filtros.estado)    props = props.filter(p => p.estado === filtros.estado);
    if (filtros.provincia) props = props.filter(p => p.provincia === filtros.provincia);
    if (filtros.comuna)    props = props.filter(p => p.comuna === filtros.comuna);
    if (filtros.tipo)      props = props.filter(p => p.tipo === filtros.tipo);
    if (filtros.sector)    props = props.filter(p => p.sector.toLowerCase().includes(filtros.sector.toLowerCase()));
    return props;
  },

  getPropiedadesUsuario(usuarioId) { return this.getPropiedades().filter(p => p.propietario_id === usuarioId); },

  getPropiedadById(id) {
    return (this._get('pnk_propiedades') || []).find(p => p.id === id) || null;
  },

  _savePropiedades(arr) { this._set('pnk_propiedades', arr); },

  nextPropId() {
    const props = this._get('pnk_propiedades') || [];
    return props.length ? Math.max(...props.map(p => p.id)) + 1 : 1;
  },

  generarCodigo(tipo) {
    const prefijos = { Casa: 'C', Departamento: 'D', Terreno: 'T' };
    const n = this.nextPropId();
    return `${prefijos[tipo] || 'X'}${String(n).padStart(7,'0')}`;
  },

  crearPropiedad(data) {
    const prop = {
      id: this.nextPropId(),
      codigo: this.generarCodigo(data.tipo),
      ...data,
      estado: data.estado || 'activa',
      fecha_publicacion: new Date().toISOString()
    };
    const arr = this._get('pnk_propiedades') || [];
    arr.push(prop);
    this._savePropiedades(arr);
    return prop;
  },

  actualizarPropiedad(id, cambios) {
    const arr = (this._get('pnk_propiedades') || []).map(p => p.id === id ? { ...p, ...cambios } : p);
    this._savePropiedades(arr);
  },

  eliminarPropiedad(id) {
    this._savePropiedades((this._get('pnk_propiedades') || []).filter(p => p.id !== id));
  },

  getVisitas() { return this._get('pnk_visitas') || []; },

  registrarVisita(data) {
    const arr = this.getVisitas();
    arr.push({ id: arr.length + 1, ...data, fecha: new Date().toISOString(), estado: 'pendiente' });
    this._set('pnk_visitas', arr);
  },

  getCaptaciones() { return this._get('pnk_captaciones') || []; },

  crearCaptacion(data) {
    const arr = this.getCaptaciones();
    const captacion = {
      id: arr.length + 1,
      ...data,
      estado: 'pendiente',
      fecha: new Date().toISOString()
    };
    arr.push(captacion);
    this._set('pnk_captaciones', arr);
    return captacion;
  },

  fmtClp(n) {
    return '$' + Number(n).toLocaleString('es-CL');
  },

  coloresProp: [
    'linear-gradient(135deg,#C4614A,#8B3A2A)',
    'linear-gradient(135deg,#2D4A6B,#1A2F45)',
    'linear-gradient(135deg,#4A6C4A,#2A4C2A)',
    'linear-gradient(135deg,#5A4A3A,#3A2A2A)',
    'linear-gradient(135deg,#3A5A7A,#1A3A5A)'
  ],

  toast(msg, tipo = 'success') {
    let t = document.getElementById('pnk-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pnk-toast';
      t.style.cssText = `position:fixed;bottom:2rem;right:2rem;padding:.85rem 1.4rem;
        border-radius:8px;font-size:.88rem;font-weight:500;z-index:9999;
        font-family:'DM Sans',sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.2);
        transition:opacity .3s;max-width:360px;`;
      document.body.appendChild(t);
    }
    const colores = {
      success: 'background:#D1FAE5;color:#065F46;border-left:4px solid #10B981',
      error:   'background:#FEE2E2;color:#991B1B;border-left:4px solid #EF4444',
      warning: 'background:#FEF3C7;color:#92400E;border-left:4px solid #F59E0B',
      info:    'background:#DBEAFE;color:#1E40AF;border-left:4px solid #3B82F6'
    };
    t.style.cssText += ';' + colores[tipo];
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.display = 'block';
    clearTimeout(t._to);
    t._to = setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.style.display='none',300); }, 3500);
  },

  requireLogin(redirectTo = '../pages/login.html') {
    if (!this.isLoggedIn()) { window.location.href = redirectTo; return false; }
    return true;
  },
  requireAdmin(redirectTo = '../index.html') {
    if (!this.isAdmin()) { window.location.href = redirectTo; return false; }
    return true;
  }
};

PNK_DB.init();
