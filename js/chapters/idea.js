// Chapter 1: momentum, p = m × v, as a live experiment on a lab track.
// Two dynamics trolleys (1 kg each, plus 1 kg brass blocks, like a school dynamics kit) roll on a
// low-friction track. Friction is small over a couple of metres and is ignored.
// Elastic: magnet bumpers push the carts apart without touching, so almost no energy is lost. Real
//   magnetic bumpers give a coefficient of restitution of about 0.9–0.95; e = 1 is shown here.
// Sticky: Velcro pads grab and the carts move off together (perfectly inelastic, e = 0).
// Explosive: a compressed spring plunger is released between two carts at rest. The spring's stored
//   energy E becomes the carts' kinetic energy: vA = −√(2E mB ÷ (mA (mA + mB))), vB = +√(2E mA ÷ (mB (mA + mB))),
//   which keeps the total momentum at zero.
// Momentum p = m v in kg·m/s; kinetic energy ½ m v² in joules. collide1D() in momentum.js gives the
// after-velocities for any e: (m1u1 + m2u2 + m2 e (u2 − u1)) ÷ (m1 + m2), and the mirror for cart 2.
import { THREE, M, box, spring } from '../kit.js';
import {
  board, panelBg, title, bars, tag, COL, fitNarrow, inReel, force, makeCart, collide1D, ke, fmt, sgn, CART_KG,
} from '../momentum.js';

const HL = 0.27;                        // half the cart length plus its bumper, m
const X0 = [-1.0, 0.2];                 // starting centres for a collision
const XE = [-0.3, 0.3];                // starting centres for the spring release
const END = 1.72;                       // the run stops when a cart reaches the end of the track
const RELEASE = 0.6;                    // s before the spring lets go
const BLUE = '#5b9bff', ORANGE = '#ff7a59';
const VIEW = { pos: [0.2, 1.3, 4.8], target: [0.2, 0.78, 0] };
const REEL = { pos: [0, 2.3, 4.2], target: [0, 1.9, 0] };
const MODES = { elastic: { e: 1, name: 'Elastic (magnets)' }, sticky: { e: 0, name: 'Sticky (Velcro)' }, explode: { e: null, name: 'Explosive (spring)' } };

// Everything about one run: velocities before and after, and when they meet.
export function plan(s) {
  const m = [s.mA, s.mB];
  if (s.mode === 'explode') {
    const M_ = m[0] + m[1];
    const v = [-Math.sqrt((2 * s.E * m[1]) / (m[0] * M_)), Math.sqrt((2 * s.E * m[0]) / (m[1] * M_))];
    return { m, u: [0, 0], v, tc: RELEASE, x0: XE, meet: true };
  }
  const u = [s.vA, s.vB], gap = X0[1] - X0[0] - 2 * HL;
  const meet = u[0] > u[1] + 1e-6, tc = meet ? gap / (u[0] - u[1]) : Infinity;
  const v = meet ? collide1D(m[0], u[0], m[1], u[1], MODES[s.mode].e) : u.slice();
  return { m, u, v, tc, x0: X0, meet };
}
const sums = (P) => {
  const pB = P.m[0] * P.u[0] + P.m[1] * P.u[1], pA = P.m[0] * P.v[0] + P.m[1] * P.v[1];
  const kB = ke(P.m[0], P.u[0]) + ke(P.m[1], P.u[1]), kA = ke(P.m[0], P.v[0]) + ke(P.m[1], P.v[1]);
  return { pB, pA, kB, kA };
};

export default {
  id: 'idea',
  short: 'p = m × v',
  title: 'Momentum: mass on the move',
  subtitle: 'Crash two carts together, stick them, or spring them apart. The total momentum never changes.',
  view: VIEW,
  learn: `<p>A rolling cart is hard to stop for two reasons: it is <b>heavy</b>, or it is <b>fast</b>. Momentum puts both into one number: <b>p = m × v</b>, mass times velocity. Its SI unit is the <b>kilogram metre per second</b> (kg·m/s), and it has a <b>direction</b>: here, rightwards is plus and leftwards is minus.</p>
    <p>To <b>measure</b> it, weigh the cart on a scale for m, time it between two light gates for v, and multiply. A 2 kg cart at 1.5 m/s has 3 kg·m/s. So does a 1 kg cart at 3 m/s.</p>
    <p>Now the magic. When two things collide, whatever momentum one loses, the other gains, because they push on each other equally hard for exactly the same time (Newton's third law, see NewtonClear). So the <b>total momentum is conserved</b>: the same before and after, every time.</p>
    <p><b>Energy</b> is different. Bouncy magnets keep the kinetic energy (<b>elastic</b>). Velcro grabs, and some of it turns into heat and sound (<b>inelastic</b>). A spring adds energy from nothing moving at all. Momentum is kept in all three.</p>
    <p class="tip"><b>Try it:</b> send a cart into an equal one at rest with magnets: they swap speeds. Switch to Velcro and watch the energy bar drop while the momentum bars stay put. Then fire the spring and see two carts share zero momentum.</p>`,
  terms: [
    { t: 'Momentum (p)', d: 'Mass times velocity, p = m v, in kg·m/s. It has a direction, like velocity.' },
    { t: 'Conservation of momentum', d: 'In a collision or explosion with no outside push, the total momentum before equals the total after.' },
    { t: 'Elastic collision', d: 'A bounce that keeps all the kinetic energy, like hard magnets or steel balls, near enough.' },
    { t: 'Inelastic collision', d: 'A collision that turns some kinetic energy into heat, sound and dents. Sticky ones lose the most.' },
    { t: 'Kinetic energy', d: 'The energy of motion, ½ m v², in joules. Not the same as momentum.' },
  ],
  defaults: { mode: 'elastic', mA: 2, vA: 1.5, mB: 2, vB: 0, E: 4 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Bumpers', options: [{ v: 'elastic', label: 'Magnets' }, { v: 'sticky', label: 'Velcro' }, { v: 'explode', label: 'Spring apart' }] },
    { key: 'mA', type: 'range', label: 'Blue cart: mass', min: 1, max: 5, step: 1, ends: ['1 kg', '5 kg'], fmt: (v) => `${fmt(v, 0)} kg` },
    { key: 'vA', type: 'range', label: 'Blue cart: velocity', min: -1, max: 2.5, step: 0.1, ends: ['← 1 m/s', '2.5 m/s →'], fmt: (v) => `${sgn(v)} m/s` },
    { key: 'mB', type: 'range', label: 'Orange cart: mass', min: 1, max: 5, step: 1, ends: ['1 kg', '5 kg'], fmt: (v) => `${fmt(v, 0)} kg` },
    { key: 'vB', type: 'range', label: 'Orange cart: velocity', min: -2.5, max: 1, step: 0.1, ends: ['← 2.5 m/s', '1 m/s →'], fmt: (v) => `${sgn(v)} m/s` },
    { key: 'E', type: 'range', label: 'Spring: energy stored', min: 0.5, max: 10, step: 0.5, ends: ['0.5 J', '10 J'], fmt: (v) => `${fmt(v)} J` },
    { key: 'go', type: 'buttons', label: 'Run', items: [
      { label: '▶ Run again', act: (s, inst) => inst.go() },
      { label: 'Equal carts', act: (s, inst) => { Object.assign(s, { mode: 'elastic', mA: 2, vA: 1.5, mB: 2, vB: 0 }); inst.go(); } },
      { label: 'Head-on', act: (s, inst) => { Object.assign(s, { mode: 'sticky', mA: 3, vA: 1.2, mB: 1, vB: -2 }); inst.go(); } },
    ] },
  ],
  onChange(s, key) { if (key === 'E') s.mode = 'explode'; if (['vA', 'vB'].includes(key) && s.mode === 'explode') s.mode = 'elastic'; },
  quiz: [
    { q: 'Which has more momentum: a 2 kg cart at 3 m/s or a 3 kg cart at 2 m/s?', options: ['The 2 kg cart', 'The 3 kg cart', 'They are equal', 'You need to know the energy'], answer: 2, why: 'p = m v: 2 × 3 = 6 kg·m/s and 3 × 2 = 6 kg·m/s. Same momentum, different mixes of mass and speed.' },
    { q: 'A 1 kg cart at 4 m/s hits a 3 kg cart at rest and they stick. How fast do they move off?', options: ['4 m/s', '1 m/s', '1.33 m/s', '0 m/s'], answer: 1, why: 'Momentum before is 1 × 4 = 4 kg·m/s. Afterwards 4 kg carry it, so v = 4 ÷ 4 = 1 m/s.' },
    { q: 'In the sticky collision above, what happens to the kinetic energy?', options: ['It is all kept', 'Some turns into heat and sound', 'It doubles', 'It becomes momentum'], answer: 1, why: 'Before: ½ × 1 × 4² = 8 J. After: ½ × 4 × 1² = 2 J. Momentum is kept; 6 J of energy went into heat, sound and squashed Velcro.' },
  ],
  reel: [
    { ms: 5200, caption: 'Momentum is mass times velocity. Hit an equal cart and they swap: momentum passes straight across.', set: { mode: 'elastic', mA: 2, vA: 1.5, mB: 2, vB: 0 }, act: (s, inst) => inst.go(), view: REEL, spin: 0 },
    { ms: 5200, caption: 'Make them stick: the total momentum is exactly the same, but kinetic energy is lost as heat.', set: { mode: 'sticky', mA: 3, vA: 1.2, mB: 1, vB: -2 }, act: (s, inst) => inst.go(), view: REEL, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);

    // ------------------------------------------------ track and carts
    const track = box(4.0, 0.03, 0.5, M.matte(0x2b2f36)); track.position.set(0, 0.015, 0); root.add(track);
    for (const x of [-2.0, 2.0]) { const stop = box(0.05, 0.12, 0.5, M.matte(0x5a616e)); stop.position.set(x, 0.07, 0); root.add(stop); }
    for (let x = -1.8; x <= 1.8001; x += 0.2) { const t = box(0.006, 0.004, 0.5, M.matte(Math.abs(x % 1) < 0.01 || Math.abs(x % 1) > 0.99 ? 0xe8e2c8 : 0x5a616e)); t.position.set(x, 0.032, 0); root.add(t); }
    for (let x = -1; x <= 1; x += 1) stage.label(`${x} m`, [x, 0.04, 0.42], root, 'small');
    // Light gates: a pair of posts either side of the collision point.
    for (const x of [-0.55, 0.95]) for (const z of [-0.28, 0.28]) { const p = box(0.03, 0.42, 0.03, M.matte(0x3a3f4b)); p.position.set(x, 0.21, z); root.add(p); if (z > 0) { const eye = box(0.04, 0.03, 0.04, M.glow(0xff3b30)); eye.position.set(x, 0.3, z); root.add(eye); } }
    const carts = [makeCart(0x3b82f6), makeCart(0xff7a59)];
    carts.forEach((c) => root.add(c));
    // Bumpers: magnets, Velcro pads, or a spring plunger on the blue cart.
    const magA = box(0.03, 0.07, 0.16, M.plastic(0xd8332f)), magB = box(0.03, 0.07, 0.16, M.plastic(0xd8332f));
    magA.position.set(0.265, 0.12, 0); carts[0].add(magA); magB.position.set(-0.265, 0.12, 0); carts[1].add(magB);
    const velA = box(0.02, 0.08, 0.18, M.matte(0x22262e)), velB = box(0.02, 0.08, 0.18, M.matte(0x22262e));
    velA.position.set(0.26, 0.12, 0); carts[0].add(velA); velB.position.set(-0.26, 0.12, 0); carts[1].add(velB);
    const spr = spring(0, 1, 0.035, 0.006, 7, M.metal(0xc9ced8)); spr.position.set(0.25, 0.12, 0); carts[0].add(spr);
    const plate = box(0.01, 0.09, 0.09, M.metal(0x8c95a3)); carts[0].add(plate);
    const arrows = [force(0x5b9bff, 0.025, 0.1), force(0xff7a59, 0.025, 0.1)]; arrows.forEach((a) => root.add(a));
    const lab = [stage.label('', [0, 0.72, 0], root), stage.label('', [0, 0.72, 0], root)];
    const lBang = stage.label('', [0, 0.95, 0], root, 'hot');

    // ------------------------------------------------ the bar-chart board
    let cur = null;
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { P, S, done } = cur;
      title(g, 'Momentum, p = m v', 'kg·m/s · right is +, left is −');
      const pm = Math.max(2, ...P.u.map((u, i) => Math.abs(u * P.m[i])), ...P.v.map((v, i) => Math.abs(v * P.m[i])), Math.abs(S.pB)) * 1.15;
      bars(g, { x0: 40, x1: w - 30, y0: 330, y1: 96, max: pm, dp: 1, groups: [
        { name: 'before', bars: [{ v: P.m[0] * P.u[0], col: BLUE, label: 'blue' }, { v: P.m[1] * P.u[1], col: ORANGE, label: 'orange' }, { v: S.pB, col: COL.v, label: 'total' }] },
        { name: 'after', bars: [{ v: P.m[0] * P.v[0], col: BLUE, label: 'blue', dim: !done }, { v: P.m[1] * P.v[1], col: ORANGE, label: 'orange', dim: !done }, { v: S.pA, col: COL.v, label: 'total', dim: !done }] },
      ] });
      g.save(); g.translate(0, 360);
      title(g, 'Kinetic energy, ½ m v²', 'joules');
      const km = Math.max(1, S.kB, S.kA) * 1.2;
      const diff = S.kA - S.kB;
      bars(g, { x0: 60, x1: w - 60, y0: 250, y1: 90, max: km, dp: 2, zeroMid: false, groups: [
        { name: '', bars: [{ v: S.kB, col: COL.a, label: 'before' }, { v: S.kA, col: COL.a, label: 'after', dim: !done }] },
      ] });
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
      g.fillText(Math.abs(diff) < 0.005 ? 'All the energy is kept.' : diff < 0 ? `${fmt(-diff, 2)} J lost as heat and sound` : `${fmt(diff, 2)} J released by the spring`, 60, 290);
      g.restore();
    }, [2.95, 1.0, -0.7]);
    chart.mesh.scale.setScalar(0.78);
    chart.mesh.rotation.y = -0.25;

    let t = 0, running = true, key = '', P = plan({ mode: 'elastic', mA: 2, vA: 1.5, mB: 2, vB: 0, E: 4 }), lastCk = '', tStop = 99;
    const pos = (i, tt) => (tt < P.tc ? P.x0[i] + P.u[i] * tt : P.x0[i] + P.u[i] * P.tc + P.v[i] * (tt - P.tc));
    const inst = {
      go() { t = 0; running = true; tStop = 99; },
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lab[0], lab[1]]);
        const reel = inReel();
        chart.mesh.position.set(...(reel ? [0, 3.3, -0.6] : narrow ? [0, 2.0, -0.8] : [1.35, 1.42, -0.7]));
        chart.mesh.scale.setScalar(reel ? 1.5 : narrow ? 0.9 : 0.66);
        chart.mesh.rotation.y = 0;
        chart.mesh.visible = reel || !narrow;              // on a phone the readout already says it
        const k = `${s.mode}|${s.mA}|${s.vA}|${s.mB}|${s.vB}|${s.E}`;
        if (k !== key) { key = k; P = plan(s); inst.go(); }
        if (running) {
          t += dt;
          const xs = [pos(0, t), pos(1, t)];
          if (Math.abs(xs[0]) > END || Math.abs(xs[1]) > END || (t > P.tc + 0.2 && Math.abs(P.v[0]) + Math.abs(P.v[1]) < 1e-3) || t > (P.meet ? P.tc + 4 : 3)) { running = false; tStop = t; }
        }
        const tt = Math.min(t, tStop);
        const done = tt >= P.tc;
        carts.forEach((c, i) => {
          const x = Math.max(-END - 0.1, Math.min(END + 0.1, pos(i, tt))), prev = c.position.x;
          c.position.set(x, 0.03, 0); c.roll(x - prev); c.setLoad(P.m[i] - CART_KG);
          const v = done ? P.v[i] : P.u[i], p = P.m[i] * v;
          arrows[i].aim([x, 0.5 + 0.02 * i, 0], [Math.sign(v) || 1, 0, 0], Math.abs(p) * 0.12);
          lab[i].position.set(x, 0.62 + 0.2 * i, 0);
          lab[i].element.innerHTML = `${fmt(P.m[i], 0)} kg × ${sgn(v)} m/s = <b>${sgn(p)}</b>`;
        });
        magA.visible = magB.visible = s.mode === 'elastic';
        velA.visible = velB.visible = s.mode === 'sticky';
        const ex = s.mode === 'explode';
        spr.visible = plate.visible = ex;
        if (ex) {
          // Squashed to 0.1 m between the carts before release, stretched out to 0.18 m after.
          const gapNow = carts[1].position.x - carts[0].position.x - 0.5;
          const L = Math.max(0.02, Math.min(0.18, gapNow));
          spr.scale.set(L, 1, 1); plate.position.set(0.25 + L, 0.12, 0);
        }
        lBang.position.set(ex ? 0 : pos(0, P.tc) + HL, 0.95, 0);
        lBang.visible = P.meet && tt >= P.tc && tt < P.tc + 0.6;
        lBang.element.innerHTML = ex ? 'release!' : s.mode === 'sticky' ? 'stick!' : 'bounce!';
        cur = { P, S: sums(P), done };
        const ck = `${k}|${done}`;
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      readout(s) {
        const Q = plan(s), S = sums(Q);
        const note = !Q.meet ? 'The orange cart is faster to the right, so they never meet. Nothing changes.'
          : s.mode === 'elastic' ? 'Magnets: momentum and kinetic energy are both kept.'
            : s.mode === 'sticky' ? `Velcro: momentum is kept, but ${fmt(S.kB - S.kA, 2)} J of energy became heat and sound.`
              : `The spring gave ${fmt(S.kA, 2)} J, yet the total momentum stays zero: equal and opposite.`;
        return `<div class="big">Total p: ${sgn(S.pB, 2)} → ${sgn(S.pA, 2)} kg·m/s</div>
          <div class="row"><span>Blue after, m v</span><b>${fmt(Q.m[0], 0)} × ${sgn(Q.v[0], 2)} = ${sgn(Q.m[0] * Q.v[0], 2)}</b></div>
          <div class="row"><span>Orange after, m v</span><b>${fmt(Q.m[1], 0)} × ${sgn(Q.v[1], 2)} = ${sgn(Q.m[1] * Q.v[1], 2)}</b></div>
          <div class="row"><span>Kinetic energy before → after</span><b>${fmt(S.kB, 2)} → ${fmt(S.kA, 2)} J</b></div>
          <small>${note}</small>`;
      },
    };
    return inst;
  },
};
