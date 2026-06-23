const CAMPO_MAX = {
  rut:               12,
  nombre:            50,
  correo:            50,
  telefono:          20,
  num_bienes_raices: 20,
  password:          50,
  password2:         50,
};

function aplicarLimite(id, max) {
  const el = document.getElementById(id);
  if (!el) return;

  const MSG = `Máximo ${max} caracteres permitidos.`;

  el.addEventListener('keydown', function (e) {
    const teclasSalvadas = [
      'Backspace','Delete','ArrowLeft','ArrowRight',
      'ArrowUp','ArrowDown','Tab','Home','End','Enter'
    ];
    if (teclasSalvadas.includes(e.key) || e.ctrlKey || e.metaKey) return;

    const sinSeleccion = this.selectionStart === this.selectionEnd;
    if (this.value.length >= max && sinSeleccion) {
      e.preventDefault();
      setError(id, MSG);
    }
  });

  el.addEventListener('input', function () {
    if (this.value.length > max) {
      this.value = this.value.slice(0, max);
      setError(id, MSG);
    }
  });
}

Object.entries(CAMPO_MAX).forEach(([id, max]) => aplicarLimite(id, max));

function setError(id, msg) {
  const el = document.getElementById('err-' + id);
  const input = document.getElementById(id);

  if (!el) return;

  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';

  if (input) {
    input.style.borderColor = msg ? '#EF4444' : '';
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });

  document.querySelectorAll('.form-grid input, .form-grid select').forEach(el => {
    el.style.borderColor = '';
  });
}

function bindClearOnInput(id) {
  const el = document.getElementById(id);

  if (!el) return;

  el.addEventListener('input', () => setError(id, ''));
  el.addEventListener('change', () => setError(id, ''));
}

[
  'rut',
  'nombre',
  'fecha_nac',
  'sexo',
  'correo',
  'telefono',
  'num_bienes_raices',
  'password',
  'password2',
  'terminos'
].forEach(bindClearOnInput);

function sanitizarTexto(txt) {
  return txt.replace(/[<>]/g, '').trim();
}

function validarRut(rut) {
  return /^\d{1,2}(\.\d{3}){0,2}-[\dkK]$/.test(rut);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefono(tel) {
  return /^[\+]?[\d\s\-]{7,20}$/.test(tel);
}

function doRegistro() {
  clearErrors();

  let hayError = false;

  const rut = sanitizarTexto(
    document.getElementById('rut').value
  );

  const nombre = sanitizarTexto(
    document.getElementById('nombre').value
  );

  const fecha_nac =
    document.getElementById('fecha_nac').value;

  const sexo =
    document.getElementById('sexo').value;

  const correo = sanitizarTexto(
    document.getElementById('correo').value.toLowerCase()
  );

  const telefono = sanitizarTexto(
    document.getElementById('telefono').value
  );

  const nbr = sanitizarTexto(
    document.getElementById('num_bienes_raices').value
  );

  const password =
    document.getElementById('password').value;

  const password2 =
    document.getElementById('password2').value;

  const terminos =
    document.getElementById('terminos').checked;

  if (!rut) {
    setError('rut', 'Este campo es obligatorio.');
    hayError = true;

  } else if (rut.length > 12) {
    setError('rut', 'El RUT no puede superar 12 caracteres.');
    hayError = true;

  } else if (!validarRut(rut)) {
    setError('rut', 'Formato inválido. Usa el formato 12.345.678-9.');
    hayError = true;
  }

  if (!nombre) {
    setError('nombre', 'Este campo es obligatorio.');
    hayError = true;

  } else if (nombre.length < 3) {
    setError('nombre', 'El nombre debe tener al menos 3 caracteres.');
    hayError = true;

  } else if (nombre.length > 50) {
    setError('nombre', 'El nombre no puede superar 50 caracteres.');
    hayError = true;

  } else if (/\d/.test(nombre)) {
    setError('nombre', 'El nombre no puede contener números.');
    hayError = true;
  }

  if (!fecha_nac) {
    setError('fecha_nac', 'Debes ingresar tu fecha de nacimiento.');
    hayError = true;

  } else {
    const hoy = new Date();
    const nac = new Date(fecha_nac);

    let edad = hoy.getFullYear() - nac.getFullYear();

    const m = hoy.getMonth() - nac.getMonth();

    if (
      m < 0 ||
      (m === 0 && hoy.getDate() < nac.getDate())
    ) {
      edad--;
    }

    if (nac > hoy) {
      setError('fecha_nac', 'La fecha no puede ser futura.');
      hayError = true;

    } else if (edad < 18) {
      setError('fecha_nac', 'Debes ser mayor de 18 años para registrarte.');
      hayError = true;
    }
  }

  if (!sexo) {
    setError('sexo', 'Selecciona una opción.');
    hayError = true;
  }

  if (!correo) {
    setError('correo', 'Este campo es obligatorio.');
    hayError = true;

  } else if (correo.length > 50) {
    setError('correo', 'El correo no puede superar 50 caracteres.');
    hayError = true;

  } else if (!validarEmail(correo)) {
    setError('correo', 'Ingresa un correo electrónico válido.');
    hayError = true;
  }

  if (!telefono) {
    setError('telefono', 'Este campo es obligatorio.');
    hayError = true;

  } else if (telefono.length > 20) {
    setError('telefono', 'El teléfono no puede superar 20 caracteres.');
    hayError = true;

  } else if (!validarTelefono(telefono)) {
    setError('telefono', 'Ingresa un número de teléfono válido.');
    hayError = true;
  }

  if (!nbr) {
    setError('num_bienes_raices', 'Este campo es obligatorio.');
    hayError = true;

  } else if (nbr.length > 20) {
    setError('num_bienes_raices', 'Máximo 20 caracteres.');
    hayError = true;
  }

  if (!password) {
    setError('password', 'Este campo es obligatorio.');
    hayError = true;

  } else if (password.length < 6) {
    setError('password', 'La contraseña debe tener al menos 6 caracteres.');
    hayError = true;

  } else if (password.length > 50) {
    setError('password', 'La contraseña no puede superar 50 caracteres.');
    hayError = true;
  }

  if (!password2) {
    setError('password2', 'Confirma tu contraseña.');
    hayError = true;

  } else if (password2.length > 50) {
    setError('password2', 'La contraseña no puede superar 50 caracteres.');
    hayError = true;

  } else if (password !== password2) {
    setError('password2', 'Las contraseñas no coinciden.');
    hayError = true;
  }

  if (!terminos) {
    setError(
      'terminos',
      'Debes aceptar los Términos y Condiciones para continuar.'
    );

    hayError = true;
  }

  if (hayError) {
    const primerError = document.querySelector(
      '.field-error[style*="block"]'
    );

    if (primerError) {
      primerError.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    return;
  }

  const res = PNK_DB.registrarUsuario({
    rut,
    nombre,
    correo,
    password,
    rol: 'propietario',
    sexo,
    telefono,
    fecha_nac,
    num_bienes_raices: nbr,
    penka_id: null
  });

  if (!res.ok) {

    if (
      res.msg &&
      res.msg.toLowerCase().includes('rut')
    ) {
      setError('rut', res.msg);

    } else if (
      res.msg &&
      res.msg.toLowerCase().includes('correo')
    ) {
      setError('correo', res.msg);

    } else {
      setError('rut', res.msg);
    }

    return;
  }

  Swal.fire({
    icon: 'success',
    title: '¡Solicitud enviada!',
    html: `
      <p style="margin-bottom:.25rem;">
        Tu registro ha sido recibido correctamente.
      </p>

      <p style="font-size:.8rem;color:#6B7280;margin-top:.5rem;">
        Tu cuenta quedará en estado
        <strong>Pendiente</strong>
        hasta que el Administrador verifique tus antecedentes.
      </p>
    `,
    confirmButtonText: 'Ir al ingreso',
    confirmButtonColor: '#C17B5C',
    allowOutsideClick: false
  }).then(() => {
    window.location.href = 'login.html';
  });
}

document.getElementById('rut').addEventListener('input', function () {

  let v = this.value.replace(/[^0-9kK]/g, '');

  if (v.length > 12) {
    v = v.slice(0, 12);
  }

  if (v.length > 1) {

    const dv = v.slice(-1).toUpperCase();

    const body = v
      .slice(0, -1)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    this.value = body + '-' + dv;
  }
});