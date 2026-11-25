// Climate map (ported as-is from the prototype): real May data from NOAA NCEI nClimGrid (1926–2026),
// drawn over the NOAA Climate.gov base map. initClimate() wires up the markup in ClimateMap.tsx.
export function initClimate() {
  const controller = new AbortController();
  const { signal } = controller;

  // Real May data from NOAA NCEI nClimGrid (1926–2026), drawn over the NOAA Climate.gov base map.
  const canvas = document.getElementById("climateCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const readout = document.getElementById("readout");
  const yearInput = document.getElementById("year");
  const timeline = document.getElementById("timeline");
  const bubble = document.getElementById("bubble");
  const ticks = document.getElementById("ticks");

  // Visible part of the 3042×2298 NOAA source image, per the Figma crop.
  const SRC = { x: 127, y: 251, w: 2788, h: 1796 };
  // The base map's projection (Albers equal-area, 96°W), fitted to its coastlines: image px = t + projected × s.
  const PROJ = { lon0: -96, lat1: 33, lat2: 45, lat0: 23, s: 3551.407, tx: 1554.652, ty: 2086.020 };
  // nClimGrid cells kept (every 4th): 347 × 149, 1/6° apart. The atlases stack May 2026 → May 1926, one grid per year.
  const GRID = { w: 347, h: 149, years: 101, lon: -124.6875, lat: 49.3542, step: 0.1666667 };
  const LAYERS = {
    temp: { src: "/climate/may-temp.png", decode: v => 10 + (v - 1) * 0.4, min: 20, max: 90 },              // °F
    rain: { src: "/climate/may-rain.png", decode: v => ((v - 1) / 254) ** 2 * 16, min: 0, max: 8 },          // inches
  };
  // Figma legend stops, cold → hot.
  const TEMP_STOPS = [[0, [24, 64, 117]], [.323, [73, 158, 211]], [.49, [255, 255, 255]], [.652, [243, 190, 122]], [1, [104, 22, 50]]];
  // Precipitation ramp, dry → wet.
  const RAIN_STOPS = [[0, [120, 72, 22]], [.2, [208, 166, 92]], [.4, [246, 232, 195]], [.55, [199, 234, 229]], [.75, [80, 170, 160]], [1, [16, 64, 110]]];

  function rampLUT(stops) {
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const t = i / 255; let k = 0;
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const [t0, c0] = stops[k], [t1, c1] = stops[k + 1];
      const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = c0[c] + (c1[c] - c0[c]) * f;
    }
    return lut;
  }
  const gradientCSS = stops => `linear-gradient(90deg, ${stops.map(([t, c]) => `rgb(${c}) ${t * 100}%`).join(", ")})`;

  let tempLUT = rampLUT(TEMP_STOPS);
  const rainLUT = rampLUT(RAIN_STOPS);

  const climate = {
    W: 0, H: 0, base: null, out: null, val: null, cell: null, fx: null, fy: null,
    year: 2026, mix: 0,           // displayed (animated)
    tYear: 2026, tMix: 0,         // targets
    ready: false,
  };
  const srcImg = new Image();
  const atlas = {};               // layer → Uint8Array of packed values
  let stateLines = [];            // state-to-state borders (U.S. Census via us-atlas), crop-relative × 10000
  const grids = new Map();        // "layer:yearIndex" → Float32Array of decoded, gap-filled values
  let fill = null;                // grid cell → nearest cell with data (fills coastal gaps)

  // Load the base map and both data atlases once the section is near the viewport.
  const loadIO = new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    srcImg.src = "/climate/climate.png";
    const lines = fetch("/climate/state-lines.json").then(r => r.json()).then(l => (stateLines = l));
    Promise.all([srcImg.decode().then(sampleLegend), lines, ...Object.keys(LAYERS).map(loadAtlas)]).then(() => { buildFill(); build(); });
  }, { rootMargin: "800px 0px" });
  loadIO.observe(document.getElementById("climateMap"));

  async function loadAtlas(layer) {
    const blob = await (await fetch(LAYERS[layer].src)).blob();
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
    const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
    const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data, out = new Uint8Array(bmp.width * bmp.height);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4];
    atlas[layer] = out;
  }

  // Each empty cell borrows from the nearest cell with data (up to 3 cells away), so coastlines don't fray.
  function buildFill() {
    const { w, h } = GRID, n = w * h, a = atlas.temp;
    fill = new Int32Array(n).fill(-1);
    let edge = [];
    for (let i = 0; i < n; i++) if (a[i]) { fill[i] = i; edge.push(i); }
    for (let r = 0; r < 3; r++) {
      const next = [];
      for (const i of edge) {
        const x = i % w, y = (i / w) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const X = x + dx, Y = y + dy, j = Y * w + X;
          if (X < 0 || Y < 0 || X >= w || Y >= h || fill[j] >= 0) continue;
          fill[j] = fill[i]; next.push(j);
        }
      }
      edge = next;
    }
  }

  function yearGrid(layer, k) {
    const key = layer + ":" + k;
    let g = grids.get(key);
    if (!g) {
      const n = GRID.w * GRID.h, a = atlas[layer], off = k * n, dec = LAYERS[layer].decode;
      g = new Float32Array(n);
      for (let i = 0; i < n; i++) g[i] = fill[i] < 0 ? NaN : dec(a[off + fill[i]]);
      grids.set(key, g);
    }
    return g;
  }

  // Calibrate the temperature ramp against the legend bar baked into the source image.
  function sampleLegend() {
    const c = document.createElement("canvas"); c.width = 1300; c.height = 1;
    const g = c.getContext("2d");
    g.drawImage(srcImg, 932, 2176, 1140, 1, 0, 0, 1300, 1);
    const d = g.getImageData(0, 0, 1300, 1).data;
    const ok = d[3] > 0 && d[2] > d[0]; // left end should be blue
    if (!ok) return;
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) { const p = Math.round(i / 255 * 1299) * 4; lut[i * 3] = d[p]; lut[i * 3 + 1] = d[p + 1]; lut[i * 3 + 2] = d[p + 2]; }
    tempLUT = lut;
  }

  // Base-map pixel → nClimGrid cell (inverse Albers).
  const RAD = Math.PI / 180;
  const ALB = (() => {
    const n = (Math.sin(PROJ.lat1 * RAD) + Math.sin(PROJ.lat2 * RAD)) / 2;
    const C = Math.cos(PROJ.lat1 * RAD) ** 2 + 2 * n * Math.sin(PROJ.lat1 * RAD);
    return { n, C, r0: Math.sqrt(C - 2 * n * Math.sin(PROJ.lat0 * RAD)) / n };
  })();
  function toGrid(px, py) {
    const X = (px - PROJ.tx) / PROJ.s, Y = (PROJ.ty - py) / PROJ.s, dy = ALB.r0 - Y;
    const r = Math.hypot(X, dy), th = Math.atan2(X, dy);
    const lon = PROJ.lon0 + th / ALB.n / RAD;
    const lat = Math.asin(Math.max(-1, Math.min(1, (ALB.C - (r * ALB.n) ** 2) / (2 * ALB.n)))) / RAD;
    return [(lon - GRID.lon) / GRID.step, (GRID.lat - lat) / GRID.step];
  }

  function build() {
    if (!fill) return;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    const W = Math.round(canvas.clientWidth * scale), H = Math.round(canvas.clientHeight * scale);
    if (!W || !H) return;
    canvas.width = W; canvas.height = H;
    ctx.drawImage(srcImg, SRC.x, SRC.y, SRC.w, SRC.h, 0, 0, W, H);
    const base = ctx.getImageData(0, 0, W, H);
    const px = base.data, N = W * H;

    // Recolour every map pixel inside the data's own outline of the U.S.: coloured ones, light-grey rivers and pale
    // patches, and the base image's old borders (crisp ones are drawn on top in render). State labels, land, water and
    // coastlines keep the base image.
    const has = atlas.temp, gw = GRID.w;
    const lineMask = (() => {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d"); g.lineWidth = 3.2 * W / 1431; g.lineJoin = "round"; g.lineCap = "round";
      strokeLines(g, W, H);
      return g.getImageData(0, 0, W, H).data;
    })();
    const val = new Int8Array(N), cell = new Int32Array(N), fx = new Float32Array(N), fy = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, p = i * 4;
      const r = px[p], g = px[p + 1], b = px[p + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const grey = mx - mn < 14 && mn < 238, dark = grey && mn < 190;
      val[i] = -1;
      if (dark && !lineMask[p + 3]) continue;
      const [gx, gy] = toGrid(SRC.x + (x + .5) / W * SRC.w, SRC.y + (y + .5) / H * SRC.h);
      const i0 = Math.min(gw - 2, Math.max(0, Math.floor(gx))), j0 = Math.min(GRID.h - 2, Math.max(0, Math.floor(gy)));
      const k = j0 * gw + i0, ax = Math.min(1, Math.max(0, gx - i0)), ay = Math.min(1, Math.max(0, gy - j0));
      const nx = Math.round(gx), ny = Math.round(gy);
      if (nx < 0 || ny < 0 || nx >= gw || ny >= GRID.h || fill[ny * gw + nx] < 0) continue;
      if (grey) {
        const inside = (has[k] > 0) * (1 - ax) * (1 - ay) + (has[k + 1] > 0) * ax * (1 - ay) + (has[k + gw] > 0) * (1 - ax) * ay + (has[k + gw + 1] > 0) * ax * ay;
        if (inside < (dark ? 0.75 : 0.5)) continue;
      }
      cell[i] = k; fx[i] = ax; fy[i] = ay; val[i] = 1;
    }

    Object.assign(climate, { W, H, base: px.slice(), out: base, val, cell, fx, fy, ready: true });
    render(true);
  }

  // Bilinear value of a year grid at pixel i; skips corners without data.
  function at(g, i) {
    const k = climate.cell[i], x = climate.fx[i], y = climate.fy[i], w = GRID.w;
    let s = 0, ws = 0;
    const add = (v, wt) => { if (v === v && wt > 0) { s += v * wt; ws += wt; } };
    add(g[k], (1 - x) * (1 - y)); add(g[k + 1], x * (1 - y)); add(g[k + w], (1 - x) * y); add(g[k + w + 1], x * y);
    return ws ? s / ws : NaN;
  }

  // Grid for a (possibly fractional) year, blended between the two nearest Mays while the slider animates.
  function blendGrid(layer, year) {
    const t = Math.min(100, Math.max(0, 2026 - year)), k0 = Math.floor(t), k1 = Math.min(100, k0 + 1), f = t - k0;
    const a = yearGrid(layer, k0);
    if (f < 0.01) return a;
    const b = yearGrid(layer, k1), out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = a[i] + (b[i] - a[i]) * f;
    return out;
  }

  const norm = (layer, v) => Math.max(0, Math.min(255, Math.round((v - LAYERS[layer].min) / (LAYERS[layer].max - LAYERS[layer].min) * 255)));

  function render() {
    if (!climate.ready) return;
    const { W, H, base, out, val } = climate;
    const d = out.data, mix = climate.mix;
    const gt = mix < 1 ? blendGrid("temp", climate.year) : null, gr = mix > 0 ? blendGrid("rain", climate.year) : null;
    for (let i = 0, N = W * H; i < N; i++) {
      const p = i * 4;
      let v;
      if (val[i] < 0 || (v = at(gt || gr, i)) !== v) { d[p] = base[p]; d[p + 1] = base[p + 1]; d[p + 2] = base[p + 2]; continue; }
      let r = 0, g = 0, b = 0;
      if (gt) { const k = norm("temp", v) * 3; r = tempLUT[k]; g = tempLUT[k + 1]; b = tempLUT[k + 2]; }
      if (gr) {
        const k = norm("rain", gt ? at(gr, i) : v) * 3, m = gt ? mix : 1;
        r += (rainLUT[k] - r) * m; g += (rainLUT[k + 1] - g) * m; b += (rainLUT[k + 2] - b) * m;
      }
      d[p] = r; d[p + 1] = g; d[p + 2] = b;
    }
    ctx.putImageData(out, 0, 0);
    ctx.lineWidth = Math.max(1, 1.1 * W / 1431); ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(18,18,18,.42)";
    strokeLines(ctx, W, H);
  }

  function strokeLines(g, W, H) {
    g.beginPath();
    for (const l of stateLines) {
      g.moveTo(l[0] / 1e4 * W, l[1] / 1e4 * H);
      for (let j = 2; j < l.length; j += 2) g.lineTo(l[j] / 1e4 * W, l[j + 1] / 1e4 * H);
    }
    g.stroke();
  }

  let raf = 0;
  function animate() {
    cancelAnimationFrame(raf);
    const step = () => {
      const smooth = true;
      const dy = climate.tYear - climate.year, dm = climate.tMix - climate.mix;
      climate.year = smooth && Math.abs(dy) > 0.4 ? climate.year + dy * 0.22 : climate.tYear;
      climate.mix = smooth && Math.abs(dm) > 0.02 ? climate.mix + dm * 0.16 : climate.tMix;
      render();
      if (climate.year !== climate.tYear || climate.mix !== climate.tMix) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  // Timeline
  const TICK_YEARS = [2026, 2016, 2006, 1996, 1986, 1976, 1966, 1956, 1946, 1936, 1926];
  TICK_YEARS.forEach(yr => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = yr;
    b.addEventListener("click", () => { yearInput.value = 2026 - yr; onYear(); }, { signal });
    ticks.appendChild(b);
  });
  function onYear() {
    const v = +yearInput.value, year = 2026 - v;
    yearInput.style.setProperty("--fill", v + "%");
    yearInput.setAttribute("aria-valuetext", year);
    bubble.textContent = year;
    bubble.style.left = `calc(4px + 11px + (100% - 4px - 22px) * ${v / 100})`;
    ticks.querySelectorAll("button").forEach(b => b.classList.toggle("is-near", Math.abs(+b.textContent - year) < 5));
    document.getElementById("capYear").textContent = `· ${year}`;
    climate.tYear = year; animate();
  }
  yearInput.addEventListener("input", onYear, { signal });
  yearInput.addEventListener("pointerdown", () => timeline.classList.add("is-dragging"), { signal });
  addEventListener("pointerup", () => timeline.classList.remove("is-dragging"), { signal });
  onYear();

  // Layer toggle
  let mode = "temp";
  document.querySelectorAll(".toggle button").forEach(btn => btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
    document.querySelectorAll(".toggle button").forEach(b => b.setAttribute("aria-pressed", b === btn));
    const rain = mode === "rain";
    document.getElementById("capTitle").textContent = rain ? "U.S. Total Precipitation, May" : "U.S. Average Temperature, May";
    document.getElementById("legMin").textContent = rain ? "0 in" : "20°F";
    document.getElementById("legMax").textContent = rain ? "8+ in" : "90°F";
    document.getElementById("legBar").style.background = gradientCSS(rain ? RAIN_STOPS : TEMP_STOPS);
    climate.tMix = rain ? 1 : 0; animate();
  }, { signal }));
  document.getElementById("legBar").style.background = gradientCSS(TEMP_STOPS);

  // Hover readout
  canvas.addEventListener("pointermove", e => {
    if (!climate.ready) return readout.classList.remove("is-on");
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * climate.W), y = Math.floor((e.clientY - r.top) / r.height * climate.H);
    const i = y * climate.W + x;
    if (x < 0 || y < 0 || x >= climate.W || y >= climate.H || climate.val[i] < 0) return readout.classList.remove("is-on");
    const year = Math.round(climate.tYear), rain = mode === "rain";
    const v = at(yearGrid(rain ? "rain" : "temp", 2026 - year), i);
    if (v !== v) return readout.classList.remove("is-on");
    readout.innerHTML = rain ? `<b>${v.toFixed(1)} in</b> · May ${year}` : `<b>${Math.round(v)}°F</b> · May ${year}`;
    const m = document.getElementById("climateMap").getBoundingClientRect();
    readout.style.left = e.clientX - m.left + "px"; readout.style.top = e.clientY - m.top + "px";
    readout.classList.add("is-on");
  }, { signal });
  canvas.addEventListener("pointerleave", () => readout.classList.remove("is-on"), { signal });

  let resizeT;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => climate.ready && build(), 200); }, { signal });

  return () => {
    controller.abort();
    loadIO.disconnect();
    cancelAnimationFrame(raf);
    clearTimeout(resizeT);
    ticks.innerHTML = "";
  };
}
