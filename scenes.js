// =====================================================
//  배경(알바 장소, 집) + 가구 그림
// =====================================================
const L_ = '#3b2f2f';
const st_ = `stroke="${L_}" stroke-width="2.5" stroke-linejoin="round"`;

function svgWrap(inner) {
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
const cloud = (x, y, s, d) =>
  `<g class="anim-cloud" style="animation-duration:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="28" ry="14" fill="#fff"/><ellipse cx="20" cy="-8" rx="20" ry="14" fill="#fff"/><ellipse cx="-18" cy="-4" rx="16" ry="11" fill="#fff"/></g></g>`;

const JOB_SCENES = [
  // 0 전단지 (거리)
  () => svgWrap(`
    <defs><linearGradient id="sky0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#sky0)"/>
    ${cloud(60, 50, 1, 40)}${cloud(260, 80, .8, 55)}
    <rect x="10" y="90" width="80" height="130" fill="#f4b183" ${st_}/><rect x="95" y="60" width="70" height="160" fill="#a9c7e8" ${st_}/>
    <rect x="245" y="70" width="70" height="150" fill="#f6d77a" ${st_}/><rect x="320" y="100" width="75" height="120" fill="#c3a6e0" ${st_}/>
    ${[0, 1, 2, 3].map(r => [0, 1].map(c => `<rect x="${22 + c * 32}" y="${104 + r * 26}" width="20" height="16" fill="#fff8d6" class="anim-blink" style="animation-delay:${(r + c) * .7}s"/>`).join('')).join('')}
    ${[0, 1, 2, 3, 4].map(r => `<rect x="108" y="${74 + r * 28}" width="44" height="16" fill="#e8f4ff"/>`).join('')}
    <rect x="0" y="220" width="400" height="80" fill="#cfcfcf"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 50} 220 l-10 80" stroke="#b5b5b5" stroke-width="2"/>`).join('')}
    <rect x="0" y="216" width="400" height="6" fill="#9a9a9a"/>
    <text x="275" y="64" font-size="22">🏪</text>`),
  // 1 편의점
  () => svgWrap(`
    <rect width="400" height="300" fill="#f5f9ff"/>
    <rect x="0" y="0" width="400" height="26" fill="#2fb36b"/><rect x="0" y="26" width="400" height="6" fill="#ff8a1f"/>
    <text x="200" y="20" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="sans-serif">24시 편의점</text>
    ${[0, 1, 2].map(r => `<rect x="10" y="${50 + r * 50}" width="120" height="8" fill="#b9c3cf" ${st_}/>` +
      [0, 1, 2, 3, 4].map(c => `<rect x="${16 + c * 23}" y="${28 + r * 50}" width="18" height="22" rx="3" fill="${['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9f1c'][(c + r) % 5]}" ${st_} stroke-width="1.5"/>`).join('')).join('')}
    ${[0, 1, 2].map(r => `<rect x="270" y="${50 + r * 50}" width="120" height="8" fill="#b9c3cf" ${st_}/>` +
      [0, 1, 2, 3, 4].map(c => `<rect x="${276 + c * 23}" y="${28 + r * 50}" width="18" height="22" rx="9" fill="${['#c77dff', '#ffd93d', '#ff6b6b', '#6bcB77', '#4d96ff'][(c + r) % 5]}" ${st_} stroke-width="1.5"/>`).join('')).join('')}
    <rect x="0" y="230" width="400" height="70" fill="#dfe6ee"/>
    <rect x="240" y="196" width="160" height="60" fill="#5c6b7a" ${st_}/><rect x="300" y="170" width="44" height="28" rx="4" fill="#2b2f36" ${st_}/>
    <rect x="306" y="176" width="32" height="14" fill="#7fffd4" class="anim-blink"/>`),
  // 2 카페
  () => svgWrap(`
    <rect width="400" height="300" fill="#e9d5bf"/>
    <rect x="0" y="0" width="400" height="300" fill="url(#none)"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 50}" y="0" width="25" height="210" fill="#e2cbb2"/>`).join('')}
    <rect x="20" y="30" width="110" height="80" rx="6" fill="#2f3b33" stroke="#8b5a3c" stroke-width="6"/>
    <text x="75" y="56" text-anchor="middle" font-size="13" fill="#fff" font-family="sans-serif">MENU</text>
    <text x="75" y="76" text-anchor="middle" font-size="11" fill="#ffe8a3" font-family="sans-serif">아메리카노 ☕</text>
    <text x="75" y="94" text-anchor="middle" font-size="11" fill="#ffc9de" font-family="sans-serif">딸기라떼 🍓</text>
    ${[260, 330].map((x, i) => `<path d="M${x} 0 v40" stroke="#555" stroke-width="2"/><path d="M${x - 16} 54 Q${x} 30 ${x + 16} 54 Z" fill="#ffcf5c" ${st_}/><circle cx="${x}" cy="58" r="5" fill="#fff6c4" class="anim-blink" style="animation-delay:${i}s"/>`).join('')}
    <text x="350" y="200" font-size="40">🪴</text>
    <rect x="0" y="210" width="400" height="90" fill="#a9714f"/>
    <rect x="0" y="210" width="400" height="10" fill="#8b5a3c"/>
    <rect x="280" y="160" width="60" height="50" rx="6" fill="#c0c6cc" ${st_}/><rect x="296" y="172" width="28" height="10" fill="#2b2f36"/>
    <path d="M300 150 q-6 -10 0 -18 M314 150 q-6 -10 0 -18" fill="none" stroke="#fff" stroke-width="3" class="anim-steam"/>`),
  // 3 택배 상하차
  () => svgWrap(`
    <rect width="400" height="300" fill="#8e9aa6"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${i * 110 + 20} 0 v210" stroke="#76828e" stroke-width="10"/>`).join('')}
    <rect x="0" y="0" width="400" height="30" fill="#6b7682"/>
    ${[0, 1, 2].map(i => `<circle cx="${70 + i * 130}" cy="18" r="8" fill="#fff6c4" class="anim-blink" style="animation-delay:${i * .5}s"/>`).join('')}
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${12 + c * 34}" y="${60 + r * 34}" width="30" height="30" fill="#d9a066" ${st_} stroke-width="1.5"/>`).join('')).join('')}
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${288 + c * 34}" y="${60 + r * 34}" width="30" height="30" fill="#c99155" ${st_} stroke-width="1.5"/>`).join('')).join('')}
    <rect x="0" y="210" width="400" height="90" fill="#5a6470"/>
    <rect x="0" y="236" width="400" height="20" fill="#2b2f36"/>
    <g class="anim-belt">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 100 - 400}" y="214" width="34" height="24" fill="#d9a066" ${st_} stroke-width="1.5"/>`).join('')}</g>`),
  // 4 공사장
  () => svgWrap(`
    <defs><linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd59e"/><stop offset="1" stop-color="#fff1d6"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#sky4)"/>
    ${cloud(300, 40, .9, 50)}
    <rect x="40" y="70" width="12" height="160" fill="#f2b705" ${st_}/>
    <g class="anim-crane" style="transform-origin:46px 74px"><rect x="20" y="66" width="200" height="10" fill="#f2b705" ${st_}/><path d="M190 76 v60" stroke="#333" stroke-width="2"/><rect x="178" y="136" width="24" height="16" fill="#9aa3ad" ${st_}/></g>
    <g fill="none" stroke="#7a6e64" stroke-width="5">${[0, 1, 2, 3].map(r => `<path d="M250 ${220 - r * 36} h130"/>`).join('')}<path d="M250 220 V112 M293 220 V112 M336 220 V112 M380 220 V112"/></g>
    <rect x="0" y="220" width="400" height="80" fill="#d8b98a"/>
    <path d="M90 240 q40 -40 80 0 Z" fill="#c9a06b" ${st_}/>
    ${[20, 350].map(x => `<path d="M${x} 262 l10 -32 l10 32 Z" fill="#ff7a1a" ${st_}/><path d="M${x + 4} 250 h12" stroke="#fff" stroke-width="4"/>`).join('')}`),
  // 5 배달 (밤 도로)
  () => svgWrap(`
    <rect width="400" height="300" fill="#1f2547"/>
    ${[...Array(14)].map((_, i) => `<circle cx="${(i * 67) % 400}" cy="${(i * 37) % 120 + 10}" r="1.6" fill="#fff" class="anim-blink" style="animation-delay:${i * .3}s"/>`).join('')}
    <circle cx="340" cy="50" r="22" fill="#fff6c4"/><circle cx="350" cy="44" r="20" fill="#1f2547"/>
    ${[[0, 70, 90], [75, 50, 110], [130, 80, 70], [270, 60, 100], [330, 70, 120]].map(([x, w, h]) =>
      `<rect x="${x}" y="${210 - h}" width="${w}" height="${h}" fill="#2e3566"/>` +
      [...Array(Math.floor(h / 22))].map((_, r) => `<rect x="${x + 8}" y="${210 - h + 8 + r * 22}" width="${w - 16}" height="8" fill="#ffd166" opacity="${(r + x) % 3 ? .8 : .25}"/>`).join('')).join('')}
    <rect x="0" y="210" width="400" height="90" fill="#3a3f4b"/>
    <g class="anim-road">${[...Array(10)].map((_, i) => `<rect x="${i * 80 - 400}" y="252" width="44" height="6" fill="#ffd166"/>`).join('')}</g>`),
];

// ---------------- 집 ----------------
const HOUSE_NAMES = ['고시원', '원룸', '투룸', '아파트', '펜트하우스'];
function houseBg(lv) {
  const P = [
    { wall: '#b9b4a8', floor: '#8c8478' },
    { wall: '#f3e6d3', floor: '#c79a6b' },
    { wall: '#fde8ef', floor: '#d8a878' },
    { wall: '#f7f7f2', floor: '#caa27a' },
    { wall: '#1e2340', floor: '#3b2f4f' },
  ][lv];
  let win = '';
  if (lv === 0) win = `<rect x="175" y="50" width="50" height="40" fill="#9fb7c9" ${st_}/>${[0, 1, 2].map(i => `<path d="M${185 + i * 15} 50 v40" stroke="#555" stroke-width="2"/>`).join('')}
    <path d="M200 0 v20" stroke="#333" stroke-width="2"/><circle cx="200" cy="26" r="7" fill="#fff6c4" class="anim-flicker"/>`;
  if (lv === 1) win = `<rect x="160" y="40" width="80" height="70" fill="#bfe6ff" ${st_}/><path d="M200 40 v70 M160 75 h80" stroke="${L_}" stroke-width="2.5"/>
    <path d="M150 34 h100 v8 h-100Z" fill="#c26b6b"/><path d="M150 42 q8 40 0 80 h14 q-6 -40 0 -80Z M250 42 q-8 40 0 80 h-14 q6 -40 0 -80Z" fill="#ff9f9f"/>`;
  if (lv === 2) win = [...Array(8)].map((_, i) => `<rect x="${i * 50}" y="0" width="25" height="200" fill="#fbd5e1"/>`).join('') +
    `<rect x="150" y="34" width="100" height="80" fill="#bfe6ff" ${st_}/><path d="M200 34 v80 M150 74 h100" stroke="${L_}" stroke-width="2.5"/>${cloud(185, 60, .5, 30)}
     <rect x="250" y="70" width="40" height="130" fill="#c08457" ${st_}/><circle cx="282" cy="140" r="3" fill="#ffd23f"/>`;
  if (lv === 3) win = `<rect x="120" y="24" width="160" height="110" fill="#bfe6ff" ${st_}/>
    ${[[130, 70], [160, 50], [195, 80], [225, 40], [255, 60]].map(([x, h]) => `<rect x="${x}" y="${134 - h}" width="24" height="${h}" fill="#8fb3d9"/>`).join('')}
    <path d="M200 24 v110" stroke="${L_}" stroke-width="2.5"/>${cloud(170, 50, .5, 35)}
    <text x="292" y="200" font-size="34">🪴</text><rect x="40" y="30" width="44" height="34" fill="#fff" ${st_}/><text x="49" y="55" font-size="18">🖼️</text>`;
  if (lv === 4) win = `<rect x="100" y="16" width="200" height="130" fill="#0d1230" stroke="#d4af37" stroke-width="4"/>
    ${[...Array(10)].map((_, i) => `<circle cx="${110 + (i * 37) % 180}" cy="${24 + (i * 23) % 50}" r="1.5" fill="#fff" class="anim-blink" style="animation-delay:${i * .4}s"/>`).join('')}
    ${[[110, 60], [140, 90], [175, 50], [210, 100], [245, 70], [275, 85]].map(([x, h]) => `<rect x="${x}" y="${146 - h}" width="22" height="${h}" fill="#2a3170"/>` +
      `<rect x="${x + 6}" y="${152 - h}" width="10" height="4" fill="#ffd166"/>`).join('')}
    <path d="M200 0 v10" stroke="#d4af37" stroke-width="2"/><path d="M180 10 h40 l-8 18 h-24Z" fill="#d4af37"/>${[186, 200, 214].map(x => `<circle cx="${x}" cy="32" r="3" fill="#fff6c4" class="anim-blink"/>`).join('')}
    <rect x="0" y="196" width="400" height="6" fill="#d4af37"/>`;
  return `<rect width="400" height="300" fill="${P.wall}"/>${win}
    <rect x="0" y="200" width="400" height="100" fill="${P.floor}"/>
    ${[...Array(9)].map((_, i) => `<path d="M${i * 50} 200 v100" stroke="rgba(0,0,0,.08)" stroke-width="2"/>`).join('')}`;
}

const FURNITURE = [
  { key: 'bed', name: '침대', icon: '🛏️', desc: '집에서 쉴 때 회복 속도 ↑', base: 3000,
    levels: ['박스 깔개', '매트리스', '싱글 침대', '퀸 침대', '킹 침대'] },
  { key: 'sink', name: '세면대', icon: '🚿', desc: '알바 중에도 기력 자동 회복 ↑', base: 5000,
    levels: ['바가지', '세면대', '샤워부스', '욕조', '스파'] },
  { key: 'desk', name: '책상', icon: '🪑', desc: '최대 기력 ↑', base: 8000,
    levels: ['박스 책상', '접이식 책상', '원목 책상', '컴퓨터 책상', '게이밍 책상'] },
  { key: 'fridge', name: '냉장고', icon: '🧊', desc: '클릭할 때 기력 덜 줄어듦', base: 6000,
    levels: ['아이스박스', '미니 냉장고', '냉장고', '양문형 냉장고', '와인셀러'] },
  { key: 'house', name: '집', icon: '🏠', desc: '모든 회복 보너스 ↑ + 배경 변경', base: 50000, mult: 25,
    levels: HOUSE_NAMES },
];

function furnBed(l) {
  const g = (inner) => `<g transform="translate(6 196)">${inner}</g>`;
  if (l === 0) return g(`<rect x="0" y="50" width="120" height="18" fill="#c9a26b" ${st_}/><path d="M20 54 l20 10 M60 52 l26 12" stroke="#a8743f" stroke-width="2"/><rect x="6" y="40" width="30" height="12" rx="4" fill="#ddd" ${st_}/>`);
  if (l === 1) return g(`<rect x="0" y="44" width="124" height="26" rx="6" fill="#fff" ${st_}/><rect x="6" y="34" width="34" height="14" rx="6" fill="#eaf2ff" ${st_}/>`);
  if (l === 2) return g(`<rect x="0" y="6" width="12" height="70" fill="#a8743f" ${st_}/><rect x="0" y="50" width="130" height="24" fill="#c08457" ${st_}/><rect x="8" y="38" width="122" height="16" rx="4" fill="#fff" ${st_}/><rect x="40" y="34" width="90" height="22" rx="6" fill="#6ea8ff" ${st_}/><rect x="14" y="28" width="28" height="12" rx="5" fill="#fff" ${st_}/>`);
  if (l === 3) return g(`<rect x="-4" y="-6" width="16" height="84" rx="6" fill="#ff9fbf" ${st_}/><rect x="0" y="50" width="150" height="26" fill="#f2c2d4" ${st_}/><rect x="8" y="36" width="142" height="18" rx="4" fill="#fff" ${st_}/><rect x="44" y="30" width="106" height="26" rx="8" fill="#ff7aa8" ${st_}/><rect x="14" y="16" width="28" height="14" rx="6" fill="#fff" ${st_}/><rect x="14" y="30" width="28" height="12" rx="6" fill="#ffe0ec" ${st_}/>`);
  return g(`<path d="M0 -60 v136 M150 -60 v136" stroke="#d4af37" stroke-width="6"/><path d="M-6 -60 h162 q-80 50 -162 0Z" fill="#b48cff" ${st_}/>
    <rect x="0" y="48" width="156" height="28" fill="#d4af37" ${st_}/><rect x="6" y="32" width="150" height="20" rx="4" fill="#fff" ${st_}/><rect x="44" y="26" width="112" height="28" rx="8" fill="#7b4ccf" ${st_}/><rect x="12" y="14" width="30" height="16" rx="7" fill="#fff" ${st_}/><text x="90" y="46" font-size="14">👑</text>`);
}
function furnSink(l) {
  const g = (inner) => `<g transform="translate(26 110)">${inner}</g>`;
  if (l === 0) return g(`<path d="M10 74 q30 30 60 0 Z" fill="#4d96ff" ${st_}/><path d="M60 72 l26 -6" stroke="#4d96ff" stroke-width="6" stroke-linecap="round"/>`);
  if (l === 1) return g(`<rect x="18" y="0" width="44" height="40" rx="6" fill="#dff3ff" ${st_}/><rect x="10" y="48" width="60" height="14" rx="4" fill="#fff" ${st_}/><path d="M34 48 v-6 h12" stroke="#999" stroke-width="3" fill="none"/><rect x="34" y="62" width="12" height="28" fill="#ddd" ${st_}/>`);
  if (l === 2) return g(`<rect x="4" y="-10" width="76" height="100" rx="4" fill="rgba(190,230,255,.55)" ${st_}/><path d="M60 -6 v14 h-10" stroke="#999" stroke-width="3" fill="none"/><circle cx="48" cy="12" r="6" fill="#bbb"/>${[0, 1, 2].map(i => `<path d="M${42 + i * 6} 22 v${20 + i * 6}" stroke="#7fc8ff" stroke-width="2" class="anim-drip" style="animation-delay:${i * .2}s"/>`).join('')}`);
  if (l === 3) return g(`<path d="M0 50 h96 v20 q0 20 -20 20 h-56 q-20 0 -20 -20Z" fill="#fff" ${st_}/>${[10, 30, 50, 70].map((x, i) => `<circle cx="${x + 6}" cy="48" r="9" fill="#e8f6ff" ${st_} stroke-width="1.5" class="anim-bob" style="animation-delay:${i * .3}s"/>`).join('')}<text x="66" y="44" font-size="16">🦆</text>`);
  return g(`<ellipse cx="50" cy="70" rx="56" ry="24" fill="#d4af37" ${st_}/><ellipse cx="50" cy="64" rx="48" ry="16" fill="#7fe0ff"/>${[20, 45, 70].map((x, i) => `<path d="M${x} 46 q-6 -12 0 -24" fill="none" stroke="#fff" stroke-width="3" class="anim-steam" style="animation-delay:${i * .4}s"/>`).join('')}<text x="38" y="72" font-size="14">🫧</text>`);
}
function furnDesk(l) {
  const g = (inner) => `<g transform="translate(268 196)">${inner}</g>`;
  if (l === 0) return g(`<rect x="10" y="30" width="80" height="44" fill="#c9a26b" ${st_}/><path d="M10 44 h80" stroke="#a8743f" stroke-width="2"/>`);
  if (l === 1) return g(`<rect x="0" y="30" width="100" height="8" fill="#9aa3ad" ${st_}/><path d="M10 38 l30 38 M40 38 l-30 38 M60 38 l30 38 M90 38 l-30 38" stroke="#6b737c" stroke-width="3"/>`);
  if (l === 2) return g(`<rect x="0" y="28" width="116" height="10" fill="#c08457" ${st_}/><rect x="6" y="38" width="10" height="38" fill="#a8743f" ${st_}/><rect x="100" y="38" width="10" height="38" fill="#a8743f" ${st_}/><text x="20" y="24" font-size="22">📚</text><text x="70" y="26" font-size="20">🪴</text>`);
  if (l === 3) return g(`<rect x="0" y="28" width="120" height="10" fill="#f2f2f2" ${st_}/><rect x="6" y="38" width="10" height="38" fill="#ddd" ${st_}/><rect x="104" y="38" width="10" height="38" fill="#ddd" ${st_}/><rect x="30" y="-14" width="60" height="38" rx="3" fill="#2b2f36" ${st_}/><rect x="35" y="-9" width="50" height="28" fill="#7fd3ff" class="anim-blink"/><rect x="56" y="24" width="8" height="6" fill="#555"/>`);
  return g(`<rect x="0" y="28" width="124" height="10" fill="#1d1e22" ${st_}/><path d="M0 38 h124" stroke="url(#rgb)" stroke-width="4"/><defs><linearGradient id="rgb"><stop offset="0" stop-color="#ff4d4d"/><stop offset=".5" stop-color="#4dff88"/><stop offset="1" stop-color="#4d7bff"/></linearGradient></defs>
    <rect x="6" y="40" width="10" height="36" fill="#333" ${st_}/><rect x="108" y="40" width="10" height="36" fill="#333" ${st_}/><rect x="12" y="-20" width="50" height="44" rx="3" fill="#111" ${st_}/><rect x="64" y="-20" width="50" height="44" rx="3" fill="#111" ${st_}/>
    <rect x="17" y="-15" width="40" height="34" fill="#b48cff" class="anim-blink"/><rect x="69" y="-15" width="40" height="34" fill="#4dff88" class="anim-blink" style="animation-delay:.5s"/>`);
}
function furnFridge(l) {
  const g = (inner) => `<g transform="translate(316 ${l >= 2 ? 80 : 130})">${inner}</g>`;
  if (l === 0) return g(`<rect x="0" y="70" width="60" height="44" rx="4" fill="#4dc4ff" ${st_}/><rect x="-2" y="66" width="64" height="10" rx="3" fill="#fff" ${st_}/>`);
  if (l === 1) return g(`<rect x="6" y="40" width="52" height="74" rx="6" fill="#f0f0f0" ${st_}/><path d="M48 54 v20" stroke="#999" stroke-width="4" stroke-linecap="round"/>`);
  if (l === 2) return g(`<rect x="4" y="0" width="64" height="122" rx="6" fill="#e8eef2" ${st_}/><path d="M4 44 h64" stroke="${L_}" stroke-width="2.5"/><path d="M58 14 v20 M58 56 v30" stroke="#999" stroke-width="4" stroke-linecap="round"/><text x="12" y="70" font-size="14">🧲</text>`);
  if (l === 3) return g(`<rect x="0" y="-6" width="78" height="128" rx="6" fill="#c9d3dc" ${st_}/><path d="M39 -6 v128" stroke="${L_}" stroke-width="2.5"/><path d="M32 30 v30 M46 30 v30" stroke="#888" stroke-width="4" stroke-linecap="round"/><rect x="48" y="8" width="22" height="16" rx="2" fill="#2b2f36"/><rect x="51" y="11" width="16" height="10" fill="#7fffd4"/>`);
  return g(`<rect x="0" y="-10" width="78" height="132" rx="6" fill="#2b1f2f" stroke="#d4af37" stroke-width="3"/><rect x="8" y="0" width="62" height="112" fill="rgba(255,200,120,.15)"/>
    ${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<ellipse cx="${20 + c * 19}" cy="${16 + r * 26}" rx="6" ry="9" fill="${(r + c) % 2 ? '#7a1f3d' : '#3d5a1f'}"/>`).join('')).join('')}`);
}
function homeScene(F) {
  return svgWrap(houseBg(F.house) + furnSink(F.sink) + furnFridge(F.fridge) + furnBed(F.bed) + furnDesk(F.desk) +
    `<g class="wardrobe" data-act="wardrobe" style="cursor:pointer">
      <rect x="120" y="96" width="46" height="106" rx="3" fill="#b07a45" ${st_}/><path d="M143 96 v106" stroke="${L_}" stroke-width="2.5"/>
      <circle cx="139" cy="150" r="2.5" fill="#ffd23f"/><circle cx="147" cy="150" r="2.5" fill="#ffd23f"/>
      <rect x="116" y="90" width="54" height="8" rx="2" fill="#8b5a3c" ${st_}/>
      <text x="143" y="88" text-anchor="middle" font-size="14" class="anim-bob">👗</text></g>`);
}

function endingScene() {
  return svgWrap(`
    <defs><linearGradient id="skyE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3c8"/><stop offset="1" stop-color="#ffe8b3"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#skyE)"/>
    <rect x="60" y="60" width="280" height="160" fill="#fff6e6" ${st_}/>
    <path d="M50 60 h300 l-20 -30 h-260 Z" fill="#ff7aa8" ${st_}/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${50 + i * 43} 60 q21 24 43 0" fill="${i % 2 ? '#fff' : '#ff7aa8'}" ${st_}/>`).join('')}
    <rect x="140" y="10" width="120" height="30" rx="6" fill="#ffd23f" ${st_}/>
    <text x="200" y="31" text-anchor="middle" font-size="16" font-weight="900" fill="#7a3b00" font-family="sans-serif">사장님 가게</text>
    <rect x="90" y="110" width="70" height="60" fill="#bfe6ff" ${st_}/><rect x="240" y="110" width="70" height="60" fill="#bfe6ff" ${st_}/>
    <rect x="170" y="150" width="60" height="70" fill="#c08457" ${st_}/><rect x="176" y="130" width="48" height="16" rx="3" fill="#2fb36b"/><text x="200" y="142" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="sans-serif">OPEN</text>
    <rect x="0" y="220" width="400" height="80" fill="#d9d2c5"/>`);
}
