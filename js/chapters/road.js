// Chapter 2: collisions on the road, and impulse = F × Δt.
// Crash: two vehicles meet head-on and lock together (real crashes are close to perfectly inelastic).
//   Masses: a 150 cc commuter motorcycle, about 140 kg, with a 70 kg rider; a family hatchback,
//   about 1,050 kg kerb plus two people, 1,200 kg; a loaded two-axle lorry, 16 t (a typical Indian
//   16-tonne gross vehicle weight class). Momentum decides the shared speed afterwards; each vehicle's
//   change of velocity Δv is what hurts the people inside. The crash pulse lasts about 0.1 s for cars
//   (frontal crash pulses are typically 70–120 ms, e.g. NHTSA NCAP barrier tests), used for both.
//   After the impact the wreck skids to a stop at μ g with μ ≈ 0.7 (dry tarmac, locked or dragging).
// Seat belt: the cabin stops over its crush depth c (about 0.6 m with a crumple zone, as Barényi's
//   design intends at 50–60 km/h; about 0.15 m for a stiff old frame). A belted occupant rides down
//   with the cabin and moves 0.3 m more on the stretching belt and airbag: stopping distance c + 0.3.
//   Unbelted, they fly on until they hit the wheel or dash and stop in about 5 cm. Stopping time
//   Δt = 2 d ÷ v (steady deceleration). Impulse J = m v, average force J ÷ Δt, and for a half-sine
//   crash pulse the peak is π/2 times the average. Round illustrative figures, not a crash test.
// Helmet: a 5 kg head dropped on a flat steel anvil, as in the ECE 22.05 helmet test (7.5 m/s, pass
//   mark 275 g peak; FMVSS 218 allows 400 g). A helmet's 30 mm EPS foam liner crushes about 3 cm;
//   a bare head stops in about 6 mm of scalp and skull (illustrative).
// Catch: a cricket ball is 156–163 g (MCC Law 4), say 0.16 kg. Stiff hands stop it in about 1 cm;
//   giving with the hands draws that out to 30–50 cm. (Stiff hands: about 2 cm of palm and finger.) Same impulse, much smaller force.
import { THREE, M, box, beam } from '../kit.js';
import {
  G, KMH, board, panelBg, title, bars, pulses, tag, COL, fitNarrow, inReel, focusView, force, makeCar, makeMoto, makeLorry,
  makePerson, makeStrip, sphere, disc, fmt, sgn, PEAK, stopTime,
} from '../momentum.js';

const BX = 60, HX = 120, CX = 180;               // belt, helmet and catch scenes along X
const DT_CRASH = 0.1, MU_SKID = 0.7, SLOW_CRASH = 5;
const VEH = {
  moto: { name: 'Motorcycle', m: 210, front: 0.92 },
  car: { name: 'Car', m: 1200, front: 2.16 },
  truck: { name: 'Lorry', m: 16000, front: 3.45 },
};
const M_OCC = 75, GAP = 0.55, DASH = 0.05, STRETCH = 0.3, SLOW_BELT = 15;
const M_HEAD = 5, D_BARE = 0.006, D_HELMET = 0.03, ECE = 275;
const M_BALL = 0.16;
const VIEWS = {
  crash: { pos: [0, 6.2, 19], target: [0, 3.0, 0] },
  belt: { pos: [BX - 1.2, 2.2, 7.6], target: [BX - 1.2, 1.25, 0] },
  helmet: { pos: [HX + 0.45, 1.2, 3.0], target: [HX + 0.45, 0.75, 0] },
  catch: { pos: [CX + 0.7, 1.7, 4.4], target: [CX + 0.7, 1.25, 0] },
};
const REEL = {
  crash: { pos: [0, 4.2, 14], target: [0, 3.4, 0] },
  helmet: { pos: [HX, 1.05, 2.6], target: [HX, 1.0, 0] },
};

// The crash: shared speed after, and each side's Δv and g. uL rightwards, uR leftwards (m/s).
export function crash(L, R, uL, uR) {
  const mL = VEH[L].m, mR = VEH[R].m, v = (mL * uL - mR * uR) / (mL + mR);
  const dL = v - uL, dR = v + uR;                      // change of velocity, + is rightwards
  const F = (mL * Math.abs(dL)) / DT_CRASH;
  return { mL, mR, v, dL, dR, F, gL: Math.abs(dL) / DT_CRASH / G, gR: Math.abs(dR) / DT_CRASH / G };
}
// Stopping a mass m from v over distance d.
export const stopper = (m, v, d) => { const dt = stopTime(v, d), J = m * v, avg = J / dt; return { dt, J, avg, peak: PEAK * avg, g: (PEAK * avg) / (m * G) }; };
const beltD = (crumple, belt) => (belt ? (crumple ? 0.6 : 0.15) + STRETCH : DASH);

export default {
  id: 'road',
  short: 'Crashes and catches',
  title: 'Crashes, crumple zones and catches',
  subtitle: 'Momentum sets who moves where after a crash. Stretching the stop sets how much it hurts.',
  view: VIEWS.crash,
  learn: `<p>When a car meets a lorry head-on, they lock together and move off with the <b>total momentum</b> they had before. A 16 t lorry at 40 km/h has thirteen times the momentum of a 1.2 t car at 40 km/h, so the wreck keeps going the lorry's way. The car's <b>change in velocity</b>, Δv, is huge; the lorry's is tiny. Δv is what hurts the people inside (see CarClear, MotorcycleClear and CycleClear).</p>
    <p>To stop anything you must take away all its momentum. The push needed is the <b>impulse</b>: <b>force × time = change in momentum</b>, F × Δt = Δp. The Δp is fixed by the speed. The only thing you can choose is <b>Δt</b>. Stretch the stop over ten times longer and the force drops ten times.</p>
    <p>That is the whole idea behind a <b>crumple zone</b> (the car's nose folds up slowly), a <b>seat belt</b> that stretches, an <b>airbag</b>, and the thick foam in a <b>helmet</b>. It is also why a fielder <b>gives with the hands</b> when catching a cricket ball: pulling the hands back 40 cm instead of 2 cm makes the stop 20 times longer.</p>
    <p class="tip"><b>Try it:</b> crash a motorcycle into a lorry and compare the two Δv's. Then switch off the crumple zone and the belt, drop a head with and without a helmet, and catch a ball with stiff and soft hands. Watch the force peak on the board: the area under the curve never changes.</p>`,
  terms: [
    { t: 'Impulse', d: 'Force × time, F Δt, in newton seconds (N·s). It equals the change in momentum.' },
    { t: 'Δv (delta-v)', d: 'The change in velocity in a crash. Doctors and crash engineers use it to judge how bad a crash was.' },
    { t: 'Crumple zone', d: 'The front and back of a car, built to fold up in a crash so the stop takes longer.' },
    { t: 'g-force', d: 'Acceleration measured in multiples of gravity, 9.81 m/s². 1 g is sitting still.' },
    { t: 'Peak force', d: 'The highest force during a collision. It is what breaks bones, so safety kit aims to lower it.' },
  ],
  defaults: { focus: 'crash', L: 'car', R: 'truck', uL: 40, uR: 40, speed: 50, crumple: true, belt: true, drop: 7.5, helmet: true, ball: 30, give: 40 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'crash', label: 'Crash' }, { v: 'belt', label: 'Seat belt' }, { v: 'helmet', label: 'Helmet' }, { v: 'catch', label: 'Catch' }] },
    { key: 'L', type: 'seg', label: 'Crash: from the left', options: [{ v: 'moto', label: 'Motorcycle' }, { v: 'car', label: 'Car' }, { v: 'truck', label: 'Lorry' }] },
    { key: 'uL', type: 'range', label: 'Crash: its speed', min: 0, max: 80, step: 5, ends: ['parked', '80 km/h'], fmt: (v) => `${fmt(v, 0)} km/h` },
    { key: 'R', type: 'seg', label: 'Crash: from the right', options: [{ v: 'moto', label: 'Motorcycle' }, { v: 'car', label: 'Car' }, { v: 'truck', label: 'Lorry' }] },
    { key: 'uR', type: 'range', label: 'Crash: its speed', min: 0, max: 80, step: 5, ends: ['parked', '80 km/h'], fmt: (v) => `${fmt(v, 0)} km/h` },
    { key: 'speed', type: 'range', label: 'Seat belt: crash speed', min: 20, max: 80, step: 5, ends: ['20 km/h', '80 km/h'], fmt: (v) => `${fmt(v, 0)} km/h` },
    { key: 'crumple', type: 'toggle', label: 'Seat belt: crumple zone' },
    { key: 'belt', type: 'toggle', label: 'Seat belt: belt and airbag' },
    { key: 'drop', type: 'range', label: 'Helmet: impact speed', min: 3, max: 9, step: 0.5, ends: ['3 m/s', '9 m/s'], fmt: (v) => `${fmt(v)} m/s (${fmt(v * KMH, 0)} km/h)` },
    { key: 'helmet', type: 'toggle', label: 'Helmet: wear it' },
    { key: 'ball', type: 'range', label: 'Catch: ball speed', min: 15, max: 40, step: 1, ends: ['lob', 'rocket'], fmt: (v) => `${fmt(v, 0)} m/s (${fmt(v * KMH, 0)} km/h)` },
    { key: 'give', type: 'range', label: 'Catch: how far your hands give', min: 2, max: 50, step: 1, ends: ['stiff', 'soft'], fmt: (v) => `${fmt(v, 0)} cm` },
    { key: 'go', type: 'buttons', label: 'Run', items: [{ label: '▶ Again', act: (s, inst) => inst.go() }] },
  ],
  onChange(s, key) {
    if (['L', 'R', 'uL', 'uR'].includes(key)) s.focus = 'crash';
    if (['speed', 'crumple', 'belt'].includes(key)) s.focus = 'belt';
    if (['drop', 'helmet'].includes(key)) s.focus = 'helmet';
    if (['ball', 'give'].includes(key)) s.focus = 'catch';
  },
  quiz: [
    { q: 'A car and a heavy lorry crash head-on at the same speed. Which one’s occupants get the bigger Δv?', options: ['The lorry’s', 'The car’s', 'Both the same', 'Neither: momentum cancels'], answer: 1, why: 'The pair moves off with the lorry’s much bigger momentum. The lorry barely slows; the car is flung backwards, so its Δv is far larger.' },
    { q: 'An airbag doesn’t change how much momentum your head loses in a crash. What does it change?', options: ['Your mass', 'The time taken to stop, so the force is lower', 'The crash speed', 'The direction of momentum'], answer: 1, why: 'Impulse F × Δt = Δp. With Δp fixed, a longer Δt means a smaller force.' },
    { q: 'A fielder lets her hands travel back 40 cm instead of 2 cm while catching. Roughly how much smaller is the average force?', options: ['The same', '2 times', '20 times', '400 times'], answer: 2, why: 'For a steady stop, Δt = 2d ÷ v. Twenty times the distance gives twenty times the time, so a twentieth of the force.' },
  ],
  reel: [
    { ms: 5400, caption: 'Car meets lorry: the wreck moves off with their total momentum, and the car’s Δv is brutal.', set: { focus: 'crash', L: 'car', R: 'truck', uL: 40, uR: 40 }, act: (s, inst) => inst.go(), view: REEL.crash, spin: 0 },
    { ms: 5000, caption: 'Same momentum to lose: a helmet stretches the stop over 3 cm and cuts the peak force five times.', set: { focus: 'helmet', drop: 7.5, helmet: true }, act: (s, inst) => inst.go(), view: REEL.helmet, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gC = new THREE.Group(), gB = new THREE.Group(), gH = new THREE.Group(), gK = new THREE.Group(); root.add(gC, gB, gH, gK);
    gB.position.x = BX; gH.position.x = HX; gK.position.x = CX;

    // ------------------------------------------------ crash
    const road = makeStrip(60); gC.add(road);
    const models = { L: { moto: makeMoto(0x2f6fd8), car: makeCar(0x3b82f6), truck: makeLorry(0x3b6fd8) }, R: { moto: makeMoto(0xd8332f), car: makeCar(0xff7a59), truck: makeLorry(0xd8332f) } };
    Object.values(models.L).forEach((m) => gC.add(m));
    Object.values(models.R).forEach((m) => { m.rotation.y = Math.PI; gC.add(m); });
    const lL = stage.label('', [0, 4.4, 0], gC), lR = stage.label('', [0, 4.4, 0], gC), lHit = stage.label('crunch!', [0, 4.8, 0], gC, 'hot');
    const pA = [force(0x5b9bff, 0.08, 0.4), force(0xff7a59, 0.08, 0.4)]; pA.forEach((a) => gC.add(a));

    // ------------------------------------------------ seat belt: an x-ray car and a barrier
    const barrier = box(0.8, 1.6, 3, M.matte(0x8c95a3)); barrier.position.set(0.4, 0.8, 0); gB.add(barrier);
    for (let i = 0; i < 5; i++) { const st = box(0.82, 0.12, 3.02, M.matte(i % 2 ? 0xe8e2c8 : 0x2b2f36)); st.position.set(0.4, 0.2 + i * 0.3, 0); gB.add(st); }
    const floorB = box(30, 0.04, 4, M.matte(0x2b2f36)); floorB.position.set(-12, -0.02, 0); gB.add(floorB);
    const car = makeCar(0x5ce1a9); gB.add(car);
    car.paint.transparent = true; car.paint.opacity = 0.3; car.paint.depthWrite = false;
    const occ = makePerson({ shirt: 0xffb547, s: 0.95 }); occ.pose({ arm: 1.2, sit: Math.PI / 2 }); car.add(occ);
    const seat = box(0.5, 0.1, 0.5, M.matte(0x22262e)); seat.position.set(-0.55, 0.55, 0.3); car.add(seat);
    const seatB = box(0.1, 0.7, 0.5, M.matte(0x22262e)); seatB.position.set(-0.8, 0.95, 0.3); car.add(seatB);
    const wheelS = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 24), M.matte(0x16181d)); wheelS.position.set(0.25, 1.0, 0.3); wheelS.rotation.y = Math.PI / 2; wheelS.rotation.x = 0.4; car.add(wheelS);
    const belt = box(0.04, 0.72, 0.08, M.plastic(0x16181d)); belt.rotation.z = -0.5; belt.position.set(-0.35, 1.05, 0.46); car.add(belt);
    const bag = sphere(0.3, M.plastic(0xf2f4f7, { roughness: 0.6, transparent: true, opacity: 0.9 }), 24); bag.position.set(0.05, 1.05, 0.3); car.add(bag);
    const lOcc = stage.label('', [0, 2.3, 0], gB, 'hot');

    // ------------------------------------------------ helmet drop test
    const anvil = disc(0.12, 0.08, M.metal(0x8c95a3)); anvil.position.y = 0.3; gH.add(anvil);
    const plinth = box(0.5, 0.26, 0.5, M.matte(0x3a3f4b)); plinth.position.y = 0.13; gH.add(plinth);
    for (const x of [-0.3, 0.3]) gH.add(beam([x, 0, -0.18], [x, 2.6, -0.18], 0.018, M.metal(0xc9ced8)));
    const head = new THREE.Group(); gH.add(head);
    const skin = sphere(0.1, M.matte(0xc68b64), 32); skin.scale.set(0.9, 1.1, 0.85); head.add(skin);
    const neck = beam([0, 0.02, 0], [0, 0.32, 0], 0.045, M.metal(0x8c95a3)); head.add(neck);
    const liner = sphere(0.135, M.matte(0xf2f4f7), 32); liner.scale.set(1, 1.08, 1); head.add(liner);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), M.plastic(0xd8332f, { roughness: 0.25, side: THREE.DoubleSide })); shell.rotation.z = Math.PI; shell.scale.set(1, 1.08, 1); head.add(shell);
    const lHead = stage.label('', [0, 1.2, 0], gH, 'hot');

    // ------------------------------------------------ catch
    const fielder = makePerson({ shirt: 0xf2f4f7, pants: 0xf2f4f7, skin: 0x8d5a3b }); fielder.pose({ arm: 1.35 }); gK.add(fielder);
    const ball = sphere(0.036, M.plastic(0xb3261e, { roughness: 0.35 }), 20); gK.add(ball);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.003, 6, 24), M.plastic(0xf2f4f7)); ball.add(seam);
    const grass = box(8, 0.02, 3, M.matte(0x2f5f3a)); grass.position.set(1.5, -0.01, 0); gK.add(grass);
    const lBall = stage.label('', [0, 2.2, 0], gK, 'hot');

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'crash') {
        const { L, R, uL, uR } = cur, c = crash(L, R, uL, uR);
        title(g, 'Momentum before and after', 'thousands of kg·m/s · right is +');
        const k = 1000, pl = (c.mL * uL) / k, pr = (-c.mR * uR) / k, pa = ((c.mL + c.mR) * c.v) / k;
        const mx = Math.max(1, Math.abs(pl), Math.abs(pr), Math.abs(pl + pr)) * 1.15;
        bars(g, { x0: 40, x1: w - 30, y0: 360, y1: 96, max: mx, dp: Math.abs(mx) < 20 ? 1 : 0, groups: [
          { name: 'before', bars: [{ v: pl, col: '#5b9bff', label: VEH[L].name.toLowerCase() }, { v: pr, col: '#ff7a59', label: VEH[R].name.toLowerCase() }, { v: pl + pr, col: COL.v, label: 'total' }] },
          { name: 'after', bars: [{ v: (c.mL * c.v) / k, col: '#5b9bff', label: 'left' }, { v: (c.mR * c.v) / k, col: '#ff7a59', label: 'right' }, { v: pa, col: COL.v, label: 'total' }] },
        ] });
        g.font = 'bold 22px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText('Change of velocity, Δv', 24, 440);
        const dvMax = Math.max(1, Math.abs(c.dL), Math.abs(c.dR));
        [[c.dL, '#5b9bff', VEH[L].name, c.gL], [c.dR, '#ff7a59', VEH[R].name, c.gR]].forEach(([dv, col, nm, gg], i) => {
          const y = 480 + i * 70, wbar = (Math.abs(dv) / dvMax) * 330;
          g.fillStyle = col; g.fillRect(200, y - 24, Math.max(3, wbar), 34);
          g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(nm, 24, y);
          g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`${fmt(Math.abs(dv) * KMH, 0)} km/h · ${fmt(gg, 0)} g`, Math.min(210 + wbar, w - 200), y);
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Both feel the same force; the lighter one gets the Δv.', 24, h - 22);
        return;
      }
      const list = [];
      let fFmt = (q) => fmt(q / 1000, 0) + ' kN', tFmt = (q) => fmt(q * 1000, 0) + ' ms', sub = '', ttl = 'Force during the stop';
      if (cur.focus === 'belt') {
        const v = cur.speed / KMH;
        [['no belt', DASH, '#ff7a59'], ['belt, stiff car', 0.15 + STRETCH, '#c49bff'], ['belt + crumple zone', 0.6 + STRETCH, COL.v]].forEach(([nm, d, col]) => {
          const S = stopper(M_OCC, v, d); list.push({ dt: S.dt, J: S.J, col, name: nm, on: Math.abs(d - beltD(cur.crumple, cur.belt)) < 1e-6 });
        });
        sub = `a ${M_OCC} kg person at ${fmt(cur.speed, 0)} km/h: same area, ${fmt(M_OCC * v, 0)} N·s`;
      } else if (cur.focus === 'helmet') {
        [['bare head', D_BARE, '#ff7a59'], ['helmet', D_HELMET, COL.v]].forEach(([nm, d, col]) => { const S = stopper(M_HEAD, cur.drop, d); list.push({ dt: S.dt, J: S.J, col, name: nm, on: (d === D_HELMET) === cur.helmet }); });
        tFmt = (q) => fmt(q * 1000, 1) + ' ms'; fFmt = (q) => fmt(q / 1000, 0) + ' kN';
        sub = `a ${M_HEAD} kg head at ${fmt(cur.drop)} m/s: same area, ${fmt(M_HEAD * cur.drop)} N·s`;
      } else {
        const v = cur.ball;
        [['stiff hands, 2 cm', 0.02, '#ff7a59'], [`your hands, ${fmt(cur.give, 0)} cm`, cur.give / 100, COL.v]].forEach(([nm, d, col], i) => { const S = stopper(M_BALL, v, d); list.push({ dt: S.dt, J: S.J, col, name: nm, on: i === 1 }); });
        fFmt = (q) => fmt(q, 0) + ' N';
        sub = `a 0.16 kg ball at ${fmt(v, 0)} m/s: same area, ${fmt(M_BALL * v, 1)} N·s`;
      }
      title(g, ttl, sub);
      const on = list.find((p) => p.on) || list[list.length - 1];
      // If one peak towers over the rest, let it run off the top so the others stay readable.
      const peaks = list.map((p) => (PEAK * p.J) / p.dt).sort((a, b) => b - a);
      const tMax = Math.max(...list.map((p) => p.dt)) * 1.15;
      const fMax = peaks[1] && peaks[0] > 6 * peaks[1] ? peaks[1] * 1.6 : peaks[0] * 1.15;
      pulses(g, w, h, list, { yTop: 90, yBot: h - 130, tMax, fMax, fFmt, tFmt });
      const pk = (PEAK * on.J) / on.dt;
      g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8';
      g.fillText(`Peak ${fFmt(pk)} over ${tFmt(on.dt)}`, 24, h - 58);
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)';
      g.fillText(pk > fMax ? 'The highlighted peak shoots off the top of the chart.' : 'Area under each curve = impulse = the momentum lost.', 24, h - 24);
    }, [0, 0, 0]);
    const BOARD = { crash: [5.4, 6.2, -2.5, 3.2], belt: [BX + 1.1, 2.9, -1.6, 1.2], helmet: [HX + 1.15, 0.85, -0.4, 0.6], catch: [CX + 1.9, 2.15, -0.8, 0.8] };

    const st = {};
    let t = 0, key = '', lastCk = '';
    const inst = {
      go() { t = 0; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lL, lR, lBall, lOcc]);
        const f = s.focus, reel = inReel();
        gC.visible = f === 'crash'; gB.visible = f === 'belt'; gH.visible = f === 'helmet'; gK.visible = f === 'catch';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'crash' ? [0, 8.6, -2] : [HX, -0.85, 0.2]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? (f === 'crash' ? 4.2 : 0.7) : B[3]);
        chart.mesh.visible = reel || !narrow || f === 'helmet';
        const k = `${f}|${s.L}|${s.R}|${s.uL}|${s.uR}|${s.speed}|${s.crumple}|${s.belt}|${s.drop}|${s.helmet}|${s.ball}|${s.give}`;
        if (k !== key) { if (key && !reel) inst.go(); key = k; }
        t += dt;

        if (f === 'crash') {
          const uL = s.uL / KMH, uR = s.uR / KMH, c = crash(s.L, s.R, uL, uR);
          const tc = 1.2, ts = t / SLOW_CRASH * 2.2;         // simulated seconds (about 2.3× slower than life)
          let xL, xR;
          if (ts < tc) { xL = -uL * (tc - ts); xR = uR * (tc - ts); }
          else { const tau = ts - tc, a = MU_SKID * G, tStop = Math.abs(c.v) / a, tt = Math.min(tau, tStop), sgnv = Math.sign(c.v); const d = Math.abs(c.v) * tt - 0.5 * a * tt * tt; xL = xR = sgnv * d; }
          // A little gap so the bumpers meet rather than overlap; a real crash crushes both fronts.
          const hit = ts >= tc;
          for (const side of ['L', 'R']) for (const [kk, m] of Object.entries(models[side])) {
            const on = kk === s[side]; m.visible = on;
            if (!on) continue;
            const fr = VEH[kk].front;
            m.position.x = side === 'L' ? xL - fr - (hit ? -0.25 : 0) : xR + fr + (hit ? -0.25 : 0);
            m.rotation.z = hit && ts < tc + 0.3 ? (side === 'L' ? 1 : -1) * 0.02 : 0;
          }
          road.scroll(0);
          const hL = s.L === 'truck' ? 3.6 : s.L === 'car' ? 2.0 : 2.1, hR = s.R === 'truck' ? 3.6 : s.R === 'car' ? 2.0 : 2.1;
          lL.position.set(xL - VEH[s.L].front - 0.5, hL + 0.3, 0); lR.position.set(xR + VEH[s.R].front + 0.5, hR + 0.3, 0);
          const vL = hit ? c.v : uL, vR = hit ? c.v : -uR;
          lL.element.innerHTML = `${VEH[s.L].name}, ${fmt(c.mL, 0)} kg · <b>${sgn(vL * KMH, 0)} km/h</b>`;
          lR.element.innerHTML = `${VEH[s.R].name}, ${fmt(c.mR, 0)} kg · <b>${sgn(vR * KMH, 0)} km/h</b>`;
          lHit.visible = hit && ts < tc + 0.5 && (uL + uR) > 0; lHit.position.set(xL, 4.8, 0);
          pA[0].aim([xL - VEH[s.L].front - 1, 1.2, 1.9], [Math.sign(vL) || 1, 0, 0], Math.min(4, (c.mL * Math.abs(vL)) / 40000));
          pA[1].aim([xR + VEH[s.R].front + 1, 1.2, 1.9], [Math.sign(vR) || 1, 0, 0], Math.min(4, (c.mR * Math.abs(vR)) / 40000));
          if (ts > tc + 4) t = 0;
        } else if (f === 'belt') {
          const v = s.speed / KMH, c = s.crumple ? 0.6 : 0.15, d = beltD(s.crumple, s.belt);
          const ts = t / SLOW_BELT, tc = 0.25;
          const carX = (tt) => { if (tt < tc) return -v * (tc - tt); const tau = tt - tc, a = (v * v) / (2 * c), T = v / a; const q = Math.min(tau, T); return v * q - 0.5 * a * q * q; };
          const cx = carX(ts);
          car.position.x = cx - 2.16;
          // Occupant, relative to the car: belted rides down over d; unbelted flies on, then hits the wheel.
          let rel = 0;
          if (ts > tc) {
            const tau = ts - tc;
            if (s.belt) { const a = (v * v) / (2 * d), T = v / a, q = Math.min(tau, T); rel = Math.max(0, v * q - 0.5 * a * q * q - (cx)); rel = Math.min(STRETCH, rel); }
            else rel = Math.min(GAP, v * tau - cx);
          }
          occ.position.set(-0.55 + rel * 0.7, 0.55 - 0.92 * 0.95, 0.3);
          occ.pose({ arm: 1.2 + rel, sit: Math.PI / 2, lean: rel * 0.9 });
          belt.visible = s.belt; bag.visible = s.belt && ts > tc + 0.03;
          bag.scale.setScalar(Math.min(1, Math.max(0.01, (ts - tc - 0.03) / 0.03)));
          const S = stopper(M_OCC, v, d);
          lOcc.position.set(cx - 1.6, 1.85, 0.3);
          lOcc.element.innerHTML = ts < tc ? `${fmt(s.speed, 0)} km/h · shown ${SLOW_BELT}× slower` : `peak <b>${fmt(S.g, 0)} g</b> on the ${s.belt ? 'belt and airbag' : 'steering wheel'}`;
          if (ts > tc + 0.5) t = 0;
        } else if (f === 'helmet') {
          const h0 = (s.drop * s.drop) / (2 * G), S = stopper(M_HEAD, s.drop, s.helmet ? D_HELMET : D_BARE);
          const r0 = s.helmet ? 0.162 : 0.11, yHit = 0.34 + r0;
          const fall = Math.sqrt((2 * h0) / G), ts = t * 0.5;          // shown at half speed
          let y, crush = 0;
          if (ts < fall) y = yHit + h0 - 0.5 * G * ts * ts;
          else { const k2 = Math.min(1, (ts - fall) / 0.25); crush = (s.helmet ? D_HELMET : D_BARE) * Math.sin(Math.min(Math.PI / 2, k2 * Math.PI)); y = yHit - crush + (k2 >= 1 ? 0.02 * Math.min(1, (ts - fall - 0.25) * 4) : 0); }
          head.position.y = Math.min(y, 2.4);
          liner.visible = shell.visible = s.helmet;
          liner.scale.y = 1.08 * (1 - (s.helmet ? crush * 3 : 0));
          lHead.position.set(0.3, 0.12, 0.3);
          lHead.element.innerHTML = ts < fall ? `dropped from ${fmt(h0, 2)} m` : `peak <b>${fmt(S.g, 0)} g</b> · ${S.g > ECE ? 'fails' : 'passes'} the 275 g limit`;
          if (ts > fall + 1.2) t = 0;
        } else {
          const v = s.ball, d = s.give / 100, S = stopper(M_BALL, v, d);
          const handX = 0.62, handY = 1.36, SL = 20, ts = t / SL, tc = 0.15;
          let bx, back = 0;
          if (ts < tc) bx = handX + 0.07 + v * (tc - ts);
          else { const tau = ts - tc, a = (v * v) / (2 * d), T = v / a, q = Math.min(tau, T); back = v * q - 0.5 * a * q * q; bx = handX + 0.07 - back; }
          fielder.position.x = -back; fielder.pose({ arm: 1.35 - back * 0.8, lean: -back * 0.4 });
          ball.position.set(bx, handY, 0);
          lBall.position.set(1.4, 0.55, 0);
          lBall.element.innerHTML = ts < tc ? `${fmt(v * KMH, 0)} km/h · shown ${SL}× slower` : `stopped in ${fmt(S.dt * 1000, 0)} ms · peak <b>${fmt(S.peak, 0)} N</b>`;
          if (ts > tc + Math.max(0.2, S.dt + 0.15)) t = 0;
        }
        cur = { focus: f, L: s.L, R: s.R, uL: s.uL / KMH, uR: s.uR / KMH, speed: s.speed, crumple: s.crumple, belt: s.belt, drop: s.drop, helmet: s.helmet, ball: s.ball, give: s.give };
        if (k !== lastCk) { lastCk = k; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'crash') {
          const uL = s.uL / KMH, uR = s.uR / KMH, c = crash(s.L, s.R, uL, uR);
          return `<div class="big">Wreck moves off at ${sgn(c.v * KMH, 0)} km/h</div>
            <div class="row"><span>Total momentum, before = after</span><b>${sgn(c.mL * uL - c.mR * uR, 0)} kg·m/s</b></div>
            <div class="row"><span>${VEH[s.L].name}: Δv · peak g</span><b>${fmt(Math.abs(c.dL) * KMH, 0)} km/h · ${fmt(c.gL * PEAK, 0)} g</b></div>
            <div class="row"><span>${VEH[s.R].name}: Δv · peak g</span><b>${fmt(Math.abs(c.dR) * KMH, 0)} km/h · ${fmt(c.gR * PEAK, 0)} g</b></div>
            <div class="row"><span>Force on each, Δp ÷ ${fmt(DT_CRASH * 1000, 0)} ms</span><b>${fmt(c.F / 1000, 0)} kN, equal and opposite</b></div>`;
        }
        if (f === 'belt') {
          const v = s.speed / KMH, d = beltD(s.crumple, s.belt), S = stopper(M_OCC, v, d);
          return `<div class="big">Peak ${fmt(S.g, 0)} g on the occupant</div>
            <div class="row"><span>Momentum to lose, m v</span><b>${fmt(S.J, 0)} kg·m/s</b></div>
            <div class="row"><span>Stopping distance · time</span><b>${fmt(d * 100, 0)} cm · ${fmt(S.dt * 1000, 0)} ms</b></div>
            <div class="row"><span>Average · peak force</span><b>${fmt(S.avg / 1000, 1)} · ${fmt(S.peak / 1000, 1)} kN</b></div>
            <small>${!s.belt ? 'Unbelted: you fly on and stop on the wheel in about 5 cm. The crumple zone can’t help.' : s.crumple ? 'Crumple zone, belt and airbag together stretch the stop the most.' : 'A stiff car stops the cabin too quickly; the belt alone can only stretch 30 cm.'}</small>`;
        }
        if (f === 'helmet') {
          const S = stopper(M_HEAD, s.drop, s.helmet ? D_HELMET : D_BARE);
          return `<div class="big">Peak ${fmt(S.g, 0)} g on the head</div>
            <div class="row"><span>Momentum to lose, 5 kg × ${fmt(s.drop)} m/s</span><b>${fmt(S.J)} kg·m/s</b></div>
            <div class="row"><span>Stopping distance · time</span><b>${fmt((s.helmet ? D_HELMET : D_BARE) * 1000, 0)} mm · ${fmt(S.dt * 1000, 1)} ms</b></div>
            <div class="row"><span>Peak force</span><b>${fmt(S.peak / 1000, 1)} kN</b></div>
            <small>ECE 22.05 test: 7.5 m/s onto a steel anvil, and no more than ${ECE} g. ${s.helmet ? 'The foam liner crushes, stretching the stop.' : 'No foam: the skull stops in millimetres.'}</small>`;
        }
        const S = stopper(M_BALL, s.ball, s.give / 100), stiff = stopper(M_BALL, s.ball, 0.02);
        return `<div class="big">Peak ${fmt(S.peak, 0)} N on your hands</div>
          <div class="row"><span>Momentum to lose, 0.16 kg × ${fmt(s.ball, 0)} m/s</span><b>${fmt(S.J, 1)} kg·m/s</b></div>
          <div class="row"><span>Stopping time</span><b>${fmt(S.dt * 1000, 1)} ms</b></div>
          <div class="row"><span>With stiff hands (2 cm)</span><b>${fmt(stiff.peak, 0)} N in ${fmt(stiff.dt * 1000, 1)} ms</b></div>
          <small>Like holding up ${fmt(S.peak / G, 0)} kg, briefly. Give with the hands and it drops ${fmt(stiff.peak / S.peak, 0)} times.</small>`;
      },
    };
    return inst;
  },
};
