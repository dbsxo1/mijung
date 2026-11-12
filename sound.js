// =====================================================
//  효과음: 소리 파일 없이 Web Audio로 직접 합성
// =====================================================
const SFX = (() => {
  let ctx = null, master = null, muted = false;
  try { muted = localStorage.getItem('alba-muted') === '1'; } catch (e) { /* 무시 */ }

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, { type = 'sine', vol = 0.5, at = 0, slide = 0, attack = 0.005 } = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, { vol = 0.4, at = 0, freq = 800, q = 1, type = 'lowpass' } = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + at;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }
  const notes = (arr, step, opt) => arr.forEach((f, i) => tone(f, opt.dur || 0.18, { ...opt, at: (opt.at || 0) + i * step }));

  // 알바별 클릭 소리
  const work = [
    () => { noise(0.08, { freq: 2500, type: 'bandpass', vol: 0.5 }); tone(900, 0.05, { type: 'triangle', vol: 0.15 }); }, // 전단지 휙
    () => { tone(1850, 0.09, { type: 'square', vol: 0.18 }); },                                                           // 삑
    () => { noise(0.12, { freq: 1200, type: 'bandpass', vol: 0.3 }); tone(520, 0.08, { type: 'sine', vol: 0.25, at: 0.04 }); }, // 커피
    () => { tone(140, 0.12, { type: 'triangle', vol: 0.6, slide: -60 }); noise(0.08, { freq: 400, vol: 0.4 }); },           // 박스 쿵
    () => { noise(0.14, { freq: 600, vol: 0.7 }); tone(110, 0.1, { type: 'square', vol: 0.15, slide: -40 }); },             // 삽 퍽
    () => { tone(660, 0.07, { type: 'square', vol: 0.15 }); tone(880, 0.09, { type: 'square', vol: 0.15, at: 0.07 }); },     // 띵동
  ];

  return {
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem('alba-muted', muted ? '1' : '0'); } catch (e) { /* 무시 */ } if (!muted) this.ui(); return muted; },
    unlock() { ac(); },
    work(job) { (work[job] || work[0])(); },
    coin() { tone(1320, 0.06, { type: 'square', vol: 0.12 }); tone(1760, 0.12, { type: 'square', vol: 0.12, at: 0.05 }); },
    ui() { tone(700, 0.04, { type: 'triangle', vol: 0.25 }); },
    buy() { notes([880, 1175, 1568], 0.06, { type: 'square', vol: 0.13, dur: 0.12 }); },
    nope() { tone(220, 0.15, { type: 'sawtooth', vol: 0.15 }); tone(180, 0.2, { type: 'sawtooth', vol: 0.15, at: 0.12 }); },
    success() { notes([523, 659, 784, 1047], 0.08, { type: 'triangle', vol: 0.35, dur: 0.22 }); tone(1568, 0.35, { type: 'sine', vol: 0.2, at: 0.32 }); },
    fail() { tone(300, 0.5, { type: 'sawtooth', vol: 0.25, slide: -230 }); noise(0.5, { freq: 300, vol: 0.6 }); },
    levelup() { notes([392, 523, 659, 784, 659, 784, 1047], 0.1, { type: 'square', vol: 0.12, dur: 0.18 }); notes([196, 262, 330], 0.3, { type: 'triangle', vol: 0.25, dur: 0.4 }); },
    fanfare() {
      notes([523, 523, 523, 698, 880, 784, 698, 1047], 0.14, { type: 'square', vol: 0.12, dur: 0.2 });
      notes([262, 349, 440, 523], 0.28, { type: 'triangle', vol: 0.25, dur: 0.5 });
    },
    alert() { tone(988, 0.1, { type: 'square', vol: 0.15 }); tone(1319, 0.16, { type: 'square', vol: 0.15, at: 0.12 }); },
    angry() { tone(160, 0.25, { type: 'sawtooth', vol: 0.2, slide: 40 }); },
    hit() { tone(400 + Math.random() * 300, 0.06, { type: 'square', vol: 0.15 }); },
    door() { noise(0.2, { freq: 500, vol: 0.5 }); tone(200, 0.15, { type: 'triangle', vol: 0.3, at: 0.15, slide: -80 }); },
    snore() { noise(0.9, { freq: 220, q: 6, type: 'bandpass', vol: 0.5 }); tone(90, 0.8, { type: 'sine', vol: 0.12, slide: 30 }); },
    pop() { tone(500, 0.08, { type: 'sine', vol: 0.3, slide: 600 }); },
    tired() { tone(440, 0.3, { type: 'triangle', vol: 0.2, slide: -200 }); },
  };
})();
