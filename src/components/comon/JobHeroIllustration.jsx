import React from "react";

/**
 * JobHeroIllustration
 * -------------------------------
 * Self-contained isometric SVG illustration in the style of a corporate
 * "cloud analytics platform" hero image: dashboard screen, shield, CPU
 * base, server towers, database cylinders, cloud upload, a branded
 * desktop PC (MEDINI Technologies), and connecting circuit traces on an
 * isometric ground plane.
 *
 * No external assets or libraries required — everything (shapes, colors,
 * animation keyframes) lives inside this one file, scoped with an
 * "iso-" class prefix so nothing leaks into the rest of your app.
 *
 * Drop it anywhere:  <JobHeroIllustration />
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

// New: desktop PC cluster — platform, tower/CPU box, monitor billboard.
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
          background: radial-gradient(120% 100% at 30% 15%, #FBFDFF 0%, #EEF2F8 55%, #E7ECF5 100%);
          border-radius: 24px;
          padding: 12px;
        }
        .iso-svg { width: 100%; height: auto; display: block; }

        .iso-enter { animation: iso-fade-up 900ms cubic-bezier(.22,.61,.36,1) both; }
        @keyframes iso-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .iso-float1 { animation: iso-float 5s ease-in-out infinite; }
        .iso-float2 { animation: iso-float 6s ease-in-out infinite 1s; }
        .iso-float3 { animation: iso-float 4.6s ease-in-out infinite .6s; }
        .iso-float4 { animation: iso-float 5.4s ease-in-out infinite 1.6s; }
        .iso-float5 { animation: iso-float 5.8s ease-in-out infinite .3s; }
        @keyframes iso-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .iso-pulse { animation: iso-pulse 3.6s ease-in-out infinite; transform-origin: center; }
        @keyframes iso-pulse {
          0%, 100% { opacity: .35; transform: scale(1); }
          50%      { opacity: .6; transform: scale(1.06); }
        }

        .iso-trace { stroke-dasharray: 6 7; animation: iso-dash 2.4s linear infinite; }
        @keyframes iso-dash { to { stroke-dashoffset: -52; } }

        .iso-blink { animation: iso-blink 2.8s ease-in-out infinite; }
        @keyframes iso-blink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }

        .iso-screen-glow { animation: iso-screen-glow 3.2s ease-in-out infinite; transform-origin: center; }
        @keyframes iso-screen-glow {
          0%, 100% { opacity: .28; }
          50%      { opacity: .55; }
        }

        .iso-scanline { animation: iso-scan 2.6s linear infinite; }
        @keyframes iso-scan {
          0%   { transform: translateY(-26px); opacity: 0; }
          10%  { opacity: .5; }
          90%  { opacity: .5; }
          100% { transform: translateY(26px); opacity: 0; }
        }

        .iso-cursor { animation: iso-cursor 1.1s step-end infinite; }
        @keyframes iso-cursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

        .iso-led { animation: iso-blink 1.8s ease-in-out infinite; }

        .iso-brand-text { animation: iso-type 3s steps(9) infinite; }
        @keyframes iso-type {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.5; }
        }

        .iso-brand-sub { animation: iso-fade-in 2s ease-out 1s both; }
        @keyframes iso-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .iso-brand-glow { animation: iso-glow-pulse 2.5s ease-in-out infinite; }
        @keyframes iso-glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .iso-blink-delayed { animation: iso-blink 1.8s ease-in-out infinite 0.5s; }

        @media (prefers-reduced-motion: reduce) {
          .iso-enter, .iso-float1, .iso-float2, .iso-float3, .iso-float4, .iso-float5,
          .iso-pulse, .iso-trace, .iso-blink, .iso-blink-delayed, .iso-screen-glow, .iso-scanline, .iso-cursor, .iso-led,
          .iso-brand-text, .iso-brand-sub, .iso-brand-glow {
            animation: none !important;
          }
          .iso-brand-sub {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="iso-wrap max-w-lg text-center relative z-10">
        <svg viewBox="0 0 700 620" className="iso-svg iso-enter" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="iso-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9CF2" />
              <stop offset="100%" stopColor="#2E7CE6" />
            </linearGradient>
            <linearGradient id="iso-blue-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E7CE6" />
              <stop offset="100%" stopColor="#164C99" />
            </linearGradient>
            <linearGradient id="iso-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#123A73" />
              <stop offset="100%" stopColor="#0B294F" />
            </linearGradient>
            <radialGradient id="iso-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2E7CE6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2E7CE6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="iso-glow-soft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2E7CE6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2E7CE6" stopOpacity="0" />
            </radialGradient>
            <filter id="iso-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1B4FA0" floodOpacity="0.18" />
            </filter>
            <filter id="iso-shadow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#1B4FA0" floodOpacity="0.16" />
            </filter>
            <clipPath id="iso-screen-clip">
              <rect x="-38" y="-27" width="76" height="52" rx="4" />
            </clipPath>
          </defs>

          {/* faint background texture */}
          <g stroke="#E3E9F2" strokeWidth="1" opacity="0.6">
            <line x1="0" y1="120" x2="260" y2="0" />
            <line x1="440" y1="620" x2="700" y2="470" />
          </g>

          {/* ground plane */}
          <polygon
            points={GROUND.map(pt).join(" ")}
            fill="#EEF2F8"
            stroke="#DCE4F0"
            strokeWidth="1.5"
          />
          <g stroke="#E1E7F1" strokeWidth="1">
            {GRID_LINES.map(([a, b], i) => (
              <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            ))}
          </g>
          <circle className="iso-pulse" cx={CHIP.topCenter[0]} cy={CHIP.topCenter[1]} r="150" fill="url(#iso-glow)" />

          {/* circuit traces */}
          <g fill="none" stroke="#B9C7DC" strokeWidth="2" strokeLinecap="round">
            {TRACE_TARGETS.map((t, i) => (
              <path key={i} className="iso-trace" d={tracePath(t)} />
            ))}
          </g>
          {TRACE_TARGETS.map((t, i) => {
            const p = iso(t[0], t[1], 0.02);
            return <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#2E7CE6" opacity="0.7" />;
          })}

          {/* ---------------- left cluster: pie platform + cylinder ---------------- */}
          <g className="iso-float2">
            <path d={PIE_PLATFORM.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={PIE_PLATFORM.left} fill="#DDE5F1" />
            <path d={PIE_PLATFORM.right} fill="#C7D2E4" />
            <circle cx={PIE_PLATFORM.topCenter[0]} cy={PIE_PLATFORM.topCenter[1]} r="24" fill="#EEF2F8" stroke="#DCE4F0" />
            <path d={pieSlice(PIE_PLATFORM.topCenter[0], PIE_PLATFORM.topCenter[1], 20, 0, 235)} fill="url(#iso-blue)" />
            <path d={pieSlice(PIE_PLATFORM.topCenter[0], PIE_PLATFORM.topCenter[1], 20, 235, 360)} fill="#FFFFFF" />
          </g>

          <g transform={`translate(${CYL_LEFT[0]}, ${CYL_LEFT[1]})`}>
            <g className="iso-float1">
              <ellipse cx="0" cy="26" rx="20" ry="6" fill="#B9C7DC" opacity="0.35" />
              <rect x="-15" y="-22" width="30" height="34" fill="url(#iso-blue)" />
              <ellipse cx="0" cy="-22" rx="15" ry="6" fill="#7FB0F6" />
              <path d="M-15 12 A15 6 0 0 0 15 12 L15 -22 A15 6 0 0 1 -15 -22 Z" fill="url(#iso-blue-dark)" opacity="0.5" />
            </g>
          </g>

          {/* ---------------- lower-left cluster: cloud platform + cylinder ---------------- */}
          <g className="iso-float3">
            <path d={CLOUD_PLATFORM.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={CLOUD_PLATFORM.left} fill="#DDE5F1" />
            <path d={CLOUD_PLATFORM.right} fill="#C7D2E4" />
            <g transform={`translate(${CLOUD_PLATFORM.topCenter[0] - 24}, ${CLOUD_PLATFORM.topCenter[1] - 30})`}>
              <path
                d="M10 24 a10 10 0 0 1 -1 -19.9 A13 13 0 0 1 34 6 a9 9 0 0 1 -2 18 Z"
                fill="#FFFFFF"
                stroke="#C7D2E4"
                strokeWidth="1.5"
              />
              <path d="M22 20 v-11 M17 13 l5 -6 l5 6" fill="none" stroke="url(#iso-blue)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          <g className="iso-float4" transform={`translate(${CYL_CLOUD[0]}, ${CYL_CLOUD[1]})`}>
            <ellipse cx="0" cy="20" rx="15" ry="5" fill="#B9C7DC" opacity="0.35" />
            <rect x="-12" y="-16" width="24" height="26" fill="url(#iso-blue)" />
            <ellipse cx="0" cy="-16" rx="12" ry="5" fill="#7FB0F6" />
          </g>

          {/* ---------------- right cluster: server stack + towers + cylinder ---------------- */}
          <g>
            <path d={SERVER_STACK.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={SERVER_STACK.left} fill="#DDE5F1" />
            <path d={SERVER_STACK.right} fill="#C7D2E4" />
            {serverRows.map((t, i) => {
              const [a, b] = faceLine(5.6, 1.4, 0, 1.2, 0.9, 1.15, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#A9B9D2" strokeWidth="1.2" />;
            })}
            {serverRows.map((t, i) => {
              const [a, b] = faceLine(5.6, 1.4, 0, 1.2, 0.9, 1.15, t + 0.06, "right");
              const mid = [(a[0] + b[0]) / 2 - 10, (a[1] + b[1]) / 2];
              return <circle key={i} className="iso-blink" cx={mid[0]} cy={mid[1]} r="2.6" fill="#2E7CE6" />;
            })}
          </g>

          <g className="iso-float2">
            <path d={TOWER_A.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={TOWER_A.left} fill="#DDE5F1" />
            <path d={TOWER_A.right} fill="#C7D2E4" />
            {towerARows.map((t, i) => {
              const [a, b] = faceLine(6.0, 3.6, 0, 1.0, 1.0, 1.5, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7FB0F6" strokeWidth="2" />;
            })}
          </g>

          <g className="iso-float3">
            <path d={TOWER_B.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={TOWER_B.left} fill="#DDE5F1" />
            <path d={TOWER_B.right} fill="#C7D2E4" />
            {towerBRows.map((t, i) => {
              const [a, b] = faceLine(7.0, 4.0, 0, 0.85, 0.85, 1.15, t, "right");
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7FB0F6" strokeWidth="2" />;
            })}
          </g>

          <g className="iso-float1" transform={`translate(${CYL_RIGHT[0]}, ${CYL_RIGHT[1]})`}>
            <ellipse cx="0" cy="18" rx="14" ry="5" fill="#B9C7DC" opacity="0.35" />
            <rect x="-11" y="-15" width="22" height="24" fill="url(#iso-blue)" />
            <ellipse cx="0" cy="-15" rx="11" ry="4.5" fill="#7FB0F6" />
          </g>

          <g className="iso-float4" transform={`translate(${CARD_ICON[0]}, ${CARD_ICON[1]})`}>
            <rect x="-16" y="-11" width="32" height="22" rx="4" fill="#FFFFFF" stroke="#C7D2E4" strokeWidth="1.4" />
            <rect x="-11" y="-5" width="22" height="4" rx="2" fill="url(#iso-blue)" />
            <rect x="-11" y="3" width="14" height="3" rx="1.5" fill="#C7D2E4" />
          </g>

          {/* ---------------- desktop PC cluster: platform + tower + monitor ---------------- */}
          <g filter="url(#iso-shadow-soft)">
            <path d={PC_PLATFORM.top} fill="#FFFFFF" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={PC_PLATFORM.left} fill="#DDE5F1" />
            <path d={PC_PLATFORM.right} fill="#C7D2E4" />
          </g>

          {/* PC tower / CPU box, sitting on the platform */}
          <g className="iso-float5">
            <path d={PC_TOWER.top} fill="#EEF2F8" stroke="#C7D2E4" strokeWidth="1.2" />
            <path d={PC_TOWER.left} fill="#DDE5F1" />
            <path d={PC_TOWER.right} fill="#C7D2E4" />
            {pcTowerRows.map((t, i) => {
              const [a, b] = faceLine(5.35, 5.55, 0.3, 0.42, 0.5, 0.8, t, "right");
              const mid = [(a[0] + b[0]) / 2 - 5, (a[1] + b[1]) / 2];
              return <circle key={i} className="iso-led" cx={mid[0]} cy={mid[1]} r="2" fill={i === 1 ? "#2E7CE6" : "#A9B9D2"} />;
            })}
          </g>

          {/* Monitor billboard, branded MEDINI Technologies */}
          <g
            className="iso-float5"
            transform={`translate(${PC_MONITOR_ANCHOR[0] - 6}, ${PC_MONITOR_ANCHOR[1] - 96})`}
            filter="url(#iso-shadow-soft)"
          >
            {/* soft glow behind the screen */}
            <circle className="iso-screen-glow" cx="0" cy="-6" r="58" fill="url(#iso-glow-soft)" />

            {/* stand + base */}
            <rect x="-6" y="30" width="12" height="14" rx="2" fill="#C7D2E4" />
            <rect x="-22" y="42" width="44" height="6" rx="3" fill="#B9C7DC" />

            {/* bezel */}
            <rect x="-42" y="-32" width="84" height="58" rx="7" fill="#1B2A44" />
            <rect x="-42" y="-32" width="84" height="58" rx="7" fill="none" stroke="#0B1626" strokeWidth="1" />

            {/* screen */}
            <g clipPath="url(#iso-screen-clip)">
              <rect x="-38" y="-27" width="76" height="52" rx="4" fill="url(#iso-screen)" />
              <rect className="iso-scanline" x="-38" y="-27" width="76" height="10" fill="#5B9CF2" opacity="0.12" />

              {/* wordmark */}
              <text x="0" y="-6" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fontWeight="700" fill="#FFFFFF" letterSpacing="0.4">
                MEDINI
              </text>
              <text x="0" y="6" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.2" fontWeight="500" fill="#8FB6F2" letterSpacing="1.1">
                TECHNOLOGIES
              </text>
              <rect x="-15" y="11" width="22" height="2.4" rx="1.2" fill="#2E7CE6" />
              <rect className="iso-cursor" x="9" y="9.5" width="4" height="5.5" fill="#7FB0F6" />
            </g>

            {/* power LED */}
            <circle className="iso-led" cx="34" cy="20" r="1.6" fill="#5EE0A0" />
          </g>

          {/* keyboard resting on the platform in front of the monitor */}
          <g transform={`translate(${PC_MONITOR_ANCHOR[0] - 6}, ${PC_MONITOR_ANCHOR[1] + 8})`}>
            <rect x="-26" y="-4" width="52" height="14" rx="3" fill="#FFFFFF" stroke="#C7D2E4" strokeWidth="1.2" />
            <rect x="-21" y="0" width="42" height="2.2" rx="1.1" fill="#E1E7F1" />
            <rect x="-21" y="4" width="26" height="2.2" rx="1.1" fill="#E1E7F1" />
          </g>

          {/* ---------------- CPU / chip base ---------------- */}
          <g filter="url(#iso-shadow)">
            <path d={CHIP.top} fill="#EEF2F8" stroke="#DCE4F0" strokeWidth="1.5" />
            <path d={CHIP.left} fill="#DDE5F1" />
            <path d={CHIP.right} fill="#C7D2E4" />
            {CHIP_BLOCKS.map((b, i) => (
              <g key={i}>
                <path d={b.top} fill={i % 2 === 0 ? "#FFFFFF" : "url(#iso-blue)"} stroke="#C7D2E4" strokeWidth="1" />
                <path d={b.left} fill="#DDE5F1" />
                <path d={b.right} fill="#C7D2E4" />
              </g>
            ))}
          </g>

          {/* ---------------- shield ---------------- */}
          <g className="iso-float2" transform="translate(250, 235)" filter="url(#iso-shadow)">
            <ellipse cx="42" cy="128" rx="52" ry="10" fill="#1B4FA0" opacity="0.1" />
            <path d="M42 6 L20 10 L14 40 C14 76 42 96 42 96 C42 96 70 76 70 40 L64 10 Z"
                  fill="#DDE5F1" transform="translate(6,8)" />
            <path d="M42 0 L18 5 L12 36 C12 74 42 96 42 96 C42 96 72 74 72 36 L66 5 Z"
                  fill="#FFFFFF" stroke="#C7D2E4" strokeWidth="1.5" />
            <path d="M42 20 L58 44 L42 74 L26 44 Z" fill="url(#iso-blue)" />
          </g>

          {/* ---------------- dashboard screen ---------------- */}
          <g filter="url(#iso-shadow)">
            <polygon points="196,60 506,60 522,74 522,238 196,238" fill="#C7D2E4" />
            <rect x="196" y="52" width="310" height="186" rx="14" fill="#FFFFFF" stroke="#E1E7F1" strokeWidth="1.5" />

            {/* browser chrome */}
            <circle cx="218" cy="76" r="4" fill="#C7D2E4" />
            <circle cx="232" cy="76" r="4" fill="#C7D2E4" />
            <circle cx="246" cy="76" r="4" fill="#C7D2E4" />
            <rect x="264" y="71" width="200" height="10" rx="5" fill="#EEF2F8" />

            {/* content lines */}
            <rect x="218" y="100" width="120" height="10" rx="5" fill="#2E7CE6" opacity="0.85" />
            <rect x="218" y="120" width="150" height="6" rx="3" fill="#E1E7F1" />
            <rect x="218" y="134" width="110" height="6" rx="3" fill="#E1E7F1" />
            <rect x="218" y="148" width="130" height="6" rx="3" fill="#E1E7F1" />

            {/* mini bar chart */}
            {[
              [352, 44, 154],
              [372, 62, 136],
              [392, 36, 162],
              [412, 78, 120],
              [432, 54, 144],
            ].map(([x, h, y], i) => (
              <rect key={i} x={x} y={y} width="14" height={h} rx="3" fill={i === 2 ? "url(#iso-blue)" : "#DDE5F1"} />
            ))}
            <line x1="218" y1="198" x2="458" y2="198" stroke="#EEF2F8" strokeWidth="2" />
          </g>

          {/* twinkles */}
          <circle className="iso-blink" cx="120" cy="90" r="2.4" fill="#7FB0F6" />
          <circle className="iso-blink" cx="580" cy="170" r="2" fill="#7FB0F6" />
          <circle className="iso-blink" cx="600" cy="500" r="2.2" fill="#7FB0F6" />

          {/* Animated MEDINI Technologies Brand */}
          <g transform="translate(350, 80)">
            {/* Background glow */}
            <ellipse className="iso-brand-glow" cx="0" cy="0" rx="80" ry="30" fill="url(#iso-glow)" />
            
            {/* Main brand text */}
            <text 
              x="0" 
              y="5" 
              textAnchor="middle" 
              fontFamily="Arial, Helvetica, sans-serif" 
              fontSize="18" 
              fontWeight="800" 
              fill="#1B4FA0" 
              letterSpacing="1.5"
              className="iso-brand-text"
            >
              MEDINI
            </text>
            
            {/* Subtitle */}
            <text 
              x="0" 
              y="22" 
              textAnchor="middle" 
              fontFamily="Arial, Helvetica, sans-serif" 
              fontSize="8" 
              fontWeight="600" 
              fill="#2E7CE6" 
              letterSpacing="2"
              className="iso-brand-sub"
            >
              TECHNOLOGIES
            </text>
            
            {/* Decorative underline */}
            <line 
              x1="-25" 
              y1="30" 
              x2="25" 
              y2="30" 
              stroke="#2E7CE6" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="iso-brand-sub"
            />
            
            {/* Tech dots */}
            <circle cx="-30" cy="0" r="3" fill="#5B9CF2" className="iso-blink" />
            <circle cx="30" cy="0" r="3" fill="#5B9CF2" className="iso-blink iso-blink-delayed" />
          </g>
        </svg>

        <h2
          className="text-4xl font-semibold text-white mt-6 mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Every step gets you closer
        </h2>
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", color: "#CFE3D8" }}
        >
          Browse roles, apply in a click, and track every application in one
          place — the next step on your path is right here.
        </p>
      </div>
    </div>
  );
}