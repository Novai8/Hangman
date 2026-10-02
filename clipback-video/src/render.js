// ---------------------------------------------------------------------------
// Clipback / $CLIP — continuous motion-design renderer.
// One persistent world. Scenes reconfigure it; nothing is ever replaced.
// Driven entirely by project/Clipback_CLIP_Motion_Design.tsrct
// ---------------------------------------------------------------------------
import { PAL, rgba, mixHex } from './lib/color.js';
import { blit, dotSprite, glowSprite, grain, vignette, roundRectPath, ring, glowLine } from './lib/gfx.js';
import {
  clamp, lerp, smoothstep, smootherstep, TAU, CURVE, win, pulse, impulse, fbm2, mulberry32, cbez, cbezTangent, ease,
} from './lib/math.js';
import {
  Camera, NetworkField, ParticleField, FragmentField, drawGrid, drawAtmosphere, drawHUD, frameGuard, W, H,
} from './lib/world.js';
import {
  registerFonts, FONT, drawTracked, drawMaskReveal, sampleTextPoints, eyebrow, measureTracked,
} from './lib/type.js';
import {
  samplePath, ribbon, streamCore, flowParticles, systemNode, uiCard, splitter, tokenObject, chip,
  slot, band, spineRails,
} from './lib/system.js';

const CURVES = { enter: CURVE.enter, exit: CURVE.exit, travel: CURVE.travel, swap: CURVE.swap, camera: CURVE.camera, breathe: CURVE.breathe };

export function createState(project, analysis) {
  registerFonts();
  const M = project.syncMarks;
  const L = project.layout;
  const T = project.textAssets;

  // CLIPBACK point cloud (world units) — carries network nodes into the wordmark
  const sample = sampleTextPoints(T.wordmark, { font: FONT.display, size: 168, tracking: 10, step: 9, jitter: 0.8 });
  const wordPoints = sample.points.map((p) => ({ x: p.x + L.hook.x, y: p.y + L.hook.y - 8 }));
  const wordEdges = sample.edges.map((p) => ({ x: p.x + L.hook.x, y: p.y + L.hook.y - 8 }));

  // hook seed nodes
  const rnd = mulberry32(20261002);
  const hookNodes = [];
  for (let i = 0; i < 26; i++) {
    const a = rnd() * TAU;
    const r = 110 + rnd() * 560;
    hookNodes.push({
      x: L.hook.x + Math.cos(a) * r * 1.05,
      y: L.hook.y + Math.sin(a) * r * 0.78,
      born: i === 0 ? M.s1_have : i === 1 ? M.s1_you : i < 7 ? M.s1_heard + (i - 2) * 0.035 : M.s1_of + (i - 7) * 0.016,
      ph: rnd() * TAU,
      sp: 0.6 + rnd() * 0.8,
      r: 4 + rnd() * 7,
      target: wordEdges[(i * 13) % wordEdges.length],
      anchor: i > 6 && i % 3 === 0,
    });
  }
  // $CLIP glyph points for the end-card light pass + deterministic mote field
  const tokenSample = sampleTextPoints(T.token, { font: FONT.display, size: 186, tracking: 7, step: 10, jitter: 0.5 });
  const tokenEdges = tokenSample.edges;
  const brandEdges = sampleTextPoints(T.wordmark, { font: FONT.display, size: 128, tracking: 9, step: 9, jitter: 0.5 }).edges;
  const finMotes = [];
  const mr = mulberry32(777013);
  for (let i = 0; i < 46; i++) finMotes.push({ a: mr(), b: mr(), c: mr(), d: mr() });

  const hookLinks = [];
  for (let i = 1; i < hookNodes.length; i++) {
    const j = Math.floor(rnd() * i);
    hookLinks.push({ a: i, b: j, born: Math.max(hookNodes[i].born, hookNodes[j].born) + 0.03 });
  }

  return {
    project, analysis, M, L, T,
    tokenEdges, brandEdges, finMotes,
    cam: new Camera(),
    net: new NetworkField(),
    particles: new ParticleField(170, 4242),
    frags: new FragmentField(16, 909),
    wordPoints, wordEdges, hookNodes, hookLinks,
    envFrames: analysis.envSmooth,
    hop: analysis.hop,
    rnd: mulberry32(7),
    impulsesFired: new Set(),
  };
}

// --------------------------------------------------------------------------
function energyAt(S, t) {
  const i = Math.floor(t / S.hop);
  if (i < 0 || i >= S.envFrames.length) return 0;
  return S.envFrames[i];
}

function camAt(S, t) {
  const keys = S.project.camera.keys;
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      const f = (CURVES[b.e] || CURVE.enter)(u);
      return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), zoom: lerp(a.zoom, b.zoom, f) };
    }
  }
  return last;
}

const lerpPt = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** Alpha multiplier that prevents any text-bearing element from clipping the frame. */
function guard(cam, x, y, hw, hh, depth = 1, margin = 80) {
  const p = cam.project(x, y, depth);
  return frameGuard(p.x, p.y, hw * p.s, hh * p.s, margin);
}

// ===========================================================================
export function renderFrame(ctx, t, S) {
  const { M, L, T } = S;
  const energy = energyAt(S, t);

  // ---- camera ------------------------------------------------------------
  const ck = camAt(S, t);
  S.cam.breathe(t, 1);
  S.cam.set(ck.x, ck.y, ck.zoom);

  // ---- world state driven by the narration -------------------------------
  const net = S.net;
  net.energy = energy;
  net.tint = clamp(smoothstep(24.6, 26.2, t) * 0.8 - smoothstep(27.2, 28.6, t) * 0.5 + smoothstep(35.4, 36.4, t) * 0.5 + smoothstep(40.2, 41.4, t) * 0.55);
  net.branchMode = clamp(smoothstep(16.0, 17.6, t) - smoothstep(27.6, 29.0, t) * 1.0);
  net.branchA = { x: -250, y: 240 };
  net.branchB = { x: 300, y: 330 };
  const convergeAmt = clamp(smoothstep(M.fin_converge, M.fin_collapse + 0.1, t) * 0.95 - smoothstep(M.fin_reveal, M.fin_settle + 0.6, t) * 0.68);
  net.convergence = convergeAmt;
  net.convergePoint = { x: 0, y: 0 };

  // one-shot field impulses, fired deterministically on the frame they cross
  const fire = (key, x, y, time, opts) => {
    if (t >= time && !S.impulsesFired.has(key)) {
      S.impulsesFired.add(key);
      net.addImpulse(x, y, time, opts);
    }
  };
  fire('k1', L.hook.x, L.hook.y, M.s1_clipback, { dur: 1.5, strength: 1.0, r1: 1100 });
  fire('k2', 0, -1250, M.s2_in, { dur: 1.2, strength: 0.6, r1: 900 });
  fire('k3', 0, -760, M.s3_clipback + 0.2, { dur: 1.3, strength: 0.7, r1: 900 });
  fire('k4', 0, -330, M.s3_generates, { dur: 1.2, strength: 0.7, r1: 800 });
  fire('k5', 0, -20, M.s3_divMid, { dur: 1.7, strength: 1.2, r1: 1250 });
  fire('k6', -250, 215, M.s4_eighty, { dur: 1.3, strength: 0.8, r1: 900 });
  fire('k7', 300, 215, M.s4_twenty, { dur: 1.2, strength: 0.6, r1: 760 });
  fire('k8', 300, 560, M.s4_burn + 0.22, { dur: 1.6, strength: 1.1, r1: 1150 });
  fire('k9', 0, 60, M.s5_connect, { dur: 1.4, strength: 0.6, r1: 1200 });
  fire('k10', 300, 560, M.s5b_clip, { dur: 1.3, strength: 0.7, r1: 950 });
  fire('k11', 0, 0, M.fin_reveal, { dur: 2.0, strength: 1.0, r1: 1400 });

  // wordmark assembly morph (scene 1) and wordmark recall (scene 6)
  const asm1 = clamp(smoothstep(M.s1_of, M.s1_clipback + 0.42, t) - smoothstep(2.0, 2.5, t));
  net.setMorph(S.wordPoints, asm1, 2);

  // =========================================================================
  // BACKGROUND
  // =========================================================================
  drawAtmosphere(ctx, t, { energy, tint: net.tint, lift: clamp(smoothstep(M.fin_reveal, M.fin_settle, t) * 0.5) });
  drawGrid(ctx, S.cam, t, { gain: 0.55 + 0.35 * clamp(smoothstep(2.2, 4.4, t)) - 0.25 * clamp(smoothstep(39.4, 41.0, t)) });
  S.frags.draw(ctx, S.cam, t, { gain: clamp(smoothstep(2.4, 4.0, t) * 1.0 - smoothstep(38.8, 40.6, t)) });
  net.update(t);
  net.draw(ctx, S.cam, t, { gain: clamp(0.35 + smoothstep(0.0, 0.9, t) * 0.65) });
  S.particles.draw(ctx, S.cam, t, {
    gain: 0.9, converge: convergeAmt * 1.05, cp: net.convergePoint,
    color: net.tint > 0.3 ? PAL.violetSoft : PAL.ink,
  });
  drawHUD(ctx, t, {
    gain: clamp(smoothstep(0.55, 1.9, t) * 0.9 - smoothstep(M.fin_converge, M.fin_collapse, t) * 0.9),
    progress: clamp(t / S.project.composition.duration),
    accent: net.tint > 0.35 ? PAL.violetSoft : PAL.indigoSoft,
  });

  // =========================================================================
  // SCENE 01 — HOOK
  // =========================================================================
  drawHook(ctx, t, S, energy);

  drawFeedLines(ctx, t, S);

  // =========================================================================
  // SCENE 02 — CREATOR CONTENT ECOSYSTEM  (persists, then converges)
  // =========================================================================
  drawEcosystem(ctx, t, S, energy);

  // =========================================================================
  // SCENE 03..05 — the spine: CREATOR CONTENT -> CREATOR FEES -> split
  // =========================================================================
  drawSpine(ctx, t, S, energy);

  // =========================================================================
  // SCENE 04/05 — allocation branches
  // =========================================================================
  drawBranches(ctx, t, S, energy);

  // =========================================================================
  // SCENE 06 + FINAL — foreground typography
  // =========================================================================
  drawFinale(ctx, t, S, energy);

  // =========================================================================
  // GRADE
  // =========================================================================
  vignette(ctx, W, H, 0.62);
  grain(ctx, W, H, 0.030);

  // opening / closing dips (very short, deliberate)
  const openDip = 1 - clamp(smoothstep(0.0, 0.34, t));
  const closeDip = clamp(smoothstep(S.M.fin_fade, S.M.fin_end, t));
  const dip = Math.max(openDip, closeDip);
  if (dip > 0.001) {
    ctx.fillStyle = `rgba(3,4,7,${dip})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ===========================================================================
// SCENE 01 — the network builds CLIPBACK
// ===========================================================================
function drawHook(ctx, t, S, energy) {
  const { M, L, T } = S;
  const vis = clamp(1 - smoothstep(2.04, 2.36, t));
  if (vis <= 0.002) return;
  const cam = S.cam;

  const assemble = clamp(smoothstep(M.s1_clipback - 0.04, M.s1_clipback + 0.40, t));
  const dotB = dotSprite(PAL.blueBright, 48);
  const dotI = dotSprite(PAL.indigoSoft, 48);
  const glowB = glowSprite(PAL.blueBright, 128, 2.8);

  // --- links
  ctx.save();
  ctx.lineCap = 'round';
  for (const lk of S.hookLinks) {
    const a = S.hookNodes[lk.a], b = S.hookNodes[lk.b];
    const g = clamp((t - lk.born) / 0.22);
    if (g <= 0) continue;
    const ga = ease.outQuint(g);
    const pa = hookPos(a, t, assemble);
    const pb = hookPos(b, t, assemble);
    const sa = cam.project(pa.x, pa.y, 1);
    const sb = cam.project(lerp(pa.x, pb.x, ga), lerp(pa.y, pb.y, ga), 1);
    const al = vis * (0.30 + 0.25 * Math.sin(t * 1.7 + lk.a)) * (1 - assemble * 0.35);
    ctx.strokeStyle = rgba(PAL.indigoSoft, al);
    ctx.lineWidth = Math.max(0.7, 1.25 * sa.s);
    ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();

    // data pulse along the link
    if (g >= 1) {
      const u = ((t * 0.55 + lk.a * 0.31) % 1);
      const px = lerp(pa.x, pb.x, u), py = lerp(pa.y, pb.y, u);
      const sp = cam.project(px, py, 1);
      blit(ctx, dotB, sp.x, sp.y, 5.5 * sp.s, vis * 0.85 * Math.sin(u * Math.PI));
    }
  }
  ctx.restore();

  // --- nodes
  for (let i = 0; i < S.hookNodes.length; i++) {
    const nd = S.hookNodes[i];
    const b = clamp((t - nd.born) / 0.26);
    if (b <= 0) continue;
    const eb = ease.outBackSoft(b);
    const p0 = hookPos(nd, t, assemble);
    const sp = cam.project(p0.x, p0.y, 1);
    const breathe = 0.82 + 0.18 * Math.sin(t * nd.sp * 2.2 + nd.ph);
    const rr = nd.r * eb * breathe * sp.s * (1 - assemble * 0.42);
    const a = vis * (0.85 + 0.15 * breathe) * (1 - assemble * 0.3);
    blit(ctx, glowB, sp.x, sp.y, rr * 9, a * 0.26);
    blit(ctx, i < 2 ? dotB : dotI, sp.x, sp.y, rr * 2.1, a);
    if (i === 0) ring(ctx, sp.x, sp.y, rr * 3.0 + impulse(t, M.s1_have, 0.5) * 26 * sp.s, 1.6, PAL.blue, a * 0.35 * (1 - clamp((t - M.s1_have) / 1.4)));
  }

  // --- anchors stay outside and stay wired to the mark being built
  if (assemble > 0.01) {
    ctx.save();
    ctx.lineCap = 'round';
    for (const nd of S.hookNodes) {
      if (!nd.anchor) continue;
      const pa = hookPos(nd, t, assemble);
      const sa = cam.project(pa.x, pa.y, 1);
      const sb = cam.project(nd.target.x, nd.target.y, 1);
      const al = vis * assemble * 0.34;
      ctx.strokeStyle = rgba(PAL.indigoSoft, al);
      ctx.lineWidth = Math.max(0.7, 1.1 * sa.s);
      ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();
      const u = ((t * 0.7 + nd.ph) % 1);
      const px = lerp(sa.x, sb.x, u), py = lerp(sa.y, sb.y, u);
      blit(ctx, dotB, px, py, 5.5 * sa.s, vis * assemble * 0.9 * Math.sin(u * Math.PI));
    }
    ctx.restore();
  }

  // --- the wordmark itself (real text, mask-revealed as the cloud lands)
  const anchor = cam.project(L.hook.x, L.hook.y, 1);
  const wordP = clamp(smoothstep(M.s1_clipback + 0.03, M.s1_clipback + 0.46, t));
  if (wordP > 0.002) {
    const size = 168 * anchor.s;
    const hold = clamp(smoothstep(M.s1_clipback + 0.3, M.s1_clipback + 0.9, t));
    // soft scrim so the type always reads
    ctx.save();
    const sc = ctx.createRadialGradient(anchor.x, anchor.y - size * 0.3, 0, anchor.x, anchor.y - size * 0.3, size * 4.0);
    sc.addColorStop(0, `rgba(5,6,10,${0.5 * wordP * vis})`);
    sc.addColorStop(1, 'rgba(5,6,10,0)');
    ctx.fillStyle = sc;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    drawTracked(ctx, T.wordmark, anchor.x, anchor.y + size * 0.36, {
      font: FONT.display, size, tracking: 10 * anchor.s, color: PAL.ink, align: 'center', alpha: vis,
      perChar: (i, n) => {
        const d = i / Math.max(1, n - 1);
        const p = clamp((wordP - d * 0.22) / 0.52);
        const e = ease.outQuint(p);
        return {
          alpha: e,
          dy: (1 - e) * 26 * anchor.s,
          scale: lerp(0.92, 1, e) * (1 + 0.012 * Math.sin(t * 2.1 + i)),
        };
      },
    });

    // kinetic highlight sweep across the wordmark
    const sweep = clamp((t - (M.s1_clipback + 0.55)) / 0.7);
    if (sweep > 0 && sweep < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gx = lerp(anchor.x - size * 3.1, anchor.x + size * 3.1, ease.inOutCubic(sweep));
      const g = ctx.createLinearGradient(gx - size * 0.9, 0, gx + size * 0.9, 0);
      g.addColorStop(0, 'rgba(98,194,255,0)');
      g.addColorStop(0.5, `rgba(120,200,255,${0.16 * Math.sin(sweep * Math.PI) * vis})`);
      g.addColorStop(1, 'rgba(98,194,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, anchor.y - size * 0.95, W, size * 1.45);
      ctx.restore();
    }

    // construction sparks sitting on the letterform edges, then settling out
    const sparkFade = clamp(smoothstep(M.s1_clipback + 0.70, M.s1_clipback + 1.45, t));
    if (assemble > 0.05 && sparkFade < 0.999) {
      const sa = vis * assemble * (1 - sparkFade);
      for (let i = 0; i < S.hookNodes.length; i++) {
        const nd = S.hookNodes[i];
        if (nd.anchor) continue;
        const pp = hookPos(nd, t, assemble);
        const sp2 = cam.project(pp.x, pp.y, 1);
        const tw = 0.6 + 0.4 * Math.sin(t * 5.2 + nd.ph * 3);
        blit(ctx, glowB, sp2.x, sp2.y, 60 * sp2.s * tw, sa * 0.34);
        blit(ctx, dotSprite(PAL.blueBright, 32), sp2.x, sp2.y, 6.0 * sp2.s * tw, sa * 0.95);
      }
      // residual edge points tracing the glyph outline, released outward
      for (let i = 0; i < 56; i++) {
        const q = S.wordEdges[(i * 37 + 5) % S.wordEdges.length];
        const dx = q.x - L.hook.x, dy = q.y - L.hook.y;
        const dl = Math.hypot(dx, dy) || 1;
        const push = sparkFade * 90;
        const sp2 = cam.project(q.x + (dx / dl) * push, q.y + (dy / dl) * push * 0.55, 1);
        const ph = (i * 0.7) % TAU;
        const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.6 + ph));
        blit(ctx, dotSprite(PAL.blueBright, 32), sp2.x, sp2.y, 5.0 * sp2.s * tw, sa * 0.85 * tw);
      }
    }

    // underline rule grows with the hold
    const uw = 420 * anchor.s * ease.outQuint(hold);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(anchor.x - uw, 0, anchor.x + uw, 0);
    lg.addColorStop(0, 'rgba(74,91,214,0)');
    lg.addColorStop(0.5, `rgba(108,123,238,${0.85 * vis * hold})`);
    lg.addColorStop(1, 'rgba(74,91,214,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(anchor.x - uw, anchor.y + size * 0.62, uw * 2, Math.max(1.2, 2.0 * anchor.s));
    ctx.restore();
  }
}

/** Lines that carry the hook downward into the ecosystem — one continuous move. */
function drawFeedLines(ctx, t, S) {
  const { M, L } = S;
  const a = clamp(smoothstep(1.42, 2.15, t)) * (1 - clamp(smoothstep(M.s2_platform, M.s2_platform + 0.9, t)));
  if (a <= 0.004) return;
  const cam = S.cam;
  const E = L.ecosystem;
  const targets = [E.creator, E.content, E.campaign];
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < targets.length; i++) {
    const tg = targets[i];
    const x0 = L.hook.x + tg.x * 0.55;
    const p0 = { x: x0, y: L.hook.y + 150 };
    const p1 = { x: x0, y: L.hook.y + 520 };
    const p2 = { x: tg.x, y: tg.y - 420 };
    const p3 = { x: tg.x, y: tg.y - tg.h / 2 - 20 };
    const grow = ease.inOutCubic(clamp((t - (1.45 + i * 0.1)) / 1.15));
    const pts = samplePath(cam, p0, p1, p2, p3, 40, 1);
    streamCore(ctx, pts, PAL.indigoSoft, a * 0.4, 1.4, { from: 0, to: grow });
    for (let k = 0; k < 3; k++) {
      const u = ((t * 0.42 + k / 3 + i * 0.17) % 1) * grow;
      const idx = clamp(u) * (pts.length - 1);
      const q = pts[Math.round(idx)];
      if (!q) continue;
      blit(ctx, dotSprite(PAL.blueBright, 32), q.x, q.y, 6 * q.s, a * 0.9 * Math.sin(clamp(u / Math.max(0.001, grow)) * Math.PI));
    }
  }
  ctx.restore();
}

function hookPos(nd, t, assemble) {
  const wob = {
    x: nd.x + Math.sin(t * nd.sp + nd.ph) * 16,
    y: nd.y + Math.cos(t * nd.sp * 0.82 + nd.ph) * 13,
  };
  if (assemble <= 0.001 || nd.anchor) return wob;
  const e = ease.inOutQuart(assemble);
  return { x: lerp(wob.x, nd.target.x, e), y: lerp(wob.y, nd.target.y, e) };
}

// ===========================================================================
// SCENE 02 — creator content ecosystem
// ===========================================================================
function ecoCards(S) {
  const E = S.L.ecosystem;
  return [
    { key: 'creator', ...E.creator, title: S.T.creator, sub: 'NODE 01', accent: PAL.blue, kind: 2, born: S.M.s2_clipback },
    { key: 'content', ...E.content, title: S.T.content, sub: 'NODE 02', accent: PAL.blueBright, kind: 0, born: S.M.s2_contentFocused },
    { key: 'campaign', ...E.campaign, title: S.T.campaign, sub: 'NODE 03', accent: PAL.indigoSoft, kind: 1, born: S.M.s2_reward },
    { key: 'reward', ...E.reward, title: S.T.reward, sub: 'NODE 04', accent: PAL.violetSoft, kind: 3, born: S.M.s2_campaigns },
  ];
}

function drawEcosystem(ctx, t, S, energy) {
  const { M, L, T } = S;
  const cam = S.cam;
  const cards = ecoCards(S);
  // converge into the CREATOR CONTENT spine node during scene 3
  const merge = clamp(smoothstep(M.s3_according + 0.25, M.s3_clipback + 0.55, t));
  const gone = clamp(smoothstep(M.s3_clipback + 0.3, M.s3_clipback + 0.9, t));
  const target = L.spine.creatorContent;
  const ghostLife = clamp(smoothstep(M.s3_clipback, M.s3_clipback + 0.8, t)) * (1 - clamp(smoothstep(M.s3_divided - 0.6, M.s3_divided + 0.5, t)));
  if (gone >= 0.999 && ghostLife <= 0.004) return;

  // --- platform substrate plate (appears on "platform")
  const sub = clamp(smoothstep(M.s2_platform, M.s2_platform + 0.75, t)) * (1 - merge * 0.9);
  if (sub > 0.004) {
    const cy = -1240;
    const pw = 980, ph = 1180;
    const p = cam.project(0, cy, 0.9);
    ctx.save();
    ctx.globalAlpha = 1;
    const g = ctx.createLinearGradient(0, p.y - (ph / 2) * p.s, 0, p.y + (ph / 2) * p.s);
    g.addColorStop(0, rgba(PAL.indigo, 0.0));
    g.addColorStop(0.5, rgba(PAL.indigo, 0.06 * sub));
    g.addColorStop(1, rgba(PAL.indigo, 0.0));
    ctx.fillStyle = g;
    ctx.fillRect(p.x - (pw / 2) * p.s, p.y - (ph / 2) * p.s, pw * p.s, ph * p.s);
    ctx.strokeStyle = rgba(PAL.indigoSoft, 0.22 * sub);
    ctx.lineWidth = Math.max(1, 1.2 * p.s);
    roundRectPath(ctx, p.x - (pw / 2) * p.s, p.y - (ph / 2) * p.s, pw * p.s, ph * p.s, 26 * p.s);
    ctx.stroke();
    // corner ticks
    ctx.strokeStyle = rgba(PAL.blue, 0.5 * sub);
    ctx.lineWidth = Math.max(1.4, 2.2 * p.s);
    const cl = 28 * p.s;
    const bx = p.x - (pw / 2) * p.s, by = p.y - (ph / 2) * p.s, bw = pw * p.s, bh = ph * p.s;
    for (const [cx, cy2, sx, sy] of [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(cx + sx * cl, cy2); ctx.lineTo(cx, cy2); ctx.lineTo(cx, cy2 + sy * cl); ctx.stroke();
    }
    ctx.restore();
  }

  // --- system scaffold: structure snaps in first, content populates it later
  const scaf = clamp(smoothstep(M.s2_in - 0.42, M.s2_in + 0.35, t));
  const ghost = ghostLife;
  if (scaf > 0.004) {
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const filled = clamp((t - c.born) / 0.45);
      const stay = { x: c.x + Math.sin(t * 0.34 + c.x * 0.013) * 11, y: c.y + Math.cos(t * 0.29 + c.y * 0.009) * 9 };
      const pos = cardPos(c, t, merge, target);
      const live = scaf * (1 - merge) * (1 - filled * 0.8);
      const gh = ghost * 0.55;
      const a = Math.max(live, gh);
      if (a <= 0.005) continue;
      const usePos = live >= gh ? pos : stay;
      slot(ctx, cam, {
        x: usePos.x, y: usePos.y, w: c.w, h: c.h, t,
        alpha: a * guard(cam, usePos.x, usePos.y, c.w / 2 + 14, c.h / 2 + 14, 1, 70),
        build: clamp((t - (M.s2_in - 0.38 + i * 0.09)) / 0.42), accent: PAL.indigo, seed: i * 1.7,
      });
      // upstream feed lines into the spine node once the cards have merged
      if (gh > 0.01 && gh > live) {
        const pa = cam.project(stay.x, stay.y + c.h / 2, 1);
        const pb = cam.project(target.x, target.y - 46, 1);
        ctx.save();
        ctx.strokeStyle = rgba(PAL.indigo, gh * 0.5);
        ctx.lineWidth = Math.max(0.7, 1.0 * pa.s);
        ctx.setLineDash([6 * pa.s, 10 * pa.s]);
        ctx.lineDashOffset = -t * 30 * pa.s;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.quadraticCurveTo(pa.x, lerp(pa.y, pb.y, 0.6), pb.x, pb.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const u = ((t * 0.4 + i * 0.25) % 1);
        const qx = lerp(pa.x, pb.x, u * u), qy = lerp(pa.y, pb.y, u);
        blit(ctx, dotSprite(PAL.blueBright, 32), qx, qy, 5 * pa.s, gh * 0.9 * Math.sin(u * Math.PI));
        ctx.restore();
      }
    }
  }

  // --- connections between cards (drawn before cards)
  const links = [
    { a: 0, b: 1, born: M.s2_contentFocused + 0.12 },
    { a: 1, b: 2, born: M.s2_reward + 0.05 },
    { a: 2, b: 3, born: M.s2_campaigns + 0.05 },
    { a: 3, b: 0, born: M.s2_campaigns + 0.45 },
  ];
  for (const lk of links) {
    const A = cards[lk.a], B = cards[lk.b];
    const g = clamp((t - lk.born) / 0.4);
    if (g <= 0) continue;
    const pa = cardPos(A, t, merge, target);
    const pb = cardPos(B, t, merge, target);
    const mid = { x: (pa.x + pb.x) / 2 + (lk.a === 3 ? -430 : 90) * (1 - merge), y: (pa.y + pb.y) / 2 };
    const c1 = { x: lerp(pa.x, mid.x, 0.6), y: lerp(pa.y, mid.y, 0.35) };
    const c2 = { x: lerp(pb.x, mid.x, 0.6), y: lerp(pb.y, mid.y, 0.35) };
    const pts = samplePath(cam, pa, c1, c2, pb, 34, 1);
    const alpha = (1 - gone) * (0.55 + 0.25 * Math.sin(t * 1.3 + lk.a));
    streamCore(ctx, pts, PAL.indigoSoft, alpha * 0.5 * ease.outQuint(g), 1.5, { from: 0, to: ease.outQuint(g) });
    if (g > 0.6) {
      flowParticles(ctx, pts, t, {
        color: PAL.blueBright, count: 5, speed: 0.26 + 0.1 * energy, size: 4.2,
        alpha: (1 - gone) * 0.85, seed: lk.a, head: ease.outQuint(g),
      });
    }
  }

  // --- cards
  for (const c of cards) {
    const b = clamp((t - c.born) / 0.52);
    if (b <= 0) continue;
    const pos = cardPos(c, t, merge, target);
    const shrink = lerp(1, 0.18, ease.inOutQuart(merge));
    const gd = guard(cam, pos.x, pos.y, (c.w / 2) * shrink + 14, (c.h / 2) * shrink + 14, 1, 70);
    uiCard(ctx, cam, {
      x: pos.x, y: pos.y, w: c.w, h: c.h, depth: 1, t, alpha: (1 - gone) * clamp(b * 1.4) * gd,
      title: c.title, sub: c.sub, accent: c.accent, kind: c.kind,
      build: ease.outQuint(b), activity: 0.4 + energy * 0.6, scale: lerp(0.9, 1, ease.outBackSoft(b)) * shrink,
      rot: Math.sin(t * 0.3 + c.x * 0.01) * 0.005,
      glowAmt: 1,
    });
  }

  // --- CREATOR CONTENT kinetic headline
  const hp = clamp(smoothstep(M.s2_creator, M.s2_creator + 0.62, t));
  const hGuard = guard(cam, L.ecosystem.headline.x, L.ecosystem.headline.y, 430, 92, 1, 70);
  const hOut = clamp(Math.max(smoothstep(M.s3_according - 0.35, M.s3_according + 0.35, t), 1 - hGuard));
  if (hp > 0.002 && hOut < 0.999) {
    const hpos = cam.project(L.ecosystem.headline.x, L.ecosystem.headline.y, 1);
    const size = 62 * hpos.s;
    drawTracked(ctx, T.creatorContent, hpos.x, hpos.y, {
      font: FONT.xbold, size, tracking: 5 * hpos.s, color: PAL.ink, align: 'center',
      alpha: (1 - hOut),
      perChar: (i, n) => {
        const d = i / Math.max(1, n - 1);
        const p = clamp((hp - d * 0.3) / 0.55);
        const e = ease.outQuint(p);
        return { alpha: e, dy: (1 - e) * 20 * hpos.s, scale: lerp(0.94, 1, e) };
      },
    });
    eyebrow(ctx, S.T.eyebrowEcosystem, hpos.x, hpos.y - size * 1.05, {
      size: 19 * hpos.s, tracking: 7 * hpos.s, color: PAL.mute, alpha: (1 - hOut) * clamp(hp * 1.5),
      progress: clamp((t - M.s2_platform) / 0.6), align: 'center',
    });
    // animated measure rule under the headline
    const rw = 300 * hpos.s * ease.outQuint(hp);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(hpos.x - rw, 0, hpos.x + rw, 0);
    g.addColorStop(0, 'rgba(47,155,255,0)');
    g.addColorStop(0.5, `rgba(98,194,255,${0.75 * (1 - hOut)})`);
    g.addColorStop(1, 'rgba(47,155,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(hpos.x - rw, hpos.y + 26 * hpos.s, rw * 2, Math.max(1, 1.8 * hpos.s));
    ctx.restore();
  }
}

function cardPos(c, t, merge, target) {
  const drift = { x: c.x + Math.sin(t * 0.34 + c.x * 0.013) * 11, y: c.y + Math.cos(t * 0.29 + c.y * 0.009) * 9 };
  if (merge <= 0.001) return drift;
  const e = ease.inOutQuart(merge);
  return { x: lerp(drift.x, target.x, e), y: lerp(drift.y, target.y, e) };
}

// ===========================================================================
// SCENE 03 — spine: CREATOR CONTENT -> CREATOR FEES -> splitter
// ===========================================================================
function drawSpine(ctx, t, S, energy) {
  const { M, L, T } = S;
  const cam = S.cam;
  const CC = L.spine.creatorContent;
  const CF = L.spine.creatorFees;
  const SP = L.spine.split;

  const ccIn = clamp(smoothstep(M.s3_clipback + 0.1, M.s3_clipback + 0.7, t));
  const fade = clamp(smoothstep(M.fin_converge + 0.35, M.fin_collapse, t));
  const simplify = clamp(smoothstep(M.s6_thats, M.s6_clipback + 0.2, t));
  if (ccIn <= 0.002 || fade >= 0.999) return;
  const gAlpha = (1 - fade) * (1 - simplify * 0.78);

  // --- CREATOR CONTENT node
  const ccPulse = impulse(t, M.s3_clipback + 0.15, 0.7);
  const ccGuard = guard(cam, CC.x, CC.y, 190, 92);
  systemNode(ctx, cam, {
    x: CC.x, y: CC.y, r: 40 + ccPulse * 9, color: PAL.blue, t,
    alpha: gAlpha * ccIn * ccGuard, active: 1, segments: 3, spin: 0.22,
    label: T.creatorContent, labelSize: 30, labelGap: 24, labelAbove: true,
    labelAlpha: clamp(smoothstep(M.s3_clipback + 0.3, M.s3_clipback + 0.9, t)) * (1 - simplify * 0.3),
    labelFont: FONT.bold, labelTracking: 3.4,
  });

  // --- structural rails along the spine (keeps the frame architected)
  const railA = clamp(smoothstep(M.s3_according, M.s3_according + 0.8, t)) * (1 - clamp(smoothstep(M.s5_so, M.s5_so + 1.0, t)) * 0.65);
  if (railA > 0.01) {
    spineRails(ctx, cam, { x: 0, y0: CC.y + 70, y1: SP.y - 70, halfW: 158, t, alpha: gAlpha * railA * 0.9 });
  }

  // --- the platform layer the launch passes through
  const bandBuild = clamp((t - (M.s3_launched - 0.15)) / 0.6);
  const bandAlive = bandBuild * (1 - clamp(smoothstep(M.s5_so + 0.4, M.s5_so + 1.4, t)) * 0.7);
  if (bandAlive > 0.01) {
    band(ctx, cam, {
      y: -545, halfW: 470, t, alpha: gAlpha * bandAlive, build: bandBuild,
      label: 'PLATFORM', accent: PAL.indigoSoft,
      charge: impulse(t, M.s3_platform, 0.6) * 1.1,
    });
  }

  // --- empty socket where CREATOR FEES will ignite
  const socket = clamp(smoothstep(M.s3_when - 0.2, M.s3_when + 0.5, t)) * (1 - clamp(smoothstep(M.s3_generates - 0.15, M.s3_generates + 0.3, t)));
  if (socket > 0.01) {
    const p = cam.project(CF.x, CF.y, 1);
    for (let i = 0; i < 3; i++) {
      const rr = (34 + i * 16) * p.s;
      const a0 = t * (0.3 + i * 0.12) + i * 2;
      ring(ctx, p.x, p.y, rr, Math.max(0.9, 1.3 * p.s), PAL.indigo, gAlpha * socket * 0.38, a0, a0 + 1.7);
    }
    ring(ctx, p.x, p.y, 10 * p.s, Math.max(1, 1.5 * p.s), PAL.indigoSoft, gAlpha * socket * 0.7);
  }

  // --- creator content items flowing down into the platform, converting to fees
  const tileA = clamp(smoothstep(M.s3_when - 0.15, M.s3_when + 0.6, t)) * (1 - clamp(smoothstep(M.s3_divided - 0.3, M.s3_divided + 0.5, t)));
  if (tileA > 0.01) {
    const y0 = CC.y + 78, y1 = CF.y - 78;
    const uBand = (-545 - y0) / (y1 - y0);
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.185 + i / 7) % 1);
      const yy = lerp(y0, y1, u);
      const side = i % 2 ? 1 : -1;
      const xx = CC.x + side * lerp(188, 16, smoothstep(0.18, 0.82, u)) + Math.sin(u * 3.3 + i * 1.7) * 14;
      const pp = cam.project(xx, yy, 1);
      const sIn = Math.min(1, Math.sin(clamp(u) * Math.PI) * 3.2);
      const a = gAlpha * tileA * sIn;
      if (a < 0.01) continue;
      if (u < uBand) {
        // content tile
        const tw = 44 * pp.s, th = 30 * pp.s;
        ctx.save();
        roundRectPath(ctx, pp.x - tw / 2, pp.y - th / 2, tw, th, 5 * pp.s);
        ctx.fillStyle = rgba(PAL.charcoal2, a * 0.9);
        ctx.fill();
        ctx.strokeStyle = rgba(PAL.blue, a * 0.85);
        ctx.lineWidth = Math.max(0.8, 1.1 * pp.s);
        ctx.stroke();
        ctx.fillStyle = rgba(PAL.blueBright, a * 0.9);
        ctx.fillRect(pp.x - tw / 2 + 6 * pp.s, pp.y - 4 * pp.s, (tw - 12 * pp.s) * (0.35 + 0.5 * ((Math.sin(t * 2 + i) + 1) / 2)), 2.2 * pp.s);
        ctx.fillRect(pp.x - tw / 2 + 6 * pp.s, pp.y + 3 * pp.s, (tw - 12 * pp.s) * 0.55, 2.2 * pp.s);
        ctx.restore();
      } else {
        // converted to a fee quantum
        const conv = clamp((u - uBand) / 0.12);
        blit(ctx, glowSprite(PAL.blueBright, 96, 3.0), pp.x, pp.y, 46 * pp.s * conv, a * 0.28);
        blit(ctx, dotSprite(PAL.blueBright, 32), pp.x, pp.y, 8.5 * pp.s * conv, a);
      }
      // conversion flash exactly at the platform band
      const d = Math.abs(u - uBand);
      if (d < 0.035) {
        const f = 1 - d / 0.035;
        blit(ctx, glowSprite(PAL.ink, 96, 2.4), pp.x, pp.y, 110 * pp.s * f, a * 0.4 * f);
      }
    }
  }

  // --- coin-launch object travelling the spine
  const launchT = clamp((t - M.s3_coin) / (M.s3_generates - M.s3_coin));
  if (t > M.s3_coin - 0.1 && t < M.s3_generates + 1.6) {
    const lp = ease.inOutCubic(launchT);
    const pos = lerpPt(CC, CF, lp);
    const sp = cam.project(pos.x, pos.y, 1);
    const a = gAlpha * clamp(smoothstep(M.s3_coin, M.s3_coin + 0.2, t)) * (1 - clamp(smoothstep(M.s3_generates, M.s3_generates + 0.3, t)));
    const r = 17 * sp.s;
    blit(ctx, glowSprite(PAL.blueBright, 128, 2.6), sp.x, sp.y, r * 9, a * 0.3);
    ring(ctx, sp.x, sp.y, r, Math.max(1.4, 2.4 * sp.s), PAL.blueBright, a * 0.95);
    ring(ctx, sp.x, sp.y, r * 0.5, Math.max(1, 1.5 * sp.s), PAL.ink, a * 0.6);
    for (let i = 0; i < 3; i++) {
      const u = clamp(lp - 0.05 * (i + 1));
      const tp = lerpPt(CC, CF, u);
      const s2 = cam.project(tp.x, tp.y, 1);
      blit(ctx, dotSprite(PAL.blueBright, 32), s2.x, s2.y, 6 * s2.s * (1 - i * 0.22), a * 0.4 * (1 - i * 0.3));
    }
    drawTracked(ctx, T.labelCoin, sp.x + 96 * sp.s, sp.y + 6 * sp.s, {
      font: FONT.mono, size: 16 * sp.s, tracking: 3 * sp.s, color: PAL.mute, alpha: a * 0.85, align: 'left',
    });
  }

  // --- spine link CC -> CF
  const linkA = clamp(smoothstep(M.s3_coin - 0.2, M.s3_coin + 0.4, t));
  const pts1 = samplePath(cam, CC, { x: CC.x, y: CC.y + 150 }, { x: CF.x, y: CF.y - 150 }, CF, 24, 1);
  streamCore(ctx, pts1, PAL.indigo, gAlpha * 0.45 * linkA, 1.6, { from: 0, to: ease.outQuint(linkA) });

  // --- CREATOR FEES node
  const cfIn = clamp(smoothstep(M.s3_generates - 0.1, M.s3_generates + 0.5, t));
  const cfHeat = impulse(t, M.s3_generates, 0.8) + impulse(t, M.s5_creatorFees, 0.9) * clamp(smoothstep(M.s5_creatorFees - 0.1, M.s5_creatorFees, t));
  if (cfIn > 0.002) {
    const cfGuard = guard(cam, CF.x, CF.y, 180, 102);
    systemNode(ctx, cam, {
      x: CF.x, y: CF.y, r: 44 + cfHeat * 10, color: mixHex(PAL.blue, PAL.blueBright, 0.4), t,
      alpha: gAlpha * cfIn * cfGuard, active: 1, segments: 4, spin: -0.26, coreScale: 1 + cfHeat * 0.4,
      label: T.creatorFees, labelSize: 34, labelGap: 26, labelAbove: false,
      labelAlpha: clamp(smoothstep(M.s3_creator, M.s3_fees + 0.35, t)) * (1 - simplify * 0.25),
      labelFont: FONT.xbold, labelTracking: 3.6,
    });
    // emission burst on "generates"
    const em = impulse(t, M.s3_generates, 0.55);
    if (em > 0.01) {
      const p = cam.project(CF.x, CF.y, 1);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + t * 0.4;
        const d = (1 - em) * 150 * p.s;
        blit(ctx, dotSprite(PAL.blueBright, 32), p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 6 * p.s * em, gAlpha * em * 0.9);
      }
    }
  }

  // --- main fee stream CF -> splitter
  const flowIn = clamp(smoothstep(M.s3_fees - 0.05, M.s3_fees + 0.55, t));
  const ptsMain = samplePath(cam, CF, { x: CF.x, y: CF.y + 120 }, { x: SP.x, y: SP.y - 120 }, SP, 26, 1);
  if (flowIn > 0.002) {
    const headP = ease.outQuint(clamp((t - M.s3_fees) / 1.1));
    const thick = 26 * (0.6 + 0.4 * clamp(smoothstep(M.s3_those, M.s3_divided, t)));
    ribbon(ctx, ptsMain, () => thick, PAL.blue, gAlpha * 0.9 * flowIn, { from: 0, to: headP });
    streamCore(ctx, ptsMain, PAL.blueBright, gAlpha * 0.8 * flowIn, 2.4, { from: 0, to: headP });
    flowParticles(ctx, ptsMain, t, {
      color: PAL.blueBright, count: 16, speed: 0.34 + energy * 0.2, size: 6.0,
      alpha: gAlpha * flowIn, spread: 34, head: headP, seed: 3,
    });
  }

  // --- pending allocation socket (structure arrives before the event)
  const spSocket = clamp(smoothstep(M.s3_platform, M.s3_platform + 0.9, t)) * (1 - clamp(smoothstep(M.s3_divided - 0.55, M.s3_divided - 0.05, t)));
  if (spSocket > 0.01) {
    const p = cam.project(SP.x, SP.y, 1);
    for (let i = 0; i < 4; i++) {
      const rr = (30 + i * 15) * p.s;
      const a0 = -t * (0.22 + i * 0.1) + i * 1.6;
      ring(ctx, p.x, p.y, rr, Math.max(0.9, 1.3 * p.s), PAL.indigo, gAlpha * spSocket * 0.34, a0, a0 + 1.3);
    }
    ctx.save();
    ctx.strokeStyle = rgba(PAL.indigo, gAlpha * spSocket * 0.4);
    ctx.lineWidth = Math.max(0.8, 1.1 * p.s);
    ctx.setLineDash([7 * p.s, 11 * p.s]);
    ctx.lineDashOffset = -t * 24 * p.s;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 30 * p.s);
      ctx.quadraticCurveTo(p.x + sx * 60 * p.s, p.y + 160 * p.s, p.x + sx * 250 * p.s, p.y + 240 * p.s);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // --- splitter
  const spIn = clamp(smoothstep(M.s3_divided - 0.5, M.s3_divided, t));
  const open = clamp(smoothstep(M.s3_divided, M.s3_divMid + 0.25, t));
  const heat = impulse(t, M.s3_divMid, 0.6) * 1.1;
  if (spIn > 0.002) {
    splitter(ctx, cam, { x: SP.x, y: SP.y, r: 52, t, open, alpha: gAlpha * spIn, color: PAL.blueBright, heat });
    // divide ticks
    const tickA = clamp(smoothstep(M.s3_divided, M.s3_divided + 0.4, t)) * (1 - clamp(smoothstep(M.s4_eighty - 0.4, M.s4_eighty, t)));
    if (tickA > 0.01) {
      const p = cam.project(SP.x, SP.y, 1);
      drawTracked(ctx, T.eyebrowAlloc, p.x, p.y - 96 * p.s, {
        font: FONT.mono, size: 17 * p.s, tracking: 6 * p.s, color: PAL.mute, alpha: tickA * 0.9, align: 'center',
      });
    }
  }
}

// ===========================================================================
// SCENE 04/05 — allocation branches
// ===========================================================================
function branchPaths(S) {
  const { L } = S;
  const SP = L.spine.split;
  const B8 = L.branch80, B2 = L.branch20;
  return {
    p80: [SP, { x: SP.x - 30, y: SP.y + 110 }, { x: B8.chip.x + 10, y: B8.chip.y - 110 }, B8.chip],
    p80b: [B8.chip, { x: B8.chip.x, y: B8.chip.y + 120 }, { x: B8.campaign.x - 110, y: B8.campaign.y - 200 }, { x: B8.campaign.x - 110, y: B8.campaign.y - B8.campaign.h / 2 - 4 }],
    p20: [SP, { x: SP.x + 40, y: SP.y + 110 }, { x: B2.chip.x - 10, y: B2.chip.y - 110 }, B2.chip],
    p20b: [B2.chip, { x: B2.chip.x, y: B2.chip.y + 110 }, { x: B2.clip.x, y: B2.clip.y - 180 }, { x: B2.clip.x, y: B2.clip.y - 112 }],
  };
}

function drawBranches(ctx, t, S, energy) {
  const { M, L, T } = S;
  const cam = S.cam;
  const B8 = L.branch80, B2 = L.branch20;
  const P = branchPaths(S);

  const fade = clamp(smoothstep(M.fin_converge + 0.25, M.fin_collapse, t));
  const simplify = clamp(smoothstep(M.s6_thats, M.s6_clipback + 0.25, t));
  const gA = (1 - fade) * (1 - simplify * 0.80);
  if (gA <= 0.004) return;

  // ---------------- 80% branch ----------------
  const a80 = clamp(smoothstep(M.s3_divMid, M.s3_divMid + 0.55, t));
  const pts80 = samplePath(cam, ...P.p80, 26, 1);
  const hw80 = 30;
  if (a80 > 0.002) {
    const head = ease.outQuint(clamp((t - M.s3_divMid) / 0.8));
    ribbon(ctx, pts80, (u) => hw80 * (0.55 + 0.45 * u), PAL.blue, gA * 0.95 * a80, { from: 0, to: head });
    streamCore(ctx, pts80, PAL.blueBright, gA * 0.85 * a80, 2.6, { from: 0, to: head });
    flowParticles(ctx, pts80, t, {
      color: PAL.blueBright, count: 20, speed: 0.3 + energy * 0.22, size: 6.4,
      alpha: gA * a80, spread: 38, head, seed: 1,
    });
  }

  // 80% headline
  const p80In = clamp(smoothstep(M.s4_eighty - 0.08, M.s4_eighty + 0.42, t)) * guard(cam, B8.chip.x, B8.chip.y, 190, 110);
  if (p80In > 0.002) {
    const p = cam.project(B8.chip.x, B8.chip.y, 1);
    const size = 104 * p.s;
    const hit = impulse(t, M.s4_eighty, 0.5);
    drawTracked(ctx, T.eighty, p.x, p.y + size * 0.36, {
      font: FONT.black, size: size * (1 + hit * 0.035), tracking: 1 * p.s, color: PAL.ink, align: 'center',
      alpha: gA * clamp(p80In * 1.3),
      perChar: (i, n) => {
        const pr = clamp((p80In - (i / n) * 0.18) / 0.7);
        const e = ease.outQuint(pr);
        return { alpha: e, dy: (1 - e) * 22 * p.s, scale: lerp(0.9, 1, e) };
      },
    });
    // bracket
    const bw = 150 * p.s * ease.outQuint(p80In), bh = 86 * p.s * ease.outQuint(p80In);
    ctx.save();
    ctx.strokeStyle = rgba(PAL.blueBright, gA * 0.75 * p80In);
    ctx.lineWidth = Math.max(1.4, 2.4 * p.s);
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(p.x + sx * bw - sx * 26 * p.s, p.y - bh);
      ctx.lineTo(p.x + sx * bw, p.y - bh);
      ctx.lineTo(p.x + sx * bw, p.y + bh);
      ctx.lineTo(p.x + sx * bw - sx * 26 * p.s, p.y + bh);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 80% -> campaign stream
  const a80b = clamp(smoothstep(M.s4_directed, M.s4_directed + 0.5, t));
  const pts80b = samplePath(cam, ...P.p80b, 26, 1);
  if (a80b > 0.002) {
    const head = ease.outQuint(clamp((t - M.s4_directed) / 1.0));
    ribbon(ctx, pts80b, () => hw80, PAL.blue, gA * 0.95 * a80b, { from: 0, to: head });
    streamCore(ctx, pts80b, PAL.blueBright, gA * 0.8 * a80b, 2.6, { from: 0, to: head });
    flowParticles(ctx, pts80b, t, {
      color: PAL.blueBright, count: 20, speed: 0.32 + energy * 0.2, size: 6.2,
      alpha: gA * a80b, spread: 40, head, seed: 5,
    });
  }

  // ghost route for the 20% chain — the system always shows where it is going next
  const ghost20 = clamp(smoothstep(M.s4_eighty + 0.2, M.s4_eighty + 1.0, t))
    * (1 - clamp(smoothstep(M.s4_twenty - 0.5, M.s4_twenty + 0.25, t)));
  if (ghost20 > 0.01) {
    const route = samplePath(cam, ...P.p20, 30, 1)
      .concat(samplePath(cam, ...P.p20b, 34, 1));
    ctx.save();
    ctx.strokeStyle = rgba(PAL.violet, gA * ghost20 * 0.6);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 13]);
    ctx.lineDashOffset = -t * 26;
    ctx.beginPath();
    route.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    for (let k = 0; k < 2; k++) {
      const u = (t * 0.33 + k * 0.5) % 1;
      const q = route[Math.round(u * (route.length - 1))];
      if (q) blit(ctx, dotSprite(PAL.violetSoft, 32), q.x, q.y, 5.2 * q.s, gA * ghost20 * 0.75 * Math.sin(u * Math.PI));
    }
    // waiting slots along the route
    for (const nd of [B2.clip, B2.buy, B2.burn]) {
      const pp = cam.project(nd.x, nd.y, 1);
      ring(ctx, pp.x, pp.y, 18 * pp.s, Math.max(0.9, 1.3 * pp.s), PAL.violetSoft, gA * ghost20 * 0.55);
      ring(ctx, pp.x, pp.y, 30 * pp.s * (0.9 + 0.1 * Math.sin(t * 2 + nd.y)), Math.max(0.7, 1.0 * pp.s), PAL.indigo, gA * ghost20 * 0.3);
    }
  }

  // distribution out of the campaign module — rewards reaching creators
  const dist = clamp(smoothstep(M.s4_contentReward + 0.5, M.s4_contentReward + 1.3, t)) * (1 - clamp(smoothstep(37.4, 38.4, t)));
  if (dist > 0.01) {
    const y0 = B8.campaign.y + B8.campaign.h / 2;
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const fx = B8.campaign.x + (i - 2) * 118;
      const fy = y0 + 196 + (i % 2) * 72;
      const pa = cam.project(B8.campaign.x + (i - 2) * 52, y0, 1);
      const pb = cam.project(fx, fy, 1);
      const grow = ease.inOutCubic(clamp((t - (M.s4_contentReward + 0.55 + i * 0.09)) / 0.55));
      ctx.strokeStyle = rgba(PAL.blue, gA * dist * 0.5 * grow);
      ctx.lineWidth = Math.max(0.8, 1.1 * pa.s);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(lerp(pa.x, pb.x, grow), lerp(pa.y, pb.y, grow));
      ctx.stroke();
      const tw = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 1.3);
      blit(ctx, dotSprite(PAL.blueBright, 32), pb.x, pb.y, 7.0 * pb.s * grow, gA * dist * 0.95 * grow * tw);
      ring(ctx, pb.x, pb.y, 15 * pb.s * grow, Math.max(0.8, 1.1 * pb.s), PAL.blue, gA * dist * 0.4 * grow);
      const u = ((t * 0.5 + i * 0.19) % 1) * grow;
      blit(ctx, dotSprite(PAL.white, 32), lerp(pa.x, pb.x, u), lerp(pa.y, pb.y, u),
        4.2 * pa.s, gA * dist * 0.75 * Math.sin(clamp(u / Math.max(0.001, grow)) * Math.PI));
    }
    ctx.restore();
  }

  // pending structure for the campaign module
  const camSock = clamp(smoothstep(M.s4_eighty + 0.35, M.s4_eighty + 1.1, t)) * (1 - clamp(smoothstep(M.s4_contentReward - 0.45, M.s4_contentReward + 0.15, t)));
  if (camSock > 0.01) {
    slot(ctx, cam, {
      x: B8.campaign.x, y: B8.campaign.y, w: B8.campaign.w, h: B8.campaign.h, t,
      alpha: gA * camSock * 0.85 * guard(cam, B8.campaign.x, B8.campaign.y, B8.campaign.w / 2 + 16, B8.campaign.h / 2 + 16, 1, 64),
      build: clamp((t - (M.s4_eighty + 0.3)) / 0.5), accent: PAL.blue, seed: 3.1,
    });
  }

  // CONTENT REWARD CAMPAIGN module
  const camIn = clamp(smoothstep(M.s4_contentReward - 0.1, M.s4_contentReward + 0.6, t))
    * guard(cam, B8.campaign.x, B8.campaign.y, B8.campaign.w / 2 + 16, B8.campaign.h / 2 + 16, 1, 64);
  if (camIn > 0.002) {
    const recv = clamp(smoothstep(M.s4_campaign - 0.4, M.s4_campaign + 0.5, t));
    const p = cam.project(B8.campaign.x, B8.campaign.y, 1);
    const s = p.s;
    const w = B8.campaign.w * s * lerp(0.94, 1, ease.outBackSoft(camIn));
    const h = B8.campaign.h * s * lerp(0.94, 1, ease.outBackSoft(camIn));
    const alpha = gA * clamp(camIn * 1.3);
    ctx.save();
    roundRectPath(ctx, p.x - w / 2, p.y - h / 2, w, h, 18 * s);
    const bg = ctx.createLinearGradient(0, p.y - h / 2, 0, p.y + h / 2);
    bg.addColorStop(0, rgba(PAL.charcoal2, 0.95 * alpha));
    bg.addColorStop(1, rgba(PAL.black, 0.9 * alpha));
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = rgba(mixHex(PAL.line, PAL.blue, 0.5), alpha);
    ctx.lineWidth = Math.max(1.2, 1.6 * s); ctx.stroke();
    // top energy rail
    ctx.save();
    roundRectPath(ctx, p.x - w / 2, p.y - h / 2, w, h, 18 * s);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createLinearGradient(p.x - w / 2, 0, p.x + w / 2, 0);
    rg.addColorStop(0, 'rgba(47,155,255,0)');
    rg.addColorStop(0.5, `rgba(98,194,255,${0.95 * alpha})`);
    rg.addColorStop(1, 'rgba(47,155,255,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(p.x - w / 2, p.y - h / 2, w * ease.outQuint(camIn), 3 * s);
    const sh = ctx.createLinearGradient(0, p.y - h / 2, 0, p.y + h / 2);
    sh.addColorStop(0, `rgba(47,155,255,${0.10 * alpha * (0.5 + recv * 0.8)})`);
    sh.addColorStop(0.7, 'rgba(47,155,255,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
    ctx.restore();

    // label — exact string, one line
    drawMaskReveal(ctx, T.contentRewardCampaign, p.x, p.y - h * 0.08, {
      font: FONT.bold, size: 38 * s, tracking: 2.4 * s, color: PAL.ink,
      progress: clamp((t - M.s4_contentReward) / 0.7), align: 'center', dir: 'left', alpha,
    });
    eyebrow(ctx, 'ALLOCATION 80', p.x, p.y - h * 0.30, {
      size: 15 * s, tracking: 5 * s, color: PAL.mute, alpha: alpha * 0.85,
      progress: clamp((t - M.s4_contentReward - 0.1) / 0.5), align: 'center', tick: false,
    });

    // campaign responds: reward meter fills + reward packets emit
    const meterY = p.y + h * 0.22;
    const mW = w - 56 * s;
    ctx.fillStyle = rgba(PAL.line, alpha);
    roundRectPath(ctx, p.x - mW / 2, meterY, mW, 7 * s, 3.5 * s); ctx.fill();
    const fillAmt = clamp(smoothstep(M.s4_campaign - 0.5, M.s4_campaignEnd, t)) * (0.78 + 0.18 * Math.sin(t * 1.2));
    ctx.fillStyle = rgba(PAL.blueBright, alpha);
    roundRectPath(ctx, p.x - mW / 2, meterY, mW * clamp(fillAmt), 7 * s, 3.5 * s); ctx.fill();
    // reward dot row
    for (let i = 0; i < 12; i++) {
      const on = clamp(smoothstep(M.s4_campaign - 0.3 + i * 0.045, M.s4_campaign + i * 0.045, t));
      const bl = 0.35 + 0.65 * ((Math.sin(t * 2.4 + i * 0.8) + 1) / 2);
      ctx.fillStyle = rgba(PAL.blueBright, alpha * on * bl * 0.9);
      const dx = p.x - mW / 2 + (i + 0.5) * (mW / 12);
      ctx.beginPath(); ctx.arc(dx, meterY + 26 * s, 3.4 * s, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // emitted reward packets rising from the module
    if (recv > 0.02) {
      for (let i = 0; i < 10; i++) {
        const u = ((t * 0.42 + i * 0.1) % 1);
        const ang = -Math.PI / 2 + (((i * 37) % 11) / 11 - 0.5) * 1.5;
        const d = u * 230 * s;
        const px = p.x + Math.cos(ang) * d * 0.8;
        const py = p.y - h / 2 + Math.sin(ang) * d;
        blit(ctx, dotSprite(PAL.blueBright, 32), px, py, 5 * s * (1 - u * 0.4), gA * recv * 0.7 * Math.sin(u * Math.PI));
      }
    }
  }

  // ---------------- 20% branch ----------------
  const a20 = clamp(smoothstep(M.s3_divMid + 0.05, M.s3_divMid + 0.6, t));
  const pts20 = samplePath(cam, ...P.p20, 26, 1);
  const hw20 = hw80 * 0.25;   // 80 : 20 — physical volume carries the ratio
  if (a20 > 0.002) {
    const head = ease.outQuint(clamp((t - M.s3_divMid - 0.05) / 0.85));
    ribbon(ctx, pts20, (u) => hw20 * (0.6 + 0.4 * u), PAL.indigoSoft, gA * 0.9 * a20, { from: 0, to: head });
    streamCore(ctx, pts20, PAL.indigoSoft, gA * 0.7 * a20, 1.5, { from: 0, to: head });
    flowParticles(ctx, pts20, t, {
      color: PAL.indigoSoft, count: 6, speed: 0.3 + energy * 0.2, size: 4.0,
      alpha: gA * a20, spread: 10, head, seed: 2,
    });
  }

  // 20% headline
  const p20In = clamp(smoothstep(M.s4_twenty - 0.08, M.s4_twenty + 0.42, t)) * guard(cam, B2.chip.x, B2.chip.y, 134, 84);
  if (p20In > 0.002) {
    const p = cam.project(B2.chip.x, B2.chip.y, 1);
    const size = 72 * p.s;
    const hit = impulse(t, M.s4_twenty, 0.5);
    drawTracked(ctx, T.twenty, p.x, p.y + size * 0.36, {
      font: FONT.black, size: size * (1 + hit * 0.03), tracking: 1 * p.s, color: PAL.ink, align: 'center',
      alpha: gA * clamp(p20In * 1.3),
      perChar: (i, n) => {
        const pr = clamp((p20In - (i / n) * 0.18) / 0.7);
        const e = ease.outQuint(pr);
        return { alpha: e, dy: (1 - e) * 18 * p.s, scale: lerp(0.9, 1, e) };
      },
    });
    const bw = 104 * p.s * ease.outQuint(p20In), bh = 62 * p.s * ease.outQuint(p20In);
    ctx.save();
    ctx.strokeStyle = rgba(PAL.indigoSoft, gA * 0.7 * p20In);
    ctx.lineWidth = Math.max(1.2, 2.0 * p.s);
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(p.x + sx * bw - sx * 20 * p.s, p.y - bh);
      ctx.lineTo(p.x + sx * bw, p.y - bh);
      ctx.lineTo(p.x + sx * bw, p.y + bh);
      ctx.lineTo(p.x + sx * bw - sx * 20 * p.s, p.y + bh);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 20% -> $CLIP stream
  const a20b = clamp(smoothstep(M.s4_percent20, M.s4_percent20 + 0.5, t));
  const pts20b = samplePath(cam, ...P.p20b, 26, 1);
  if (a20b > 0.002) {
    const head = ease.outQuint(clamp((t - M.s4_percent20) / 0.9));
    ribbon(ctx, pts20b, () => hw20, PAL.indigoSoft, gA * 0.9 * a20b, { from: 0, to: head });
    streamCore(ctx, pts20b, PAL.violetSoft, gA * 0.72 * a20b, 1.6, { from: 0, to: head });
    flowParticles(ctx, pts20b, t, {
      color: PAL.violetSoft, count: 7, speed: 0.34 + energy * 0.2, size: 4.4,
      alpha: gA * a20b, spread: 10, head, seed: 7,
    });
  }

  // pending structure for the token mechanism
  const tokSock = clamp(smoothstep(M.s4_twenty + 0.15, M.s4_twenty + 0.8, t)) * (1 - clamp(smoothstep(M.s4_used - 0.45, M.s4_used + 0.1, t)));
  if (tokSock > 0.01) {
    const p = cam.project(B2.clip.x, B2.clip.y, 1);
    const a = gA * tokSock * guard(cam, B2.clip.x, B2.clip.y, 120, 150);
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * TAU - t * 0.3;
      ring(ctx, p.x, p.y, 92 * p.s, Math.max(1, 1.5 * p.s), PAL.indigo, a * 0.45, a0, a0 + 0.62);
    }
    ring(ctx, p.x, p.y, 20 * p.s * (0.8 + 0.2 * Math.sin(t * 2)), Math.max(1, 1.4 * p.s), PAL.indigoSoft, a * 0.6);
    ctx.save();
    ctx.strokeStyle = rgba(PAL.indigo, a * 0.4);
    ctx.lineWidth = Math.max(0.8, 1.1 * p.s);
    ctx.setLineDash([7 * p.s, 11 * p.s]);
    ctx.lineDashOffset = -t * 22 * p.s;
    const pb = cam.project(B2.burn.x, B2.burn.y, 1);
    ctx.beginPath(); ctx.moveTo(p.x, p.y + 104 * p.s); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // --- $CLIP token mechanism (a repeating cycle, not a one-off event)
  // form -> BUY (mass accrues) -> BURN (contract & extinguish) -> re-form.
  const formA   = clamp(smoothstep(M.s4_used - 0.15, M.s4_used + 0.45, t));
  const burnA   = clamp(smoothstep(M.s4_burn, M.s4_burn + 0.60, t));
  const outA    = clamp(smoothstep(M.s4_burn + 0.50, M.s4_burn + 0.88, t));
  const reformB = clamp(smoothstep(M.s4_out + 0.40, M.s4_out + 1.25, t)); // the chain stays complete on the map
  const massB   = clamp(smoothstep(M.s5b_creating - 0.2, M.s5b_specific + 0.3, t));
  const burnB   = clamp(smoothstep(M.s5b_mechanism, M.s5b_mechanism + 0.62, t));
  const reformC = clamp(smoothstep(M.s5b_clip - 0.22, M.s5b_clip + 0.45, t));

  const present = clamp(Math.max(formA * (1 - outA), reformB, reformC));
  const burnAmt = clamp(Math.max(burnA * (1 - reformB), burnB * (1 - reformC)));
  const massNow = clamp(Math.max(
    clamp(smoothstep(M.s4_buy - 0.05, M.s4_burn - 0.08, t)) * (1 - burnA),
    reformB * 0.35 + massB * 0.65 * (1 - burnB),
    reformC * (0.2 + 0.5 * clamp(smoothstep(M.s5b_clip, M.s5b_token + 0.4, t))),
  ));
  const clipHi = impulse(t, M.s5b_clip, 0.9) * 0.8;

  const tokenGuard = guard(cam, B2.clip.x, B2.clip.y, 140, 190);
  const tokenAlpha = gA * tokenGuard * present;

  if (tokenAlpha > 0.004) {
    tokenObject(ctx, cam, {
      x: B2.clip.x, y: B2.clip.y, r: 92 * (1 + clipHi * 0.06), t, alpha: tokenAlpha,
      form: present, mass: massNow, burn: burnAmt,
      label: T.token,
      labelAlpha: clamp(smoothstep(M.s4_used, M.s4_used + 0.5, t)) * (1 - burnAmt * 0.6),
    });
    // inward collapsing particles whenever a burn is happening
    if (burnAmt > 0.02 && burnAmt < 0.99) {
      const p = cam.project(B2.clip.x, B2.clip.y, 1);
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * TAU + t * 0.6;
        const d = (1 - burnAmt) * 180 * p.s;
        blit(ctx, dotSprite(PAL.emberSoft, 32), p.x + Math.cos(a) * d, p.y + Math.sin(a) * d,
          5.6 * p.s * (1 - burnAmt * 0.5), tokenAlpha * (1 - burnAmt) * 0.9);
      }
      ring(ctx, p.x, p.y, (1 - burnAmt) * 210 * p.s, Math.max(1, 2.4 * p.s), PAL.ember, tokenAlpha * (1 - burnAmt) * 0.5);
    }
  }

  // BUY / BURN stages — part of the permanent chain once established
  const stageOn = clamp(Math.max(
    clamp(smoothstep(M.s4_buy - 0.06, M.s4_buy + 0.34, t)) * (1 - outA * 0.0),
    reformB, reformC,
  ));
  const burnStageOn = clamp(Math.max(
    clamp(smoothstep(M.s4_burn - 0.06, M.s4_burn + 0.34, t)),
    reformB, reformC,
  ));
  const buyIn = stageOn * guard(cam, B2.buy.x, B2.buy.y, 120, 70);
  const burnIn = burnStageOn * guard(cam, B2.burn.x, B2.burn.y, 120, 70);
  const buyHit = Math.max(impulse(t, M.s4_buy, 0.6), impulse(t, M.s5b_creating, 0.6) * 0.7);
  const burnHit = Math.max(impulse(t, M.s4_burn, 0.6), impulse(t, M.s5b_mechanism, 0.6) * 0.7);

  if (buyIn > 0.002) {
    const cp = samplePath(cam, B2.clip, { x: B2.clip.x, y: B2.clip.y + 90 }, { x: B2.buy.x, y: B2.buy.y - 90 }, B2.buy, 14, 1);
    streamCore(ctx, cp, PAL.violetSoft, gA * 0.55 * buyIn, 1.5, { from: 0, to: ease.outQuint(buyIn) });
    flowParticles(ctx, cp, t, { color: PAL.violetSoft, count: 4, speed: 0.4, size: 3.8, alpha: gA * buyIn, head: 1, seed: 11 });
    chip(ctx, cam, {
      x: B2.buy.x, y: B2.buy.y, text: T.buy, size: 42 * (1 + buyHit * 0.05), accent: PAL.violetSoft,
      alpha: gA * buyIn, build: buyIn, t, tracking: 5, font: FONT.xbold,
    });
  }
  if (burnIn > 0.002) {
    const cp = samplePath(cam, B2.buy, { x: B2.buy.x, y: B2.buy.y + 60 }, { x: B2.burn.x, y: B2.burn.y - 60 }, B2.burn, 12, 1);
    streamCore(ctx, cp, mixHex(PAL.violetSoft, PAL.ember, 0.4), gA * 0.55 * burnIn, 1.5, { from: 0, to: ease.outQuint(burnIn) });
    chip(ctx, cam, {
      x: B2.burn.x, y: B2.burn.y, text: T.burn, size: 42 * (1 + burnHit * 0.05), accent: mixHex(PAL.violetSoft, PAL.ember, 0.55),
      alpha: gA * burnIn, build: burnIn, t, tracking: 5, font: FONT.xbold,
    });
    const p = cam.project(B2.burn.x, B2.burn.y, 1);
    const c = burnIn * (0.25 + burnHit);
    if (c > 0.01) {
      for (let i = 0; i < 3; i++) {
        const r = (1 - ((t * 0.5 + i / 3) % 1)) * 76 * p.s;
        ring(ctx, p.x, p.y + 68 * p.s, r, Math.max(1, 1.6 * p.s), PAL.ember, gA * c * 0.35 * (1 - r / (76 * p.s)));
      }
    }
  }

  // --- system map eyebrow during the pulled-back reconnection
  const mapLbl = clamp(smoothstep(M.s5_so, M.s5_so + 0.6, t)) * (1 - clamp(smoothstep(M.s5b_while - 0.4, M.s5b_while + 0.3, t)));
  if (mapLbl > 0.01) {
    eyebrow(ctx, T.eyebrowSystem, W / 2, 232, {
      size: 20, tracking: 8, color: PAL.mute, alpha: mapLbl * 0.95,
      progress: clamp((t - M.s5_so) / 0.6), align: 'center',
    });
  }
  const mechLbl = clamp(smoothstep(M.s5b_creating, M.s5b_creating + 0.6, t)) * (1 - clamp(smoothstep(M.s6_thats - 0.5, M.s6_thats, t)));
  if (mechLbl > 0.01) {
    eyebrow(ctx, T.eyebrowMech, W / 2, 232, {
      size: 20, tracking: 8, color: PAL.violetSoft, alpha: mechLbl * 0.9,
      progress: clamp((t - M.s5b_creating) / 0.6), align: 'center',
    });
  }

  // --- end-to-end "connect" highlight running the whole system
  const conn = clamp((t - M.s5_connect) / 1.9);
  if (conn > 0 && conn < 1) {
    const chain = [
      samplePath(cam, L.spine.creatorContent, { x: 0, y: L.spine.creatorContent.y + 150 }, { x: 0, y: L.spine.creatorFees.y - 150 }, L.spine.creatorFees, 18, 1),
      samplePath(cam, L.spine.creatorFees, { x: 0, y: L.spine.creatorFees.y + 120 }, { x: 0, y: L.spine.split.y - 120 }, L.spine.split, 18, 1),
      pts80, pts80b,
    ];
    const chain2 = [pts20, pts20b];
    const e = ease.inOutCubic(conn);
    const seg = e * chain.length;
    for (let i = 0; i < chain.length; i++) {
      const local = clamp(seg - i);
      if (local <= 0) continue;
      streamCore(ctx, chain[i], PAL.ink, gA * 0.5 * Math.sin(conn * Math.PI), 2.2,
        { from: Math.max(0, local - 0.35), to: local });
    }
    const seg2 = clamp((e - 0.5) * 2) * chain2.length;
    for (let i = 0; i < chain2.length; i++) {
      const local = clamp(seg2 - i);
      if (local <= 0) continue;
      streamCore(ctx, chain2[i], PAL.violetSoft, gA * 0.45 * Math.sin(conn * Math.PI), 1.8,
        { from: Math.max(0, local - 0.35), to: local });
    }
  }
}

// ===========================================================================
// SCENE 06 + FINAL
// ===========================================================================
function drawFinale(ctx, t, S, energy) {
  const { M, T } = S;

  // ---- CLIPBACK recall (screen-space foreground, the world keeps living behind it)
  const wIn = clamp(smoothstep(M.s6_clipback - 0.18, M.s6_clipback + 0.45, t));
  const wOut = clamp(smoothstep(M.fin_converge - 0.1, M.fin_converge + 0.75, t));
  const wA = wIn * (1 - wOut);
  if (wA > 0.003) {
    const cx = W / 2, cy = H * 0.455;
    const size = 128;
    ctx.save();
    const sc = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, 1020);
    sc.addColorStop(0, `rgba(5,6,10,${0.80 * wA})`);
    sc.addColorStop(0.42, `rgba(5,6,10,${0.62 * wA})`);
    sc.addColorStop(0.78, `rgba(5,6,10,${0.26 * wA})`);
    sc.addColorStop(1, 'rgba(5,6,10,0)');
    ctx.fillStyle = sc;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const float = Math.sin(t * 0.8) * 4;
    drawTracked(ctx, T.wordmark, cx, cy + size * 0.36 + float, {
      font: FONT.display, size: size * lerp(0.965, 1, ease.outQuint(wIn)), tracking: 9, color: PAL.ink, align: 'center',
      alpha: wA,
      perChar: (i, n) => {
        const d = i / Math.max(1, n - 1);
        const p = clamp((wIn - d * 0.26) / 0.6);
        const e = ease.outQuint(p);
        return { alpha: e, dy: (1 - e) * 24, scale: lerp(0.94, 1, e) };
      },
    });
    // substrate rule + mono tag
    const rw = 300 * ease.outQuint(wIn);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0);
    g.addColorStop(0, 'rgba(74,91,214,0)');
    g.addColorStop(0.5, `rgba(108,123,238,${0.8 * wA})`);
    g.addColorStop(1, 'rgba(74,91,214,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - rw, cy + size * 0.66, rw * 2, 2);
    ctx.restore();
    // --- the hold is never still: motes drift, a light pass crosses the letterforms
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sweep6 = (((t - M.s6_clipback) * 0.5) % 2.6);
    const sx6 = cx - 420 + sweep6 * 420;
    for (let i = 0; i < S.brandEdges.length; i += 2) {
      const q = S.brandEdges[i];
      const px = cx + q.x, py = cy + size * 0.36 + q.y - size * 0.42;
      const dx = Math.abs(px - sx6);
      const hit = dx < 140 ? Math.pow(1 - dx / 140, 2.4) : 0;
      const tw = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.3 + i * 0.5));
      const aa = wA * (hit * 0.75 + 0.08 * tw);
      if (aa < 0.012) continue;
      blit(ctx, dotSprite(hit > 0.3 ? PAL.white : PAL.blueBright, 32), px, py, 3 + hit * 4.6, aa);
    }
    for (let i = 0; i < S.finMotes.length; i++) {
      const r = S.finMotes[i];
      const span = H + 260;
      const y = H + 130 - (((t - M.s6_clipback + 6) * (22 + r.a * 48) + r.b * span) % span);
      const x = r.c * W + Math.sin(t * 0.5 + r.b * 9.1) * 28;
      const tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.3 + r.d * 11));
      blit(ctx, dotSprite(r.a > 0.74 ? PAL.violetSoft : PAL.blueBright, 32), x, y, 3 + r.a * 4.6, wA * 0.34 * tw);
    }
    ctx.restore();

    const plat = clamp(smoothstep(M.s6_around, M.s6_around + 0.6, t)) * (1 - wOut);
    if (plat > 0.01) {
      eyebrow(ctx, 'PLATFORM', cx, cy + size * 0.66 + 44, {
        size: 19, tracking: 9, color: PAL.mute, alpha: plat * 0.85,
        progress: clamp((t - M.s6_around) / 0.5), align: 'center', tick: false,
      });
    }
  }

  // ---- convergence streaks toward the centre
  const cv = clamp(smoothstep(M.fin_converge, M.fin_collapse, t));
  const cvOut = clamp(smoothstep(M.fin_collapse, M.fin_reveal + 0.1, t));
  if (cv > 0.004 && cvOut < 0.999) {
    const cx = W / 2, cy = H / 2;
    const a = cv * (1 - cvOut);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const ang = (i / 46) * TAU + i * 0.21;
      const u = ((t * 0.9 + i * 0.137) % 1);
      const d = lerp(1150, 0, ease.inCubic(u)) * (1 - cv * 0.25);
      const x0 = cx + Math.cos(ang) * d;
      const y0 = cy + Math.sin(ang) * d * 1.5;
      const len = lerp(10, 92, 1 - u) * (0.4 + cv);
      const x1 = cx + Math.cos(ang) * (d + len);
      const y1 = cy + Math.sin(ang) * (d + len) * 1.5;
      ctx.strokeStyle = rgba(i % 5 === 0 ? PAL.violetSoft : PAL.blueBright, a * 0.42 * Math.sin(u * Math.PI));
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.restore();
    // collapsing core
    const core = clamp(smoothstep(M.fin_collapse - 0.5, M.fin_collapse, t)) * (1 - clamp(smoothstep(M.fin_collapse, M.fin_collapse + 0.26, t)));
    if (core > 0.005) {
      blit(ctx, glowSprite(PAL.ink, 128, 2.2), cx, cy, 460 * core, core * 0.5);
      blit(ctx, dotSprite(PAL.white, 48), cx, cy, 44 * core, core);
    }
  }

  // ---- $CLIP reveal
  const rIn = clamp(smoothstep(M.fin_reveal - 0.06, M.fin_reveal + 0.38, t));
  if (rIn > 0.003) {
    const cx = W / 2, cy = H * 0.47;
    const bloom = impulse(t, M.fin_reveal, 0.55);
    // scrim so the mark always separates from the living network behind it
    ctx.save();
    const sc2 = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, 780);
    sc2.addColorStop(0, `rgba(5,6,10,${0.62 * rIn})`);
    sc2.addColorStop(0.5, `rgba(5,6,10,${0.4 * rIn})`);
    sc2.addColorStop(1, 'rgba(5,6,10,0)');
    ctx.fillStyle = sc2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    blit(ctx, glowSprite(PAL.violet, 128, 2.9), cx, cy - 10, 980 * rIn, 0.062 * rIn + bloom * 0.08);
    blit(ctx, glowSprite(PAL.indigo, 128, 2.6), cx, cy + 180, 1250 * rIn, 0.035 * rIn);
    ctx.restore();

    // shockwave ring at the moment of reveal
    const sw = clamp((t - M.fin_reveal) / 1.25);
    if (sw > 0 && sw < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const rr = ease.outQuint(sw) * (980 - i * 320);
        ctx.strokeStyle = rgba(i ? PAL.blueBright : PAL.violetSoft, Math.pow(1 - sw, 3) * (i ? 0.2 : 0.3));
        ctx.lineWidth = i ? 1.2 : 1.8;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10, rr, rr * 0.5, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    const size = 186;
    const settle = ease.outQuint(clamp((t - M.fin_reveal) / 0.9));
    drawTracked(ctx, T.token, cx, cy + size * 0.36, {
      font: FONT.display, size: size * lerp(1.055, 1, settle), tracking: 7, color: PAL.ink, align: 'center',
      alpha: rIn,
      perChar: (i, n) => {
        const d = i / Math.max(1, n - 1);
        const p = clamp((rIn - d * 0.2) / 0.66);
        const e = ease.outQuint(p);
        return { alpha: e, dy: (1 - e) * 30, scale: lerp(0.9, 1, e) * (1 + 0.006 * Math.sin(t * 1.5 + i * 0.7)) };
      },
    });

    // quiet orbit system around the mark — keeps the final frame alive
    const orb = clamp(smoothstep(M.fin_reveal + 0.3, M.fin_settle + 0.4, t));
    if (orb > 0.01) {
      ctx.save();
      for (let i = 0; i < 2; i++) {
        const rr = 330 + i * 150;
        const ry = rr * 0.42;
        const a0 = t * (0.11 + i * 0.05) + i * 2.1;
        ctx.save();
        ctx.strokeStyle = rgba(i === 1 ? PAL.violetSoft : PAL.indigoSoft, orb * 0.12);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10, rr, ry, 0.08 * (i - 1), 0, TAU);
        ctx.stroke();
        ctx.restore();
        for (let k = 0; k < 2; k++) {
          const ang = a0 + k * Math.PI;
          blit(ctx, dotSprite(i === 1 ? PAL.violetSoft : PAL.blueBright, 32),
            cx + Math.cos(ang) * rr, cy - 10 + Math.sin(ang) * ry, 7.5, orb * 0.8);
        }
      }
      ctx.restore();
    }
    // ---- sustained life on the end card: nothing in this film is ever still
    const live = clamp(smoothstep(M.fin_reveal + 0.35, M.fin_settle - 0.2, t));
    if (live > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // light pass travelling through the letterforms
      const sweepU = ((t - M.fin_reveal) * 0.42) % 2.35 / 1.0;   // long gap between passes
      const sweepX = (sweepU - 0.18) * 620 - 310 + cx;
      for (let i = 0; i < S.tokenEdges.length; i++) {
        const q = S.tokenEdges[i];
        const px = cx + q.x, py = cy + size * 0.36 + q.y - size * 0.42;
        const dx = Math.abs(px - sweepX);
        const hit = dx < 150 ? Math.pow(1 - dx / 150, 2.2) : 0;
        const tw = 0.3 + 0.7 * Math.sin(t * 2.1 + i * 0.6) * 0.5 + 0.35;
        const aa = live * (hit * 0.9 + 0.1 * tw);
        if (aa < 0.01) continue;
        blit(ctx, dotSprite(hit > 0.25 ? PAL.white : PAL.blueBright, 32), px, py, 3.4 + hit * 5.2, aa);
      }

      // ambient motes rising through the frame
      for (let i = 0; i < S.finMotes.length; i++) {
        const r = S.finMotes[i];
        const sp = 24 + r.a * 54;
        const span = H + 260;
        const y = H + 130 - (((t - M.fin_reveal) * sp + r.b * span) % span);
        const x = r.c * W + Math.sin(t * 0.45 + r.b * 9.1) * 30;
        const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.25 + r.d * 11));
        blit(ctx, dotSprite(r.a > 0.74 ? PAL.violetSoft : PAL.blueBright, 32),
          x, y, 3.2 + r.a * 5.4, live * 0.42 * tw);
      }

      // slow interface scan — a single hairline crossing the frame
      const scanU = (((t - M.fin_reveal) * 0.155) % 1);
      const sy = scanU * (H + 200) - 100;
      const sg = ctx.createLinearGradient(0, sy - 150, 0, sy + 150);
      sg.addColorStop(0, 'rgba(47,155,255,0)');
      sg.addColorStop(0.5, `rgba(98,194,255,${0.1 * live * Math.sin(scanU * Math.PI)})`);
      sg.addColorStop(1, 'rgba(47,155,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 150, W, 300);
      ctx.fillStyle = `rgba(160,205,255,${0.1 * live * Math.sin(scanU * Math.PI)})`;
      ctx.fillRect(0, sy, W, 1);
      ctx.restore();

      // breathing halo so the luminance never freezes
      const br = 0.5 + 0.5 * Math.sin((t - M.fin_reveal) * 1.05);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      blit(ctx, glowSprite(PAL.indigoSoft, 128, 2.6), cx, cy - 10, 700 + br * 180, live * (0.018 + br * 0.026));
      ctx.restore();
    }

    const rule = clamp(smoothstep(M.fin_reveal + 0.25, M.fin_reveal + 1.0, t));
    const rw = 220 * ease.outQuint(rule);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0);
    g.addColorStop(0, 'rgba(139,92,246,0)');
    g.addColorStop(0.5, `rgba(169,139,255,${0.7 * rule})`);
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - rw, cy + size * 0.68, rw * 2, 2);
    ctx.restore();
  }
}
