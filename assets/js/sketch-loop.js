/*!
 * SketchLoop — hand-drawn weather texture animation.
 * Self-contained, no dependencies. Attach to a <canvas> or any container.
 *
 * Usage:
 *   <div id="weather" style="position:absolute; top:0; right:0; width:46vw; height:62vh;"></div>
 *   <script src="assets/js/sketch-loop.js"></script>
 *   <script>
 *     const loop = SketchLoop.mount('#weather', {
 *       threshold: 0.48,
 *       clumpSize: 140,
 *       // ...other config from the study
 *     });
 *
 *     // loop.update({ fallSpeed: 0.6 })   — change params live
 *     // loop.pause(); loop.resume();
 *     // loop.destroy();
 *   </script>
 */
(function () {
  'use strict';

  // ---------- 3D value noise ----------
  function hash3(ix, iy, iz) {
    let h = ((ix | 0) * 73856093) ^ ((iy | 0) * 19349663) ^ ((iz | 0) * 83492791);
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 1274126177) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967295;
  }
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  function noise3(x, y, z) {
    var ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    var fx = x - ix, fy = y - iy, fz = z - iz;
    var sx = smooth(fx), sy = smooth(fy), sz = smooth(fz);
    var L = function (a, b, t) { return a + (b - a) * t; };
    var c000 = hash3(ix,     iy,     iz);
    var c100 = hash3(ix + 1, iy,     iz);
    var c010 = hash3(ix,     iy + 1, iz);
    var c110 = hash3(ix + 1, iy + 1, iz);
    var c001 = hash3(ix,     iy,     iz + 1);
    var c101 = hash3(ix + 1, iy,     iz + 1);
    var c011 = hash3(ix,     iy + 1, iz + 1);
    var c111 = hash3(ix + 1, iy + 1, iz + 1);
    var x00 = L(c000, c100, sx), x10 = L(c010, c110, sx);
    var x01 = L(c001, c101, sx), x11 = L(c011, c111, sx);
    var y0 = L(x00, x10, sy), y1 = L(x01, x11, sy);
    return L(y0, y1, sz);
  }
  function fbm3(x, y, z) {
    var v = 0, amp = 1, f = 1, tot = 0;
    for (var o = 0; o < 2; o++) {
      v += noise3(x * f, y * f, z) * amp;
      tot += amp;
      amp *= 0.55; f *= 2.1;
    }
    return v / tot;
  }

  // ---------- Defaults (match the study's Blizzard preset) ----------
  var DEFAULTS = {
    threshold:   0.48, // where the ink threshold sits — raise for sparser
    clumpSize:   140,  // px per noise unit — bigger = larger blobs
    turbulence:  0.50, // how fast the noise morphs
    fallSpeed:   1.10, // drift speed of the whole field
    angle:      -10,   // stroke direction, degrees (0 = horizontal, -90 = up)
    strokeLen:   32,   // average stroke length in px
    strokeWidth: 1.0,  // multiplier on baseline per-stroke line weight
    wobble:      3.0,  // perpendicular jitter along the stroke
    drawTime:    380,  // ms to trace one full stroke; un-draw is 1.35× slower
    inkColor:  '10,10,10', // r,g,b triplet as string — keeps alpha composable
    spacing:     7,    // grid spacing in px; smaller = denser, pricier
    scale:       1.0,  // uniform spatial scale — <1 shrinks clumps, strokes, grid, wobble proportionally
    taperBottom: 0,    // 0..1 fraction of canvas height (from the bottom) over which ink pools thin out
    taperCurve:  1.5,  // >1 = softer start, sharper finish of the taper; <1 = sharper start, softer finish
    clearRadius:   0,   // px radius around the cursor where ink clears. 0 disables the effect.
    clearStrength: 1,   // 0..1 — how fully ink is suppressed at the cursor center. 1 = fully cleared.
    clearCurve:    1.5, // shape of the radial falloff. Same semantics as taperCurve.
    clearUndrawBoost: 5,// multiplier on un-draw speed inside the clear zone — higher = snappier clear.
    clearAlpha:    1,   // 0..1 — how much alpha fading is applied inside the clear zone. 0 = no alpha effect (only threshold + un-draw), 1 = full fade.
  };

  // ---------- Mount ----------
  function mount(target, options) {
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('SketchLoop.mount: target not found (' + target + ')');

    // Either use an existing <canvas> or create one filling the host.
    var canvas, createdCanvas = false;
    if (host.tagName === 'CANVAS') {
      canvas = host;
    } else {
      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.display = 'block';
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.style.overflow = host.style.overflow || 'hidden';
      host.appendChild(canvas);
      createdCanvas = true;
    }

    var ctx = canvas.getContext('2d');
    var state = Object.assign({}, DEFAULTS, options || {});

    var W = 0, H = 0, dpr = 1;
    var strokes = [];
    var tZ = 0, scrollY = 0, scrollX = 0;
    var lastT = performance.now();
    var rafId = 0, running = true;
    // Cursor-clear state. -9999 = offscreen / no effect.
    var mouseX = -9999, mouseY = -9999;
    // Desktop-only: skip hover logic on touch-only devices (no hover media or coarse pointer).
    var isDesktop = !window.matchMedia
      || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildStrokes() {
      strokes.length = 0;
      var sc = state.scale || 1;
      var spacing = state.spacing * sc;
      var jitter = 3.5 * sc;
      for (var y = -30; y < H + 30; y += spacing) {
        for (var x = -30; x < W + 30; x += spacing) {
          var wob = [];
          for (var i = 0; i < 6; i++) wob.push(rand(-1, 1));
          strokes.push({
            x: x + rand(-jitter, jitter),
            y: y + rand(-jitter, jitter),
            lenMul: rand(0.7, 1.35),
            lw: rand(0.45, 1.35),
            wob: wob,
            aJit: rand(-9, 9),
            passOffX: rand(-0.9, 0.9),  passOffY: rand(-0.4, 0.4),
            passOffX2: rand(-1.1, 1.1), passOffY2: rand(-0.5, 0.5),
            progress: 0,
            speedMul: rand(0.6, 1.5),
            intensity: 0.7,
          });
        }
      }
    }

    function drawStroke(s, alpha, angleRad, passes, progress) {
      if (progress <= 0) return;
      var sc = state.scale || 1;
      var len = s.lenMul * state.strokeLen * sc;
      var dx = Math.cos(angleRad) * len;
      var dy = Math.sin(angleRad) * len;
      var segs = 6;
      var px = -Math.sin(angleRad);
      var py = Math.cos(angleRad);
      ctx.lineCap = 'round';
      for (var pass = 0; pass < passes; pass++) {
        var offX, offY, passA, lw;
        if (pass === 0) { offX = 0; offY = 0; passA = alpha; lw = s.lw; }
        else if (pass === 1) { offX = s.passOffX; offY = s.passOffY; passA = alpha * 0.55; lw = s.lw * 0.8; }
        else { offX = s.passOffX2; offY = s.passOffY2; passA = alpha * 0.35; lw = s.lw * 0.7; }
        if (passA <= 0.01) continue;
        ctx.strokeStyle = 'rgba(' + state.inkColor + ',' + Math.min(1, passA) + ')';
        ctx.lineWidth = lw * state.strokeWidth;
        ctx.beginPath();
        var endT = Math.min(1, progress);
        ctx.moveTo(s.x + offX - dx / 2, s.y + offY - dy / 2);
        for (var i = 1; i <= segs; i++) {
          var tSeg = i / segs;
          if (tSeg >= endT) {
            var wTip = s.wob[i - 1] * state.wobble * sc * (endT * segs - (i - 1));
            ctx.lineTo(s.x + offX + (-0.5 + endT) * dx + px * wTip,
                       s.y + offY + (-0.5 + endT) * dy + py * wTip);
            break;
          } else {
            var w = s.wob[i - 1] * state.wobble * sc;
            ctx.lineTo(s.x + offX + (-0.5 + tSeg) * dx + px * w,
                       s.y + offY + (-0.5 + tSeg) * dy + py * w);
          }
        }
        ctx.stroke();
      }
    }

    function frame(now) {
      if (!running) return;
      var dtMs = Math.min(50, now - lastT);
      var dt60 = dtMs / 16.67;
      lastT = now;
      tZ += 0.004 * state.turbulence * dt60;
      scrollY -= 0.9 * state.fallSpeed * dt60;
      scrollX -= 0.25 * state.fallSpeed * dt60;
      var angleRad = state.angle * Math.PI / 180;
      var ns = 1 / (state.clumpSize * (state.scale || 1));
      // Taper: pools thin out toward the bottom. We raise the effective threshold
      // toward 1 as the stroke's y approaches the bottom, so progressively fewer
      // spots can ink — the pattern truly thins out rather than alpha-fading.
      var taper = Math.min(1, Math.max(0, state.taperBottom || 0));
      var taperCurve = state.taperCurve || 1;
      var taperStartY = taper > 0 ? H * (1 - taper) : H + 1;
      // Cursor-clear: same mechanic, radial. Raise threshold + fade alpha inside
      // the clear radius, and boost the un-draw rate so clearing feels snappy.
      var clearR = state.clearRadius || 0;
      var clearR2 = clearR * clearR;
      var clearStrength = state.clearStrength == null ? 1 : state.clearStrength;
      var clearCurve = state.clearCurve || 1;
      var undrawBoost = state.clearUndrawBoost || 1;
      ctx.clearRect(0, 0, W, H);
      for (var si = 0; si < strokes.length; si++) {
        var s = strokes[si];
        var n = fbm3((s.x + scrollX) * ns, (s.y + scrollY) * ns, tZ);
        // Effective threshold at this stroke's y position
        var thr = state.threshold;
        var fade = 1;
        var undrawMul = 1;
        if (taper > 0 && s.y > taperStartY) {
          var t = (s.y - taperStartY) / Math.max(0.001, (H - taperStartY));
          t = Math.min(1, Math.max(0, t));
          // curve lets the taper be soft-in / sharp-out (>1) or sharp-in / soft-out (<1)
          t = Math.pow(t, taperCurve);
          thr = state.threshold + (1 - state.threshold) * t;
          fade = 1 - t;
        }
        if (clearR > 0) {
          var ddx = s.x - mouseX, ddy = s.y - mouseY;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 < clearR2) {
            // 1 at cursor center, 0 at radius edge
            var c = 1 - Math.sqrt(d2) / clearR;
            c = Math.pow(c, clearCurve) * clearStrength;
            // Raise threshold toward 1, optionally fade alpha toward 0, speed up un-draw.
            // The alpha fade can be reduced/disabled independently via clearAlpha —
            // with clearAlpha=0 the only clearing mechanism is the reverse-trace un-draw,
            // which preserves the hand-drawn feel (no translucent strokes).
            var clearAlpha = state.clearAlpha == null ? 1 : state.clearAlpha;
            thr = thr + (1 - thr) * c;
            fade *= (1 - c * clearAlpha);
            undrawMul = 1 + (undrawBoost - 1) * c;
          }
        }
        var above = n >= thr;
        if (above) {
          var r = (dtMs / state.drawTime) * s.speedMul;
          s.progress = Math.min(1, s.progress + r);
          var t01 = (n - thr) / Math.max(0.001, (1 - thr));
          s.intensity = Math.min(1, 0.4 + t01 * 1.3);
        } else {
          var re = (dtMs / (state.drawTime * 1.35)) * s.speedMul * undrawMul;
          s.progress = Math.max(0, s.progress - re);
        }
        if (s.progress < 0.015) continue;
        var passes = 1 + (s.intensity > 0.55 ? 1 : 0) + (s.intensity > 0.85 ? 1 : 0);
        var strokeA = angleRad + s.aJit * Math.PI / 180;
        drawStroke(s, s.intensity * fade, strokeA, passes, s.progress);
      }
      rafId = requestAnimationFrame(frame);
    }

    function onResize() { resize(); buildStrokes(); }

    // Cursor-tracking. Listen on window so we catch the cursor everywhere
    // — the wrapper has pointer-events: none and shouldn't intercept events.
    // Coords are converted to canvas-local on each move so scrolling / layout
    // shifts don't desync the clear zone.
    function onMouseMove(e) {
      var r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999; }

    // init
    resize();
    buildStrokes();
    window.addEventListener('resize', onResize);
    // Watch the host element too — its size can change independently of the
    // window (e.g. a layout script sets its height after fonts load). Without
    // this, the canvas's internal buffer stays frozen at its initial size and
    // the browser stretches it to fit — which reads as geometry distortion.
    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(onResize);
      ro.observe(host);
    }
    if (isDesktop) {
      window.addEventListener('mousemove', onMouseMove);
      // If the cursor leaves the viewport we also want to reset — otherwise
      // the last-known position keeps a phantom hole in the ink.
      document.addEventListener('mouseleave', onMouseLeave);
      window.addEventListener('blur', onMouseLeave);
    }
    rafId = requestAnimationFrame(frame);

    return {
      update: function (newOpts) {
        var rebuild = !!(newOpts && (
          (newOpts.spacing && newOpts.spacing !== state.spacing) ||
          (newOpts.scale != null && newOpts.scale !== state.scale)
        ));
        Object.assign(state, newOpts || {});
        if (rebuild) buildStrokes();
      },
      pause: function () {
        running = false;
        cancelAnimationFrame(rafId);
      },
      resume: function () {
        if (!running) {
          running = true;
          lastT = performance.now();
          rafId = requestAnimationFrame(frame);
        }
      },
      destroy: function () {
        running = false;
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        if (isDesktop) {
          window.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseleave', onMouseLeave);
          window.removeEventListener('blur', onMouseLeave);
        }
        if (ro) ro.disconnect();
        if (createdCanvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
      getState: function () { return Object.assign({}, state); },
      canvas: canvas,
    };
  }

  window.SketchLoop = { mount: mount, defaults: DEFAULTS };
})();
