// Hand-built SVG botanicals and Rajasthani line art for the floral designs.
// Each function returns an SVG string; shared gradients live in one hidden <svg> added by floraDefs().

const PETAL = "M0 0C-.42-.2-.5-.78 0-1C.5-.78.42-.2 0 0Z"; // pointed petal, base at origin, tip at (0,-1)
const ROUND = "M0 0C-.62-.25-.6-1 0-1C.6-1 .62-.25 0 0Z"; // rounded petal
const LEAF = "M0 0C.34-.26.32-.72 0-1C-.32-.72-.34-.26 0 0Z";

const GRADS = {
  rose: ["#6e0f1a", "#b3242f", "#ec8a86"],
  blush: ["#9c2a3a", "#d9707a", "#f6c4bf"],
  mari: ["#c84b05", "#f0950f", "#fbd979"],
  leaf: ["#4f6a49", "#87a27f", "#c9d8bf"],
  sage: ["#62824b", "#9dbb7c", "#d6e5bf"],
  gold: ["#cf9500", "#f2c230", "#fff0a8"],
  white: ["#d8d0bd", "#f7f3ea", "#ffffff"],
};

function floraDefs() {
  const stops = (c) =>
    `<stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/>`;
  const defs = Object.entries(GRADS)
    .map(([k, c]) => `<linearGradient id="fg-${k}" x1="0" y1="1" x2="0" y2="0">${stops(c)}</linearGradient>`)
    .join("");
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>`
  );
}

// Seeded random so the artwork looks the same on every load
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n) => n.toFixed(1);
const place = (x, y, rot = 0) => `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`;
const edge = (c, o = 0.35) => `stroke="${c}" stroke-opacity="${o}" stroke-width=".6" vector-effect="non-scaling-stroke"`;

function petals(n, len, wid, path, grad, offset = 0, opacity = 1, stroke = "", r0 = 0) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = offset + (i * 360) / n;
    s += `<path d="${path}" fill="url(#fg-${grad})" opacity="${opacity}" ${stroke} transform="rotate(${f1(a)}) translate(0 ${-r0}) scale(${f1(wid)} ${f1(len)})"/>`;
  }
  return s;
}

function rose(x, y, r, rot = 0, grad = "rose") {
  const e = edge("#4a0710");
  return (
    `<g transform="${place(x, y, rot)}">` +
    petals(7, r, r * 0.95, PETAL, grad, 0, 0.96, e) +
    petals(6, r * 0.74, r * 0.74, PETAL, grad, 26, 0.97, e) +
    petals(5, r * 0.5, r * 0.5, ROUND, grad, 52, 1, e) +
    petals(4, r * 0.3, r * 0.32, ROUND, grad, 8, 1, e) +
    `<circle r="${f1(r * 0.08)}" fill="#4a0710" opacity=".45"/></g>`
  );
}

function marigold(x, y, r, rot = 0) {
  const e = edge("#9a3a00");
  return (
    `<g transform="${place(x, y, rot)}">` +
    petals(18, r, r * 0.5, ROUND, "mari", 0, 1, e) +
    petals(15, r * 0.78, r * 0.45, ROUND, "mari", 10, 1, e) +
    petals(12, r * 0.55, r * 0.4, ROUND, "mari", 4, 1, e) +
    petals(8, r * 0.32, r * 0.3, ROUND, "mari", 20, 1, e) +
    `</g>`
  );
}

function jasmine(x, y, r, rot = 0) {
  return (
    `<g transform="${place(x, y, rot)}">` +
    petals(5, r, r * 0.72, ROUND, "white", 0, 1, edge("#8f866f", 0.5)) +
    `<circle r="${f1(r * 0.15)}" fill="#e3b448"/></g>`
  );
}

function leaf(x, y, len, rot, grad = "leaf", w = 0.42) {
  let veins = "";
  for (let i = 1; i <= 4; i++) {
    const vy = -len * 0.18 * i;
    const vx = len * w * 0.32 * (1 - i * 0.15);
    veins += `<path d="M0 ${f1(vy)}L${f1(vx)} ${f1(vy - len * 0.09)}M0 ${f1(vy)}L${f1(-vx)} ${f1(vy - len * 0.09)}"/>`;
  }
  return (
    `<g transform="${place(x, y, rot)}">` +
    `<path d="${LEAF}" fill="url(#fg-${grad})" opacity=".95" transform="scale(${f1(len * w * 2)} ${f1(len)})"/>` +
    `<g fill="none" stroke="#3a5233" stroke-opacity=".35" stroke-width=".8">` +
    `<path d="M0 0Q${f1(len * 0.03)} ${f1(-len * 0.5)} 0 ${f1(-len * 0.95)}"/>${veins}</g></g>`
  );
}

function sprig(x, y, len, rot, grad = "sage", size = 0.16) {
  const bend = len * 0.12;
  let s = `<g transform="${place(x, y, rot)}"><path d="M0 0Q${f1(bend)} ${f1(-len / 2)} 0 ${f1(-len)}" fill="none" stroke="#5d7a50" stroke-width="1.3" stroke-linecap="round"/>`;
  const n = 9;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const px = 2 * (1 - t) * t * bend;
    s += leaf(px, -len * t, len * size * (1 - t * 0.45), (i % 2 ? 1 : -1) * 52, grad, 0.5);
  }
  return s + leaf(0, -len, len * size * 0.6, 0, grad, 0.5) + `</g>`;
}

function bud(x, y, r, rot = 0, grad = "rose") {
  return (
    `<g transform="${place(x, y, rot)}">` +
    `<path d="M0 0Q2 ${f1(r * 0.8)} 0 ${f1(r * 2)}" stroke="#5d7a50" stroke-width="1.2" fill="none"/>` +
    `<path d="${PETAL}" fill="url(#fg-${grad})" ${edge("#4a0710")} transform="scale(${f1(r * 1.1)} ${f1(r * 1.6)})"/>` +
    `<path d="${LEAF}" fill="url(#fg-leaf)" transform="rotate(-28) scale(${f1(r * 0.7)} ${f1(r)})"/>` +
    `<path d="${LEAF}" fill="url(#fg-leaf)" transform="rotate(28) scale(${f1(r * 0.7)} ${f1(r)})"/></g>`
  );
}

function dots(x, y, n, spread, color, rand) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * spread;
    s += `<circle cx="${f1(x + Math.cos(a) * d)}" cy="${f1(y + Math.sin(a) * d)}" r="${f1(1.2 + rand() * 1.8)}" fill="${color}" opacity=".8"/>`;
  }
  return s;
}

// Amaltas (golden shower tree): a drooping chain of small yellow flowers
function amaltas(x, y, len, sway, rand) {
  let s = `<g transform="translate(${f1(x)} ${f1(y)})"><path d="M0 0Q${f1(sway)} ${f1(len / 2)} ${f1(sway * 0.6)} ${f1(len)}" fill="none" stroke="#8a8f3c" stroke-width="1"/>`;
  const n = Math.round(len / 8.5);
  for (let i = 0; i < n; i++) {
    const t = 0.05 + (i / n) * 0.95;
    const px = 2 * (1 - t) * t * sway + t * t * sway * 0.6;
    const py = len * t;
    const r = 9.5 * (1 - t * 0.55);
    const jx = (i % 2 ? 1 : -1) * r * (0.9 + rand() * 0.6);
    if (t > 0.84) {
      s += `<circle cx="${f1(px + jx * 0.4)}" cy="${f1(py)}" r="${f1(r * 0.55)}" fill="url(#fg-gold)"/>`;
    } else {
      s +=
        `<g transform="${place(px + jx, py, rand() * 72)}">` +
        petals(5, r, r * 0.85, ROUND, "gold", 0, 0.95, edge("#a77400")) +
        `<circle r="${f1(r * 0.18)}" fill="#9c6400"/></g>`;
    }
  }
  return s + `</g>`;
}

// Rajasthani line-art mandala, drawn as outlines in one colour (viewBox -100 -100 200 200)
function mandala(color) {
  const line = `fill="none" stroke="${color}" stroke-width="1" vector-effect="non-scaling-stroke"`;
  const ring = (n, r0, len, wid, path, off = 0) => {
    let s = "";
    for (let i = 0; i < n; i++)
      s += `<path d="${path}" ${line} transform="rotate(${f1(off + (i * 360) / n)}) translate(0 ${-r0}) scale(${wid} ${len})"/>`;
    return s;
  };
  const dotRing = (n, r, size) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      s += `<circle cx="${f1(Math.cos(a) * r)}" cy="${f1(Math.sin(a) * r)}" r="${size}" fill="${color}"/>`;
    }
    return s;
  };
  return (
    `<circle r="5" fill="${color}"/>` +
    ring(8, 6, 20, 16, PETAL) +
    `<circle r="28" ${line}/>` +
    ring(16, 28, 18, 11, PETAL, 11.25) +
    `<circle r="48" ${line}/>` +
    dotRing(32, 53, 1.2) +
    ring(24, 57, 16, 10, ROUND) +
    `<circle r="75" ${line} stroke-dasharray="2 3"/>` +
    ring(32, 77, 14, 8, PETAL, 5.6) +
    dotRing(48, 95, 0.9)
  );
}

// Cusped Rajput (jharokha) arch outline for a box of size w×h; lobes curve inward, leaving cusps
function archPath(w, h, inset = 0, lobes = 11) {
  const R = w / 2 - inset;
  const cx = w / 2;
  const cy = R + inset + 4;
  const chord = 2 * R * Math.sin(Math.PI / lobes / 2);
  const ar = f1(chord * 0.6);
  let d = `M${inset} ${h - inset}L${inset} ${f1(cy)}`;
  for (let k = 1; k <= lobes; k++) {
    const a = Math.PI - (Math.PI * k) / lobes;
    d += `A${ar} ${ar} 0 0 0 ${f1(cx + R * Math.cos(a))} ${f1(cy - R * Math.sin(a))}`;
  }
  return d + `L${w - inset} ${h - inset}Z`;
}
