// Chapter 4: games. Newton's cradle, carrom and pool (collisions in two directions), and bat on ball.
// Cradle: five 100 g steel balls (29 mm across) on 12 cm strings, drawn 3 times life size. Each ball
//   is a pendulum, θ'' = −(g ÷ L) sin θ, with a little damping. When two neighbours touch while
//   closing, equal-mass elastic balls swap velocities; sticky clay balls share them (e = 0). Swaps
//   repeat along the row in one instant, which is how the ideal cradle passes momentum through.
//   (Real cradles leak a little motion into the middle balls because steel is not perfectly hard.)
// Carrom (International Carrom Federation rules): striker at most 15 g and 41.3 mm across; coins
//   5.0–5.5 g and about 31 mm across. Pool: balls about 170 g and 57 mm. Frictionless impact along
//   the line of centres with restitution e ≈ 0.9 (carrom) and 0.95 (pool balls, measured 0.92–0.98).
//   Momentum is conserved as a vector: striker before = striker after + coin after, head to tail.
//   Equal masses with e = 1 split at exactly 90°; a heavier striker follows the coin forward.
//   The pieces then slide or roll to a stop at about 1.5 m/s² (a powdered carrom board, rounded).
// Bat and ball: a cricket ball, 0.16 kg (MCC Law 4). A 1.2 kg bat swung from the hands acts at the
//   sweet spot like a free mass of roughly 0.8 kg (effective mass; illustrative). Restitution of a
//   cricket ball on willow about 0.5 (rough). Head-on: v_ball = ((m − e M) u + (1 + e) M V) ÷ (m + M)
//   with u the delivery (negative, towards the bat) and V the bat speed. Contact lasts about 1 ms.
import { THREE, M, box, beam, torus } from '../kit.js';
import {
  G, KMH, TAU, board, panelBg, title, bars, tag, COL, fitNarrow, inReel, focusView, force, makePerson,
  collide1D, ke, sphere, disc, fmt, sgn, clamp,
} from '../momentum.js';

const KX = 60, BX = 120;
const CR = { n: 5, r: 0.0145, L: 0.12, m: 0.1, S: 3, damp: 0.08, top: 0.2 };
const PIECES = {
  carrom: { m1: 0.015, r1: 0.0206, m2: 0.0055, r2: 0.0155, e: 0.9, W: 0.74, H: 0.74, name: 'carrom', c1: 0xf2f4f7, c2: 0x1b1d22, felt: 0xe8cf9a },
  pool: { m1: 0.17, r1: 0.0286, m2: 0.17, r2: 0.0286, e: 0.95, W: 1.9, H: 1.0, name: 'pool', c1: 0xf7f4ea, c2: 0xd8332f, felt: 0x1f6e43 },
};
const DECEL = 1.5;
const BAT = { m: 0.16, M: 0.8, e: 0.5, contact: 0.001, pivotY: 1.05, len: 0.86, sweet: 0.7 };
const VIEWS = {
  cradle: { pos: [0.4, 0.8, 1.9], target: [0.4, 0.5, 0] },
  carrom: { pos: [KX + 0.28, 1.45, 1.05], target: [KX + 0.28, 0, 0.05] },
  bat: { pos: [BX + 0.6, 1.6, 4.6], target: [BX + 0.6, 1.3, 0] },
};
const REEL = {
  cradle: { pos: [0, 1.0, 1.4], target: [0, 0.8, 0] },
  carrom: { pos: [KX + 0.1, 1.6, 1.0], target: [KX + 0.1, 0.3, 0.1] },
};

// A 2D collision: striker moving +x at u hits a coin at rest; b is the offset of centres across the
// path, as a fraction of r1 + r2. Returns velocities after [vx, vz] for both.
export function hit2D(P, u, b) {
  const D = P.r1 + P.r2, off = clamp(b, -0.97, 0.97), phi = Math.asin(off);
  const n = [Math.cos(phi), -Math.sin(phi)], un = u * n[0];
  const [v1n, v2n] = collide1D(P.m1, un, P.m2, 0, P.e);
  const ut = [u - un * n[0], -un * n[1]];
  return { v1: [ut[0] + v1n * n[0], ut[1] + v1n * n[1]], v2: [v2n * n[0], v2n * n[1]], n, D, phi };
}
export function batHit(u, V) {
  const { m, M: Mb, e } = BAT, uu = -u;
  const v = ((m - e * Mb) * uu + (1 + e) * Mb * V) / (m + Mb);
  const Vb = (m * uu + Mb * V - m * v) / Mb;
  return { v, Vb, dp: m * (v - uu), F: (m * (v - uu)) / BAT.contact };
}

export default {
  id: 'games',
  short: 'Games',
  title: 'Cradles, carrom and cricket',
  subtitle: 'Momentum passes down a row of steel balls, splits at an angle on a carrom board, and flies off a bat.',
  view: VIEWS.cradle,
  learn: `<p><b>Newton's cradle</b> is momentum in a row. Lift one ball and let go: one ball flies out the far side. Lift two, and two come out. Why not one ball at twice the speed? That would carry the same momentum, but <b>twice the kinetic energy</b>. Hard steel balls must keep <b>both</b>, and only "same number, same speed" does. Make the balls of clay and they stick: all five crawl off together: momentum kept, much of the energy gone.</p>
    <p>On a <b>carrom</b> board or a pool table, momentum is conserved <b>as an arrow</b>. Add the striker's arrow after the hit to the coin's arrow and you get exactly the striker's arrow before. Two equal pool balls always split at about <b>90°</b>. A carrom striker is almost three times heavier than a coin, so it follows through.</p>
    <p>In <b>cricket</b>, the bat reverses a 0.16 kg ball in about a millisecond. The ball's momentum changes by more than it had to begin with, because it goes back the other way. That change needs a force of several thousand newtons. The heavier and faster the bat, the more momentum it can hand over.</p>
    <p class="tip"><b>Try it:</b> lift one, two and three balls, then switch to clay. Cut the striker thin and thick, and compare carrom with pool. Then swing the bat harder at a faster delivery.</p>`,
  terms: [
    { t: 'Newton’s cradle', d: 'A row of hanging steel balls that passes momentum and energy from one end to the other.' },
    { t: 'Vector', d: 'A quantity with a size and a direction, like momentum. Vectors add head to tail.' },
    { t: 'Cut shot', d: 'Hitting a ball or coin off-centre so it goes off at an angle.' },
    { t: 'Coefficient of restitution', d: 'How bouncy a collision is: speed apart ÷ speed together. 1 is perfectly bouncy, 0 sticks.' },
    { t: 'Sweet spot', d: 'The place on a bat where the ball leaves fastest and the handle barely stings.' },
  ],
  defaults: { focus: 'cradle', lift: 1, balls: 'steel', table: 'carrom', cut: 0.4, shot: 2.5, bowl: 35, swing: 22 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'cradle', label: 'Newton’s cradle' }, { v: 'carrom', label: 'Carrom and pool' }, { v: 'bat', label: 'Bat and ball' }] },
    { key: 'lift', type: 'seg', label: 'Cradle: balls to lift', options: [{ v: 1, label: 'One' }, { v: 2, label: 'Two' }, { v: 3, label: 'Three' }] },
    { key: 'balls', type: 'seg', label: 'Cradle: balls made of', options: [{ v: 'steel', label: 'Steel' }, { v: 'clay', label: 'Clay' }] },
    { key: 'table', type: 'seg', label: 'Board', options: [{ v: 'carrom', label: 'Carrom' }, { v: 'pool', label: 'Pool' }] },
    { key: 'cut', type: 'range', label: 'Board: how thin you cut it', min: 0, max: 0.9, step: 0.05, ends: ['full', 'thin'], fmt: (v) => `${fmt(v * 100, 0)}% off-centre` },
    { key: 'shot', type: 'range', label: 'Board: shot speed', min: 1, max: 4, step: 0.1, ends: ['soft', 'hard'], fmt: (v) => `${fmt(v)} m/s` },
    { key: 'bowl', type: 'range', label: 'Cricket: delivery speed', min: 20, max: 42, step: 1, ends: ['spin', 'express'], fmt: (v) => `${fmt(v, 0)} m/s (${fmt(v * KMH, 0)} km/h)` },
    { key: 'swing', type: 'range', label: 'Cricket: bat speed at the sweet spot', min: 8, max: 32, step: 1, ends: ['block', 'slog'], fmt: (v) => `${fmt(v, 0)} m/s` },
    { key: 'go', type: 'buttons', label: 'Run', items: [{ label: '▶ Again', act: (s, inst) => inst.go() }] },
  ],
  onChange(s, key) {
    if (['lift', 'balls'].includes(key)) s.focus = 'cradle';
    if (['table', 'cut', 'shot'].includes(key)) s.focus = 'carrom';
    if (['bowl', 'swing'].includes(key)) s.focus = 'bat';
  },
  quiz: [
    { q: 'You lift two balls of a Newton’s cradle and let go. Why don’t you get one ball out at twice the speed?', options: ['It would break momentum conservation', 'It would carry twice the kinetic energy, and energy must be kept too', 'Gravity stops it', 'The strings are too short'], answer: 1, why: 'One ball at 2v has the same momentum as two at v, but ½ m (2v)² is twice ½ (2m) v². Hard steel keeps both, so two balls come out.' },
    { q: 'A pool ball hits an equal ball at rest off-centre. About what angle do their paths make afterwards?', options: ['0°', '45°', '90°', '180°'], answer: 2, why: 'Equal masses in a nearly elastic collision split at right angles. Their momentum arrows still add up to the first ball’s arrow.' },
    { q: 'A 0.16 kg ball arrives at 30 m/s and leaves the bat at 40 m/s the other way. What is its change in momentum?', options: ['1.6 kg·m/s', '4.8 kg·m/s', '11.2 kg·m/s', '6.4 kg·m/s'], answer: 2, why: 'Direction matters: from −30 to +40 m/s is a change of 70 m/s. 0.16 × 70 = 11.2 kg·m/s.' },
  ],
  reel: [
    { ms: 5000, caption: 'Newton’s cradle: lift two, two fly out. Only that keeps both momentum and energy.', set: { focus: 'cradle', lift: 2, balls: 'steel' }, act: (s, inst) => inst.go(), view: REEL.cradle, spin: 0 },
    { ms: 5000, caption: 'On a carrom board momentum adds up as arrows: striker plus coin equals the striker before.', set: { focus: 'carrom', table: 'carrom', cut: 0.45, shot: 2.5 }, act: (s, inst) => inst.go(), view: REEL.carrom, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gC = new THREE.Group(), gK = new THREE.Group(), gB = new THREE.Group(); root.add(gC, gK, gB);
    gK.position.x = KX; gB.position.x = BX;

    // ------------------------------------------------ Newton's cradle, 3× life size
    const cr = new THREE.Group(); cr.scale.setScalar(CR.S); gC.add(cr);
    const chrome = M.metal(0xd9dde4, { roughness: 0.15 }), clay = M.matte(0xb86b4b);
    const base = box(0.2, 0.012, 0.1, M.plastic(0x16181d, { roughness: 0.3 })); base.position.y = 0.006; cr.add(base);
    for (const x of [-0.085, 0.085]) for (const z of [-0.04, 0.04]) cr.add(beam([x, 0.01, z], [x, CR.top, z], 0.0025, chrome));
    for (const z of [-0.04, 0.04]) cr.add(beam([-0.085, CR.top, z], [0.085, CR.top, z], 0.0025, chrome));
    const balls = [], strings = [];
    const home = (i) => (i - (CR.n - 1) / 2) * 2 * CR.r;
    for (let i = 0; i < CR.n; i++) {
      const b = sphere(CR.r, chrome, 32); cr.add(b); balls.push(b);
      const s1 = beam([0, 0, 0], [0, 1, 0], 0.0006, M.matte(0xe8e2c8), 4), s2 = s1.clone(); cr.add(s1, s2); strings.push([s1, s2]);
    }
    const lCr = stage.label('', [0, 0.95, 0], gC, 'hot');

    // ------------------------------------------------ carrom / pool
    const table = new THREE.Group(); table.position.set(0.1, 0, 0.12); gK.add(table);
    const felt = box(1, 0.02, 1, M.matte(0xe8cf9a)); felt.position.y = 0.01; table.add(felt);
    const rails = [0, 1, 2, 3].map(() => { const r = box(1, 0.05, 0.05, M.matte(0x4a2e1a)); table.add(r); return r; });
    const tokenA = disc(1, 1, M.plastic(0xf2f4f7, { roughness: 0.3 })), tokenB = disc(1, 1, M.plastic(0x1b1d22, { roughness: 0.3 }));
    const ballA = sphere(1, M.plastic(0xf7f4ea, { roughness: 0.15 })), ballB = sphere(1, M.plastic(0xd8332f, { roughness: 0.15 }));
    table.add(tokenA, tokenB, ballA, ballB);
    const trail = [0, 1, 2].map((i) => { const l = box(1, 0.002, 0.004, M.glow([0x8ef0ff, 0xffb547, 0x7be08c][i])); table.add(l); return l; });
    const lK = stage.label('', [0, 0.35, 0], gK, 'hot');

    // ------------------------------------------------ bat and ball
    const pitch = box(6, 0.02, 2.4, M.matte(0xb89c6a)); pitch.position.set(1.5, -0.01, 0); gB.add(pitch);
    const stumps = new THREE.Group(); for (const z of [-0.11, 0, 0.11]) stumps.add(beam([-0.6, 0, z - 0.3], [-0.6, 0.71, z - 0.3], 0.017, M.matte(0xe8e2c8))); gB.add(stumps);
    const batter = makePerson({ shirt: 0xf2f4f7, pants: 0xf2f4f7, skin: 0x8d5a3b }); batter.position.set(-0.3, 0, -0.45); gB.add(batter);
    const bat = new THREE.Group(); bat.position.set(0, BAT.pivotY, 0); gB.add(bat);
    const handle = beam([0, 0, 0], [0, -0.3, 0], 0.017, M.matte(0x22262e)); bat.add(handle);
    const blade = box(0.06, 0.56, 0.108, M.matte(0xe8d3a0)); blade.position.y = -0.58; bat.add(blade);
    const cball = sphere(0.036, M.plastic(0xb3261e, { roughness: 0.35 }), 20); gB.add(cball);
    const lB = stage.label('', [0, 2.1, 0], gB, 'hot');
    const arB = force(0x7be08c, 0.03, 0.15); gB.add(arB);

    // ------------------------------------------------ board
    let cur = null;
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'cradle') {
        const n = cur.lift, v = cur.v0, m = CR.m;
        title(g, 'What could come out the far side?', `${n} ball${n > 1 ? 's' : ''} in at ${fmt(v, 2)} m/s`);
        const opts = [
          { name: `${n} ball${n > 1 ? 's' : ''} at ${fmt(v, 2)} m/s`, p: n * m * v, E: 0.5 * n * m * v * v, ok: cur.balls === 'steel' },
          { name: `1 ball at ${fmt(n * v, 2)} m/s`, p: n * m * v, E: 0.5 * m * (n * v) ** 2, ok: false },
          { name: `all 5 at ${fmt((n * v) / 5, 2)} m/s`, p: n * m * v, E: 0.5 * 5 * m * ((n * v) / 5) ** 2, ok: cur.balls === 'clay' },
        ];
        const E0 = 0.5 * n * m * v * v, Emax = Math.max(...opts.map((o) => o.E));
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('momentum, kg·m/s', 290, 96); g.fillText('energy, J', 470, 96);
        opts.forEach((o, i) => {
          const y = 150 + i * 150;
          g.font = 'bold 21px sans-serif'; g.fillStyle = o.ok ? COL.v : '#e8eef8'; g.fillText((o.ok ? '✓ ' : '') + o.name, 24, y);
          g.fillStyle = COL.s; g.fillRect(290, y + 20, 140, 30); g.font = 'bold 18px sans-serif'; g.fillStyle = '#0a0c12'; g.fillText(fmt(o.p, 3), 300, y + 42);
          const ew = (o.E / Emax) * 140; g.fillStyle = Math.abs(o.E - E0) < 1e-9 ? COL.a : COL.warn; g.fillRect(470, y + 20, Math.max(3, ew), 30);
          g.fillStyle = '#e8eef8'; g.fillText(fmt(o.E, 3), 470, y + 78);
          g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)';
          g.fillText(Math.abs(o.E - E0) < 1e-9 ? 'momentum ✓ energy ✓' : o.E > E0 ? 'energy out of nowhere ✗' : 'energy lost to heat', 24, y + 42);
        });
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText('All three keep momentum. Only one keeps energy too.', 24, h - 24);
        return;
      }
      if (cur.focus === 'carrom') {
        const P = PIECES[cur.table], H = hit2D(P, cur.shot, cur.cut);
        title(g, 'Momentum adds up as arrows', `g·m/s · ${P.name} · paths split at ${fmt(cur.angle, 0)}°`);
        const p0 = P.m1 * cur.shot * 1000, p1 = H.v1.map((q) => q * P.m1 * 1000), p2 = H.v2.map((q) => q * P.m2 * 1000);
        const sc = 420 / p0, ox = 110, oy = 380;
        const arrowTo = (x0, y0, dx, dy, col, wdt = 7, lab = '') => {
          const x1 = x0 + dx * sc, y1 = y0 + dy * sc; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = wdt;
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
          const a = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 22 * Math.cos(a - 0.4), y1 - 22 * Math.sin(a - 0.4)); g.lineTo(x1 - 22 * Math.cos(a + 0.4), y1 - 22 * Math.sin(a + 0.4)); g.closePath(); g.fill();
          if (lab) tag(g, lab, (x0 + x1) / 2 + 10, (y0 + y1) / 2 + (dy > 0 ? 30 : -14), col, 'bold 18px sans-serif', w);
        };
        arrowTo(ox, oy, p0, 0, 'rgba(255,255,255,.55)', 10, `striker before ${fmt(p0, 1)}`);
        arrowTo(ox, oy, p1[0], p1[1], COL.s, 6, `striker after ${fmt(Math.hypot(...p1), 1)}`);
        arrowTo(ox + p1[0] * sc, oy + p1[1] * sc, p2[0], p2[1], COL.a, 6, `coin after ${fmt(Math.hypot(...p2), 1)}`);
        g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
        const kB = ke(P.m1, cur.shot) * 1000, kA = (ke(P.m1, Math.hypot(...H.v1)) + ke(P.m2, Math.hypot(...H.v2))) * 1000;
        g.fillText(`Energy: ${fmt(kB, 1)} mJ before, ${fmt(kA, 1)} mJ after`, 24, h - 60);
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('The two "after" arrows, head to tail, land on the "before" arrow.', 24, h - 26);
        return;
      }
      const R = batHit(cur.bowl, cur.swing);
      title(g, 'Bat and ball: momentum before and after', 'kg·m/s · towards the bowler is +');
      const pb = [BAT.m * -cur.bowl, BAT.M * cur.swing], pa = [BAT.m * R.v, BAT.M * R.Vb];
      const mx = Math.max(...pb.map(Math.abs), ...pa.map(Math.abs), Math.abs(pb[0] + pb[1])) * 1.2;
      bars(g, { x0: 40, x1: w - 30, y0: 420, y1: 96, max: mx, dp: 1, groups: [
        { name: 'before', bars: [{ v: pb[0], col: '#ff7a59', label: 'ball' }, { v: pb[1], col: '#e8d3a0', label: 'bat' }, { v: pb[0] + pb[1], col: COL.v, label: 'total' }] },
        { name: 'after', bars: [{ v: pa[0], col: '#ff7a59', label: 'ball' }, { v: pa[1], col: '#e8d3a0', label: 'bat' }, { v: pa[0] + pa[1], col: COL.v, label: 'total' }] },
      ] });
      g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`Ball's Δp = ${fmt(R.dp, 1)} kg·m/s in about 1 ms`, 24, h - 90);
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(`Average force on the ball: about ${fmt(R.F / 1000, 1)} kN`, 24, h - 56);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('bat counted as its sweet-spot mass, about 0.8 kg', 24, h - 24);
    }, [0, 0, 0]);
    const BOARD = { cradle: [0.85, 0.5, -0.3, 0.4], carrom: [KX + 0.78, 0.28, 0.0, 0.3], bat: [BX + 2.0, 1.3, -1.2, 0.65] };

    // ------------------------------------------------ cradle physics state
    let th = new Array(CR.n).fill(0), om = new Array(CR.n).fill(0), v0 = 0;
    const TH0 = 0.6;
    const startCradle = (s) => { th = th.map((_, i) => (i < s.lift ? -TH0 : 0)); om = om.map(() => 0); v0 = Math.sqrt(2 * G * CR.L * (1 - Math.cos(TH0))); };
    const stepCradle = (h, clayOn) => {
      for (let i = 0; i < CR.n; i++) { om[i] += (-(G / CR.L) * Math.sin(th[i]) - CR.damp * om[i]) * h; th[i] += om[i] * h; }
      for (let pass = 0; pass < 12; pass++) {
        let any = false;
        for (let i = 0; i < CR.n - 1; i++) {
          const xa = home(i) + CR.L * Math.sin(th[i]), xb = home(i + 1) + CR.L * Math.sin(th[i + 1]);
          if (xb - xa < 2 * CR.r - 1e-7 && om[i] > om[i + 1] + 1e-9) {
            if (clayOn) {
              // Sticky: find the touching run and give it one shared velocity.
              let a = i, b = i + 1;
              while (a > 0 && home(a) + CR.L * Math.sin(th[a]) - (home(a - 1) + CR.L * Math.sin(th[a - 1])) < 2 * CR.r + 1e-6) a--;
              while (b < CR.n - 1 && home(b + 1) + CR.L * Math.sin(th[b + 1]) - (home(b) + CR.L * Math.sin(th[b])) < 2 * CR.r + 1e-6) b++;
              let sum = 0; for (let k = a; k <= b; k++) sum += om[k];
              for (let k = a; k <= b; k++) om[k] = sum / (b - a + 1);
            } else { const q = om[i]; om[i] = om[i + 1]; om[i + 1] = q; }
            any = true;
          }
        }
        if (!any) break;
      }
      // Keep balls from sinking into each other.
      for (let i = 0; i < CR.n - 1; i++) {
        const xa = home(i) + CR.L * Math.sin(th[i]), xb = home(i + 1) + CR.L * Math.sin(th[i + 1]), over = 2 * CR.r - (xb - xa);
        if (over > 0) { th[i] -= over / (2 * CR.L); th[i + 1] += over / (2 * CR.L); }
      }
    };

    const st = {};
    let t = 0, key = '', lastCk = '', splitAngle = 0;
    const inst = {
      go() { t = 0; cradleKey = ''; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lCr, lK, lB]);
        const f = s.focus, reel = inReel();
        gC.visible = f === 'cradle'; gK.visible = f === 'carrom'; gB.visible = f === 'bat';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'cradle' ? [0, 1.25, -0.3] : [KX + 0.1, 0.82, -0.4]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? (f === 'cradle' ? 0.4 : 0.48) : B[3]);
        chart.mesh.rotation.x = f === 'carrom' && !reel ? -0.6 : 0;
        chart.mesh.visible = reel || !narrow;
        const k = `${f}|${s.lift}|${s.balls}|${s.table}|${s.cut}|${s.shot}|${s.bowl}|${s.swing}`;
        if (k !== key) { if (key && !reel) inst.go(); key = k; }
        t += dt;

        if (f === 'cradle') {
          const ck = `${s.lift}|${s.balls}`;
          if (cradleKey !== ck) { cradleKey = ck; startCradle(s); }
          balls.forEach((b) => { b.material = s.balls === 'clay' ? clay : chrome; });
          const sub = 40, h = (dt * 0.5) / sub;                    // shown at half speed
          for (let q = 0; q < sub; q++) stepCradle(h, s.balls === 'clay');
          balls.forEach((b, i) => {
            const px = home(i) + CR.L * Math.sin(th[i]), py = CR.top - CR.L * Math.cos(th[i]);
            b.position.set(px, py, 0);
            strings[i].forEach((sg, j) => { const z = j ? 0.04 : -0.04; const A = new THREE.Vector3(home(i), CR.top, z), Bv = new THREE.Vector3(px, py, 0); sg.position.copy(A).add(Bv).multiplyScalar(0.5); sg.scale.set(1, A.distanceTo(Bv), 1); sg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); });
          });
          const moving = om.map((w) => Math.abs(w * CR.L) > 0.05).filter(Boolean).length;
          lCr.position.set(0.55, 0.06, 0.25);
          lCr.element.innerHTML = `${s.lift} in · ${moving} moving now`;
          if (t > 9) { t = 0; startCradle(s); }
          cur = { focus: f, lift: s.lift, balls: s.balls, v0 };
        } else if (f === 'carrom') {
          const P = PIECES[s.table], H = hit2D(P, s.shot, s.cut);
          felt.material.color.setHex(P.felt); felt.scale.set(P.W, 1, P.H);
          rails[0].scale.set(P.W + 0.1, 1, 1); rails[0].position.set(0, 0.03, P.H / 2 + 0.025);
          rails[1].scale.set(P.W + 0.1, 1, 1); rails[1].position.set(0, 0.03, -P.H / 2 - 0.025);
          rails[2].scale.set(1, 1, 1); rails[2].rotation.y = Math.PI / 2; rails[2].scale.x = P.H + 0.1; rails[2].position.set(P.W / 2 + 0.025, 0.03, 0);
          rails[3].rotation.y = Math.PI / 2; rails[3].scale.x = P.H + 0.1; rails[3].position.set(-P.W / 2 - 0.025, 0.03, 0);
          const carrom = s.table === 'carrom';
          table.scale.setScalar(carrom ? 1 : 0.42);                 // the pool table is drawn smaller to fit
          tokenA.visible = tokenB.visible = carrom; ballA.visible = ballB.visible = !carrom;
          const A1 = carrom ? tokenA : ballA, A2 = carrom ? tokenB : ballB;
          if (carrom) { tokenA.scale.set(P.r1, 0.008, P.r1); tokenB.scale.set(P.r2, 0.007, P.r2); } else { ballA.scale.setScalar(P.r1); ballB.scale.setScalar(P.r2); }
          const yA = carrom ? 0.024 : 0.02 + P.r1, yB = carrom ? 0.0235 : 0.02 + P.r2;
          // Coin at the centre; striker starts 0.3 m back and meets it at time tc.
          const start = carrom ? 0.28 : 0.6, tc = start / s.shot, ts = Math.max(0, t - 0.5) * 0.6;
          const cx0 = -H.D * Math.cos(H.phi), cz0 = H.D * Math.sin(H.phi);
          const glide = (v, tt) => { const sp = Math.hypot(...v); if (sp < 1e-9) return [0, 0]; const T = sp / DECEL, q = Math.min(tt, T), d = sp * q - 0.5 * DECEL * q * q; return [(v[0] / sp) * d, (v[1] / sp) * d]; };
          const clampIn = (x, z, r) => [clamp(x, -P.W / 2 + r, P.W / 2 - r), clamp(z, -P.H / 2 + r, P.H / 2 - r)];
          let a, b;
          if (ts < tc) { a = [cx0 - start + s.shot * ts, cz0]; b = [0, 0]; }
          else { const d1 = glide(H.v1, ts - tc), d2 = glide(H.v2, ts - tc); a = [cx0 + d1[0], cz0 + d1[1]]; b = d2; }
          a = clampIn(a[0], a[1], P.r1); b = clampIn(b[0], b[1], P.r2);
          A1.position.set(a[0], yA, a[1]); A2.position.set(b[0], yB, b[1]);
          // Guide lines: the striker's path in, and both paths out.
          const seg = (l, x0, z0, dx, dz, L) => { const len = Math.max(0.001, L); l.scale.set(len, 1, 1); l.position.set(x0 + (dx * len) / 2, 0.022, z0 + (dz * len) / 2); l.rotation.y = -Math.atan2(dz, dx); };
          seg(trail[0], cx0 - start, cz0, 1, 0, start);
          const u1 = Math.hypot(...H.v1), u2 = Math.hypot(...H.v2);
          // Each path runs until the piece stops or reaches a rail.
          const reach = (x0, z0, dx, dz, L, r) => { let l = L; if (dx > 1e-6) l = Math.min(l, (P.W / 2 - r - x0) / dx); if (dx < -1e-6) l = Math.min(l, (-P.W / 2 + r - x0) / dx); if (dz > 1e-6) l = Math.min(l, (P.H / 2 - r - z0) / dz); if (dz < -1e-6) l = Math.min(l, (-P.H / 2 + r - z0) / dz); return Math.max(0, l); };
          const d1 = [H.v1[0] / (u1 || 1), H.v1[1] / (u1 || 1)], d2 = [H.v2[0] / (u2 || 1), H.v2[1] / (u2 || 1)];
          seg(trail[1], cx0, cz0, d1[0], d1[1], reach(cx0, cz0, d1[0], d1[1], (u1 * u1) / (2 * DECEL), P.r1));
          seg(trail[2], 0, 0, d2[0], d2[1], reach(0, 0, d2[0], d2[1], (u2 * u2) / (2 * DECEL), P.r2));
          trail[1].visible = u1 > 0.01; trail.forEach((l) => { l.material.opacity = 0.7; });
          splitAngle = u1 > 0.01 && u2 > 0.01 ? Math.acos(clamp((H.v1[0] * H.v2[0] + H.v1[1] * H.v2[1]) / (u1 * u2), -1, 1)) * (180 / Math.PI) : 0;
          lK.position.set(0, 0.3, -P.H / 2);
          lK.element.innerHTML = ts < tc ? `${P.name}: striker ${fmt(P.m1 * 1000, 1)} g, coin ${fmt(P.m2 * 1000, 1)} g` : `paths split at <b>${fmt(splitAngle, 0)}°</b>`;
          if (ts > tc + 3.2) t = 0;
          cur = { focus: f, table: s.table, cut: s.cut, shot: s.shot, angle: splitAngle };
        } else {
          const R = batHit(s.bowl, s.swing), SL = 25, ts = t / SL, tc = 0.1;
          const hitY = BAT.pivotY - BAT.sweet;
          // Bat swings through vertical at the moment of impact, with sweet-spot speed V.
          const wBat = s.swing / BAT.sweet, wAfter = R.Vb / BAT.sweet;
          const ang = ts < tc ? -wBat * (tc - ts) : Math.min(1.6, wAfter * (ts - tc));
          bat.rotation.z = clamp(ang, -1.4, 1.6);
          let bx, by;
          if (ts < tc) { bx = 0.07 + s.bowl * (tc - ts); by = hitY + 0.3 * (tc - ts); }
          else { const tau = ts - tc; bx = 0.07 + R.v * tau; by = hitY + 4 * tau - 0.5 * G * tau * tau; }
          cball.position.set(bx, Math.max(0.036, by), 0);
          batter.pose({ arm: 0.9 - ang * 0.3, lean: 0.15 });
          arB.aim([bx + 0.1, by + 0.25, 0], [ts < tc ? -1 : 1, 0, 0], 0.2 + (BAT.m * Math.abs(ts < tc ? s.bowl : R.v)) * 0.12);
          lB.position.set(1.0, 0.85, 0.3);
          lB.element.innerHTML = ts < tc ? `${fmt(s.bowl * KMH, 0)} km/h in · shown ${SL}× slower` : `<b>${fmt(R.v * KMH, 0)} km/h</b> off the bat`;
          if (ts > tc + 0.2) t = 0;
          cur = { focus: f, bowl: s.bowl, swing: s.swing };
        }
        const ck = f === 'carrom' ? `${k}|${fmt(splitAngle, 0)}` : f === 'cradle' ? `${k}|${fmt(v0, 3)}` : k;
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'cradle') {
          const v = Math.sqrt(2 * G * CR.L * (1 - Math.cos(TH0))), n = s.lift, p = n * CR.m * v;
          return `<div class="big">${n} in → ${s.balls === 'steel' ? `${n} out` : 'all 5 crawl off'}</div>
            <div class="row"><span>Each ball, 100 g, hits at</span><b>${fmt(v, 2)} m/s</b></div>
            <div class="row"><span>Momentum in = out</span><b>${fmt(p, 3)} kg·m/s</b></div>
            <div class="row"><span>Energy in → out</span><b>${fmt(0.5 * n * CR.m * v * v * 1000, 1)} → ${fmt((s.balls === 'steel' ? 0.5 * n * CR.m * v * v : 0.5 * 5 * CR.m * ((n * v) / 5) ** 2) * 1000, 1)} mJ</b></div>
            <small>${s.balls === 'steel' ? 'Hard steel keeps momentum and energy, so the same number of balls leave at the same speed.' : `Clay sticks: momentum is kept, but ${fmt((1 - n / 5) * 100, 0)}% of the energy squashes the clay.`}</small>`;
        }
        if (f === 'carrom') {
          const P = PIECES[s.table], H = hit2D(P, s.shot, s.cut);
          const p1 = Math.hypot(...H.v1) * P.m1, p2 = Math.hypot(...H.v2) * P.m2;
          return `<div class="big">Coin off at ${fmt(Math.hypot(...H.v2), 2)} m/s</div>
            <div class="row"><span>Striker before, m v</span><b>${fmt(P.m1 * s.shot * 1000, 1)} g·m/s</b></div>
            <div class="row"><span>Striker after · coin after</span><b>${fmt(p1 * 1000, 1)} · ${fmt(p2 * 1000, 1)} g·m/s</b></div>
            <div class="row"><span>Sum of the arrows, forwards · sideways</span><b>${fmt((P.m1 * H.v1[0] + P.m2 * H.v2[0]) * 1000, 1)} · ${fmt(Math.abs(P.m1 * H.v1[1] + P.m2 * H.v2[1]) * 1000, 1)}</b></div>
            <small>${s.table === 'pool' ? 'Equal balls split at about 90°.' : 'The striker is nearly three times the coin’s mass, so it follows through.'} Sideways momentum still adds to zero.</small>`;
        }
        const R = batHit(s.bowl, s.swing);
        return `<div class="big">Ball leaves at ${fmt(R.v * KMH, 0)} km/h</div>
          <div class="row"><span>Ball in, 0.16 kg × ${fmt(s.bowl, 0)} m/s</span><b>${sgn(-BAT.m * s.bowl, 2)} kg·m/s</b></div>
          <div class="row"><span>Ball out</span><b>${sgn(BAT.m * R.v, 2)} kg·m/s</b></div>
          <div class="row"><span>Bat at the sweet spot: before → after</span><b>${fmt(s.swing, 0)} → ${fmt(R.Vb, 1)} m/s</b></div>
          <small>The ball's momentum changes by ${fmt(R.dp, 1)} kg·m/s, taken from the bat. Total before = total after.</small>`;
      },
    };
    let cradleKey = '';
    return inst;
  },
};
