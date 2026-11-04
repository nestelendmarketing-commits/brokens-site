/* brokens.app — landing page davranışları. Bağımlılık yok. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- Kaydırmaya bağlı efektler (tek rAF) ---------- */
  const header = $('[data-header]');
  const hero = $('[data-hero]');
  const words = setupWords($('[data-words]'));
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (hero && !reduce.matches) {
      hero.style.setProperty('--p', clamp(y / vh, 0, 1).toFixed(4));
    }
    if (words) words.update(vh);
  }
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  function setupWords(el) {
    if (!el) return null;
    const parts = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const spans = parts.map((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      el.appendChild(s);
      if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    el.classList.add('is-ready');
    let lit = -1;
    return {
      update(vh) {
        let n = spans.length;
        if (!reduce.matches) {
          const r = el.getBoundingClientRect();
          const start = vh * 0.82;
          const end = vh * 0.3;
          const p = clamp((start - r.top) / (r.height + start - end), 0, 1);
          n = Math.round(p * spans.length * 1.08);
        }
        if (n !== lit) {
          lit = n;
          spans.forEach((s, i) => s.classList.toggle('is-lit', i < n));
        }
      },
    };
  }

  /* ---------- Bölümler: adım değişince arka plan ve ekran değişir ---------- */
  const steps = $$('[data-step]');
  const bgs = $$('[data-bg]');
  const screens = $$('[data-screen]');
  const marks = $$('.chapters__marks span');
  const pop = $('[data-pop]');
  function setStep(i) {
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    bgs.forEach((b, j) => b.classList.toggle('is-active', j === i));
    screens.forEach((s, j) => s.classList.toggle('is-active', j === i));
    marks.forEach((m, j) => m.classList.toggle('is-active', j === i));
    if (pop) pop.classList.toggle('is-active', i === 1);
  }
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setStep(steps.indexOf(e.target)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  /* ---------- Rumuz önerisi: uygulamadaki kelime listesinden ---------- */
  const FIRST = ['Bozuk', 'Durgun', 'Son', 'Kış', 'Sessiz', 'Yorgun', 'Uykusuz', 'Yarım', 'Kırık', 'Puslu', 'Gece', 'Sisli', 'Yağmurlu', 'Eski', 'Uzak', 'Kayıp', 'Gri', 'Solgun', 'Serin', 'Sonbahar', 'Gizli', 'Yalnız', 'Dalgın', 'Ağır', 'Yavaş', 'Tuzlu', 'Mavi', 'Loş', 'Buğulu', 'Sabah', 'Akşam', 'Kuzey', 'Rüzgarlı', 'Yitik', 'Suskun', 'Ilık', 'Geç', 'Dingin', 'Bulutlu', 'Kırçıllı'];
  const SECOND = ['plak', 'deniz', 'yıldız', 'güneş', 'liman', 'peron', 'bilet', 'fincan', 'mektup', 'bavul', 'pusula', 'sokak', 'durak', 'fener', 'martı', 'kumsal', 'rüzgar', 'gölge', 'ayna', 'kalem', 'şiir', 'nota', 'şarkı', 'defter', 'pencere', 'balkon', 'köprü', 'vapur', 'iskele', 'sahil', 'yaprak', 'bulut', 'şehir', 'saat', 'kibrit', 'mum', 'perde', 'kapı', 'çay', 'istasyon'];
  const nickOut = $('[data-nick-out]');
  const nickBtn = $('[data-nick-btn]');
  if (nickOut && nickBtn) {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    nickBtn.addEventListener('click', () => {
      let next = nickOut.textContent;
      while (next === nickOut.textContent) next = pick(FIRST) + pick(SECOND);
      if (reduce.matches) { nickOut.textContent = next; return; }
      nickOut.classList.add('is-swapping');
      setTimeout(() => { nickOut.textContent = next; nickOut.classList.remove('is-swapping'); }, 220);
    });
  }

  /* ---------- Hero cihazı: imleçle hafif eğilir ---------- */
  const tilt = $('[data-tilt]');
  if (tilt && finePointer.matches && !reduce.matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      tilt.style.transform = `perspective(1400px) rotateY(${(cx * 9).toFixed(2)}deg) rotateX(${(-cy * 7).toFixed(2)}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0008 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ---------- Yaşayan deniz: dalgalar, bulutlar, fenerler (WebGL) ---------- */
  const seaImg = $('[data-hero-img]');
  const canvas = $('[data-hero-gl]');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (seaImg && canvas && !reduce.matches && !saveData) {
    const go = () => { try { initSea(seaImg, canvas, hero); } catch (err) { canvas.remove(); } };
    if (seaImg.complete && seaImg.naturalWidth) go();
    else seaImg.addEventListener('load', go, { once: true });
  }

  function initSea(img, cv, section) {
    const gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) { cv.remove(); return; }

    // Fenerler: görseldeki gaz lambalarının yeri (görsel genişliği/yüksekliği oranında), parlama yarıçapı, rastgele tohum.
    const LAMPS = [
      [0.0836, 0.4740, 0.010, 0.31], [0.1780, 0.4596, 0.007, 0.77], [0.1977, 0.4818, 0.013, 0.12],
      [0.3321, 0.4740, 0.009, 0.58], [0.4012, 0.4635, 0.006, 0.91], [0.4237, 0.4700, 0.008, 0.44],
      [0.4971, 0.4753, 0.014, 0.05], [0.6388, 0.4740, 0.009, 0.66], [0.7035, 0.4818, 0.012, 0.23],
      [0.7602, 0.4648, 0.006, 0.83], [0.8140, 0.4635, 0.006, 0.49], [0.8779, 0.4792, 0.010, 0.37],
    ];
    const HORIZON = 0.465;

    const vert = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }`;
    const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const frag = `
      precision ${highp && highp.precision > 0 ? 'highp' : 'mediump'} float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform vec2 uRes;
      uniform vec2 uImg;
      uniform vec2 uPos;
      uniform float uTime;
      uniform float uIntro;
      uniform float uHorizon;
      uniform vec4 uLamps[12];

      float hash(vec2 p) { p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
        return v;
      }

      void main() {
        float rs = uRes.x / uRes.y;
        float ri = uImg.x / uImg.y;
        vec2 sc = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
        vec2 uv = vUv * sc + (1.0 - sc) * uPos;
        float t = uTime;

        // Su: ufka yakın (tekneler) sabit, öne doğru dalga artar.
        float below = uv.y - uHorizon;
        float kw = smoothstep(0.055, 0.42, below);
        float z = 1.0 / (max(below, 0.0) + 0.035);
        vec2 p = vec2((uv.x - 0.5) * ri * z * 0.55, z * 0.85);
        vec2 flow = vec2(t * 0.05, -t * 0.2);
        vec2 disp = (vec2(fbm(p + flow), fbm(p * 1.3 - flow * 0.8 + 4.3)) - 0.5) * vec2(0.011, 0.007) * kw;
        disp.y += sin(t * 0.7 + p.y * 1.7 + p.x * 0.6) * 0.0022 * kw;

        // Gökyüzü: bulutlar çok yavaş kayar.
        float ks = smoothstep(0.02, 0.35, uHorizon - uv.y);
        vec2 sp = vec2(uv.x * ri * 1.6 + t * 0.016, uv.y * 3.2);
        disp += (vec2(fbm(sp), fbm(sp + 7.1)) - 0.5) * 0.008 * ks;

        vec3 col = texture2D(uTex, clamp(uv + disp, 0.001, 0.999)).rgb;

        // Fenerler: titreyen sıcak ışık ve suya düşen yansıma.
        vec3 glow = vec3(0.0);
        for (int i = 0; i < 12; i++) {
          vec4 L = uLamps[i];
          vec2 d = (uv - L.xy) * vec2(ri, 1.0);
          float on = clamp((uIntro * 3.0 - L.w * 1.6 - 0.35) / 0.7, 0.0, 1.0);
          float fl = 0.8 + 0.2 * sin(t * (6.0 + L.w * 5.0) + L.w * 40.0) * sin(t * (2.1 + L.w * 1.7) + L.w * 9.0);
          float g = exp(-dot(d, d) / (L.z * L.z));
          float dy = uv.y - L.y;
          float sx = d.x / (L.z * 0.5 + max(dy, 0.0) * 0.05);
          float streak = step(0.0, dy) * exp(-sx * sx) * exp(-max(dy, 0.0) / (L.z * 5.0)) * (0.55 + 0.45 * sin(dy * 700.0 - t * 4.0 + L.w * 20.0));
          glow += vec3(1.0, 0.63, 0.3) * (g * 0.5 + streak * 0.26) * fl * on;
        }
        gl_FragColor = vec4(col + glow, 1.0);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); // file:// ise burada hata verir, statik görsel kalır.

    const u = (n) => gl.getUniformLocation(prog, n);
    const uRes = u('uRes'), uTime = u('uTime'), uIntro = u('uIntro'), uPos = u('uPos');
    gl.uniform1i(u('uTex'), 0);
    gl.uniform2f(u('uImg'), img.naturalWidth, img.naturalHeight);
    gl.uniform1f(u('uHorizon'), HORIZON);
    gl.uniform4fv(u('uLamps'), new Float32Array(LAMPS.flat()));

    const readPos = () => {
      const parts = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      gl.uniform2f(uPos, isNaN(parts[0]) ? 0.5 : parts[0], isNaN(parts[1]) ? 0.5 : parts[1]);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.25 : 1.5);
      const w = Math.max(1, Math.round(cv.clientWidth * dpr));
      const h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      readPos();
    };
    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    if ('IntersectionObserver' in window && section) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(section);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

    const t0 = performance.now();
    let raf = 0, last = 0, shown = false;
    const frame = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
      if (now - last < 24) return; // ~40 fps yeterli
      last = now;
      const t = (now - t0) / 1000;
      gl.uniform1f(uTime, t + 20.0);
      gl.uniform1f(uIntro, Math.min(t / 3.0, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!shown) { shown = true; cv.classList.add('is-on'); }
    };
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cv.classList.remove('is-on'); visible = false; });
    start();
  }
})();
