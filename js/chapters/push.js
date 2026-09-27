// Chapter 3: push-offs. Start with zero momentum, push two things apart, and the total stays zero:
// m1 v1 = −m2 v2. Keep throwing mass backwards and you get a steady push: thrust = momentum per second.
// Skaters: a 50 kg skater and a heavier partner push apart with impulse J (N·s): v = J ÷ m each way.
//   Ice friction (μ about 0.005–0.01 for a skate blade) is ignored over a few seconds.
// Boat: a 60 kg jumper leaps forward at 3 m/s relative to the boat (a brisk standing jump). Momentum
//   makes the jumper's speed over the water u mB ÷ (mB + mj) and the boat's u mj ÷ (mB + mj) backwards.
//   The gap to the jetty is 1.0 m and the jump lasts about 0.45 s in the air, so the jumper needs about
//   2.2 m/s over the water: a light kayak (about 30 kg) steals too much of the jump.
// Cannon: a field gun of about 1,000 kg with its carriage firing a 5 kg ball at 450 m/s, round figures
//   typical of 19th-century field artillery. Recoil v = 5 × 450 ÷ 1,000 = 2.25 m/s. The powder gas
//   also leaves the muzzle and adds roughly a quarter more recoil in real guns; ignored here.
//   A rifle: 10 g bullet at 900 m/s from a 4 kg rifle gives 2.25 m/s too, unless it is held firmly.
// Rocket: Tsiolkovsky's rocket equation (1903), Δv = v_e ln(m0 ÷ mf), from momentum conservation for
//   each bit of exhaust. Effective exhaust speeds: solid motors about 2.5 km/s, kerosene–oxygen about
//   3.0 km/s, hydrogen–oxygen about 4.4 km/s in vacuum (specific impulse ≈ 450 s × g). Reaching low
//   Earth orbit takes about 9.4 km/s including gravity and drag losses (orbital speed 7.8 km/s).
// Fan: a 1,200 mm ceiling fan (as in FanClear): 210 m³/min at 350 rpm, airflow in proportion to rpm.
//   The air leaves through the swept area A = π × 0.6² at v = Q ÷ A. Each second it gives ρ Q kg of air
//   the speed v, so thrust F = ρ Q v, about 13 N at full speed: the fan hangs about 1.3 kg lighter.
import { THREE, M, box, beam, swarm } from '../kit.js';
import {
  G, RHO_AIR, board, panelBg, axes, title, bars, line, dot, tag, COL, ticks, fitNarrow, inReel, focusView, force,
  makePerson, makeBoat, makeCannon, makeRocket, makeCeilingFan, sphere, fmt, sgn, ke,
} from '../momentum.js';

const RX = 60, FX = 120;
const M_SK = 50, M_JUMP = 60, LEAP = 3.0, JETTY = 1.0, AIR_T = 0.45;
const CAN = { M: 1000, m: 5, v: 450 };
const FUELS = { solid: { ve: 2500, name: 'solid fuel' }, kero: { ve: 3000, name: 'kerosene + oxygen' }, hydro: { ve: 4400, name: 'hydrogen + oxygen' } };
const LEO = 9400;
const FAN = { Q: 210 / 60, rpm: 350, R: 0.6, Y: 3.0 };
const STEPS = [0, 130, 180, 230, 290, 350];
const PAUSE = 0.8;
const VIEWS = {
  apart: { pos: [0.6, 2.6, 10], target: [0.6, 1.3, 0] },
  rocket: { pos: [RX + 0.3, 1.2, 8.5], target: [RX + 0.3, 1.0, 0] },
  fan: { pos: [FX + 0.3, 2.9, 7.0], target: [FX + 0.3, 2.7, 0] },
};
const REEL = {
  apart: { pos: [0, 2.6, 7.2], target: [0, 2.1, 0] },
  rocket: { pos: [RX - 0.5, 1.6, 6.5], target: [RX - 0.5, 2.4, 0] },
};

export function apart(s) {
  if (s.pair === 'skaters') { const m = [M_SK, s.mSk], v = [-s.push / M_SK, s.push / s.mSk]; return { m, v, names: ['skater', 'partner'] }; }
  if (s.pair === 'boat') { const M_ = M_JUMP + s.mBoat; return { m: [s.mBoat, M_JUMP], v: [(-LEAP * M_JUMP) / M_, (LEAP * s.mBoat) / M_], names: ['boat', 'jumper'] }; }
  return { m: [CAN.M, CAN.m], v: [(-CAN.m * CAN.v) / CAN.M, CAN.v], names: ['cannon', 'ball'] };
}
export const fanThrust = (rpm) => { const Q = (FAN.Q * rpm) / FAN.rpm, A = Math.PI * FAN.R * FAN.R, v = Q / A, mdot = RHO_AIR * Q; return { Q, v, mdot, F: mdot * v }; };

export default {
  id: 'push',
  short: 'Push-offs',
  title: 'Push-offs, recoil and rockets',
  subtitle: 'Push two things apart and their momenta cancel. Keep throwing mass back and you get thrust.',
  view: VIEWS.apart,
  learn: `<p>Two skaters stand still on ice: total momentum <b>zero</b>. They push apart. Now one has momentum to the left and the other the same amount to the right, so the total is <b>still zero</b>. The lighter skater goes faster: <b>m₁ v₁ = m₂ v₂</b>.</p>
    <p>The same rule explains <b>recoil</b>. A cannonball leaves at 450 m/s, so the heavy cannon must roll back with the same momentum, about 2 m/s. A rifle kicks the same way, which is why you hold it firmly against your shoulder: then the rifle and you share the recoil. Jump off a small <b>boat</b> and the boat shoots backwards, stealing part of your jump. In a light kayak you may land in the water.</p>
    <p>A <b>rocket</b> does this non-stop. It throws hot gas backwards at 2 to 4.4 km/s, and every kilogram thrown back gives the rocket that much momentum forwards. <b>Thrust = momentum thrown away per second</b>, ṁ × v. It needs no air to push on, which is why rockets work in space. Tsiolkovsky's equation says the final speed depends on the exhaust speed and how much of the rocket is fuel (see ForceClear and NewtonClear for the forces).</p>
    <p>A <b>ceiling fan</b> is a gentle rocket. It pushes about 4 kg of air down every second at 3 m/s, so the air pushes the fan up with about 13 N (FanClear).</p>
    <p class="tip"><b>Try it:</b> make one skater heavier and push. Jump off a kayak and then a rowing boat. Fire the cannon. Then fill the rocket with more fuel and watch the gains shrink, and step the fan's regulator from 1 to 5.</p>`,
  terms: [
    { t: 'Recoil', d: 'The backwards kick of a gun or cannon. It carries the same momentum as the shot, in the opposite direction.' },
    { t: 'Thrust', d: 'The push from throwing mass backwards: mass per second × speed, ṁ v, in newtons.' },
    { t: 'Exhaust velocity', d: 'How fast a rocket throws its gas backwards, 2 to 4.4 km/s for chemical rockets.' },
    { t: 'Mass ratio', d: 'A rocket’s mass full of fuel divided by its mass when empty.' },
    { t: 'Rocket equation', d: 'Δv = v_e × ln(m_full ÷ m_empty), published by Konstantin Tsiolkovsky in 1903.' },
  ],
  defaults: { focus: 'apart', pair: 'skaters', push: 100, mSk: 80, mBoat: 30, ratio: 4, fuel: 'kero', step: 5 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'apart', label: 'Push apart' }, { v: 'rocket', label: 'Rocket' }, { v: 'fan', label: 'Ceiling fan' }] },
    { key: 'pair', type: 'seg', label: 'Push apart: who', options: [{ v: 'skaters', label: 'Skaters' }, { v: 'boat', label: 'Boat jump' }, { v: 'cannon', label: 'Cannon' }] },
    { key: 'push', type: 'range', label: 'Skaters: how hard they push', min: 30, max: 200, step: 10, ends: ['gentle', 'shove'], fmt: (v) => `${fmt(v, 0)} N·s` },
    { key: 'mSk', type: 'range', label: 'Skaters: the partner’s mass', min: 40, max: 120, step: 5, ends: ['40 kg', '120 kg'], fmt: (v) => `${fmt(v, 0)} kg` },
    { key: 'mBoat', type: 'range', label: 'Boat: its mass', min: 20, max: 400, step: 10, ends: ['kayak', 'rowing boat'], fmt: (v) => `${fmt(v, 0)} kg` },
    { key: 'ratio', type: 'range', label: 'Rocket: full ÷ empty mass', min: 1.5, max: 12, step: 0.5, ends: ['little fuel', 'mostly fuel'], fmt: (v) => `${fmt(v)} (${fmt((1 - 1 / v) * 100, 0)}% fuel)` },
    { key: 'fuel', type: 'seg', label: 'Rocket: fuel', options: [{ v: 'solid', label: 'Solid' }, { v: 'kero', label: 'Kerosene' }, { v: 'hydro', label: 'Hydrogen' }] },
    { key: 'step', type: 'range', label: 'Fan: regulator step', min: 1, max: 5, step: 1, ends: ['1', '5'], fmt: (v) => `${v} · ${STEPS[v]} rpm` },
    { key: 'go', type: 'buttons', label: 'Run', items: [{ label: '▶ Again', act: (s, inst) => inst.go() }] },
  ],
  onChange(s, key) {
    if (['pair', 'push', 'mSk', 'mBoat'].includes(key)) s.focus = 'apart';
    if (key === 'push' || key === 'mSk') s.pair = 'skaters';
    if (key === 'mBoat') s.pair = 'boat';
    if (['ratio', 'fuel'].includes(key)) s.focus = 'rocket';
    if (key === 'step') s.focus = 'fan';
  },
  quiz: [
    { q: 'A 50 kg skater and an 80 kg skater push apart. The 50 kg skater moves off at 1.6 m/s. How fast does the other go?', options: ['1.6 m/s', '1.0 m/s', '2.56 m/s', '0.8 m/s'], answer: 1, why: 'The momenta must cancel: 50 × 1.6 = 80 kg·m/s, so the 80 kg skater moves at 80 ÷ 80 = 1.0 m/s the other way.' },
    { q: 'Why can a rocket accelerate in empty space, with no air to push against?', options: ['It pushes on the vacuum', 'It throws exhaust backwards, and gains the same momentum forwards', 'Gravity pulls it along', 'It can’t'], answer: 1, why: 'The rocket and its exhaust start with the same total momentum. Throwing gas back gives the rocket equal momentum forwards. No air needed.' },
    { q: 'A ceiling fan pushes 4 kg of air downwards each second at 3 m/s. What upward push does the air give the fan?', options: ['4 N', '12 N', '7 N', '0.75 N'], answer: 1, why: 'Thrust is momentum per second: 4 kg/s × 3 m/s = 12 N, about the weight of 1.2 kg.' },
  ],
  reel: [
    { ms: 5000, caption: 'Push off on ice: equal and opposite momentum, so the lighter skater flies away faster.', set: { focus: 'apart', pair: 'skaters', push: 120, mSk: 90 }, act: (s, inst) => inst.go(), view: REEL.apart, spin: 0 },
    { ms: 5000, caption: 'A rocket throws its exhaust back at 3 km/s, and gains that momentum forwards, even in empty space.', set: { focus: 'rocket', ratio: 6, fuel: 'kero' }, act: (s, inst) => inst.go(), view: REEL.rocket, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gA = new THREE.Group(), gR = new THREE.Group(), gF = new THREE.Group(); root.add(gA, gR, gF);
    gR.position.x = RX; gF.position.x = FX;

    // ------------------------------------------------ push apart: three small scenes, one at a time
    const ice = box(14, 0.04, 4, M.plastic(0xdff3ff, { roughness: 0.1 })); ice.position.y = -0.02; gA.add(ice);
    const skA = makePerson({ shirt: 0xc49bff, pants: 0x2b3242, skin: 0x8d5a3b, s: 0.92 }), skB = makePerson({ shirt: 0x3b6fd8, pants: 0x22262e });
    skB.rotation.y = Math.PI; gA.add(skA, skB);
    const water = box(14, 0.02, 4, M.plastic(0x2a6fb0, { roughness: 0.15, transparent: true, opacity: 0.85 })); water.position.y = 0.2; gA.add(water);
    const jetty = box(3, 0.1, 2.4, M.matte(0x8a5a3a)); jetty.position.set(3.9, 0.75, 0); gA.add(jetty);
    const posts = [];
    for (const x of [2.6, 5.0]) for (const z of [-1, 1]) { const p = box(0.12, 0.9, 0.12, M.matte(0x6b4a2e)); p.position.set(x, 0.3, z); gA.add(p); posts.push(p); }
    const boat = makeBoat(); gA.add(boat);
    const jumper = makePerson({ shirt: 0xffb547, pants: 0x2b3242 }); gA.add(jumper);
    const cannon = makeCannon(); gA.add(cannon);
    const ground = box(14, 0.04, 4, M.matte(0x4a5a3a)); ground.position.y = -0.02; gA.add(ground);
    const shot = sphere(0.08, M.metal(0x22262e), 16); gA.add(shot);
    const puff = sphere(0.4, new THREE.MeshBasicMaterial({ color: 0xcfd6e0, transparent: true, opacity: 0.6, depthWrite: false }), 16); gA.add(puff);
    const arA = [force(0x5b9bff, 0.05, 0.25), force(0xff7a59, 0.05, 0.25)]; arA.forEach((a) => gA.add(a));
    const lA = [stage.label('', [0, 2.3, 0], gA), stage.label('', [0, 2.3, 0], gA)], lSay = stage.label('', [0, 3, 0], gA, 'hot');

    // ------------------------------------------------ rocket in space
    const rocket = makeRocket(); rocket.position.set(0, 1.0, 0); gR.add(rocket);
    const fuelBar = box(1.0, 0.08, 0.02, M.glow(0xffb547)); gR.add(fuelBar);   // a fuel gauge painted on the side
    const N_STARS = 260, stars = swarm(N_STARS, new THREE.SphereGeometry(0.03, 6, 4), M.glow(0xffffff));
    stars.castShadow = false; gR.add(stars);
    const starXY = Array.from({ length: N_STARS }, (_, i) => [((i * 97.3) % 40) - 20, ((i * 53.7) % 9) - 2.5, -3 - ((i * 31.1) % 12)]);
    const gas = swarm(120, new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0.7, toneMapped: false })); gas.castShadow = false; gR.add(gas);
    const lRock = stage.label('', [0, 2.2, 0], gR, 'hot');

    // ------------------------------------------------ ceiling fan and its air
    const ceiling = box(6, 0.1, 3, M.matte(0xe8e2c8)); ceiling.position.set(0, FAN.Y + 0.65, -0.2); gF.add(ceiling);
    const fan = makeCeilingFan(); fan.position.set(0, FAN.Y, 0); gF.add(fan);
    const N_AIR = 260, air = swarm(N_AIR, new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.75, toneMapped: false }));
    air.castShadow = false; gF.add(air);
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const airSeed = Array.from({ length: N_AIR }, (_, i) => [hash(i), hash(i + 1000) * Math.PI * 2, Math.sqrt(hash(i + 2000))]);
    const arF = force(0x7be08c, 0.05, 0.25); gF.add(arF);
    const lFan = stage.label('', [0, 4.2, 0], gF, 'hot');
    const table = box(1.2, 0.05, 0.8, M.matte(0x8a5a3a)); table.position.set(-1.3, 0.75, 0.3); gF.add(table);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'apart') {
        const A = apart(cur), p = A.m.map((m, i) => m * A.v[i]);
        title(g, 'Momentum: zero before, zero after', 'kg·m/s · right is +');
        const mx = Math.max(...p.map(Math.abs)) * 1.2;
        bars(g, { x0: 40, x1: w - 30, y0: 380, y1: 96, max: mx, dp: 0, groups: [
          { name: 'before', bars: [{ v: 0, col: '#5b9bff', label: A.names[0] }, { v: 0, col: '#ff7a59', label: A.names[1] }, { v: 0, col: COL.v, label: 'total' }] },
          { name: 'after', bars: [{ v: p[0], col: '#5b9bff', label: A.names[0] }, { v: p[1], col: '#ff7a59', label: A.names[1] }, { v: p[0] + p[1], col: COL.v, label: 'total' }] },
        ] });
        g.font = 'bold 21px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText('Same momentum, very different energy', 24, 460);
        const k = A.m.map((m, i) => ke(m, A.v[i])), tot = k[0] + k[1];
        [[A.names[0], k[0], '#5b9bff'], [A.names[1], k[1], '#ff7a59']].forEach(([nm, e, col], i) => {
          const y = 505 + i * 56; g.fillStyle = col; g.fillRect(170, y - 24, Math.max(3, (e / tot) * 300), 32);
          g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(nm, 24, y);
          g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`${fmt(e, e < 100 ? 1 : 0)} J · ${fmt((e / tot) * 100, 0)}%`, 180 + Math.min(300, (e / tot) * 300), y);
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('The lighter one gets the speed, and most of the energy.', 24, h - 22);
      } else if (cur.focus === 'rocket') {
        const ve = FUELS[cur.fuel].ve;
        title(g, 'Final speed vs how much is fuel', 'Δv = v_e × ln(full ÷ empty)');
        const A = axes(g, w, h, { x0: 100, y0: h - 110, y1: 90, xMin: 1, xMax: 12, yMax: 12, xTicks: [1, 2, 4, 6, 8, 10, 12], yTicks: [0, 3, 6, 9, 12], xFmt: (q) => q + '', yFmt: (q) => q + ' km/s', xLabel: 'full ÷ empty mass' });
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.setLineDash([10, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(A.x0, A.Y(LEO / 1000)); g.lineTo(A.x1, A.Y(LEO / 1000)); g.stroke(); g.setLineDash([]);
        tag(g, 'to reach orbit ≈ 9.4 km/s', A.x0 + 10, A.Y(LEO / 1000) - 10, 'rgba(255,255,255,.75)', '17px sans-serif');
        Object.entries(FUELS).forEach(([kk, F]) => {
          const pts = []; for (let r = 1; r <= 12.001; r += 0.1) pts.push([r, (F.ve * Math.log(r)) / 1000]);
          line(g, pts, A.X, A.Y, kk === cur.fuel ? COL.a : 'rgba(255,255,255,.25)', kk === cur.fuel ? 5 : 2);
          tag(g, F.name, A.X(12) - 190, A.Y((F.ve * Math.log(12)) / 1000) - 8, kk === cur.fuel ? COL.a : 'rgba(255,255,255,.4)', '16px sans-serif');
        });
        dot(g, A.X(cur.ratio), A.Y((ve * Math.log(cur.ratio)) / 1000), COL.a, 11);
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)';
        g.fillText('Doubling the fuel adds less each time: that is why rockets drop', 24, h - 50);
        g.fillText('empty stages on the way up.', 24, h - 24);
      } else {
        title(g, 'Thrust = air momentum per second', 'ρ Q v, grows with speed²');
        const A = axes(g, w, h, { x0: 100, y0: h - 120, y1: 90, xMax: 350, yMax: 15, xTicks: [0, 70, 140, 210, 280, 350], yTicks: [0, 5, 10, 15], xFmt: (q) => q + '', yFmt: (q) => q + ' N', xLabel: 'rpm' });
        const pts = []; for (let r = 0; r <= 350; r += 5) pts.push([r, fanThrust(r).F]);
        line(g, pts, A.X, A.Y, COL.v, 5);
        STEPS.slice(1).forEach((r, i) => { const F = fanThrust(r).F; dot(g, A.X(r), A.Y(F), i + 1 === cur.step ? COL.a : 'rgba(255,255,255,.35)', i + 1 === cur.step ? 11 : 6); });
        const T = fanThrust(STEPS[cur.step]);
        g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
        g.fillText(`Step ${cur.step}: ${fmt(T.mdot, 1)} kg of air each second at ${fmt(T.v, 1)} m/s`, 24, h - 50);
        g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '17px sans-serif';
        g.fillText('Half the speed: half the air, half as fast, a quarter of the push.', 24, h - 22);
      }
    }, [0, 0, 0]);
    const BOARD = { apart: [3.1, 3.2, -1.4, 1.4], rocket: [RX + 2.4, 2.9, -1.6, 1.4], fan: [FX + 2.1, 1.4, -0.9, 1.0] };

    const st = {};
    let t = 0, key = '', lastCk = '';
    const inst = {
      go() { t = 0; },
      dispose() { stage.floor.visible = true; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lA[0], lA[1], lFan, lRock]);
        const f = s.focus, reel = inReel();
        gA.visible = f === 'apart'; gR.visible = f === 'rocket'; gF.visible = f === 'fan';
        stage.floor.visible = f !== 'rocket';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'rocket' ? [RX, 4.2, -1.6] : [0, 4.6, -1.4]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? (f === 'rocket' ? 1.9 : 2.0) : B[3]);
        chart.mesh.visible = reel || !narrow;
        const k = `${f}|${s.pair}|${s.push}|${s.mSk}|${s.mBoat}|${s.ratio}|${s.fuel}|${s.step}`;
        if (k !== key) { if (key && !reel) inst.go(); key = k; }
        t += dt;

        if (f === 'apart') {
          const A = apart(s), tau = Math.max(0, t - PAUSE);
          const P = s.pair;
          ice.visible = skA.visible = skB.visible = P === 'skaters';
          water.visible = jetty.visible = boat.visible = jumper.visible = P === 'boat';
          posts.forEach((o) => { o.visible = P === 'boat'; });
          cannon.visible = ground.visible = shot.visible = P === 'cannon';
          puff.visible = P === 'cannon' && tau > 0 && tau < 0.5;
          let xs = [0, 0], ys = [2.3, 2.3];
          if (P === 'skaters') {
            const x1 = -0.36 + A.v[0] * tau, x2 = 0.38 + A.v[1] * tau;
            skA.position.set(x1, 0, 0); skB.position.set(x2, 0, 0);
            const push = tau < 0.25;
            skA.pose({ arm: push || t < PAUSE ? 1.45 : 0.4, lean: 0.1 }); skB.pose({ arm: push || t < PAUSE ? 1.45 : 0.4, lean: 0.1 });
            xs = [x1, x2]; ys = [2.05, 2.2];
          } else if (P === 'boat') {
            const bx = A.v[0] * tau; boat.position.set(bx, 0.15, 0);
            const land = A.v[1] * AIR_T >= JETTY + 0.001;
            // Jumper stands at the bow, x = 1.4 in the boat, feet at the deck, 0.58 m up.
            let jx = 1.4 + A.v[1] * tau, jy = 0.58;
            if (tau > 0) {
              const tt = Math.min(tau, AIR_T); jy = 0.58 + 2.2 * tt - 0.5 * G * tt * tt + (land ? (0.8 - 0.58) * (tt / AIR_T) : 0);
              if (tau > AIR_T) { if (land) { jx = 1.4 + A.v[1] * AIR_T; jy = 0.8; } else { jy = Math.max(-0.9, 0.58 - 0.5 * G * (tau - AIR_T) * (tau - AIR_T) - 0.1); } }
              else jx = 1.4 + A.v[1] * tt;
            }
            jumper.position.set(jx, jy, 0); jumper.pose({ arm: tau > 0 && tau < AIR_T ? 2.4 : 0.3, stride: tau > 0 && tau < AIR_T ? 0.5 : 0 });
            xs = [bx, jx]; ys = [1.4, 2.6];
          } else {
            // Recoil at 2.25 m/s, then the wheels and trail drag it to a stop at about 1.8 m/s².
            const vr = -A.v[0], ar = 1.8, tt = Math.min(tau, vr / ar), cx = -(vr * tt - 0.5 * ar * tt * tt);
            cannon.roll(cx - cannon.position.x); cannon.position.set(cx, 0, 0);
            shot.visible = P === 'cannon' && tau > 0 && tau < 0.02;
            shot.position.set(cannon.position.x + 1.5 + tau * 400, 1.15, 0);
            puff.position.set(cannon.position.x + 1.8, 1.15, 0); puff.scale.setScalar(0.4 + tau * 2);
            xs = [cannon.position.x, 4.5]; ys = [2.3, 2.3];
          }
          const on = tau > 0;
          A.m.forEach((m, i) => {
            const v = on ? A.v[i] : 0, p = m * v;
            arA[i].aim([xs[i], ys[i] - 0.35, 0.6], [Math.sign(v) || 1, 0, 0], on ? Math.min(2.2, 0.4 + Math.abs(p) / (P === 'cannon' ? 1500 : 150)) : 0.01);
            lA[i].position.set(xs[i], ys[i], 0);
            lA[i].element.innerHTML = `${A.names[i]} ${fmt(m, 0)} kg · <b>${sgn(v, v > 50 ? 0 : 2)} m/s</b>`;
          });
          lSay.position.set(2.0, 0.1, 1.6);
          const landOK = A.v[1] * AIR_T >= JETTY;
          lSay.element.innerHTML = t < PAUSE ? 'total momentum: 0' : P === 'boat' ? (tau > AIR_T ? (landOK ? 'made it to the jetty' : 'splash! the boat stole the jump') : 'jump!') : P === 'cannon' ? 'boom: the cannon recoils' : 'push!';
          lA[1].visible = !(P === 'cannon' && tau > 0.3) && !narrow;
          if (tau > 3.2) t = 0;
        } else if (f === 'rocket') {
          const F = FUELS[s.fuel], burn = 3.0, tau = Math.max(0, t - 0.5), k2 = Math.min(1, tau / burn);
          const mFrac = 1 - k2 * (1 - 1 / s.ratio), v = F.ve * Math.log(1 / mFrac), firing = tau > 0 && tau < burn;
          rocket.flame(firing ? 1 : 0, time);
          const frac = (1 - k2) * (1 - 1 / s.ratio);
          fuelBar.scale.x = Math.max(0.01, frac * 2); fuelBar.position.set(-1.3 + frac, 1.0, 0.26);
          fuelBar.visible = fuelBar.scale.x > 0.02;
          // Stars stream past in proportion to the speed (scaled right down so they can be followed).
          const off = (v / 1000) * (t * 0.6);
          starXY.forEach(([x, y, z], i) => { let xx = ((x - off * (1 + (i % 3) * 0.3)) % 40 + 40) % 40 - 20; stars.place(i, [xx, y + 1, z]); });
          stars.done();
          for (let i = 0; i < 120; i++) { const a = ((i * 0.618 + time * 1.7) % 1); const on = firing; gas.place(i, [-1.8 - a * 3.5, 1.0 + Math.sin(i * 7.3) * 0.25 * a, Math.cos(i * 3.1) * 0.25 * a], null, on ? 1 - a * 0.7 : 0.001); }
          gas.done();
          lRock.position.set(0.3, 0.2, 0.6);
          lRock.element.innerHTML = tau <= 0 ? 'fuelled, at rest' : `<b>${fmt(v / 1000, 2)} km/s</b> · ${fmt(mFrac * 100, 0)}% of the start mass left`;
          if (tau > burn + 2) t = 0;
        } else {
          const rpm = STEPS[s.step], T = fanThrust(rpm);
          fan.spin(-(time * (rpm / 60) * Math.PI * 2) * 0.2);
          airSeed.forEach(([ph, ang, rr], i) => {
            const fall = ((ph + (time * T.v) / 3.2) % 1);
            const y = FAN.Y - 0.1 - fall * 3.0, r = rr * FAN.R * (0.9 + fall * 0.6);
            air.place(i, [Math.cos(ang + fall * 0.8) * r, y, Math.sin(ang + fall * 0.8) * r], null, rpm ? 1 : 0.001);
          });
          air.done();
          arF.aim([0.9, FAN.Y + 0.1, 0], [0, 1, 0], 0.1 + T.F * 0.07);
          lFan.position.set(1.4, FAN.Y + 0.9, 0);
          lFan.element.innerHTML = `air pushes the fan up: <b>${fmt(T.F, 1)} N</b>`;
        }
        cur = { focus: f, pair: s.pair, push: s.push, mSk: s.mSk, mBoat: s.mBoat, ratio: s.ratio, fuel: s.fuel, step: s.step };
        if (k !== lastCk) { lastCk = k; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'apart') {
          const A = apart(s), p = A.m[1] * A.v[1];
          const extra = s.pair === 'boat' ? `<div class="row"><span>Needed to reach the jetty</span><b>${fmt(JETTY / AIR_T, 1)} m/s · ${A.v[1] * AIR_T >= JETTY ? 'lands' : 'splash'}</b></div>`
            : s.pair === 'cannon' ? '<div class="row"><span>A 4 kg rifle, 10 g bullet at 900 m/s</span><b>2.25 m/s kick</b></div>' : `<div class="row"><span>Energy from their muscles</span><b>${fmt(ke(A.m[0], A.v[0]) + ke(A.m[1], A.v[1]), 0)} J</b></div>`;
          return `<div class="big">${sgn(A.m[0] * A.v[0], 0)} + ${sgn(p, 0)} = 0 kg·m/s</div>
            <div class="row"><span>${A.names[0]}: ${fmt(A.m[0], 0)} kg × ${sgn(A.v[0], 2)} m/s</span><b>${sgn(A.m[0] * A.v[0], 0)}</b></div>
            <div class="row"><span>${A.names[1]}: ${fmt(A.m[1], A.m[1] < 10 ? 0 : 0)} kg × ${sgn(A.v[1], A.v[1] > 50 ? 0 : 2)} m/s</span><b>${sgn(p, 0)}</b></div>
            ${extra}`;
        }
        if (f === 'rocket') {
          const F = FUELS[s.fuel], dv = F.ve * Math.log(s.ratio);
          return `<div class="big">Δv = ${fmt(dv / 1000, 2)} km/s</div>
            <div class="row"><span>Exhaust speed, ${F.name}</span><b>${fmt(F.ve / 1000, 1)} km/s</b></div>
            <div class="row"><span>Full ÷ empty mass</span><b>${fmt(s.ratio)} (ln = ${fmt(Math.log(s.ratio), 2)})</b></div>
            <div class="row"><span>Each kg of exhaust gives the rocket</span><b>${fmt(F.ve, 0)} kg·m/s</b></div>
            <small>${dv >= LEO ? 'Enough for orbit in one stage, on paper. Real tanks and engines make that very hard.' : `Orbit needs about 9.4 km/s: ${fmt((LEO - dv) / 1000, 1)} km/s short. Stack stages.`}</small>`;
        }
        const T = fanThrust(STEPS[s.step]);
        return `<div class="big">Thrust ${fmt(T.F, 1)} N</div>
          <div class="row"><span>Air moved, Q</span><b>${fmt(T.Q * 60, 0)} m³/min</b></div>
          <div class="row"><span>Air mass per second, ρ Q</span><b>${fmt(T.mdot, 2)} kg/s</b></div>
          <div class="row"><span>Air speed, Q ÷ area</span><b>${fmt(T.v, 2)} m/s</b></div>
          <small>Momentum given to the air each second = ${fmt(T.F, 1)} N. The fan hangs ${fmt((T.F / G) * 1000, 0)} g lighter.</small>`;
      },
    };
    return inst;
  },
};
