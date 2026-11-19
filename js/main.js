// El destierro y la vuelta · De Jerusalén a Babilonia y regreso
// Mapa ilustrado 3D (Three.js local, sin claves ni servicios de pago). Familia de «El paso».
// Coordenadas del mapa: x (oeste→este) y z (norte→sur). x = (lon + 3.6) · 4.59 ; z = −(lat − 41.2) · 6.06
import * as THREE from './three.module.min.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');

/* ------------------------------------------------------------------ */
/* Geografía estilizada del centro y norte de la Península             */
/* ------------------------------------------------------------------ */
// x = (lon − 41.4) · 1.316 ; z = −(lat − 33.65) · 1.576
const JERU = [-8.12, 2.95], BABEL = [3.97, 1.75];
const ROUTE_2D = [
  [-8.12, 2.95],  // I · Jerusalén
  [-7.95, 1.9],
  [-6.72, 0.22],  // Damasco
  [-6.38, -1.26], // II · Ribla
  [-6.12, -2.33], // Hamat
  [-5.59, -4.02], // Alepo
  [-4.6, -4.75],  // Carquemis
  [-3.68, -3.7],
  [-3.16, -3.62],
  [-0.67, -1.42], // Mari
  [1.87, 0.02],
  [3.2, 1.3],
  [3.85, 1.9],    // III · los canales
  [4.5, 2.2],
  [5.04, 2.4],    // IV · Quebar
  [4.62, 2.12],   // V · la carta
  [4.74, 2.8],    // VI · huesos secos
  [4.25, 2.32],   // VII · la Palabra
  [3.97, 1.75],   // VIII · Ciro
  [2.4, 2.35],
  [-1.84, 2.6],   // IX · el desierto
  [-5.4, 2.85],
  [-7.84, 2.8],   // Jericó
  [-8.12, 2.95],  // X · el regreso
  [-8.16, 3.0],   // XI · Esdras
  [-8.08, 2.91],  // XII · Nehemías
];
const STATIONS = [
  { xz: [-8.12, 2.95], rn: 'I', name: 'Jerusalén', lab: [-10, 3], tag: 'I · X–XII', zoom: .5 },
  { xz: [-6.38, -1.26], rn: 'II', name: 'Ribla', lab: [-9, 3], zoom: .8 },
  { xz: [3.85, 1.9], rn: 'III', name: 'Babilonia', lab: [0, -7], tag: 'III–VIII', zoom: .5, lift: 1.6 },
  { xz: [5.04, 2.4], rn: 'IV', name: 'Quebar', ov: false, zoom: .5 },
  { xz: [4.62, 2.12], rn: 'V', name: 'La carta', ov: false, zoom: .5 },
  { xz: [4.74, 2.8], rn: 'VI', name: 'Los huesos', ov: false, zoom: .5 },
  { xz: [4.25, 2.32], rn: 'VII', name: 'La Palabra', ov: false, zoom: .5 },
  { xz: [3.97, 1.75], rn: 'VIII', name: 'Ciro', ov: false, zoom: .5 },
  { xz: [-1.84, 2.6], rn: 'IX', name: 'El desierto', lab: [0, 11], zoom: 1 },
  { xz: [-8.12, 2.95], rn: 'X', name: 'El regreso', ov: false, zoom: .5 },
  { xz: [-8.16, 3.0], rn: 'XI', name: 'Esdras', ov: false, zoom: .45 },
  { xz: [-8.08, 2.91], rn: 'XII', name: 'Nehemías', ov: false, zoom: .5 },
];

function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let s = 0, a = .5, f = 1; for (let o = 0; o < 4; o++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
function seg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az; let t = ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz);
  t = Math.max(0, Math.min(1, t)); const ex = ax + dx * t - px, ez = az + dz * t - pz; return Math.hypot(ex, ez);
}
const polyD = (x, z, P) => { let d = 1e9; for (let i = 0; i < P.length - 1; i++) d = Math.min(d, seg(x, z, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1])); return d; };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));

const RIVERS = {
  'Éufrates': [[-4.9, -6.6], [-4.47, -5.01], [-3.68, -3.7], [-3.16, -3.62], [-1.8, -2.4], [-0.67, -1.42], [0.9, -0.55], [1.87, 0.02], [3.0, 0.9], [3.97, 1.75], [4.9, 2.9], [5.53, 3.7], [7.1, 4.25], [8.3, 4.75], [9.0, 5.25]],
  Tigris: [[1.2, -6.6], [1.9, -5.2], [2.3, -4.27], [2.9, -2.8], [3.5, -1.0], [3.95, 0.55], [4.6, 1.2], [5.79, 1.81], [6.9, 3.0], [7.9, 4.18], [9.0, 5.25]],
  Quebar: [[3.97, 1.75], [4.5, 2.1], [5.04, 2.4], [5.6, 2.75]],
  'Jordán': [[-7.63, 1.34], [-7.7, 2.2], [-7.76, 3.0]],
  Orontes: [[-6.55, 0.3], [-6.38, -1.26], [-6.12, -2.33], [-6.4, -3.6], [-6.95, -4.25]],
};
const RIVER_W = { 'Éufrates': .11, Tigris: .1, Quebar: .04, 'Jordán': .035, Orontes: .04 };
const riverD = (x, z) => { let d = 1e9; for (const k in RIVERS) d = Math.min(d, polyD(x, z, RIVERS[k]) - RIVER_W[k] * .5); return d; };
// costa mediterránea: x de la costa según z
const COAST = [[-6.6, -6.9], [-5.0, -6.75], [-4.65, -6.84], [-4.2, -7.15], [-2.92, -7.4], [-1.2, -7.75], [0.6, -8.16], [2.0, -8.5], [3.39, -9.15], [5.0, -9.75], [6.6, -10.4]];
function coastX(z) { for (let i = 0; i < COAST.length - 1; i++) { const [z0, x0] = COAST[i], [z1, x1] = COAST[i + 1]; if (z <= z1) return x0 + (x1 - x0) * (z - z0) / (z1 - z0); } return COAST[COAST.length - 1][1]; }
// > 0 tierra, < 0 agua
function land(x, z) {
  const wob = (fbm(x * .9 + 3, z * .9) - .5) * .35;
  const med = z < -5.1 ? 9 : (x - coastX(z)) + wob;                    // Mediterráneo
  const gulf = ((z - 5.4) * -1 + (x - 8.2) * -.55) + wob * .6;           // golfo Pérsico, abajo a la derecha
  const dead = (Math.hypot((x + 7.76) / .09, (z - 3.35) / .32) - 1) * .09;
  const gal = (Math.hypot((x + 7.63) / .08, (z - 1.3) / .1) - 1) * .08;
  return Math.min(med, gulf, dead, gal);
}
const ZAGROS = [[2.4, -6.8], [4.6, -4.6], [6.6, -2.2], [8.4, 0.2], [10.4, 2.4]];
const MAP = { x0: -10.2, x1: 10.2, z0: -6.7, z1: 6.7 };
MAP.w = MAP.x1 - MAP.x0; MAP.d = MAP.z1 - MAP.z0;
function height(x, z) {
  const e = Math.min(x - MAP.x0, MAP.x1 - x, z - MAP.z0, MAP.z1 - z);
  return heightCore(x, z) * smooth(0, .7, e) * .75;
}
function heightCore(x, z) {
  const l = land(x, z);
  if (l < 0) return 0;
  const k = smooth(0, .4, l), n = fbm(x * .7, z * .7), ridge = 1 - Math.abs(fbm(x * 1.6 + 7, z * 1.6) * 2 - 1);
  let h = Math.min(l, .25) * .3 + k * (.06 + n * .14);
  h += k * Math.exp(-(polyD(x, z, [[-7.6, 1.6], [-7.15, -0.4], [-6.9, -1.6]]) ** 2) / (2 * .35 ** 2)) * (.6 + ridge * .35);   // Líbano
  h += k * Math.exp(-(polyD(x, z, [[-6.9, 0.9], [-6.4, -0.6]]) ** 2) / (2 * .3 ** 2)) * (.45 + ridge * .3);                  // Antilíbano
  h += k * gauss(x, z, -8.1, 3.1, .55) * .42;                                                                                 // montes de Judá
  h += k * smooth(-4.8, -6.6, z) * (1 - smooth(3, 6, x)) * (.55 + ridge * .4);                                               // Tauro
  h += k * Math.exp(-(polyD(x, z, ZAGROS) ** 2) / (2 * 1.1 ** 2)) * (.85 + ridge * .5);                                     // Zagros
  h += k * gauss(x, z, -2.2, 1.2, 2.6) * .16;                                                                                 // meseta del desierto sirio
  h += k * smooth(3.8, 6.5, z) * (1 - smooth(4, 7, x)) * .12;                                                                 // Arabia
  h -= k * Math.exp(-(polyD(x, z, RIVERS['Éufrates'].slice(9)) ** 2) / (2 * .9 ** 2)) * .08;                                // llanura de Mesopotamia
  const rd = riverD(x, z);
  h -= (1 - smooth(0, .3, rd)) * .07;
  return Math.max(.015, h);
}

/* ------------------------------------------------------------------ */
/* Ruta (compartida por el 3D y el mapa SVG)                           */
/* ------------------------------------------------------------------ */
const route2 = new THREE.CatmullRomCurve3(ROUTE_2D.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
const SAMPLES = 1600;
const samples = route2.getSpacedPoints(SAMPLES).map(p => new THREE.Vector3(p.x, height(p.x, p.z) + .035, p.z));
const route = new THREE.CatmullRomCurve3(samples);
let lastK = -1;
const stationU = STATIONS.map(s => {
  let best = lastK + 1, bd = 1e9;
  for (let k = lastK + 1; k < samples.length; k++) { const d = Math.hypot(samples[k].x - s.xz[0], samples[k].z - s.xz[1]); if (d < bd - 1e-6) { bd = d; best = k; } }
  lastK = best;
  return best / SAMPLES;
});

/* ------------------------------------------------------------------ */
/* Lámina de atlas                                                      */
/* ------------------------------------------------------------------ */
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const HYPSO = [[0, hex('#d9cc9c')], [.12, hex('#dcc890')], [.28, hex('#d0b07a')], [.5, hex('#bd9564')], [.75, hex('#9f7a54')], [1.1, hex('#826349')]];
const C_SHALLOW = hex('#bcd2d3'), C_DEEP = hex('#93b3bc'), C_COAST = hex('#7b9da8'), C_RIVER = hex('#6f97a3'), C_GREEN = hex('#a3ab72');
let atlasBase = null;
function paintBase(G) {
  const W = MAP.w, D = MAP.d, Hh = new Float32Array((G + 1) * (G + 1)), Ll = new Float32Array((G + 1) * (G + 1));
  for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) { const x = MAP.x0 + i / G * W, z = MAP.z0 + j / G * D, k = j * (G + 1) + i; Hh[k] = height(x, z); Ll[k] = land(x, z); }
  const c = document.createElement('canvas'); c.width = c.height = G;
  const ctx = c.getContext('2d'), id = ctx.createImageData(G, G), S = .2 / (W / G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const k = j * (G + 1) + i, x = MAP.x0 + i / G * W, z = MAP.z0 + j / G * D, l = Ll[k], h = Hh[k];
    let col;
    if (l < 0) col = l > -.05 ? C_COAST : mix3(C_SHALLOW, C_DEEP, smooth(.05, .9, -l));
    else {
      let q = 0; while (q < HYPSO.length - 2 && h > HYPSO[q + 1][0]) q++;
      col = mix3(HYPSO[q][1], HYPSO[q + 1][1], Math.min(1, (h - HYPSO[q][0]) / (HYPSO[q + 1][0] - HYPSO[q][0])));
      const rd = riverD(x, z);
      col = mix3(col, C_GREEN, Math.max((1 - smooth(0, .7, rd)) * .8, gauss(x, z, -7.6, 1.2, 1.1) * .35));   // vegas y la Media Luna Fértil
      const dx = Hh[k + 1] - Hh[k], dz = Hh[k + G + 1] - Hh[k];
      const sh = Math.max(.55, Math.min(1.3, 1 + (-dx - dz) * S * 2.2));
      col = [col[0] * sh, col[1] * sh, col[2] * sh];
      if (rd < 0) col = C_RIVER;
    }
    const grain = .96 + hash(i * .37, j * .91) * .07, o = (j * G + i) * 4;
    id.data[o] = col[0] * grain; id.data[o + 1] = col[1] * grain; id.data[o + 2] = col[2] * grain; id.data[o + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}
function paintAtlas(N, G) {
  if (!atlasBase || atlasBase.width !== G) atlasBase = paintBase(G);
  const c = document.createElement('canvas'); c.width = c.height = N;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlasBase, 0, 0, N, N);
  const PX = x => (x - MAP.x0) / MAP.w * N, PZ = z => (z - MAP.z0) / MAP.d * N, UX = N / MAP.w, UZ = N / MAP.d;
  ctx.strokeStyle = 'rgba(110,80,45,.13)'; ctx.lineWidth = N / 1400;
  for (let x = -8; x <= 8; x += 2) { ctx.beginPath(); ctx.moveTo(PX(x), 0); ctx.lineTo(PX(x), N); ctx.stroke(); }
  for (let z = -6; z <= 6; z += 2) { ctx.beginPath(); ctx.moveTo(0, PZ(z)); ctx.lineTo(N, PZ(z)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(70,110,125,.85)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k in RIVERS) { ctx.lineWidth = RIVER_W[k] * UZ * .5; ctx.beginPath(); RIVERS[k].forEach(([x, z], i) => i ? ctx.lineTo(PX(x), PZ(z)) : ctx.moveTo(PX(x), PZ(z))); ctx.stroke(); }
  const serif = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
  function txt(str, x, z, size, o = {}) {
    ctx.save();
    ctx.translate(PX(x), PZ(z)); ctx.scale(UX / UZ, 1); if (o.rot) ctx.rotate(o.rot);
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 500} ${size * UZ}px ${serif}`;
    const sp = (o.spacing || 0) * size * UZ;
    const chars = [...str], widths = chars.map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
    let cx = o.align === 'left' ? 0 : o.align === 'right' ? -total : -total / 2;
    ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    chars.forEach((ch, k) => {
      if (o.halo) { ctx.strokeStyle = o.halo; ctx.lineWidth = size * UZ * .22; ctx.strokeText(ch, cx, 0); }
      ctx.fillStyle = o.color || 'rgba(92,62,36,.62)'; ctx.fillText(ch, cx, 0); cx += widths[k] + sp;
    });
    ctx.restore();
  }
  const SEA = 'rgba(52,88,104,.8)', REG = 'rgba(96,64,36,.5)', TOWN = 'rgba(58,38,22,.9)', HALO = 'rgba(232,222,190,.6)';
  txt('MAR GRANDE', -9.4, -1.0, .32, { italic: true, spacing: .4, color: SEA, rot: -1.25 });
  txt('Golfo Pérsico', 9.4, 6.15, .24, { italic: true, color: SEA, rot: -.5 });
  txt('Éufrates', -1.9, -2.7, .28, { italic: true, color: SEA, rot: .7, spacing: .15 });
  txt('Tigris', 2.25, -3.0, .26, { italic: true, color: SEA, rot: 1.25, spacing: .15 });
  txt('río Quebar', 5.75, 2.95, .17, { italic: true, color: SEA, align: 'left' });
  txt('Orontes', -5.75, -2.9, .17, { italic: true, color: SEA, rot: 1.5 });
  txt('Jordán', -7.45, 2.2, .14, { italic: true, color: SEA, rot: 1.5 });
  txt('BABILONIA', 5.4, 0.5, .32, { spacing: .55, color: REG });
  txt('(Caldea)', 5.4, .85, .2, { italic: true, color: REG });
  txt('ASIRIA', 3.4, -5.0, .34, { spacing: .55, color: REG });
  txt('ARAM', -5.4, 0.6, .3, { spacing: .55, color: REG });
  txt('JUDÁ', -8.3, 4.15, .26, { spacing: .5, color: REG });
  txt('FENICIA', -7.75, -0.6, .2, { spacing: .4, color: REG, rot: -1.25 });
  txt('DESIERTO DE SIRIA', -2.0, 0.9, .32, { spacing: .5, color: REG });
  txt('ARABIA', -1.0, 5.2, .4, { spacing: .7, color: REG });
  txt('ELAM', 8.9, 1.2, .3, { spacing: .55, color: REG });
  txt('MONTES ZAGROS', 6.9, -2.9, .22, { spacing: .4, color: REG, rot: .78 });
  txt('MESOPOTAMIA', 0.6, -1.2, .22, { spacing: .5, color: REG, rot: .48 });
  txt('— Camino en el desierto (Is 40) —', -1.8, 3.15, .17, { italic: true, color: 'rgba(130,40,28,.75)' });
  const towns = [
    ['Jerusalén', -8.12, 2.95, 'r', .2], ['Damasco', -6.72, .22, 'r', .22], ['Ribla', -6.38, -1.26, 'r', .22], ['Hamat', -6.12, -2.33, 'r', .2],
    ['Alepo', -5.59, -4.02, 'r', .2], ['Carquemis', -4.47, -5.01, 'r', .2], ['Mari', -.67, -1.42, 'l', .2], ['Babilonia', 3.97, 1.75, 'l', .22],
    ['Nipur', 5.25, 2.15, 'r', .18], ['Tel Abib', 5.04, 2.4, 'l', .16], ['Nínive (en ruinas)', 2.3, -4.27, 'r', .18], ['Susa', 9.03, 2.3, 'l', .22],
    ['Tiro', -8.16, .6, 'r', .17], ['Gaza', -9.15, 3.39, 'r', .17], ['Jericó', -7.84, 2.72, 'r', .13], ['Tadmor', -4.12, -1.42, 'r', .17], ['Ur', 6.05, 4.0, 'r', .17],
  ];
  towns.forEach(([n, x, z, side, s]) => {
    ctx.fillStyle = '#9b2a1c'; ctx.strokeStyle = 'rgba(240,230,200,.8)'; ctx.lineWidth = UZ * .02;
    ctx.beginPath(); ctx.ellipse(PX(x), PZ(z), UX * .05, UZ * .05, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt(n, x + (side === 'r' ? .12 : -.12), z - .14, s, { italic: true, color: TOWN, align: side === 'r' ? 'left' : 'right', halo: HALO });
  });
  ctx.save(); ctx.translate(PX(-9.3), PZ(5.6)); ctx.scale(UX / UZ, 1); ctx.fillStyle = 'rgba(90,60,34,.55)';
  ctx.beginPath(); ctx.moveTo(0, -UZ * .45); ctx.lineTo(UZ * .08, 0); ctx.lineTo(0, UZ * .45); ctx.lineTo(-UZ * .08, 0); ctx.closePath(); ctx.fill();
  ctx.font = `600 ${UZ * .2}px ${serif}`; ctx.textAlign = 'center'; ctx.fillText('N', 0, -UZ * .56); ctx.restore();
  ctx.strokeStyle = 'rgba(80,52,28,.55)'; ctx.lineWidth = N / 500; ctx.strokeRect(N * .008, N * .008, N * .984, N * .984);
  ctx.lineWidth = N / 1400; ctx.strokeRect(N * .016, N * .016, N * .968, N * .968);
  return c;
}

// Mapa SVG de respaldo
(function drawSvg() {
  const P = (x, z) => `${(x * 9.6 + 100).toFixed(1)} ${(z * 9.6 + 100).toFixed(1)}`;
  const path = document.getElementById('ruta-svg');
  if (path) path.setAttribute('d', 'M' + route2.getSpacedPoints(200).map(p => P(p.x, p.z)).join(' L'));
  const img = document.getElementById('mapa-img');
  const fill = () => {
    if (!img) return;
    img.setAttribute('x', MAP.x0 * 9.6 + 100); img.setAttribute('y', MAP.z0 * 9.6 + 100);
    img.setAttribute('width', MAP.w * 9.6); img.setAttribute('height', MAP.d * 9.6);
    img.setAttribute('preserveAspectRatio', 'none');
    img.setAttribute('href', paintAtlas(900, 360).toDataURL('image/jpeg', .85));
  };
  const hasGL = (() => { try { const t = document.createElement('canvas'); return !!(t.getContext('webgl2') || t.getContext('webgl')); } catch (e) { return false; } })();
  if (!hasGL) { fill(); if (document.fonts) document.fonts.ready.then(fill); }
  const g = document.getElementById('st-svg');
  if (g) g.innerHTML = STATIONS.filter(s => s.ov !== false).map(s => {
    const cx = s.xz[0] * 9.6 + 100, cy = s.xz[1] * 9.6 + 100;
    return `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#C9A35B" stroke="#3a2614" stroke-width=".8"/><text x="${cx + s.lab[0]}" y="${cy + s.lab[1]}" stroke="#0B0A08" stroke-width="2.4" paint-order="stroke">${s.tag || s.rn}</text>`;
  }).join('');
})();

/* ------------------------------------------------------------------ */
/* Interfaz: revelados, navegación, compartir                          */
/* ------------------------------------------------------------------ */
requestAnimationFrame(() => document.body.classList.add('is-loaded'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const menuBtn = document.querySelector('.top__btn'), menu = document.getElementById('menu-etapas'), curEl = document.getElementById('etapa-actual');
const setMenu = open => { menuBtn.setAttribute('aria-expanded', open); menu.hidden = !open; document.body.classList.toggle('menu-open', open); };
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

const dots = [...document.querySelectorAll('[data-dot]')];
const etapas = [...document.querySelectorAll('.etapa')];
const markActive = n => {
  dots.forEach(a => a.classList.toggle('is-active', a.dataset.dot === n));
  if (n) { const e = etapas[+n - 1]; curEl.textContent = e.querySelector('.etapa__rn').textContent + ' · ' + dots[+n - 1].querySelector('.nm').textContent; }
  else curEl.textContent = 'Etapas';
};
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) markActive(e.target.id.startsWith('etapa-') ? e.target.id.split('-')[1] : null); }), { rootMargin: '-45% 0px -45% 0px' });
etapas.forEach(s => navIO.observe(s));
['inicio', 'prologo', 'final'].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });

document.querySelectorAll('[data-share]').forEach(b => b.addEventListener('click', () => {
  const n = +b.dataset.share;
  let txt = 'El destierro y la vuelta · De Jerusalén a Babilonia y regreso. Un itinerario de fe en doce etapas';
  if (n) { const e = etapas[n - 1]; txt = `El destierro y la vuelta · ${e.querySelector('.etapa__rn').textContent}. ${e.querySelector('.etapa__lugar').textContent}: ${e.querySelector('.panel__title').textContent}`; }
  const url = location.href.split('#')[0] + (n ? '#etapa-' + n : '');
  window.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + url), '_blank', 'noopener');
}));

/* ------------------------------------------------------------------ */
/* Escena 3D                                                           */
/* ------------------------------------------------------------------ */
const stageEl = document.querySelector('.stage');
const canvas = document.getElementById('mapa3d');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' }); } catch (e) { renderer = null; }
if (!renderer) document.documentElement.classList.add('no-webgl'); else initScene();

function initScene() {
  const mobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;

  const scene = new THREE.Scene();
  const BG = new THREE.Color('#EFE4D0');
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, .028);
  const camera = new THREE.PerspectiveCamera(40, 1, .02, 200);

  scene.add(new THREE.HemisphereLight('#fff2dc', '#3c2e1e', 1.25));
  const moon = new THREE.DirectionalLight('#ffe7c2', 1.7); moon.position.set(-6, 9, -6); scene.add(moon);
  const rim = new THREE.DirectionalLight('#c9a35b', .35); rim.position.set(8, 4, 10); scene.add(rim);

  // Terreno: lámina de atlas en relieve
  const SEGX = mobile ? 130 : 190, SEGZ = Math.round(SEGX * MAP.d / MAP.w);
  const geo = new THREE.PlaneGeometry(MAP.w, MAP.d, SEGX, SEGZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate((MAP.x0 + MAP.x1) / 2, 0, (MAP.z0 + MAP.z1) / 2);
  const pos = geo.attributes.position;
  for (let k = 0; k < pos.count; k++) pos.setY(k, height(pos.getX(k), pos.getZ(k)));
  geo.computeVertexNormals();
  const TEX_N = mobile ? 2048 : 3072, TEX_G = mobile ? 420 : 560;
  const atlasTex = new THREE.CanvasTexture(paintAtlas(TEX_N, TEX_G));
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (document.fonts) document.fonts.ready.then(() => { atlasTex.image = paintAtlas(TEX_N, TEX_G); atlasTex.needsUpdate = true; });
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 1, metalness: 0 })));
  const slab = new THREE.Mesh(new THREE.BoxGeometry(MAP.w, .55, MAP.d), new THREE.MeshStandardMaterial({ color: '#8a6a48', roughness: 1 }));
  slab.position.set((MAP.x0 + MAP.x1) / 2, -.285, (MAP.z0 + MAP.z1) / 2); scene.add(slab);

  // Ruta
  const TUBE_SEG = 1800, RAD = 6;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(route, TUBE_SEG, mobile ? .022 : .018, RAD, false), new THREE.MeshBasicMaterial({ color: '#9b2a1c' }));
  scene.add(tube);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(route, 400, .01, 4, false), new THREE.MeshBasicMaterial({ color: '#9b2a1c', transparent: true, opacity: .3 })));

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.25, 'rgba(232,190,110,.6)'); r.addColorStop(1, 'rgba(201,163,91,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const walker = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  walker.scale.setScalar(.3); scene.add(walker);
  const walkerLight = new THREE.PointLight('#f0c47a', 1.6, 3, 2); scene.add(walkerLight);
  const stationPts = stationU.map(u => route.getPointAt(u));

  const stone = new THREE.MeshStandardMaterial({ color: '#e3d3ae', roughness: .9 });
  stone.side = THREE.DoubleSide;
  // Jerusalén: la muralla en tramos que caen (I) y se levantan (X–XII), y el templo
  const jSegs = [];
  (function jerusalen() {
    const [cx, cz] = JERU, hy = height(cx, cz), R = .15, N = 10;
    for (let i = 0; i < N; i++) {
      const a = (i + .5) / N * Math.PI * 2, len = 2 * R * Math.sin(Math.PI / N) + .004;
      const w = new THREE.Mesh(new THREE.BoxGeometry(len, .05, .014), stone);
      w.position.set(cx + Math.cos(a) * R, hy + .025, cz + Math.sin(a) * R); w.rotation.y = -a + Math.PI / 2; scene.add(w);
      jSegs.push({ w, order: (i * 3) % N / N });
    }
    const t = new THREE.Mesh(new THREE.BoxGeometry(.05, .045, .07), stone); t.position.set(cx + .02, hy + .025, cz - .03); scene.add(t); jSegs.temple = t;
  })();
  // Babilonia: el zigurat escalonado y la puerta azul de Ishtar
  (function babilonia() {
    const [cx, cz] = BABEL, hy = height(cx, cz), mud = new THREE.MeshStandardMaterial({ color: '#cdb07c', roughness: .95 });
    for (let i = 0; i < 6; i++) { const s = .16 - i * .022, m = new THREE.Mesh(new THREE.BoxGeometry(s, .03, s), mud); m.position.set(cx + .05, hy + .015 + i * .03, cz - .05); scene.add(m); }
    const gate = new THREE.Mesh(new THREE.BoxGeometry(.06, .05, .014), new THREE.MeshStandardMaterial({ color: '#2a5aa8', roughness: .4, emissive: '#1d3f80', emissiveIntensity: .3 }));
    gate.position.set(cx - .1, hy + .025, cz + .06); scene.add(gate);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .025, 4, 1, true), mud); wall.rotation.y = Math.PI / 4; wall.position.set(cx, hy + .012, cz); mud.side = THREE.DoubleSide; scene.add(wall);
  })();
  // Fuego sobre Jerusalén (I)
  const fireTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,220,150,1)'); r.addColorStop(.3, 'rgba(255,110,40,.75)'); r.addColorStop(1, 'rgba(160,30,10,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const flames = [];
  for (let i = 0; i < (mobile ? 40 : 60); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.setScalar(.04 + Math.random() * .05); scene.add(s);
    flames.push({ s, a: Math.random() * 6.28, r: Math.random() * .17, h: Math.random(), v: .4 + Math.random() * .5 });
  }
  const smokeMat = new THREE.SpriteMaterial({ map: glowTex, color: '#5b4f45', transparent: true, depthWrite: false, opacity: 0 });
  const smoke = new THREE.Sprite(smokeMat); smoke.scale.set(.6, .5, 1); scene.add(smoke);
  // Huesos secos (VI) y el soplo del Espíritu
  const bones = [], breath = [];
  (function huesos() {
    const [cx, cz] = STATIONS[5].xz, boneMat = new THREE.MeshStandardMaterial({ color: '#f1ead8', roughness: .6, emissive: '#fff4d8', emissiveIntensity: 0 });
    for (let i = 0; i < 70; i++) {
      const x = cx + (Math.random() - .5) * .34, z = cz + (Math.random() - .5) * .24, m = new THREE.Mesh(new THREE.BoxGeometry(.016, .004, .004), boneMat);
      m.position.set(x, height(x, z) + .004, z); m.rotation.y = Math.random() * 3; scene.add(m); bones.push(m);
    }
    bones.mat = boneMat;
    for (let i = 0; i < 50; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff3d6', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
      s.scale.setScalar(.03 + Math.random() * .03); scene.add(s);
      breath.push({ s, a: Math.random() * 6.28, r: .05 + Math.random() * .2, h: Math.random(), v: .3 + Math.random() * .4, cx, cz });
    }
  })();

  const beamMat = new THREE.MeshBasicMaterial({ color: '#f0cf8a', transparent: true, opacity: .5, depthWrite: false });
  stationPts.forEach((p, i) => {
    if (STATIONS[i].ov === false) return;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.4, 6, 1, true), beamMat); beam.position.set(p.x, p.y + .7, p.z); scene.add(beam);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: .8 }));
    halo.position.set(p.x, p.y + .08, p.z); halo.scale.setScalar(.3); scene.add(halo);
  });

  // Etiquetas HTML proyectadas
  const labelsEl = document.getElementById('labels');
  const labels = STATIONS.map((s, k) => {
    const el = document.createElement('div'); el.className = 'lbl';
    el.innerHTML = `<b>${s.tag || s.rn}</b>`; if (s.ov === false) el.style.display = 'none';
    labelsEl.appendChild(el); return { el, p: stationPts[k].clone().add(new THREE.Vector3(0, s.lift || 1.45, 0)) };
  });

  /* ---------- Cámara guiada por el scroll ---------- */
  let keys = [], fireA = 0, fireB = 1, bonesA = 0, bonesB = 1, wallA = 0, wallB = 1, vh = innerHeight;
  function buildKeys() {
    vh = innerHeight; keys = [];
    const y0 = scrollY;
    document.querySelectorAll('[data-cam]').forEach(el => {
      const type = el.dataset.cam; if (type === 'travel') return;
      const r = el.getBoundingClientRect(), top = r.top + y0, bot = r.bottom + y0;
      let st;
      if (type === 'overview') st = { u: 0, w: 0 };
      else if (type === 'end') st = { u: 1, w: 0 };
      else st = { u: stationU[+el.dataset.station], w: 1 };
      const a = top - vh * .1, b = Math.max(a, bot - vh * .9);
      keys.push([a, st], [b, st]);
    });
    keys.sort((p, q) => p[0] - q[0]);
    const top = id => document.getElementById(id).getBoundingClientRect().top + y0;
    fireA = top('etapa-1') - vh * .2; fireB = top('etapa-2') - vh * .2;
    bonesA = top('etapa-6') - vh * .1; bonesB = top('etapa-6') + vh * .8;
    wallA = top('etapa-10') - vh * .3; wallB = top('etapa-12') + vh * .8;
  }
  function targetAt(y) {
    if (y <= keys[0][0]) return { ...keys[0][1] };
    for (let k = 0; k < keys.length - 1; k++) {
      const [ya, a] = keys[k], [yb, b] = keys[k + 1];
      if (y <= yb) { const t = yb > ya ? smooth(0, 1, (y - ya) / (yb - ya)) : 1; return { u: a.u + (b.u - a.u) * t, w: a.w + (b.w - a.w) * t }; }
    }
    return { ...keys[keys.length - 1][1] };
  }

  const cur = { u: 0, w: 0, fire: 0, spirit: 0, wall: 0 };
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vT = new THREE.Vector3(), look = new THREE.Vector3(),
    camOver = new THREE.Vector3(), lookOver = new THREE.Vector3(), camFol = new THREE.Vector3(), lookFol = new THREE.Vector3(), proj = new THREE.Vector3();
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); buildKeys(); }
  addEventListener('resize', resize); addEventListener('load', buildKeys); resize();

  const clock = new THREE.Clock(); let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, mv = reduceMotion ? 0 : 1;
    const y = scrollY, tgt = targetAt(y);
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2), k2 = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2);
    cur.u += (tgt.u - cur.u) * k; cur.w += (tgt.w - cur.w) * k;
    cur.fire += (smooth(fireA, fireA + vh * .9, y) * (1 - smooth(fireB, fireB + vh * .6, y)) - cur.fire) * k2;
    cur.spirit += (smooth(bonesA, bonesB, y) - cur.spirit) * k2;
    cur.wall += (smooth(wallA, wallB, y) - cur.wall) * k2;

    // Vista general (mapa alto: en vertical cabe casi entero)
    const aspect = camera.aspect;
    const dOver = aspect < 1 ? 34 : Math.max(20, 11.5 / (Math.tan(THREE.MathUtils.degToRad(20)) * aspect)) + 2;
    lookOver.set(aspect < 1 ? -1.6 : -4.2, 0, aspect < 1 ? 2.2 : .2);
    camOver.copy(lookOver).add(vB.set(0, 17, aspect < 1 ? 5 : 8).normalize().multiplyScalar(dOver));
    if (!reduceMotion) camOver.x += Math.sin(t * .12) * .5;

    // Vista de seguimiento
    const u = Math.min(Math.max(cur.u, 0), 1);
    route.getPointAt(u, vA);
    route.getTangentAt(Math.min(u + .001, 1), vT); vT.y = 0; if (vT.lengthSq() < 1e-6) vT.set(0, 0, -1); vT.normalize();
    let zw = .04, zs = .04;
    STATIONS.forEach((st, i) => { const g = Math.exp(-((u - stationU[i]) ** 2) / (2 * .01 ** 2)); zw += g; zs += g * (st.zoom || 1); });
    const zoomK = zs / zw, port = (aspect < 1 ? 1.45 : 1) * zoomK;
    // mirar siempre hacia el norte (el camino sube), con la cámara al sur
    const hgt = 6.2 * port, back = 4.2 * port;
    camFol.copy(vA).add(vB.set(.9 * port * (aspect < 1 ? .3 : 1), hgt, back));
    if (!reduceMotion) camFol.y += Math.sin(t * .4) * .04 * zoomK;
    lookFol.copy(vA).add(vB.set(aspect < 1 ? 0 : .55 * zoomK, 0, -.5 * zoomK));

    const w = smooth(0, 1, cur.w);
    camera.position.lerpVectors(camOver, camFol, w);
    look.lerpVectors(lookOver, lookFol, w);
    camera.lookAt(look);
    scene.fog.density = THREE.MathUtils.lerp(.36 / dOver, .03, w);
    beamMat.opacity = .5 * (1 - w);

    tube.geometry.setDrawRange(0, Math.floor(u * TUBE_SEG) * RAD * 6);
    walker.position.copy(vA).add(vB.set(0, .1, 0));
    walker.material.opacity = smooth(.02, .2, w + (u > .001 ? .5 : 0)) * (u < .999 ? 1 : .5);
    walkerLight.position.copy(walker.position).add(vB.set(0, .3, 0));
    walker.scale.setScalar((.3 + Math.sin(t * 2) * .02) * (.35 + .65 * zoomK));

    // Jerusalén: cae (I) y se reconstruye (X–XII)
    const [jx, jz] = JERU, jy = height(jx, jz);
    const fallen = smooth(fireA - vh * .2, fireA + vh * .9, y), up = cur.wall;
    jSegs.forEach(sg => { const b = Math.max(.08, (1 - fallen) + smooth(sg.order * .8, sg.order * .8 + .2, up)); sg.w.scale.y = Math.min(1, b); sg.w.position.y = jy + .025 * Math.min(1, b); });
    jSegs.temple.scale.y = Math.max(.15, Math.min(1, (1 - fallen) + smooth(0, .4, up)));
    flames.forEach(f => {
      const q = (f.h + t * .25 * f.v * mv) % 1;
      f.s.position.set(jx + Math.cos(f.a) * f.r, jy + .02 + q * .18, jz + Math.sin(f.a) * f.r);
      f.s.material.opacity = cur.fire * (1 - q) * .9;
    });
    smoke.position.set(jx + .05, jy + .35 + Math.sin(t * .3) * .02, jz - .05); smokeMat.opacity = cur.fire * .45;
    // huesos secos que se encienden con el Espíritu
    bones.mat.emissiveIntensity = cur.spirit * (.5 + Math.sin(t * 2) * .1);
    bones.forEach((m, i) => { m.rotation.z = cur.spirit * Math.PI / 2 * (i % 3 === 0 ? 1 : 0); m.position.y = height(m.position.x, m.position.z) + .004 + cur.spirit * (i % 3 === 0 ? .008 : 0); });
    breath.forEach(p => {
      const q = (p.h + t * .1 * p.v * mv) % 1, a = p.a + q * 4;
      p.s.position.set(p.cx + Math.cos(a) * p.r * (1.6 - q), height(p.cx, p.cz) + .03 + q * .3, p.cz + Math.sin(a) * p.r * (1.6 - q));
      p.s.material.opacity = cur.spirit * Math.sin(q * Math.PI) * .9;
    });

    labels.forEach((L, i) => {
      proj.copy(L.p).project(camera);
      const vis = proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1;
      const op = vis && u < .02 ? Math.max(0, 1 - w * 2) : 0;
      L.el.style.opacity = op.toFixed(2);
      L.el.style.transform = `translate(${((proj.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - proj.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
    });

    renderer.render(scene, camera);
    if (renderMini) renderMini(t, dt);
  }

  /* ---------- Mapa 3D del final ---------- */
  let renderMini = null;
  (function initMini() {
    const wrap = document.getElementById('mapa3d-wrap'), cv = document.getElementById('mapa3d-final');
    if (!wrap || !cv) return;
    let r2;
    try { r2 = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'low-power' }); } catch (e) { return; }
    r2.setPixelRatio(Math.min(devicePixelRatio, 2));
    r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = THREE.ACESFilmicToneMapping; r2.toneMappingExposure = 1.1;
    const cam = new THREE.PerspectiveCamera(38, 1, .05, 200);
    const target = new THREE.Vector3(0, 0, 0);
    let az = 0, el = 1.0, dist = 26, visible = false, dragging = false, lastX = 0, idle = 0;
    const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; dist = w < 480 ? 30 : 27; r2.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(wrap);
    cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; wrap.classList.add('is-drag'); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!dragging) return; az -= (e.clientX - lastX) * .009; lastX = e.clientX; idle = 0; });
    const up = () => { dragging = false; wrap.classList.remove('is-drag'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const box = document.getElementById('mapa3d-labels');
    const tags = STATIONS.map((st, k) => {
      const a = document.createElement('a'); a.className = 'm3l'; a.href = '#etapa-' + (k + 1);
      a.setAttribute('aria-label', 'Etapa ' + st.rn + ': ' + st.name);
      a.innerHTML = '<span>' + (st.tag || st.rn) + '</span>'; box.appendChild(a); if (st.ov === false) a.style.display = 'none';
      return { a, p: stationPts[k].clone().add(new THREE.Vector3(0, (st.lift || 1.45) * .65, 0)) };
    });
    const pv = new THREE.Vector3();
    renderMini = (t, dt) => {
      if (!visible) return;
      idle += dt;
      if (!reduceMotion && !dragging && idle > 2.5) az += dt * .06;
      cam.position.set(target.x + Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
      cam.lookAt(target);
      const keepRange = tube.geometry.drawRange.count, keepFog = scene.fog.density;
      tube.geometry.setDrawRange(0, Infinity); scene.fog.density = .012;
      beamMat.opacity = .5; walker.visible = false; walkerLight.visible = false;
      r2.render(scene, cam);
      tube.geometry.setDrawRange(0, keepRange); scene.fog.density = keepFog; walker.visible = true; walkerLight.visible = true;
      const W = wrap.clientWidth, H = wrap.clientHeight;
      tags.forEach(tg => {
        pv.copy(tg.p).project(cam);
        const vis = pv.z < 1 && Math.abs(pv.x) < 1 && Math.abs(pv.y) < 1;
        tg.a.style.opacity = vis ? 1 : 0; tg.a.tabIndex = vis ? 0 : -1;
        tg.a.style.transform = `translate(${((pv.x + 1) / 2 * W).toFixed(1)}px,${((1 - pv.y) / 2 * H).toFixed(1)}px)`;
      });
    };
  })();

  loop();
  requestAnimationFrame(() => stageEl.classList.add('is-ready'));
}
