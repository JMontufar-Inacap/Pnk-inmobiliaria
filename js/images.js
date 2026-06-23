const PNK_IMAGES = {
  'casa1':    '/img/Casa1.jpg',
  'depto1':   '/img/Depto1.jpg',
  'terreno1': '/img/Terreno1.jpg',
  'casa2':    '/img/Casa2.jpg',
  'depto2':   '/img/Depto2.jpg',
  'terreno2': '/img/Terreno2.jpg',
  'Lobby':    '/img/Lobby.jpg',
};

function cargarImagenesGuardadas() {
  const claves = ['casa1','casa2','depto1','depto2','terreno1','terreno2','Lobby'];
  claves.forEach(k => {
    const saved = localStorage.getItem('pnk_img_' + k);
    if (saved) PNK_IMAGES[k] = saved;
  });
}
cargarImagenesGuardadas();

function inyectarImagenes() {
  const overlay = 'linear-gradient(rgba(0,0,0,0.30),rgba(0,0,0,0.30))';
  const overlayLight = 'linear-gradient(rgba(0,0,0,0.20),rgba(0,0,0,0.20))';

  const css = `
    .t1  { background: ${overlayLight} center/cover, url("${PNK_IMAGES['casa1']}") center/cover !important; }
    .t2  { background: ${overlayLight} center/cover, url("${PNK_IMAGES['depto1']}") center/cover !important; }
    .t3  { background: ${overlayLight} center/cover, url("${PNK_IMAGES['terreno1']}") center/cover !important; }
    .pi1 { background: ${overlay} center/cover, url("${PNK_IMAGES['casa1']}") center/cover !important; }
    .pi2 { background: ${overlay} center/cover, url("${PNK_IMAGES['depto1']}") center/cover !important; }
    .pi3 { background: ${overlay} center/cover, url("${PNK_IMAGES['terreno1']}") center/cover !important; }
    .pi4 { background: ${overlay} center/cover, url("${PNK_IMAGES['casa2']}") center/cover !important; }
    .pi5 { background: ${overlay} center/cover, url("${PNK_IMAGES['depto2']}") center/cover !important; }
    .pi6 { background: ${overlay} center/cover, url("${PNK_IMAGES['terreno2']}") center/cover !important; }
    .lobby-bg { background: linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)) center/cover, url("${PNK_IMAGES['Lobby']}") center/cover !important; }
  `;
  let tag = document.getElementById('pnk-img-styles');
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'pnk-img-styles';
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}

function subirImagen(input, clave, callback) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert('La imagen no debe superar 3 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    PNK_IMAGES[clave] = e.target.result;
    localStorage.setItem('pnk_img_' + clave, e.target.result);
    inyectarImagenes();
    if (callback) callback(clave, e.target.result);
  };
  reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', inyectarImagenes);
if (document.readyState !== 'loading') inyectarImagenes();
