// Shared parts for MomentumClear: constants, chart boards, arrows that point anywhere, the momentum
// bar chart, and the models the chapters use (lab carts, people, a car, a motorcycle, a lorry, a
// skater). Scenes are built in metres unless a chapter says otherwise: +x forward, +y up.
// Boards, arrows, carts and vehicles follow InertiaClear and MotionClear (same kit, same author).
import { THREE, M, box, beam, sphere, torus, arrow, spring, canvasTexture, clamp, lerp, smooth, approach } from './kit.js';

// ---------------------------------------------------------------- constants
export const G = 9.81;                 // m/s², standard gravity (9.80665 exactly, by the 1901 CGPM)
export const G_MOON = 1.62;            // m/s², the Moon's surface gravity (NASA Moon fact sheet)
export const C = 299792458;            // m/s, the speed of light (exact since the 1983 metre)
export const RHO_AIR = 1.2;            // kg/m³, air at about 20 °C at sea level
export const KMH = 3.6;                // 1 m/s = 3.6 km/h (3,600 s in an hour ÷ 1,000 m in a km)
export const TAU = Math.PI * 2;

export const D2R = Math.PI / 180;

// ---------------------------------------------------------------- formatting
export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
export const sgn = (v, d = 1) => (v < -0.5 * 10 ** -d ? '−' + fmt(-v, d) : fmt(Math.abs(v), d));
export const kmh = (ms, d = 0) => fmt(ms * KMH, d);
export const fmtS = (m) => (Math.abs(m) >= 1000 ? (m / 1000).toFixed(2) + ' km' : Math.abs(m) >= 100 ? m.toFixed(0) + ' m' : m.toFixed(1) + ' m');
// Nice round ticks from lo to hi.
export function ticks(lo, hi, n = 5) {
  const span = Math.max(1e-9, hi - lo), raw = span / n, p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= raw) || 10 * p;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return { list: out, lo: Math.min(lo, out[0]), hi: Math.max(hi, out[out.length - 1]), step };
}

// ---------------------------------------------------------------- boards
export const COL = { s: '#8ef0ff', v: '#7be08c', a: '#ffb547', area: 'rgba(123,224,140,.25)', neg: 'rgba(255,122,89,.28)', warn: '#ff7a59', soft: '#c49bff', dim: 'rgba(255,255,255,.45)' };
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
// Axes with a grid. Returns X(x) and Y(y) for the plot area.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '' }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  if (yMin < 0 && yMax > 0) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function title(g, text, sub = '', x = 20) {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, x, 34);
  if (sub) { g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 58); }
}
// A polyline of [x, y] data points in chart coordinates.
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
// Shade between a curve of [x, y] points and y = 0, green above the axis and red below.
export function area(g, pts, X, Y, pos = COL.area, neg = COL.neg) {
  for (let i = 1; i < pts.length; i++) {
    const [xa, ya] = pts[i - 1], [xb, yb] = pts[i];
    g.fillStyle = (ya + yb) / 2 >= 0 ? pos : neg;
    g.beginPath(); g.moveTo(X(xa), Y(0)); g.lineTo(X(xa), Y(ya)); g.lineTo(X(xb), Y(yb)); g.lineTo(X(xb), Y(0)); g.closePath(); g.fill();
  }
}
export function tag(g, text, x, y, col, font = 'bold 19px sans-serif', w = null) {
  g.font = font; g.fillStyle = col;
  const tw = g.measureText(text).width;
  g.fillText(text, w ? Math.min(x, w - tw - 12) : x, y);
}

// ---------------------------------------------------------------- stage helpers
// True while the Glassbox studio records the reel: scenes then choose their own camera views.
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.y, s: b.mesh.scale.x };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.y = 0; }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(b.home.s); b.mesh.rotation.y = b.home.r; }
  });
}
// Switch the camera when a chapter's "Look at" choice changes (not while the reel is recording).
export function focusView(stage, st, focus, views) {
  if (focus === st.focus) return false;
  if (st.focus !== undefined && !inReel()) stage.setView(views[focus].pos, views[focus].target, 1.0);
  st.focus = focus;
  return true;
}

// ---------------------------------------------------------------- arrows
// A kit arrow that can point any way: aim(from, dir, len). dir is a unit-ish [x, y, z].
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
export function force(color, r = 0.05, head = 0.3) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}


// ---------------------------------------------------------------- simple models
// A person standing with feet at the origin, facing +x. pose({ arm, lean, stride }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, TAU, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.22 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); return l; });
  body.position.y = hipY;
  g.pose = ({ arm = 0, lean = 0, stride = 0, sit = 0 } = {}) => {
    arms[0].rotation.z = arm - stride * 0.8; arms[1].rotation.z = arm + stride * 0.8;
    body.rotation.z = -lean;
    legs[0].rotation.z = stride + sit; legs[1].rotation.z = -stride + sit;
  };
  return g;
}

// A family hatchback, 4.2 m long, from an extruded side profile. low > 0 squashes it into a
// sleeker car. roll(dx) turns the wheels for dx metres of travel.
export function makeCar(color = 0xd8332f, { low = 0 } = {}) {
  const g = new THREE.Group();
  const prof = low
    ? [[-2.3, 0.3], [2.3, 0.3], [2.36, 0.56], [2.2, 0.72], [1.0, 0.86], [0.2, 1.24], [-1.2, 1.26], [-2.1, 0.98], [-2.34, 0.8]]
    : [[-2.1, 0.3], [2.08, 0.3], [2.12, 0.62], [2.02, 0.82], [1.1, 0.96], [0.35, 1.42], [-1.35, 1.44], [-2.0, 1.05], [-2.12, 0.85]];
  const sh = new THREE.Shape(); prof.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const W = low ? 1.9 : 1.72;
  const geo = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -W / 2);
  const paint = M.plastic(color, { roughness: 0.3, metalness: 0.3 });
  const shell = new THREE.Mesh(geo, paint); shell.castShadow = true; g.add(shell);
  const glass = M.plastic(0x0e1420, { roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const side = low ? [[0.95, 0.9], [0.25, 1.19], [-1.12, 1.2], [-1.9, 0.96]] : [[1.02, 1.0], [0.4, 1.36], [-1.28, 1.38], [-1.85, 1.04]];
  const gs = new THREE.Shape(); side.forEach(([x, y], i) => (i ? gs.lineTo(x, y) : gs.moveTo(x, y))); gs.closePath();
  for (const z of [-1, 1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(gs), glass); w.position.z = z * (W / 2 + 0.07); g.add(w); }
  const wheels = [], xs = low ? [-1.45, 1.45] : [-1.3, 1.32];
  for (const x of xs) for (const z of [-1, 1]) {
    const t = torus(0.24, 0.085, M.matte(0x16181d), 32); t.position.set(x, 0.32, z * (W / 2 - 0.05)); g.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), M.metal(0xb7bfcc)); rim.rotation.x = Math.PI / 2; t.add(rim);
    const spoke = box(0.36, 0.05, 0.13, M.metal(0x8c95a3)); t.add(spoke);
    wheels.push(t);
  }
  const front = low ? 2.34 : 2.1, back = low ? -2.36 : -2.14;
  const lamp = box(0.04, 0.1, 0.34, M.glow(0xfff2c8)); for (const z of [-0.6, 0.6]) { const l = lamp.clone(); l.position.set(front, low ? 0.6 : 0.74, z); g.add(l); }
  const tail = box(0.04, 0.12, 0.3, M.glow(0xff3b30)); for (const z of [-0.62, 0.62]) { const l = tail.clone(); l.position.set(back, low ? 0.84 : 0.92, z); g.add(l); }
  g.paint = paint; g.W = W;
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.33; });
  return g;
}

// A lab trolley, 0.5 m long (deck at 0.16 m). setLoad(kg) stacks 1 kg brass blocks on it, up to 8;
// the trolley itself is 1 kg, like a school dynamics trolley. roll(dx) turns the wheels for dx metres of travel.
export const CART_KG = 1;
export function makeCart(color = 0x3b82f6) {
  const g = new THREE.Group();
  const body = box(0.5, 0.08, 0.26, M.plastic(color, { roughness: 0.35 })); body.position.y = 0.12; g.add(body);
  const deck = box(0.46, 0.012, 0.22, M.matte(0x1d222b)); deck.position.y = 0.166; g.add(deck);
  const wheels = [];
  for (const x of [-0.17, 0.17]) for (const z of [-0.14, 0.14]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 24), M.matte(0x1b1d22)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.05, z); w.castShadow = true; g.add(w);
    const hub = box(0.07, 0.012, 0.03, M.metal(0xc9ced8)); hub.position.set(x, 0.05, z * 1.1); g.add(hub);
    wheels.push([w, hub]);
  }
  const brass = M.metal(0xc9a24a, { roughness: 0.35 });
  const blocks = [];
  for (let i = 0; i < 8; i++) { const b = box(0.2, 0.05, 0.1, brass); b.position.set(i % 2 ? 0.105 : -0.105, 0.198 + Math.floor(i / 2) * 0.052, 0); b.visible = false; g.add(b); blocks.push(b); }
  g.setLoad = (kg) => blocks.forEach((b, i) => { b.visible = i < Math.round(kg); });
  g.roll = (dx) => wheels.forEach(([w, h]) => { h.rotation.z -= dx / 0.05; });
  return g;
}

// A small flatbed lorry, 7 m long, facing +x, bed at 1.2 m. roll(dx) turns its wheels.
export function makeLorry(color = 0x2f6fd8) {
  const g = new THREE.Group(), paint = M.plastic(color, { roughness: 0.35 }), dark = M.matte(0x16181d), steel = M.metal(0x8c95a3, { roughness: 0.4 });
  const cab = box(1.8, 2.0, 2.2, paint); cab.position.set(2.5, 1.7, 0); g.add(cab);
  const ws = box(0.05, 0.8, 2.0, M.plastic(0x0e1420, { roughness: 0.1 })); ws.position.set(3.42, 2.2, 0); g.add(ws);
  const chassis = box(6.6, 0.3, 1.0, dark); chassis.position.set(0.1, 0.85, 0); g.add(chassis);
  const bed = box(4.8, 0.14, 2.3, steel); bed.position.set(-0.9, 1.13, 0); g.add(bed);
  const head = box(0.1, 1.2, 2.3, steel); head.position.set(1.5, 1.8, 0); g.add(head);
  const wheels = [];
  for (const x of [-2.2, 2.4]) for (const z of [-1, 1]) { const t = torus(0.34, 0.14, dark, 28); t.position.set(x, 0.48, z * 0.98); g.add(t); wheels.push(t); }
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.48; });
  g.bedY = 1.2;
  return g;
}

// A 150 cc commuter motorcycle, about 2 m long, facing +x, as in MotionClear. The rider is a
// separate group hinged at the hips (rider.rotation.z < 0 pitches the body forward).
export function makeMoto(color = 0x2f6fd8) {
  const g = new THREE.Group();
  const paint = M.plastic(color, { roughness: 0.3, metalness: 0.25 }), frame = M.metal(0x2a2e37, { roughness: 0.45 }), steel = M.metal(0xc9ced8), black = M.matte(0x16181d);
  const wheels = [];
  for (const x of [-0.66, 0.66]) {
    const w = new THREE.Group(); w.position.set(x, 0.3, 0); g.add(w);
    w.add(torus(0.25, 0.05, black, 36));
    for (let i = 0; i < 5; i++) { const sp = box(0.4, 0.03, 0.02, M.metal(0x8c95a3)); sp.rotation.z = (i / 5) * Math.PI; w.add(sp); }
    wheels.push(w);
  }
  g.add(beam([0.62, 0.3, 0], [0.42, 0.95, 0], 0.025, steel));
  g.add(beam([-0.66, 0.3, 0], [-0.05, 0.42, 0], 0.025, frame));
  g.add(beam([0.38, 0.9, 0], [-0.55, 0.78, 0], 0.03, frame));
  g.add(beam([0.3, 1.08, -0.36], [0.3, 1.08, 0.36], 0.015, steel));
  const tank = sphere(0.22, paint, 24); tank.scale.set(1.25, 0.6, 0.8); tank.position.set(0.12, 0.88, 0); g.add(tank);
  const seat = box(0.62, 0.08, 0.26, M.matte(0x1b1d22)); seat.position.set(-0.36, 0.84, 0); g.add(seat);
  const eng = box(0.34, 0.3, 0.22, M.metal(0x8c95a3, { roughness: 0.4 })); eng.position.set(0.02, 0.48, 0); g.add(eng);
  const lampM = sphere(0.09, M.glow(0xfff2c8), 16); lampM.position.set(0.5, 0.98, 0); g.add(lampM);
  const jacket = M.matte(0x3a3f4b), jeans = M.matte(0x2b3242);
  for (const z of [-1, 1]) { g.add(beam([-0.36, 0.94, z * 0.12], [0.05, 0.78, z * 0.18], 0.065, jeans)); g.add(beam([0.05, 0.78, z * 0.18], [-0.1, 0.4, z * 0.2], 0.055, jeans)); }
  const rider = new THREE.Group(); rider.position.set(-0.36, 0.94, 0); g.add(rider);
  const torso = beam([0, 0, 0], [0.2, 0.5, 0], 0.14, jacket, 16); torso.scale.z = 1.2; rider.add(torso);
  const helmet = sphere(0.14, M.plastic(0xf2f4f7, { roughness: 0.2 }), 24); helmet.position.set(0.24, 0.68, 0); rider.add(helmet);
  const arms = [];
  for (const z of [-1, 1]) { const a = beam([0.16, 0.42, z * 0.2], [0.64, 0.16, z * 0.33], 0.05, jacket); rider.add(a); arms.push(a); }
  g.rider = rider;
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.3; });
  return g;
}

// A figure skater standing on one skate, spinning about the vertical (y) axis. setArms(k): k = 0
// arms tucked across the chest, k = 1 arms straight out sideways. Drawn at life size (1.6 m).
export function makeSkater({ dress = 0xc49bff, skin = 0xc68b64 } = {}) {
  const g = new THREE.Group(), sk = M.matte(skin), cloth = M.plastic(dress, { roughness: 0.4 });
  const leg = beam([0, 0.05, 0], [0, 0.9, 0], 0.06, sk); g.add(leg);
  const blade = box(0.3, 0.02, 0.02, M.metal(0xe6e9ee)); blade.position.y = 0.01; g.add(blade);
  const boot = box(0.24, 0.14, 0.09, M.plastic(0xf2f4f7)); boot.position.set(0.02, 0.1, 0); g.add(boot);
  const free = beam([0, 0.88, 0.1], [-0.08, 0.5, 0.12], 0.06, sk); g.add(free);
  const free2 = beam([-0.08, 0.5, 0.12], [0, 0.18, 0.06], 0.05, sk); g.add(free2);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 24, 1, true), cloth); skirt.position.y = 0.95; skirt.material.side = THREE.DoubleSide; g.add(skirt);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 6, 14), cloth); torso.position.y = 1.25; torso.scale.x = 0.8; torso.castShadow = true; g.add(torso);
  const head = sphere(0.1, sk, 24); head.position.y = 1.6; g.add(head);
  const bun = sphere(0.07, M.matte(0x1b1410), 16); bun.position.set(-0.07, 1.66, 0); g.add(bun);
  const arms = [-1, 1].map((z) => {
    const p = new THREE.Group(); p.position.set(0, 1.42, z * 0.17); g.add(p);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.54, 4, 10), sk); upper.position.y = -0.31; upper.castShadow = true; p.add(upper);
    const hand = sphere(0.045, sk, 12); hand.position.y = -0.64; p.add(hand);
    p.userData.z = z; return p;
  });
  g.setArms = (k) => arms.forEach((p) => {
    const z = p.userData.z;
    // Out: straight sideways (rotate about x by ±90°). In: folded forward across the chest.
    p.rotation.set(z * lerp(0.6, -Math.PI / 2, k), 0, lerp(1.35, 0, k));
  });
  g.setArms(1);
  return g;
}

// ---------------------------------------------------------------- physics
// A head-on collision along one line. e is the coefficient of restitution: 1 = elastic (they bounce
// apart as fast as they came together), 0 = sticky (they move off together). Momentum is kept for
// any e; kinetic energy only for e = 1. Standard result, e.g. any first-year mechanics text.
export function collide1D(m1, u1, m2, u2, e) {
  const P = m1 * u1 + m2 * u2, M_ = m1 + m2;
  return [(P + m2 * e * (u2 - u1)) / M_, (P + m1 * e * (u1 - u2)) / M_];
}
export const ke = (m, v) => 0.5 * m * v * v;
// A crash pulse modelled as a half-sine of duration dt carrying impulse J: F(t) = Fpk sin(π t ÷ dt),
// so J = 2 Fpk dt ÷ π and the peak is π/2 times the average force J ÷ dt.
export const PEAK = Math.PI / 2;
// Stopping time when something slows steadily from v to 0 over distance d: dt = 2 d ÷ v.
export const stopTime = (v, d) => (2 * d) / Math.max(1e-6, v);

// ---------------------------------------------------------------- more boards
// Signed bars around a zero line: groups = [{ name, bars: [{ v, col, label }] }].
export function bars(g, { x0, x1, y0, y1, max, groups, unit = '', dp = 1, zeroMid = true }) {
  const mid = zeroMid ? (y0 + y1) / 2 : y0, span = zeroMid ? (y0 - y1) / 2 : y0 - y1;
  const Y = (v) => mid - (v / max) * span;
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, mid); g.lineTo(x1, mid); g.stroke();
  const n = groups.reduce((a, gr) => a + gr.bars.length, 0) + (groups.length - 1) * 0.8;
  const bw = (x1 - x0) / n;
  let x = x0;
  groups.forEach((gr, gi) => {
    const gx = x;
    gr.bars.forEach((b) => {
      const v = Math.max(-max * 1.05, Math.min(max * 1.05, b.v));
      g.fillStyle = b.col; g.globalAlpha = b.dim ? 0.35 : 1;
      const top = Math.min(Y(v), mid), hh = Math.abs(Y(v) - mid);
      g.fillRect(x + bw * 0.12, top, bw * 0.76, Math.max(2, hh));
      g.globalAlpha = 1;
      g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8';
      const s = sgn(b.v, dp), tw = g.measureText(s).width;
      g.fillText(s, x + bw / 2 - tw / 2, b.v >= 0 ? top - 8 : top + hh + 22);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)';
      const lw = g.measureText(b.label).width;
      g.fillText(b.label, x + bw / 2 - lw / 2, zeroMid ? (b.v >= 0 ? mid + 22 : mid - 10) : mid + 22);
      x += bw;
    });
    g.font = 'bold 18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
    const nw = g.measureText(gr.name).width;
    if (gr.name) g.fillText(gr.name, (gx + x) / 2 - nw / 2, y0 + 30);
    if (gi < groups.length - 1) { x += bw * 0.8; g.strokeStyle = 'rgba(255,255,255,.15)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x - bw * 0.4, y0); g.lineTo(x - bw * 0.4, y1); g.stroke(); g.setLineDash([]); }
  });
  if (unit) { g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText(unit, x0, y0 + 4); }
}
// Force-time pulses: list = [{ dt, J, col, name, on }]. Each is a half-sine; equal J means equal area.
export function pulses(g, w, h, list, { yTop = 84, yBot = h - 70, tMax, fMax, fFmt, tFmt }) {
  const tx = ticks(0, tMax, 4), fy = ticks(0, fMax, 4);
  const A = axes(g, w, h, { x0: 110, y0: yBot, y1: yTop, xMax: tx.hi, yMax: fy.hi, xTicks: tx.list, yTicks: fy.list, xFmt: tFmt, yFmt: fFmt, xLabel: 'time →' });
  list.forEach((p) => {
    const pk = (PEAK * p.J) / p.dt, pts = [];
    for (let k = 0; k <= 80; k++) { const t = (k / 80) * p.dt; pts.push([t, pk * Math.sin((Math.PI * t) / p.dt)]); }
    pts.push([tx.hi, 0]);
    if (p.on) { g.fillStyle = 'rgba(255,181,71,.22)'; g.beginPath(); g.moveTo(A.X(0), A.Y(0)); pts.forEach(([x, y]) => g.lineTo(A.X(x), A.Y(Math.min(y, fy.hi)))); g.closePath(); g.fill(); }
    line(g, pts.map(([x, y]) => [x, Math.min(y, fy.hi)]), A.X, A.Y, p.col, p.on ? 5 : 2.5, p.on ? null : [8, 6]);
    if (p.name) { const x = A.X(Math.min(p.dt * 0.5, tx.hi * 0.8)); tag(g, p.name, Math.min(x + 6, w - 170), Math.max(yTop + 20, A.Y(Math.min(pk, fy.hi)) - 10), p.col, (p.on ? 'bold ' : '') + '17px sans-serif'); }
  });
  return A;
}

// ---------------------------------------------------------------- more models
// A small cylinder standing on its end (coins, pucks, test masses).
export function disc(r, h, mat, seg = 40) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; }

// A plain road that scrolls under a vehicle standing still on screen.
export function makeStrip(len = 80) {
  const g = new THREE.Group();
  const road = box(len, 0.06, 7, M.matte(0x2b2f36)); road.position.y = -0.03; g.add(road);
  const dashes = new THREE.Group(); g.add(dashes);
  for (let x = -len / 2; x < len / 2; x += 6) { const d = box(3, 0.01, 0.16, M.matte(0xe8e2c8)); d.position.set(x, 0.005, 0); dashes.add(d); }
  g.scroll = (x) => { dashes.position.x = -(((x % 6) + 6) % 6); };
  return g;
}

// A muzzle-loading field cannon on a two-wheeled carriage, barrel along +x, about 2.4 m long.
export function makeCannon() {
  const g = new THREE.Group(), bronze = M.metal(0x9c7a3c, { roughness: 0.35 }), wood = M.matte(0x6b4a2e), iron = M.metal(0x3a3f4b, { roughness: 0.5 });
  const barrel = new THREE.Group(); barrel.position.set(0, 1.05, 0); barrel.rotation.z = 0.06; g.add(barrel);
  const prof = [[-0.75, 0], [-0.75, 0.16], [-0.6, 0.2], [0.2, 0.16], [1.3, 0.12], [1.36, 0.14], [1.4, 0.14], [1.4, 0.06], [-0.4, 0.06]];
  const pts = prof.map(([x, r]) => new THREE.Vector2(r, x));
  const lg = new THREE.LatheGeometry(pts, 32); lg.rotateZ(-Math.PI / 2);
  const b = new THREE.Mesh(lg, bronze); b.castShadow = true; barrel.add(b);
  const knob = sphere(0.07, bronze, 16); knob.position.x = -0.82; barrel.add(knob);
  const trail = box(2.2, 0.16, 0.36, wood); trail.position.set(-0.6, 0.55, 0); trail.rotation.z = 0.36; g.add(trail);
  const wheels = [];
  for (const z of [-0.38, 0.38]) {
    const w = new THREE.Group(); w.position.set(0, 0.7, z); g.add(w);
    w.add(torus(0.66, 0.05, wood, 40));
    for (let i = 0; i < 6; i++) { const sp = box(1.3, 0.05, 0.04, wood); sp.rotation.z = (i / 6) * Math.PI; w.add(sp); }
    wheels.push(w);
  }
  g.add(beam([0, 0.7, -0.45], [0, 0.7, 0.45], 0.05, iron));
  g.barrel = barrel; g.muzzle = [1.45, 1.13, 0];
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.7; });
  return g;
}

// A small rowing boat (about 3 m), bow along +x, floating with its gunwale 0.35 m above the water.
export function makeBoat(color = 0xd8332f) {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); [[-1.5, 0.45], [-1.45, -0.05], [-1.0, -0.25], [1.0, -0.25], [1.6, 0.05], [1.75, 0.5]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.08, bevelSegments: 2 }), M.plastic(color, { roughness: 0.4 }));
  hull.position.z = -0.55; hull.castShadow = true; g.add(hull);
  const inside = box(2.8, 0.05, 1.0, M.matte(0x8a5a3a)); inside.position.set(0.1, 0.4, 0); g.add(inside);
  const seat = box(0.3, 0.05, 1.1, M.matte(0x6b4a2e)); seat.position.set(-0.2, 0.55, 0); g.add(seat);
  return g;
}

// A slim two-stage-style rocket, nose along +x, 3 m long. flame(k) sets the exhaust plume 0–1.
export function makeRocket() {
  const g = new THREE.Group(), white = M.plastic(0xf2f4f7, { roughness: 0.35 }), dark = M.matte(0x22262e), red = M.plastic(0xd8332f);
  const body = latheXLocal([[-1.4, 0.24], [0.9, 0.24], [1.6, 0]], white); g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.12, 32), dark); band.rotation.z = Math.PI / 2; band.position.x = 0.3; g.add(band);
  const nozzle = latheXLocal([[-1.75, 0.2], [-1.4, 0.1]], M.metal(0x6b7280)); g.add(nozzle);
  for (let i = 0; i < 4; i++) { const f = box(0.5, 0.02, 0.28, red); const p = new THREE.Group(); p.rotation.x = (i / 4) * Math.PI * 2; f.position.set(-1.15, 0, 0.36); p.add(f); g.add(p); }
  const plume = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.85, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
  plume.rotation.z = Math.PI / 2; plume.position.x = -2.55; g.add(plume);
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.9, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.95, toneMapped: false, depthWrite: false }));
  core.rotation.z = Math.PI / 2; core.position.x = -2.2; g.add(core);
  g.flame = (k, t = 0) => { plume.visible = core.visible = k > 0.01; const f = k * (1 + 0.08 * Math.sin(t * 40)); plume.scale.set(1, Math.max(0.01, f), 1); plume.position.x = -1.75 - 0.8 * f; core.scale.set(1, Math.max(0.01, f), 1); core.position.x = -1.75 - 0.45 * f; };
  g.flame(0);
  return g;
}
function latheXLocal(profile, mat) {
  const geo = new THREE.LatheGeometry(profile.map(([x, r]) => new THREE.Vector2(Math.max(0, r), x)), 40);
  geo.rotateZ(-Math.PI / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}

// A 1,200 mm ceiling fan hanging from a downrod, hub at the origin. spin(a) turns the blades.
export function makeCeilingFan(color = 0xe9e4d8) {
  const g = new THREE.Group(), body = M.plastic(color, { roughness: 0.35 }), blade = M.plastic(0x8a5a3a, { roughness: 0.5 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), M.metal(0xc9ced8)); rod.position.y = 0.3; g.add(rod);
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.08, 24), body); canopy.position.y = 0.56; g.add(canopy);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.14, 32), body); motor.castShadow = true; g.add(motor);
  const rotor = new THREE.Group(); g.add(rotor);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group(); arm.rotation.y = (i / 3) * Math.PI * 2; rotor.add(arm);
    const b = box(0.46, 0.012, 0.12, blade); b.position.set(0.36, -0.02, 0); b.rotation.x = 0.2; arm.add(b);
    const tip = box(0.1, 0.01, 0.1, blade); tip.position.set(0.58, -0.02, 0); tip.rotation.x = 0.2; arm.add(tip);
  }
  // Blades reach about 0.6 m: the 1,200 mm sweep.
  rotor.scale.set(1, 1, 1);
  g.spin = (a) => { rotor.rotation.y = a; };
  return g;
}

export { clamp, lerp, smooth, approach, THREE, M, box, beam, sphere, torus, spring, canvasTexture };
