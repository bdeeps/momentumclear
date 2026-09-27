// Chapter 5: myths and limits.
// Myth 1, "the heavier vehicle always wins": a 1,200 kg car and a 16 t lorry meet head-on and lock
//   together (the crash() model from the road chapter). By Newton's third law the forces on the two
//   are equal and opposite at every instant; what differs is Δv = F Δt ÷ m. And which way the wreck
//   goes depends on momentum, not mass: a fast car can shove a crawling lorry backwards.
// Myth 2, "momentum and energy are the same thing": two balls with the same momentum, 2 kg·m/s,
//   one of 1 kg at 2 m/s and one n times lighter and n times faster, each hit a 10 kg block of clay
//   on a low-friction trolley and stick. The trolleys move off at almost the same speed (momentum),
//   but the light, fast ball carries n times the kinetic energy (p² ÷ 2m), and nearly all of it goes
//   into squashing clay. Dent depth = energy absorbed ÷ crushing force, with the clay resisting at
//   about 250 N (an illustrative figure for stiff modelling clay). This is 's Gravesande's 1722 test:
//   brass balls dropped into clay made dents in proportion to m v², not m v.
// Teaser, angular momentum: a person on a swivel stool holds a spinning bicycle wheel with its axle
//   upright. Wheel: 700c, I_w ≈ 0.1 kg·m² (as in InertiaClear). Person, stool and wheel held close:
//   I_p ≈ 2 kg·m² about the stool's axis (illustrative, for a seated adult with elbows in).
//   Total vertical angular momentum stays I_w ω_w. Tilt the wheel by θ and its share becomes
//   I_w ω_w cos θ, so the stool must pick up I_w ω_w (1 − cos θ): Ω = I_w ω_w (1 − cos θ) ÷ I_p.
// Light carries momentum: p = E ÷ c for light, so sunlight presses on anything it hits. At 1 AU the
//   solar constant is 1,361 W/m² (NASA/NOAA), giving S ÷ c = 4.54 µPa absorbed, twice that
//   reflected. JAXA's IKAROS (launched 20 May 2010): a 14 m × 14 m sail, 196 m², craft about 315 kg.
//   Ideal mirror thrust at 1 AU: 2 × 4.54 µPa × 196 m² = 1.78 mN; the thrust JAXA measured from its
//   orbit was about 1.12 mN (wrinkles, tilt and imperfect reflection). Sunlight falls off as 1 ÷ r².
import { THREE, M, box, beam, torus, swarm } from '../kit.js';
import {
  G, KMH, TAU, C, board, panelBg, axes, title, bars, line, dot, tag, COL, ticks, fitNarrow, inReel, focusView, force,
  makeCar, makeLorry, makePerson, sphere, disc, fmt, sgn, ke, clamp, approach,
} from '../momentum.js';
import { crash } from './road.js';

const EX = 60, SX = 120, LX = 200;
const P_EN = 2, M_BLOCK = 10, F_CRUSH = 250;
const I_W = 0.1, I_P = 2.0;
const SUN = 1361, SAIL = { side: 14, A: 196, m: 315, measured: 1.12e-3 };
const VIEWS = {
  truck: { pos: [0, 6.2, 19], target: [0, 3.0, 0] },
  energy: { pos: [EX - 1.1, 1.25, 2.7], target: [EX + 0.35, 0.5, 0] },
  spin: { pos: [SX + 0.6, 1.8, 4.8], target: [SX + 0.6, 1.25, 0] },
  light: { pos: [LX - 16, 5, 20], target: [LX + 1, 3, 0] },
};
const REEL = { energy: { pos: [EX + 0.6, 1.8, 3.4], target: [EX + 0.6, 1.5, 0] } };

export function energyMyth(n) {
  const m = [1, 1 / n], v = [P_EN / m[0], P_EN / m[1]];
  return m.map((mm, i) => {
    const E0 = ke(mm, v[i]), vf = P_EN / (mm + M_BLOCK), Ef = ke(mm + M_BLOCK, vf), lost = E0 - Ef;
    return { m: mm, v: v[i], E0, vf, lost, dent: lost / F_CRUSH };
  });
}
export const sailThrust = (au, mirror) => (mirror ? 2 : 1) * (SUN / (au * au) / C) * SAIL.A;

export default {
  id: 'limits',
  short: 'Myths and limits',
  title: 'Myths, spin and the push of light',
  subtitle: 'Who really “wins” a crash, why momentum isn’t energy, spinning momentum, and sunlight that pushes.',
  view: VIEWS.truck,
  learn: `<p><b>Myth: “the heavier vehicle always wins.”</b> In a crash the car pushes the lorry exactly as hard as the lorry pushes the car, at every instant (Newton's third law, see NewtonClear). The forces are <b>equal</b>. What differs is the <b>change in velocity</b>: the same force for the same time changes a light car's speed far more. And the wreck goes whichever way had more <b>momentum</b>, not more mass: a car at 90 km/h can shove a lorry crawling at 5 km/h backwards.</p>
    <p><b>Myth: “momentum and energy are the same thing.”</b> Both depend on mass and speed, but differently: p = m v, and energy = ½ m v² = p² ÷ 2m. Two balls with the same momentum push a block off at the same speed, but a light, fast one carries far more energy and <b>digs a much deeper dent</b>. Momentum decides the shove; energy decides the damage. Leibniz and the Cartesians argued about this for fifty years (see the history).</p>
    <p><b>Spinning things</b> have their own momentum, <b>angular momentum</b>, L = I ω, and it is conserved too. Tip a spinning bicycle wheel over while sitting on a swivel stool and the stool starts to turn, to keep the total the same. A skater pulling in her arms is the same law (InertiaClear).</p>
    <p><b>Light</b> has no mass, yet it carries momentum, p = E ÷ c. Sunlight pushes about 9 micronewtons on every square metre of mirror. Tiny, but it never stops: in 2010 Japan's <b>IKAROS</b> sailed between the planets on sunlight alone.</p>
    <p class="tip"><b>Try it:</b> race a fast car into a slow lorry and see who gets shoved. Make the light ball 10 times lighter and compare the dents. Tip the wheel over on the stool. Then fly the sail closer to the Sun.</p>`,
  terms: [
    { t: 'Third law pair', d: 'Two forces, equal in size and opposite in direction, that two objects exert on each other.' },
    { t: 'Kinetic energy', d: '½ m v², or p² ÷ 2m. For the same momentum, the lighter object has more.' },
    { t: 'Angular momentum', d: 'Momentum of spinning, L = I ω. It stays the same unless a twisting force acts.' },
    { t: 'Radiation pressure', d: 'The tiny push of light on a surface, because light carries momentum, p = E ÷ c.' },
    { t: 'Solar sail', d: 'A huge, thin mirror that uses sunlight’s momentum to push a spacecraft, with no fuel.' },
  ],
  defaults: { focus: 'truck', car: 90, lorry: 5, n: 10, flip: 180, wrpm: 240, au: 1, mirror: true },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'truck', label: 'Who wins?' }, { v: 'energy', label: 'p vs energy' }, { v: 'spin', label: 'Spin' }, { v: 'light', label: 'Light' }] },
    { key: 'car', type: 'range', label: 'Who wins: car speed', min: 0, max: 100, step: 5, ends: ['0', '100 km/h'], fmt: (v) => `${fmt(v, 0)} km/h` },
    { key: 'lorry', type: 'range', label: 'Who wins: lorry speed', min: 0, max: 60, step: 5, ends: ['0', '60 km/h'], fmt: (v) => `${fmt(v, 0)} km/h` },
    { key: 'n', type: 'range', label: 'Energy: the light ball is lighter by', min: 1, max: 20, step: 1, ends: ['same', '20×'], fmt: (v) => `${fmt(v, 0)}× (and ${fmt(v, 0)}× faster)` },
    { key: 'wrpm', type: 'range', label: 'Spin: wheel speed', min: 60, max: 300, step: 10, ends: ['60 rpm', '300 rpm'], fmt: (v) => `${fmt(v, 0)} rpm` },
    { key: 'flip', type: 'range', label: 'Spin: tip the wheel over', min: 0, max: 180, step: 5, ends: ['upright', 'upside down'], fmt: (v) => `${fmt(v, 0)}°` },
    { key: 'au', type: 'range', label: 'Light: distance from the Sun', min: 0.5, max: 1.5, step: 0.05, ends: ['Venus-ish', 'Mars-ish'], fmt: (v) => `${fmt(v, 2)} AU` },
    { key: 'mirror', type: 'toggle', label: 'Light: shiny sail (off = black)' },
    { key: 'go', type: 'buttons', label: 'Run', items: [{ label: '▶ Again', act: (s, inst) => inst.go() }] },
  ],
  onChange(s, key) {
    if (['car', 'lorry'].includes(key)) s.focus = 'truck';
    if (key === 'n') s.focus = 'energy';
    if (['wrpm', 'flip'].includes(key)) s.focus = 'spin';
    if (['au', 'mirror'].includes(key)) s.focus = 'light';
  },
  quiz: [
    { q: 'A car and a lorry crash head-on. Which one feels the bigger force?', options: ['The car', 'The lorry', 'Both feel the same force', 'Whichever was faster'], answer: 2, why: 'They push on each other: a third-law pair, equal and opposite. The car suffers more because the same force changes its smaller mass’s velocity more.' },
    { q: 'Ball A (1 kg, 2 m/s) and ball B (0.1 kg, 20 m/s) have the same momentum. Which has more kinetic energy?', options: ['A', 'B, ten times more', 'The same', 'Neither has energy'], answer: 1, why: 'A: ½ × 1 × 2² = 2 J. B: ½ × 0.1 × 20² = 20 J. Same momentum, ten times the energy, so B makes a much deeper dent.' },
    { q: 'How can light, which has no mass, push a solar sail?', options: ['It can’t; the solar wind does it all', 'Light carries momentum, p = E ÷ c, and hands it to the sail', 'It heats the sail, which expands', 'Gravity from the light'], answer: 1, why: 'Every photon carries momentum. A mirror reverses it, getting twice the push. IKAROS measured about 1.1 millinewtons from sunlight in 2010.' },
  ],
  reel: [
    { ms: 5200, caption: 'Same momentum, very different energy: the light, fast ball digs a ten times deeper dent.', set: { focus: 'energy', n: 10 }, act: (s, inst) => inst.go(), view: REEL.energy, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gT = new THREE.Group(), gE = new THREE.Group(), gS = new THREE.Group(), gL = new THREE.Group(); root.add(gT, gE, gS, gL);
    gE.position.x = EX; gS.position.x = SX; gL.position.x = LX;

    // ------------------------------------------------ who wins
    const roadT = box(60, 0.06, 7, M.matte(0x2b2f36)); roadT.position.y = -0.03; gT.add(roadT);
    const car = makeCar(0x3b82f6), lorry = makeLorry(0xd8332f); lorry.rotation.y = Math.PI; gT.add(car, lorry);
    const fC = force(0xffb547, 0.1, 0.45), fL = force(0xffb547, 0.1, 0.45); gT.add(fC, fL);
    const lC = stage.label('', [0, 2.4, 0], gT), lLo = stage.label('', [0, 4.2, 0], gT), lF = stage.label('', [0, 5.2, 0], gT, 'hot');

    // ------------------------------------------------ same momentum, different energy
    const lanes = [-0.35, 0.35];
    const trackE = box(3.4, 0.03, 1.3, M.matte(0x2b2f36)); trackE.position.set(0.4, 0.015, 0); gE.add(trackE);
    const blocks = lanes.map((z) => {
      const g = new THREE.Group(); g.position.set(0.3, 0, z); gE.add(g);
      const cart = box(0.5, 0.08, 0.3, M.plastic(0x5a616e)); cart.position.y = 0.09; g.add(cart);
      for (const x of [-0.18, 0.18]) for (const zz of [-0.14, 0.14]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), M.matte(0x16181d)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.04, zz); g.add(w); }
      const clayB = box(0.4, 0.3, 0.26, M.matte(0x9c6b4b)); clayB.position.y = 0.28; g.add(clayB);
      const dent = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24), M.matte(0x3a2518)); dent.rotation.z = Math.PI / 2; g.add(dent);
      g.dent = dent; return g;
    });
    const bullets = [sphere(0.06, M.metal(0x9c7a3c)), sphere(0.03, M.metal(0xc9ced8))];
    bullets.forEach((b, i) => { b.position.z = lanes[i]; gE.add(b); });
    const lE = [stage.label('', [0, 0.8, lanes[0]], gE), stage.label('', [0, 0.8, lanes[1]], gE, 'hot')];

    // ------------------------------------------------ swivel stool and bicycle wheel
    const baseS = disc(0.3, 0.04, M.metal(0x3a3f4b)); baseS.position.y = 0.02; gS.add(baseS);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12), M.metal(0xc9ced8)); post.position.y = 0.25; gS.add(post);
    const spinner = new THREE.Group(); gS.add(spinner);
    const seatS = disc(0.22, 0.06, M.matte(0x22262e)); seatS.position.y = 0.5; spinner.add(seatS);
    const sitter = makePerson({ shirt: 0x7be08c, pants: 0x2b3242, skin: 0xc68b64 }); sitter.pose({ arm: 1.3, sit: Math.PI / 2 }); sitter.position.set(-0.15, 0.53 - 0.92, 0); spinner.add(sitter);
    const holder = new THREE.Group(); holder.position.set(0.5, 1.15, 0); spinner.add(holder);
    const wheel = new THREE.Group(); holder.add(wheel);
    wheel.add(torus(0.33, 0.016, M.matte(0x16181d), 64));
    wheel.add(torus(0.31, 0.012, M.metal(0xc9ced8), 64));
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; wheel.add(beam([0, 0, 0], [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0], 0.0025, M.metal(0xc9ced8), 6)); }
    const mark = box(0.1, 0.04, 0.03, M.plastic(0xff7a59)); mark.position.set(0, 0.31, 0); wheel.add(mark);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 12), M.metal(0x8c95a3)); axle.rotation.x = Math.PI / 2; holder.add(axle);
    const Lw = force(0xffb547, 0.03, 0.14), Lp = force(0x7be08c, 0.04, 0.16); gS.add(Lw, Lp);
    const lS = stage.label('', [0, 2.3, 0], gS, 'hot');

    // ------------------------------------------------ solar sail in sunlight
    const sail = new THREE.Group(); sail.position.set(0, 3, 0); gL.add(sail);
    const film = new THREE.Mesh(new THREE.PlaneGeometry(SAIL.side, SAIL.side), M.metal(0xd9dde4, { roughness: 0.25, side: THREE.DoubleSide }));
    film.rotation.y = Math.PI / 2; sail.add(film);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 24), M.plastic(0xc9a24a)); hub.rotation.z = Math.PI / 2; hub.position.x = 0.5; sail.add(hub);
    for (const [y, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) sail.add(beam([0.1, 0, 0], [0.1, y * 7, z * 7], 0.04, M.matte(0x3a3f4b)));
    sail.rotation.x = Math.PI / 4;
    const N_PH = 220, photons = swarm(N_PH, new THREE.SphereGeometry(0.12, 6, 4), M.glow(0xffe08a)); photons.castShadow = false; gL.add(photons);
    const N_ST = 160, starsL = swarm(N_ST, new THREE.SphereGeometry(0.08, 5, 3), M.glow(0xffffff)); starsL.castShadow = false; gL.add(starsL);
    for (let i = 0; i < N_ST; i++) starsL.place(i, [((i * 97.3) % 90) - 60, ((i * 53.7) % 40) - 12, -20 - ((i * 31.1) % 30)]);
    starsL.done();
    const sun = sphere(3, M.glow(0xffd36b), 32); sun.position.set(-34, 5, -8); gL.add(sun);
    const push = force(0x7be08c, 0.2, 1.0); gL.add(push);
    const lSail = stage.label('', [0, 12, 0], gL, 'hot');

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'truck') {
        const c = crash('car', 'truck', cur.car / KMH, cur.lorry / KMH);
        title(g, 'Equal forces, unequal Δv', 'car vs a 16 t lorry, head-on');
        const k = 1000;
        bars(g, { x0: 40, x1: w - 30, y0: 330, y1: 110, max: Math.max(1, c.F / k) * 1.2, dp: 0, zeroMid: false, groups: [
          { name: 'force, kN (average)', bars: [{ v: c.F / k, col: '#5b9bff', label: 'on car' }, { v: c.F / k, col: '#ff7a59', label: 'on lorry' }] },
          { name: 'Δv, km/h', bars: [{ v: Math.abs(c.dL) * KMH, col: '#5b9bff', label: 'car', dim: true }, { v: Math.abs(c.dR) * KMH, col: '#ff7a59', label: 'lorry', dim: true }] },
        ] });
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText('(both groups on one scale: kN and km/h)', 40, 395);
        g.font = 'bold 21px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText('Momentum before, kg·m/s', 24, 450);
        const pc = c.mL * (cur.car / KMH), pl = c.mR * (cur.lorry / KMH), mx = Math.max(pc, pl, 1);
        [['car →', pc, '#5b9bff'], ['← lorry', pl, '#ff7a59']].forEach(([nm, p, col], i) => {
          const y = 495 + i * 52; g.fillStyle = col; g.fillRect(150, y - 24, Math.max(3, (p / mx) * 300), 32);
          g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(nm, 24, y);
          g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(fmt(p, 0), 160 + (p / mx) * 300, y);
        });
        g.font = '18px sans-serif'; g.fillStyle = COL.v;
        g.fillText(Math.abs(c.v) < 0.01 ? 'Momenta cancel: the wreck stops dead.' : c.v > 0 ? 'The car had more momentum: it shoves the lorry back.' : 'The lorry had more momentum: the wreck goes its way.', 24, h - 24);
        return;
      }
      if (cur.focus === 'energy') {
        const R = energyMyth(cur.n);
        title(g, 'Same momentum, different energy', `both balls carry ${P_EN} kg·m/s`);
        bars(g, { x0: 40, x1: w - 30, y0: 330, y1: 110, max: Math.max(...R.map((r) => r.E0)) * 1.2, dp: 1, zeroMid: false, groups: [
          { name: 'momentum, kg·m/s', bars: R.map((r, i) => ({ v: P_EN, col: i ? '#ff7a59' : '#5b9bff', label: i ? 'light' : 'heavy' })) },
          { name: 'energy, J', bars: R.map((r, i) => ({ v: r.E0, col: i ? '#ff7a59' : '#5b9bff', label: i ? 'light' : 'heavy' })) },
        ] });
        g.font = 'bold 21px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText('What happens to each block', 24, 440);
        R.forEach((r, i) => {
          g.font = '18px sans-serif'; g.fillStyle = i ? '#ff7a59' : '#5b9bff';
          g.fillText(`${i ? 'light' : 'heavy'}: ${fmt(r.m, r.m < 0.1 ? 2 : 1)} kg at ${fmt(r.v, 0)} m/s → trolley ${fmt(r.vf * 100, 1)} cm/s, dent ${fmt(r.dent * 1000, 0)} mm`, 24, 485 + i * 40);
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)';
        g.fillText('Momentum sets the shove. Energy sets the damage.', 24, h - 50);
        g.fillText('’s Gravesande saw this with brass balls in clay, 1722.', 24, h - 24);
        return;
      }
      if (cur.focus === 'spin') {
        const w0 = (cur.wrpm / 60) * TAU, L = I_W * w0, th = (cur.flip * Math.PI) / 180;
        title(g, 'Angular momentum stays the same', 'upwards is +, kg·m²/s');
        bars(g, { x0: 40, x1: w - 30, y0: 420, y1: 110, max: 2 * L * 1.15, dp: 2, groups: [
          { name: 'wheel upright', bars: [{ v: L, col: COL.a, label: 'wheel' }, { v: 0, col: COL.v, label: 'you' }, { v: L, col: COL.s, label: 'total' }] },
          { name: `tipped ${fmt(cur.flip, 0)}°`, bars: [{ v: L * Math.cos(th), col: COL.a, label: 'wheel' }, { v: L * (1 - Math.cos(th)), col: COL.v, label: 'you' }, { v: L, col: COL.s, label: 'total' }] },
        ] });
        const Om = (L * (1 - Math.cos(th))) / I_P;
        g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
        g.fillText(`You and the stool turn at ${fmt((Om * 60) / TAU, 0)} rpm the other way round`, 24, h - 56);
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('A skater pulling her arms in: same law (InertiaClear).', 24, h - 24);
        return;
      }
      title(g, 'Sunlight’s push on a 196 m² sail', 'millinewtons, falls off as 1 ÷ distance²');
      const A = axes(g, w, h, { x0: 100, y0: h - 130, y1: 90, xMin: 0.5, xMax: 1.5, yMax: 8, xTicks: [0.5, 0.75, 1, 1.25, 1.5], yTicks: [0, 2, 4, 6, 8], xFmt: (q) => q + ' AU', yFmt: (q) => q + ' mN' });
      [[true, COL.a, 'mirror'], [false, 'rgba(255,255,255,.45)', 'black']].forEach(([mir, col, nm]) => {
        const pts = []; for (let r = 0.5; r <= 1.5001; r += 0.02) pts.push([r, sailThrust(r, mir) * 1000]);
        line(g, pts, A.X, A.Y, col, mir === cur.mirror ? 5 : 2);
        tag(g, nm, A.X(1.3), A.Y(sailThrust(1.3, mir) * 1000) - 10, col, '17px sans-serif');
      });
      dot(g, A.X(cur.au), A.Y(sailThrust(cur.au, cur.mirror) * 1000), COL.a, 11);
      g.fillStyle = COL.v; dot(g, A.X(1), A.Y(SAIL.measured * 1000), COL.v, 7);
      tag(g, 'IKAROS measured ≈ 1.12 mN', A.X(1) + 14, A.Y(SAIL.measured * 1000) + 26, COL.v, '16px sans-serif');
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)';
      g.fillText('Ideal values; a real sail wrinkles and tilts, so it gets less.', 24, h - 56);
      g.fillText('A mirror gets twice the push: the light bounces back.', 24, h - 26);
    }, [0, 0, 0]);
    const BOARD = { truck: [5.4, 6.2, -2.5, 3.2], energy: [EX + 1.45, 1.25, -0.9, 0.7], spin: [SX + 1.9, 1.4, -0.8, 0.9], light: [LX - 2, 3.5, 10, 3] };

    const st = {};
    let t = 0, key = '', lastCk = '', flipNow = 0, yaw = 0, wAng = 0;
    const inst = {
      go() { t = 0; },
      dispose() { stage.floor.visible = true; },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lC, lLo, lS, lSail]);
        const f = s.focus, reel = inReel();
        gT.visible = f === 'truck'; gE.visible = f === 'energy'; gS.visible = f === 'spin'; gL.visible = f === 'light';
        stage.floor.visible = f !== 'light';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel && f === 'energy' ? [EX + 0.6, 2.3, -0.8] : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel && f === 'energy' ? 0.95 : B[3]);
        chart.mesh.rotation.y = reel ? 0 : f === 'energy' ? -0.45 : f === 'light' ? -0.67 : 0;
        chart.mesh.visible = reel || !narrow;
        const k = `${f}|${s.car}|${s.lorry}|${s.n}|${s.wrpm}|${s.flip}|${s.au}|${s.mirror}`;
        if (k !== key) { if (key && !reel && f !== 'spin') inst.go(); key = k; }
        t += dt;

        if (f === 'truck') {
          const uC = s.car / KMH, uL = s.lorry / KMH, c = crash('car', 'truck', uC, uL);
          const ts = t * 0.45, tc = 1.2, hit = ts >= tc;
          let xc, xl;
          if (!hit) { xc = -uC * (tc - ts); xl = uL * (tc - ts); }
          else { const a = 0.7 * G, T = Math.abs(c.v) / a, q = Math.min(ts - tc, T), d = Math.abs(c.v) * q - 0.5 * a * q * q; xc = xl = Math.sign(c.v) * d; }
          car.position.x = xc - 2.16 + (hit ? 0.25 : 0); lorry.position.x = xl + 3.45 - (hit ? 0.25 : 0);
          const fl = hit && ts < tc + 0.35 && uC + uL > 0;
          fC.aim([xc - 0.3, 1.0, 1.5], [-1, 0, 0], fl ? 2.2 : 0.01); fL.aim([xl + 0.3, 1.0, 1.5], [1, 0, 0], fl ? 2.2 : 0.01);
          lC.position.set(car.position.x, 2.2, 0); lLo.position.set(lorry.position.x, 3.9, 0);
          lC.element.innerHTML = `car 1,200 kg · <b>${sgn((hit ? c.v : uC) * KMH, 0)} km/h</b>`;
          lLo.element.innerHTML = `lorry 16 t · <b>${sgn((hit ? c.v : -uL) * KMH, 0)} km/h</b>`;
          lF.position.set(xc, 5.0, 0); lF.visible = fl; lF.element.innerHTML = `equal forces: ${fmt(c.F / 1000, 0)} kN each way`;
          if (ts > tc + 4) t = 0;
        } else if (f === 'energy') {
          const R = energyMyth(s.n), ts = t * 0.5, start = 1.2;
          R.forEach((r, i) => {
            const vis = Math.min(3, r.v) * 0.5 + 0.2;                     // shown speed: slowed, and capped so both can be followed
            const tc = start / vis, hit = ts >= tc, g = blocks[i], face = 0.3 - 0.2;
            const tau = Math.max(0, ts - tc), dx = hit ? r.vf * tau * 4 : 0;           // trolley drift, exaggerated 4×
            g.position.x = 0.3 + Math.min(1.2, dx);
            const rad = i ? 0.03 : 0.06, depth = hit ? Math.min(0.2, r.dent) * Math.min(1, tau * 8) : 0;
            bullets[i].position.set(hit ? g.position.x - 0.2 + depth - rad * 0.2 : face - start + vis * ts - rad, 0.3, lanes[i]);
            g.dent.visible = hit; g.dent.scale.set(Math.max(0.002, depth), rad * 1.3, rad * 1.3); g.dent.position.set(-0.2 + depth / 2 - 0.001, 0.3, 0);
            lE[i].position.set(g.position.x + 0.1, 0.62 - i * 0.5, lanes[i] + i * 0.2);
            lE[i].element.innerHTML = `${fmt(r.m, r.m < 0.1 ? 2 : 1)} kg at ${fmt(r.v, 0)} m/s · ${hit ? `dent <b>${fmt(r.dent * 1000, 0)} mm</b>` : `${fmt(r.E0, 1)} J`}`;
          });
          if (ts > 7) t = 0;
        } else if (f === 'spin') {
          const w0 = (s.wrpm / 60) * TAU, L = I_W * w0;
          flipNow = approach(flipNow, (s.flip * Math.PI) / 180, 1.5, dt);
          const Om = (L * (1 - Math.cos(flipNow))) / I_P;
          yaw -= Om * dt; wAng += w0 * dt * 0.25;          // wheel shown 4× slower
          spinner.rotation.y = yaw;
          holder.rotation.set(0, 0, 0); holder.rotateX(-Math.PI / 2 + flipNow);  // axle starts pointing up (axle is along the wheel's z)
          wheel.rotation.z = wAng;
          Lw.aim([0.9, 1.15, 0.5], [0, Math.cos(flipNow) >= 0 ? 1 : -1, 0], 0.05 + Math.abs(L * Math.cos(flipNow)) * 0.35);
          Lp.aim([-0.7, 0.1, 0], [0, 1, 0], 0.05 + L * (1 - Math.cos(flipNow)) * 0.35);
          lS.position.set(0.9, 0.25, 0.5);
          lS.element.innerHTML = `stool: <b>${fmt((Om * 60) / TAU, 0)} rpm</b>`;
        } else {
          const F = sailThrust(s.au, s.mirror), sc = 1 / (s.au * s.au);
          sun.scale.setScalar(Math.min(1.8, 1 / s.au));
          // Photons stream in from the Sun's side and, off a mirror, bounce back.
          for (let i = 0; i < N_PH; i++) {
            const ph = ((i * 0.618 + time * 0.35) % 1), yz = [((i * 0.3819) % 1) * 12 - 6, ((i * 0.7548) % 1) * 12 - 6];
            const inb = ph < 0.6, x = inb ? -24 + (ph / 0.6) * 24 : -(((ph - 0.6) / 0.4) * 18);
            const vis = (i / N_PH) < 0.25 + 0.5 * Math.min(1, sc / 2.5) && (inb || s.mirror);
            photons.place(i, [x, 3 + yz[0] * 0.8, yz[1] * 0.8], null, vis ? 1 : 0.001);
          }
          photons.done();
          push.aim([2, 3, 0], [1, 0, 0], 2 + F * 2500);
          lSail.position.set(6, -2.5, 6);
          lSail.element.innerHTML = `sunlight pushes <b>${fmt(F * 1000, 2)} mN</b>`;
        }
        cur = { focus: f, car: s.car, lorry: s.lorry, n: s.n, wrpm: s.wrpm, flip: s.flip, au: s.au, mirror: s.mirror };
        if (k !== lastCk) { lastCk = k; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'truck') {
          const c = crash('car', 'truck', s.car / KMH, s.lorry / KMH);
          return `<div class="big">Both feel ${fmt(c.F / 1000, 0)} kN</div>
            <div class="row"><span>Car's Δv · lorry's Δv</span><b>${fmt(Math.abs(c.dL) * KMH, 0)} · ${fmt(Math.abs(c.dR) * KMH, 0)} km/h</b></div>
            <div class="row"><span>Mass ratio</span><b>lorry ${fmt(16000 / 1200, 1)}× heavier</b></div>
            <div class="row"><span>Wreck moves</span><b>${Math.abs(c.v) < 0.01 ? 'nowhere' : `${fmt(Math.abs(c.v) * KMH, 0)} km/h ${c.v > 0 ? 'the car’s way' : 'the lorry’s way'}`}</b></div>
            <small>Heavier doesn't “hit harder”. It just changes speed less for the same force.</small>`;
        }
        if (f === 'energy') {
          const R = energyMyth(s.n);
          return `<div class="big">Same p, ${fmt(R[1].E0 / R[0].E0, 0)}× the energy</div>
            <div class="row"><span>Heavy: 1 kg × 2 m/s</span><b>2 kg·m/s · ${fmt(R[0].E0, 1)} J</b></div>
            <div class="row"><span>Light: ${fmt(R[1].m, 2)} kg × ${fmt(R[1].v, 0)} m/s</span><b>2 kg·m/s · ${fmt(R[1].E0, 1)} J</b></div>
            <div class="row"><span>Dents in the clay</span><b>${fmt(R[0].dent * 1000, 0)} mm vs ${fmt(R[1].dent * 1000, 0)} mm</b></div>
            <small>Kinetic energy = p² ÷ 2m: for the same momentum, the lighter ball carries more.</small>`;
        }
        if (f === 'spin') {
          const w0 = (s.wrpm / 60) * TAU, L = I_W * w0, th = (s.flip * Math.PI) / 180, Om = (L * (1 - Math.cos(th))) / I_P;
          return `<div class="big">Stool turns at ${fmt((Om * 60) / TAU, 0)} rpm</div>
            <div class="row"><span>Wheel's L = I ω</span><b>${fmt(I_W, 1)} × ${fmt(w0, 1)} = ${fmt(L, 2)} kg·m²/s</b></div>
            <div class="row"><span>Wheel's upward share now</span><b>${sgn(L * Math.cos(th), 2)}</b></div>
            <div class="row"><span>Yours, to keep the total</span><b>${fmt(L * (1 - Math.cos(th)), 2)}</b></div>
            <small>Turn the wheel over and you must pick up twice its angular momentum.</small>`;
        }
        const F = sailThrust(s.au, s.mirror), a = F / SAIL.m;
        return `<div class="big">Push ${fmt(F * 1000, 2)} mN, ideal</div>
          <div class="row"><span>Sunlight here</span><b>${fmt(SUN / (s.au * s.au), 0)} W/m²</b></div>
          <div class="row"><span>Pressure, ${s.mirror ? '2' : '1'} × S ÷ c</span><b>${fmt(((s.mirror ? 2 : 1) * SUN) / (s.au * s.au) / C * 1e6, 2)} µPa</b></div>
          <div class="row"><span>On 315 kg: speed gained per day · per year</span><b>${fmt(a * 86400, 2)} m/s · ${fmt(a * 86400 * 365, 0)} m/s</b></div>
          <small>The weight of just ${fmt((F / G) * 1000, 2)} g, but it never runs out. IKAROS measured ≈ 1.12 mN.</small>`;
      },
    };
    return inst;
  },
};
