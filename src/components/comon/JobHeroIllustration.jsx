import React from "react";
import { Typewriter } from "react-simple-typewriter";

/**
 * Requires: npm install react-simple-typewriter
 *
 * JobHeroIllustration
 * -------------------------------
 * Self-contained isometric SVG illustration for the MEDINI Technologies /
 * ITTS hero. A drafting-desk scene — dashboard, security shield, CPU base,
 * server towers, data cylinders, cloud sync, and a branded workstation —
 * connected by circuit traces on an isometric ground plane.
 *
 * v2 changes:
 *  - One brand moment on the monitor: a wipe + underline draw + a small
 *    drafting-compass mark, then a quiet idle glow. No duplicate wordmark.
 *  - Warm parchment/graphite surfaces with a brass-gold primary accent and
 *    a deep-teal secondary accent (pulled from the page's forest-green
 *    wrapper), replacing the generic blue-on-white "SaaS dashboard" look.
 *  - Groups are named for what they are (iso-cluster-servers,
 *    iso-cluster-monitor, etc.) with their own one-shot entrance + idle
 *    motion, staggered so the scene assembles once instead of floating
 *    all at once.
 *
 * v3 changes:
 *  - The dashboard card is now a dark terminal window — a deliberately
 *    different color combination from the parchment scene around it, so
 *    it reads as its own focal point rather than blending in.
 *  - It types out "MEDINI TECHNOLOGIES" (looping into a tagline) using the
 *    react-simple-typewriter package, rendered via <foreignObject> so real
 *    HTML/CSS can sit inside the SVG. Terminal dots and bar-chart colors
 *    were updated to match the new dark card.
 *
 * Everything except the typewriter effect (shapes, layout, most of the
 * animation) is plain SVG/CSS scoped with an "iso-" class prefix, so it
 * still drops in anywhere with one dependency installed:
 *
 *   npm install react-simple-typewriter
 *
 * Usage:  <JobHeroIllustration />
 */

/* ---------------------------------------------------------------------- */
/*  Isometric projection helpers                                          */
/* ---------------------------------------------------------------------- */

const OX = 350; // origin x (px)
const OY = 220; // origin y (px)
const K1 = 46; // x half-step per grid unit
const K2 = 23; // y half-step per grid unit (2:1 iso ratio)
const UNIT = 48; // px per z (height) unit

// Project isometric grid coords (gx, gy, gz) -> screen [x, y]
function iso(gx, gy, gz = 0) {
  return [OX + (gx - gy) * K1, OY + (gx + gy) * K2 - gz * UNIT];
}
const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

// Build the three visible faces of an isometric box.
function boxFaces(gx, gy, gz, w, d, h) {
  const B = iso(gx + w, gy, gz);
  const C = iso(gx + w, gy + d, gz);
  const D = iso(gx, gy + d, gz);
  const Ap = iso(gx, gy, gz + h);
  const Bp = iso(gx + w, gy, gz + h);
  const Cp = iso(gx + w, gy + d, gz + h);
  const Dp = iso(gx, gy + d, gz + h);
  return {
    top: `M${pt(Ap)} L${pt(Bp)} L${pt(Cp)} L${pt(Dp)} Z`,
    right: `M${pt(B)} L${pt(C)} L${pt(Cp)} L${pt(Bp)} Z`,
    left: `M${pt(D)} L${pt(C)} L${pt(Cp)} L${pt(Dp)} Z`,
    topCenter: [(Ap[0] + Cp[0]) / 2, (Ap[1] + Cp[1]) / 2],
  };
}

// A single pie-slice path, angles in degrees, 0 = up, clockwise.
function pieSlice(cx, cy, r, startDeg, endDeg) {
  const rad = (d) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(
    1
  )},${y2.toFixed(1)} Z`;
}

// Horizontal accent/divider line across a box's right or left face at height fraction t (0..1)
function faceLine(gx, gy, gz, w, d, h, t, side = "right") {
  const z = gz + h * t;
  const p1 = side === "right" ? iso(gx + w, gy, z) : iso(gx, gy + d, z);
  const p2 = side === "right" ? iso(gx + w, gy + d, z) : iso(gx + w, gy + d, z);
  return [p1, p2];
}

/* ---------------------------------------------------------------------- */
/*  Static layout data                                                    */
/* ---------------------------------------------------------------------- */

const GROUND = [iso(1, 1), iso(7.6, 1), iso(7.6, 7.6), iso(1, 7.6)];

// Faint reference grid drawn on the ground plane for depth.
const GRID_LINES = (() => {
  const lines = [];
  for (let i = 2; i <= 7; i++) {
    lines.push([iso(i, 1), iso(i, 7.6)]);
    lines.push([iso(1, i), iso(7.6, i)]);
  }
  return lines;
})();

const CHIP = boxFaces(3.3, 3.3, 0, 1.4, 1.4, 0.45);
const CHIP_BLOCKS = [
  [3.4, 3.4, 0.45, 0.35, 0.35, 0.18],
  [3.85, 3.4, 0.45, 0.3, 0.3, 0.28],
  [4.15, 3.78, 0.45, 0.35, 0.3, 0.15],
  [3.38, 3.82, 0.45, 0.3, 0.35, 0.22],
  [3.9, 4.02, 0.45, 0.32, 0.3, 0.3],
  [3.55, 4.18, 0.45, 0.24, 0.24, 0.12],
].map((b) => boxFaces(...b));

const PIE_PLATFORM = boxFaces(1, 2.6, 0, 1.1, 1.1, 0.3);
const CLOUD_PLATFORM = boxFaces(1.3, 5.6, 0, 1.2, 1.2, 0.3);
const SERVER_STACK = boxFaces(5.6, 1.4, 0, 1.2, 0.9, 1.15);
const TOWER_A = boxFaces(6.0, 3.6, 0, 1.0, 1.0, 1.5);
const TOWER_B = boxFaces(7.0, 4.0, 0, 0.85, 0.85, 1.15);

// Desktop PC cluster — platform, tower/CPU box, monitor billboard.
const PC_PLATFORM = boxFaces(4.35, 5.5, 0, 1.5, 1.3, 0.3);
const PC_TOWER = boxFaces(5.35, 5.55, 0.3, 0.42, 0.5, 0.8);
const pcTowerRows = [0.25, 0.55, 0.85];

const CYL_LEFT = iso(0.2, 4.6, 0);
const CYL_CLOUD = iso(2.6, 6.8, 0);
const CYL_RIGHT = iso(4.6, 1.0, 0);
const CARD_ICON = iso(5.8, 0.9, 0.9);
const PC_MONITOR_ANCHOR = iso(4.75, 5.55, 0.3);

const TRACE_TARGETS = [
  [1.55, 3.15],
  [1.9, 6.2],
  [6.2, 1.85],
  [6.5, 4.1],
  [4.6, 1.0],
  [4.75, 5.55],
];

function tracePath(target) {
  const from = [4, 4];
  const [tx, ty] = target;
  const corner = [tx, from[1]];
  const p1 = iso(from[0], from[1], 0.02);
  const p2 = iso(corner[0], corner[1], 0.02);
  const p3 = iso(tx, ty, 0.02);
  return `M${pt(p1)} L${pt(p2)} L${pt(p3)}`;
}

// Dashboard mini bar-chart data: [x, height, topY] — every bar shares the
// baseline (topY + height = 198) so each can grow up from the same floor.
const DASHBOARD_BARS = [
  [352, 44, 154],
  [372, 62, 136],
  [392, 36, 162],
  [412, 78, 120],
  [432, 54, 144],
];

/* ---------------------------------------------------------------------- */
/*  Component                                                             */
/* ---------------------------------------------------------------------- */

export default function JobHeroIllustration() {
  const serverRows = [0.2, 0.42, 0.64, 0.86];
  const towerARows = [0.25, 0.5, 0.75];
  const towerBRows = [0.3, 0.65];

  return (
    <div
      className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0B2E24 0%, #123024 45%, #1F6B4F 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .iso-wrap {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          background: radial-gradient(120% 100% at 30% 15%, #FBF8EF 0%, #F3EDDB 55%, #ECE3C9 100%);
          border-radius: 24px;
          padding: 12px;
        }
        .iso-svg { width: 100%; height: auto; display: block; }

        /* ---- shared one-shot entrance ---- */
        .iso-scene-enter { animation: iso-fade-up 900ms cubic-bezier(.22,.61,.36,1) both; }
        @keyframes iso-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes iso-rise {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ---- idle motion, shared keyframes, per-cluster timing ---- */
        @keyframes iso-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes iso-sway {
          0%, 100% { transform: rotate(-2.5deg); }
          50%      { transform: rotate(2.5deg); }
        }

        /* Each on-scene cluster gets its own rule: a one-shot rise-in,
           then a subtle infinite idle motion, so the whole scene reads
           as one assembled moment rather than five separate loops. */
        .iso-cluster-pie        { opacity: 0; animation: iso-rise 650ms ease-out 60ms both, iso-float 5.2s ease-in-out 700ms infinite; }
        .iso-cluster-pie-cyl    { opacity: 0; animation: iso-rise 650ms ease-out 140ms both, iso-float 4.6s ease-in-out 800ms infinite; }
        .iso-cluster-cloud      { opacity: 0; animation: iso-rise 650ms ease-out 200ms both, iso-float 5.8s ease-in-out 900ms infinite; }
        .iso-cluster-cloud-cyl  { opacity: 0; animation: iso-rise 650ms ease-out 260ms both, iso-float 5.4s ease-in-out 1000ms infinite; }
        .iso-cluster-servers    { opacity: 0; animation: iso-rise 650ms ease-out 320ms both; }
        .iso-cluster-tower-a    { opacity: 0; animation: iso-rise 650ms ease-out 380ms both, iso-float 5s ease-in-out 1100ms infinite; }
        .iso-cluster-tower-b    { opacity: 0; animation: iso-rise 650ms ease-out 440ms both, iso-float 4.6s ease-in-out 1200ms infinite; }
        .iso-cluster-cyl-right  { opacity: 0; animation: iso-rise 650ms ease-out 500ms both, iso-float 5.6s ease-in-out 1300ms infinite; }
        .iso-cluster-card       { opacity: 0; animation: iso-rise 650ms ease-out 560ms both, iso-float 5.2s ease-in-out 1400ms infinite; }
        .iso-cluster-workstation{ opacity: 0; animation: iso-rise 650ms ease-out 260ms both; }
        .iso-cluster-tower-pc   { opacity: 0; animation: iso-rise 650ms ease-out 420ms both, iso-float 4.8s ease-in-out 1000ms infinite; }
        .iso-cluster-monitor    { opacity: 0; animation: iso-rise 650ms ease-out 480ms both, iso-float 5.2s ease-in-out 1100ms infinite; }
        .iso-cluster-keyboard   { opacity: 0; animation: iso-rise 650ms ease-out 540ms both; }
        .iso-cluster-chip       { opacity: 0; animation: iso-rise 700ms ease-out 100ms both; }
        .iso-cluster-shield     { opacity: 0; animation: iso-rise 700ms ease-out 640ms both, iso-float 5.4s ease-in-out 1300ms infinite; }
        .iso-cluster-dashboard  { opacity: 0; animation: iso-rise 700ms ease-out 700ms both; }

        .iso-pulse { animation: iso-pulse 3.6s ease-in-out infinite; transform-origin: center; }
        @keyframes iso-pulse {
          0%, 100% { opacity: .3; transform: scale(1); }
          50%      { opacity: .55; transform: scale(1.06); }
        }

        .iso-trace { stroke-dasharray: 6 7; animation: iso-dash 2.4s linear infinite; }
        @keyframes iso-dash { to { stroke-dashoffset: -52; } }

        .iso-blink { animation: iso-blink 2.8s ease-in-out infinite; }
        @keyframes iso-blink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
        .iso-led { animation: iso-blink 1.8s ease-in-out infinite; }
        .iso-led-delay { animation: iso-blink 1.8s ease-in-out infinite .6s; }

        /* ---- dashboard bars: grow up from the baseline, once, staggered ---- */
        .iso-bar { transform: scaleY(0); animation: iso-bar-grow 520ms cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes iso-bar-grow { to { transform: scaleY(1); } }

        /* ---- the one brand moment: monitor wordmark reveal ---- */
        .iso-screen-glow { animation: iso-screen-glow 3.4s ease-in-out 2.4s infinite; transform-origin: center; }
        @keyframes iso-screen-glow {
          0%, 100% { opacity: .25; }
          50%      { opacity: .5; }
        }
        .iso-scanline { animation: iso-scan 3.4s linear 2.6s infinite; }
        @keyframes iso-scan {
          0%   { transform: translateY(-26px); opacity: 0; }
          10%  { opacity: .4; }
          90%  { opacity: .4; }
          100% { transform: translateY(26px); opacity: 0; }
        }
        .iso-wipe {
          transform-origin: left center;
          animation: iso-wipe 950ms cubic-bezier(.65,0,.35,1) 900ms both;
        }
        @keyframes iso-wipe { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        .iso-word { opacity: 0; animation: iso-word-in 500ms ease-out 950ms forwards; }
        @keyframes iso-word-in { from { opacity: 0; transform: translateX(-3px); } to { opacity: 1; transform: translateX(0); } }
        .iso-subtitle { opacity: 0; animation: iso-fade-in 550ms ease-out 1250ms forwards; }
        @keyframes iso-fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        .iso-underline { stroke-dasharray: 26; stroke-dashoffset: 26; animation: iso-draw 550ms ease-out 1500ms forwards; }
        @keyframes iso-draw { to { stroke-dashoffset: 0; } }
        .iso-compass { opacity: 0; transform-origin: center; animation: iso-compass-in 500ms ease-out 1000ms forwards, iso-compass-idle 6s ease-in-out 1700ms infinite; }
        @keyframes iso-compass-in { from { opacity: 0; transform: rotate(-18deg) scale(.7); } to { opacity: 1; transform: rotate(-4deg) scale(1); } }
        @keyframes iso-compass-idle { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }

        @media (prefers-reduced-motion: reduce) {
          .iso-scene-enter,
          .iso-cluster-pie, .iso-cluster-pie-cyl, .iso-cluster-cloud, .iso-cluster-cloud-cyl,
          .iso-cluster-servers, .iso-cluster-tower-a, .iso-cluster-tower-b, .iso-cluster-cyl-right,
          .iso-cluster-card, .iso-cluster-workstation, .iso-cluster-tower-pc, .iso-cluster-monitor,
          .iso-cluster-keyboard, .iso-cluster-chip, .iso-cluster-shield, .iso-cluster-dashboard,
          .iso-pulse, .iso-trace, .iso-blink, .iso-led, .iso-led-delay, .iso-bar,
          .iso-screen-glow, .iso-scanline, .iso-wipe, .iso-word, .iso-subtitle, .iso-underline, .iso-compass {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="iso-wrap max-w-lg text-center relative z-10">
        <svg viewBox="0 0 700 620" className="iso-svg iso-scene-enter" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Primary accent: brass/gold — certification, precision, drafting brass. */}
            <linearGradient id="iso-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0C15C" />
              <stop offset="100%" stopColor="#D99A2B" />
            </linearGradient>
            <linearGradient id="iso-gold-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D99A2B" />
              <stop offset="100%" stopColor="#966215" />
            </linearGradient>
            {/* Secondary accent: deep teal-green, pulled from the page wrapper. */}
            <linearGradient id="iso-teal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3FA383" />
              <stop offset="100%" stopColor="#1F6B4F" />
            </linearGradient>
            <linearGradient id="iso-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12271E" />
              <stop offset="100%" stopColor="#081712" />
            </linearGradient>
            {/* Dashboard card is its own moment: a dark terminal window, distinct
                from the parchment scene around it, so the typed brand line pops. */}
            <linearGradient id="iso-terminal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C2438" />
              <stop offset="100%" stopColor="#10151F" />
            </linearGradient>
            <radialGradient id="iso-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D99A2B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#D99A2B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="iso-glow-soft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0C15C" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F0C15C" stopOpacity="0" />
            </radialGradient>
            <filter id="iso-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#4A3A16" floodOpacity="0.2" />
            </filter>
            <filter id="iso-shadow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#4A3A16" floodOpacity="0.16" />
            </filter>
            <clipPath id="iso-screen-clip">
              <rect x="-38" y="-27" width="76" height="52" rx="4" />
            </clipPath>
            <clipPath id="iso-terminal-clip">
              <rect x="196" y="52" width="310" height="186" rx="14" />
            </clipPath>
          </defs>

          {/* faint background texture */}
          <g stroke="#E7DEC0" strokeWidth="1" opacity="0.7">
            <line x1="0" y1="120" x2="260" y2="0" />
            <line x1="440" y1="620" x2="700" y2="470" />
          </g>

          {/* ground plane */}
          <polygon
            points={GROUND.map(pt).join(" ")}
            fill="#F3EDDB"
            stroke="#E1D8B8"
            strokeWidth="1.5"
          />
          <g stroke="#E7DFC4" strokeWidth="1">
            {GRID_LINES.map(([a, b], i) => (
              <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            ))}
          </g>
          <circle className="iso-pulse" cx={CHIP.topCenter[0]} cy={CHIP.topCenter[1]} r="150" fill="url(#iso-glow)" />

          {/* circuit traces */}
          <g fill="none" stroke="#D8C79B" strokeWidth="2" strokeLinecap="round">
            {TRACE_TARGETS.map((t, i) => (
              <path key={i} className="iso-trace" d={tracePath(t)} />
            ))}
          </g>
          {TRACE_TARGETS.map((t, i) => {
            const p = iso(t[0], t[1], 0.02);
            return <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#D99A2B" opacity="0.75" />;
          })}

          {/* ---------------- left cluster: certification-progress dial ---------------- */}
          <g className="iso-cluster-pie">
            <path d={PIE_PLATFORM.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={PIE_PLATFORM.left} fill="#E7DEC0" />
            <path d={PIE_PLATFORM.right} fill="#CFC295" />
            <circle cx={PIE_PLATFORM.topCenter[0]} cy={PIE_PLATFORM.topCenter[1]} r="24" fill="#F3EDDB" stroke="#E1D8B8" />
            <path d={pieSlice(PIE_PLATFORM.topCenter[0], PIE_PLATFORM.topCenter[1], 20, 0, 235)} fill="url(#iso-gold)" />
            <path d={pieSlice(PIE_PLATFORM.topCenter[0], PIE_PLATFORM.topCenter[1], 20, 235, 360)} fill="#FBF8EF" />
          </g>

          <g className="iso-cluster-pie-cyl" transform={`translate(${CYL_LEFT[0]}, ${CYL_LEFT[1]})`}>
            <ellipse cx="0" cy="26" rx="20" ry="6" fill="#CFC295" opacity="0.4" />
            <rect x="-15" y="-22" width="30" height="34" fill="url(#iso-gold)" />
            <ellipse cx="0" cy="-22" rx="15" ry="6" fill="#F5D485" />
            <path d="M-15 12 A15 6 0 0 0 15 12 L15 -22 A15 6 0 0 1 -15 -22 Z" fill="url(#iso-gold-dark)" opacity="0.5" />
          </g>

          {/* ---------------- lower-left cluster: cloud sync ---------------- */}
          <g className="iso-cluster-cloud">
            <path d={CLOUD_PLATFORM.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={CLOUD_PLATFORM.left} fill="#E7DEC0" />
            <path d={CLOUD_PLATFORM.right} fill="#CFC295" />
            <g transform={`translate(${CLOUD_PLATFORM.topCenter[0] - 24}, ${CLOUD_PLATFORM.topCenter[1] - 30})`}>
              <path
                d="M10 24 a10 10 0 0 1 -1 -19.9 A13 13 0 0 1 34 6 a9 9 0 0 1 -2 18 Z"
                fill="#FBF8EF"
                stroke="#CFC295"
                strokeWidth="1.5"
              />
              <path d="M22 20 v-11 M17 13 l5 -6 l5 6" fill="none" stroke="url(#iso-teal)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          <g className="iso-cluster-cloud-cyl" transform={`translate(${CYL_CLOUD[0]}, ${CYL_CLOUD[1]})`}>
            <ellipse cx="0" cy="20" rx="15" ry="5" fill="#CFC295" opacity="0.4" />
            <rect x="-12" y="-16" width="24" height="26" fill="url(#iso-teal)" />
            <ellipse cx="0" cy="-16" rx="12" ry="5" fill="#6FBFA0" />
          </g>

          {/* ---------------- right cluster: server stack + towers + reserve ---------------- */}
          <g className="iso-cluster-servers">
            <path d={SERVER_STACK.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={SERVER_STACK.left} fill="#E7DEC0" />
            <path d={SERVER_STACK.right} fill="#CFC295" />
            {serverRows.map((t, i) => {
              const [a, b] = faceLine(5.6, 1.4, 0, 1.2, 0.9, 1.15, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#B8A876" strokeWidth="1.2" />;
            })}
            {serverRows.map((t, i) => {
              const [a, b] = faceLine(5.6, 1.4, 0, 1.2, 0.9, 1.15, t + 0.06, "right");
              const mid = [(a[0] + b[0]) / 2 - 10, (a[1] + b[1]) / 2];
              return <circle key={i} className="iso-blink" cx={mid[0]} cy={mid[1]} r="2.6" fill="#D99A2B" />;
            })}
          </g>

          <g className="iso-cluster-tower-a">
            <path d={TOWER_A.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={TOWER_A.left} fill="#E7DEC0" />
            <path d={TOWER_A.right} fill="#CFC295" />
            {towerARows.map((t, i) => {
              const [a, b] = faceLine(6.0, 3.6, 0, 1.0, 1.0, 1.5, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#F0C15C" strokeWidth="2" />;
            })}
          </g>

          <g className="iso-cluster-tower-b">
            <path d={TOWER_B.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={TOWER_B.left} fill="#E7DEC0" />
            <path d={TOWER_B.right} fill="#CFC295" />
            {towerBRows.map((t, i) => {
              const [a, b] = faceLine(7.0, 4.0, 0, 0.85, 0.85, 1.15, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#6FBFA0" strokeWidth="2" />;
            })}
          </g>

          <g className="iso-cluster-cyl-right" transform={`translate(${CYL_RIGHT[0]}, ${CYL_RIGHT[1]})`}>
            <ellipse cx="0" cy="18" rx="14" ry="5" fill="#CFC295" opacity="0.4" />
            <rect x="-11" y="-15" width="22" height="24" fill="url(#iso-gold)" />
            <ellipse cx="0" cy="-15" rx="11" ry="4.5" fill="#F5D485" />
          </g>

          <g className="iso-cluster-card" transform={`translate(${CARD_ICON[0]}, ${CARD_ICON[1]})`}>
            <rect x="-16" y="-11" width="32" height="22" rx="4" fill="#FBF8EF" stroke="#CFC295" strokeWidth="1.4" />
            <rect x="-11" y="-5" width="22" height="4" rx="2" fill="url(#iso-teal)" />
            <rect x="-11" y="3" width="14" height="3" rx="1.5" fill="#CFC295" />
          </g>

          {/* ---------------- workstation cluster: platform + tower + monitor ---------------- */}
          <g className="iso-cluster-workstation" filter="url(#iso-shadow-soft)">
            <path d={PC_PLATFORM.top} fill="#FBF8EF" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={PC_PLATFORM.left} fill="#E7DEC0" />
            <path d={PC_PLATFORM.right} fill="#CFC295" />
          </g>

          <g className="iso-cluster-tower-pc">
            <path d={PC_TOWER.top} fill="#F3EDDB" stroke="#CFC295" strokeWidth="1.2" />
            <path d={PC_TOWER.left} fill="#E7DEC0" />
            <path d={PC_TOWER.right} fill="#CFC295" />
            {pcTowerRows.map((t, i) => {
              const [a, b] = faceLine(5.35, 5.55, 0.3, 0.42, 0.5, 0.8, t, "right");
              const mid = [(a[0] + b[0]) / 2 - 5, (a[1] + b[1]) / 2];
              return (
                <circle
                  key={i}
                  className={i === 1 ? "iso-led" : "iso-led-delay"}
                  cx={mid[0]}
                  cy={mid[1]}
                  r="2"
                  fill={i === 1 ? "#3FA383" : "#B8A876"}
                />
              );
            })}
          </g>

          {/* Monitor billboard — the single MEDINI Technologies brand moment */}
          <g
            className="iso-cluster-monitor"
            transform={`translate(${PC_MONITOR_ANCHOR[0] - 6}, ${PC_MONITOR_ANCHOR[1] - 96})`}
            filter="url(#iso-shadow-soft)"
          >
            <circle className="iso-screen-glow" cx="0" cy="-6" r="58" fill="url(#iso-glow-soft)" />

            {/* stand + base */}
            <rect x="-6" y="30" width="12" height="14" rx="2" fill="#CFC295" />
            <rect x="-22" y="42" width="44" height="6" rx="3" fill="#B8A876" />

            {/* bezel */}
            <rect x="-42" y="-32" width="84" height="58" rx="7" fill="#1C1710" />
            <rect x="-42" y="-32" width="84" height="58" rx="7" fill="none" stroke="#0D0A06" strokeWidth="1" />

            {/* screen content, revealed by a one-time wipe */}
            <g clipPath="url(#iso-screen-clip)">
              <rect x="-38" y="-27" width="76" height="52" rx="4" fill="url(#iso-screen)" />
              <rect className="iso-scanline" x="-38" y="-27" width="76" height="10" fill="#F0C15C" opacity="0.1" />

              {/* small drafting-compass mark, standing in for a logo icon */}
              <g className="iso-compass" transform="translate(-22, -3)">
                <circle cx="0" cy="-6" r="1.4" fill="#F0C15C" />
                <path d="M0 -6 L-6 8 M0 -6 L6 8" stroke="#F0C15C" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M-4.5 4.5 A5 5 0 0 0 4.5 4.5" stroke="#F0C15C" strokeWidth="1" fill="none" opacity="0.7" />
              </g>

              <text className="iso-word" x="6" y="-3" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fontWeight="700" fill="#F0C15C" letterSpacing="0.5">
                MEDINI
              </text>
              <text className="iso-subtitle" x="6" y="8" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="6" fontWeight="500" fill="#8FD9BE" letterSpacing="1.1">
                TECHNOLOGIES
              </text>
              <line className="iso-underline" x1="-9" y1="12.5" x2="21" y2="12.5" stroke="#D99A2B" strokeWidth="1.6" strokeLinecap="round" />

              {/* wipe mask — slides away once to reveal the wordmark above */}
              <rect className="iso-wipe" x="-38" y="-27" width="76" height="52" fill="#12271E" />
            </g>

            {/* power LED */}
            <circle className="iso-led" cx="34" cy="20" r="1.6" fill="#5EE0A0" />
          </g>

          {/* keyboard resting on the platform in front of the monitor */}
          <g className="iso-cluster-keyboard" transform={`translate(${PC_MONITOR_ANCHOR[0] - 6}, ${PC_MONITOR_ANCHOR[1] + 8})`}>
            <rect x="-26" y="-4" width="52" height="14" rx="3" fill="#FBF8EF" stroke="#CFC295" strokeWidth="1.2" />
            <rect x="-21" y="0" width="42" height="2.2" rx="1.1" fill="#E7DEC0" />
            <rect x="-21" y="4" width="26" height="2.2" rx="1.1" fill="#E7DEC0" />
          </g>

          {/* ---------------- CPU / chip base ---------------- */}
          <g className="iso-cluster-chip" filter="url(#iso-shadow)">
            <path d={CHIP.top} fill="#F3EDDB" stroke="#E1D8B8" strokeWidth="1.5" />
            <path d={CHIP.left} fill="#E7DEC0" />
            <path d={CHIP.right} fill="#CFC295" />
            {CHIP_BLOCKS.map((b, i) => (
              <g key={i}>
                <path d={b.top} fill={i % 2 === 0 ? "#FBF8EF" : "url(#iso-gold)"} stroke="#CFC295" strokeWidth="1" />
                <path d={b.left} fill="#E7DEC0" />
                <path d={b.right} fill="#CFC295" />
              </g>
            ))}
          </g>

          {/* ---------------- shield ---------------- */}
          <g className="iso-cluster-shield" transform="translate(250, 235)" filter="url(#iso-shadow)">
            <ellipse cx="42" cy="128" rx="52" ry="10" fill="#4A3A16" opacity="0.12" />
            <path d="M42 6 L20 10 L14 40 C14 76 42 96 42 96 C42 96 70 76 70 40 L64 10 Z"
                  fill="#E7DEC0" transform="translate(6,8)" />
            <path d="M42 0 L18 5 L12 36 C12 74 42 96 42 96 C42 96 72 74 72 36 L66 5 Z"
                  fill="#FBF8EF" stroke="#CFC295" strokeWidth="1.5" />
            <path d="M42 20 L58 44 L42 74 L26 44 Z" fill="url(#iso-gold)" />
          </g>

          {/* ---------------- dashboard screen: dark terminal card ---------------- */}
          <g className="iso-cluster-dashboard" filter="url(#iso-shadow)">
            <polygon points="196,60 506,60 522,74 522,238 196,238" fill="#0B0F1A" />
            <rect x="196" y="52" width="310" height="186" rx="14" fill="url(#iso-terminal)" stroke="#2A3350" strokeWidth="1.5" />

            {/* window chrome */}
            <circle cx="218" cy="76" r="4" fill="#E2735A" />
            <circle cx="232" cy="76" r="4" fill="#F0C15C" />
            <circle cx="246" cy="76" r="4" fill="#3FA383" />
            <rect x="264" y="71" width="200" height="10" rx="5" fill="#232C42" />

            {/* typed brand line — real HTML via foreignObject, powered by
                react-simple-typewriter (npm install react-simple-typewriter) */}
            <g clipPath="url(#iso-terminal-clip)">
              <foreignObject x="212" y="92" width="290" height="34">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontFamily: "'Fira Code', 'JetBrains Mono', ui-monospace, Menlo, monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#F0C15C",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                  }}
                >
                  <span style={{ color: "#6FBFA0", marginRight: "6px" }}>{">"}</span>
                  <Typewriter
                    words={["MEDINI TECHNOLOGIES", "LEARN. BUILD. CERTIFY."]}
                    loop={0}
                    cursor
                    cursorStyle="_"
                    cursorColor="#6FBFA0"
                    typeSpeed={65}
                    deleteSpeed={35}
                    delaySpeed={1800}
                  />
                </div>
              </foreignObject>
            </g>

            {/* muted output lines under the typed prompt */}
            <rect x="218" y="130" width="150" height="5" rx="2.5" fill="#2A3350" />
            <rect x="218" y="142" width="110" height="5" rx="2.5" fill="#2A3350" />

            {/* mini bar chart — bars grow up from the baseline once, staggered */}
            {DASHBOARD_BARS.map(([x, h, y], i) => (
              <rect
                key={i}
                className="iso-bar"
                x={x}
                y={y}
                width="14"
                height={h}
                rx="3"
                fill={i === 2 ? "url(#iso-gold)" : "url(#iso-teal)"}
                style={{ transformOrigin: `${x + 7}px 198px`, animationDelay: `${900 + i * 90}ms` }}
              />
            ))}
            <line x1="218" y1="198" x2="458" y2="198" stroke="#2A3350" strokeWidth="2" />
          </g>

          {/* twinkles */}
          <circle className="iso-blink" cx="120" cy="90" r="2.4" fill="#F0C15C" />
          <circle className="iso-blink" cx="580" cy="170" r="2" fill="#6FBFA0" />
          <circle className="iso-blink" cx="600" cy="500" r="2.2" fill="#F0C15C" />
        </svg>

       
      </div>
    </div>
  );
}