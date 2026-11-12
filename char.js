// =====================================================
//  캐릭터 렌더러: 실제 얼굴 사진 + 만화 몸통 + 스킨/유니폼
// =====================================================
const SKINS = {
  clothes: [
    { id: 'hoodie',   name: '회색 후드티', price: 0 },
    { id: 'pink',     name: '핑크 후드티', price: 30000 },
    { id: 'cardigan', name: '뽀송 가디건', price: 150000 },
    { id: 'padding',  name: '검정 패딩',   price: 2000000 },
    { id: 'track',    name: '츄리닝',      price: 8000000 },
    { id: 'dino',     name: '공룡 잠옷',   price: 50000000 },
    { id: 'suit',     name: '정장',        price: 0, unlock: 'prestige', hint: '첫 퇴사 후 해금' },
  ],
  hat: [
    { id: 'none',   name: '없음',       price: 0 },
    { id: 'beanie', name: '비니',       price: 20000 },
    { id: 'ribbon', name: '리본',       price: 60000 },
    { id: 'cat',    name: '고양이 귀',  price: 500000 },
    { id: 'frog',   name: '개구리 모자', price: 12000000 },
    { id: 'crown',  name: '왕관',       price: 0, unlock: 'ending', hint: '엔딩 보면 해금' },
  ],
  acc: [
    { id: 'none',    name: '없음',         price: 0 },
    { id: 'glasses', name: '동그란 안경',  price: 40000 },
    { id: 'mask',    name: '마스크',       price: 90000 },
    { id: 'sticker', name: '볼 하트 스티커', price: 700000 },
    { id: 'shades',  name: '선글라스',     price: 0, unlock: 'karen', hint: '진상 손님 30명 처리' },
  ],
  shoes: [
    { id: 'boots',   name: '장화',   price: 0 },
    { id: 'sneaker', name: '운동화', price: 25000 },
    { id: 'slipper', name: '삼선 슬리퍼', price: 80000 },
    { id: 'dress',   name: '구두',   price: 3000000 },
  ],
  fx: [
    { id: 'none',    name: '없음',       price: 0 },
    { id: 'sparkle', name: '반짝반짝',   price: 1000000 },
    { id: 'hearts',  name: '하트 뿅뿅',  price: 5000000 },
    { id: 'money',   name: '돈 비',      price: 100000000 },
    { id: 'rainbow', name: '무지개 오라', price: 0, unlock: 'enhance10', hint: '장비 +10 강화 달성' },
  ],
};
const SKIN_SLOTS = [
  { key: 'clothes', label: '👕 옷' },
  { key: 'hat', label: '🧢 모자' },
  { key: 'acc', label: '🕶️ 소품' },
  { key: 'shoes', label: '👟 신발' },
  { key: 'fx', label: '✨ 효과' },
];

// 얼굴 사진별 위치 정보 (SVG 좌표)
const HEADS = {
  blank: { file: 'head-blank.png', w: 142, h: 190, hatX: 130, hatS: 1.05, tilt: 0,
           eye: { x: 141, y: 119, d: 48, a: 7 }, mouth: { x: 135, y: 176 } },
  laugh: { file: 'head-laugh.png', w: 166, h: 192, hatX: 124, hatS: 1.1, tilt: -9,
           eye: { x: 152, y: 101, d: 58, a: 22 }, mouth: { x: 146, y: 153 } },
  peace: { file: 'head-peace.png', w: 128, h: 195, hatX: 131, hatS: 0.95, tilt: 0,
           eye: { x: 131, y: 107, d: 52, a: 0 }, mouth: { x: 130, y: 160 } },
};

const CLOTH_COLORS = {
  hoodie:   { main: '#c4c6cc', dark: '#a9acb4', pants: '#4b4f5a' },
  pink:     { main: '#ffb3c8', dark: '#f28dab', pants: '#4b4f5a' },
  cardigan: { main: '#eeeae2', dark: '#d6d0c4', pants: '#5a6170' },
  padding:  { main: '#2b2d33', dark: '#1d1e22', pants: '#3a3d45' },
  track:    { main: '#2f4fa8', dark: '#253f88', pants: '#2f4fa8' },
  dino:     { main: '#7ccf6a', dark: '#5fb24f', pants: '#7ccf6a' },
  suit:     { main: '#2c3550', dark: '#1f2740', pants: '#2c3550' },
};

let __clipId = 0;
function renderChar(opt = {}) {
  const {
    face = 'blank', skin = {}, job = -1, uniform = true, home = false, imgBase = 'img/',
  } = opt;
  const L = '#3b2f2f';
  const SKIN = '#f6d3bd';
  const s = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const sk = Object.assign({ clothes: 'hoodie', hat: 'none', acc: 'none', shoes: 'boots', fx: 'none' }, skin);
  const C = CLOTH_COLORS[sk.clothes] || CLOTH_COLORS.hoodie;
  const useUni = uniform && !home && job >= 0;
  const headKey = face === 'laugh' ? 'laugh' : face === 'peace' ? 'peace' : 'blank';
  const H = HEADS[headKey];
  const bottom = 212, top = bottom - H.h;
  const hatY = top + 30 * H.hatS;
  const glove = useUni && job === 3;
  const HAND = glove ? '#e9e6dc' : SKIN;
  const raised = face === 'peace';
  const id = 'cc' + (++__clipId);

  // ---------- 효과(뒤) ----------
  let fxBack = '', fxFront = '';
  if (sk.fx === 'rainbow') {
    fxBack = `<defs><radialGradient id="${id}r"><stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".55" stop-color="#ffe066" stop-opacity=".0"/><stop offset=".7" stop-color="#ff8fab" stop-opacity=".55"/>
      <stop offset=".82" stop-color="#8fd0ff" stop-opacity=".55"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient></defs>
      <ellipse class="fx-aura" cx="130" cy="160" rx="135" ry="165" fill="url(#${id}r)"/>`;
  }
  if (sk.fx === 'sparkle') fxFront = ['✨', '✨', '⭐', '✨'].map((e, i) =>
    `<text class="fx-tw" style="animation-delay:${i * .4}s" x="${[30, 215, 45, 205][i]}" y="${[60, 90, 200, 230][i]}" font-size="22">${e}</text>`).join('');
  if (sk.fx === 'hearts') fxFront = [0, 1, 2, 3].map(i =>
    `<text class="fx-up" style="animation-delay:${i * .6}s" x="${[35, 200, 60, 190][i]}" y="240" font-size="20">${i % 2 ? '💗' : '💕'}</text>`).join('');
  if (sk.fx === 'money') fxFront = [0, 1, 2, 3, 4].map(i =>
    `<text class="fx-down" style="animation-delay:${i * .5}s" x="${[20, 70, 120, 170, 220][i]}" y="0" font-size="20">${i % 2 ? '💸' : '💵'}</text>`).join('');

  // ---------- 다리 + 신발 ----------
  const shoes = {
    boots:   (x) => `<path d="M${x - 3} 294 h30 v12 h-30 Z" fill="#2f6f4f" ${s}/>`,
    sneaker: (x) => `<path d="M${x - 4} 296 h28 q6 0 6 6 v4 h-34 Z" fill="#fff" ${s}/><path d="M${x + 2} 300 h14" stroke="#ff5a5a" stroke-width="3"/>`,
    slipper: (x) => `<path d="M${x - 4} 302 h34 v5 h-34 Z" fill="#2d5bd1" ${s}/><path d="M${x + 1} 296 h22" stroke="#fff" stroke-width="5"/><path d="M${x + 1} 296 h22" stroke="#2d5bd1" stroke-width="1.5" stroke-dasharray="4 3"/>`,
    dress:   (x) => `<path d="M${x - 4} 296 h26 q8 0 8 7 v3 h-34 Z" fill="#1b1b1f" ${s}/><path d="M${x + 4} 299 h8" stroke="#fff" stroke-width="2" opacity=".6"/>`,
  }[sk.shoes] || (() => '');
  const legs = `
    <rect x="101" y="270" width="24" height="30" rx="8" fill="${C.pants}" ${s}/>
    <rect x="135" y="270" width="24" height="30" rx="8" fill="${C.pants}" ${s}/>
    ${shoes(99)}${shoes(133)}`;

  // ---------- 몸통 ----------
  const torsoPath = 'M92 196 C72 206 68 248 72 280 L188 280 C192 248 188 206 168 196 Q130 214 92 196 Z';
  let torso = `<path d="${torsoPath}" fill="${C.main}" ${s}/>`;
  if (sk.clothes === 'hoodie' || sk.clothes === 'pink') {
    torso += `<path d="M100 198 Q130 222 160 198" fill="none" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
      <path d="M120 212 L118 232 M140 212 L142 232" ${s} stroke-width="2.5"/>
      <circle cx="118" cy="234" r="3" fill="#fff" ${s} stroke-width="2"/><circle cx="142" cy="234" r="3" fill="#fff" ${s} stroke-width="2"/>
      <path d="M100 258 Q130 266 160 258" fill="none" stroke="${C.dark}" stroke-width="3"/>`;
  } else if (sk.clothes === 'cardigan') {
    torso += `<path d="M104 200 L130 236 L156 200" fill="none" stroke="#9aa6c0" stroke-width="4"/>
      <path d="M130 236 V280" stroke="${C.dark}" stroke-width="2"/>
      ${[244, 258, 272].map(y => `<circle cx="130" cy="${y}" r="3.5" fill="#2b2b2b"/>`).join('')}
      <path d="M74 276 H186" stroke="#9aa6c0" stroke-width="4"/>`;
  } else if (sk.clothes === 'padding') {
    torso += [222, 240, 258].map(y => `<path d="M76 ${y} Q130 ${y + 8} 184 ${y}" fill="none" stroke="#45474f" stroke-width="2.5"/>`).join('') +
      `<path d="M130 206 V280" stroke="#8b8d94" stroke-width="2.5"/><path d="M100 214 q8 -6 14 -2" stroke="#666a74" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (sk.clothes === 'track') {
    torso += `<path d="M130 206 V280" stroke="#d8dce8" stroke-width="3"/><path d="M80 214 L76 276 M180 214 L184 276" stroke="#fff" stroke-width="5"/>
      <path d="M110 200 L130 210 L150 200" fill="none" stroke="#fff" stroke-width="3"/>`;
  } else if (sk.clothes === 'dino') {
    torso += `<ellipse cx="130" cy="250" rx="34" ry="26" fill="#d9f5b5"/>
      ${[0, 1, 2].map(i => `<path d="M${74 - i * 2} ${214 + i * 18} l-12 6 l12 6Z" fill="#ffd166" ${s} stroke-width="2"/>`).join('')}
      ${[0, 1, 2].map(i => `<path d="M${186 + i * 2} ${214 + i * 18} l12 6 l-12 6Z" fill="#ffd166" ${s} stroke-width="2"/>`).join('')}`;
  } else if (sk.clothes === 'suit') {
    torso += `<path d="M110 198 L130 240 L150 198 Z" fill="#fff" ${s} stroke-width="2"/>
      <path d="M126 206 L134 206 L137 236 L130 246 L123 236 Z" fill="#d23c3c" ${s} stroke-width="2"/>
      <path d="M108 198 L124 238 M152 198 L136 238" stroke="${C.dark}" stroke-width="4"/>
      <rect x="150" y="226" width="16" height="4" rx="2" fill="#fff"/>`;
  }

  // ---------- 유니폼 덧옷 ----------
  let uniOver = '';
  if (useUni && job === 1) uniOver = `<path d="M84 206 C76 230 76 256 78 280 L112 280 L112 210 Z M176 206 C184 230 184 256 182 280 L148 280 L148 210 Z" fill="#2fb36b" ${s}/><rect x="152" y="228" width="22" height="12" rx="3" fill="#fff" ${s} stroke-width="2"/>`;
  if (useUni && job === 2) uniOver = `<path d="M100 214 h60 v66 h-60 Z" fill="#8b5a3c" ${s}/><path d="M100 214 L94 200 M160 214 L166 200" stroke="#8b5a3c" stroke-width="4"/><rect x="118" y="240" width="24" height="14" rx="3" fill="#a9714f"/>`;
  if (useUni && job === 4) uniOver = `<path d="M84 206 C76 230 76 256 78 280 L114 280 L114 210 Z M176 206 C184 230 184 256 182 280 L146 280 L146 210 Z" fill="#ff8a1f" ${s}/><path d="M78 250 H114 M146 250 H182" stroke="#e8f0f2" stroke-width="6"/>`;
  if (useUni && job === 5) uniOver = `<path d="${torsoPath}" fill="#2ac1bc" ${s}/><path d="M130 206 V280" stroke="#1d8f8b" stroke-width="3"/><text x="154" y="236" font-size="12" font-weight="900" fill="#fff" font-family="sans-serif">배달</text>`;

  // ---------- 도구 (오른손) ----------
  const tools = [
    // 전단지
    `<g transform="rotate(-10 205 240)"><rect x="196" y="222" width="34" height="26" fill="#fff" ${s}/><rect x="199" y="218" width="34" height="26" fill="#fff6a8" ${s}/><path d="M204 226 h22 M204 232 h16 M204 238 h20" stroke="#e05a5a" stroke-width="2.5"/></g>`,
    // 바코드 스캐너
    `<g><path d="M200 252 l10 -32 h18 l-6 14 h-10 l-6 22 Z" fill="#555b66" ${s}/><path d="M224 222 L250 214 L250 230 Z" fill="#ff4d4d" opacity=".55"/></g>`,
    // 커피
    `<g><path d="M196 226 h30 l-4 30 h-22 Z" fill="#fff" ${s}/><rect x="196" y="234" width="30" height="8" fill="#8b5a3c"/><path d="M205 218 q-4 -6 0 -12 M215 218 q-4 -6 0 -12" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linecap="round"/></g>`,
    // 택배 박스
    `<g><rect x="188" y="224" width="46" height="38" fill="#d9a066" ${s}/><path d="M188 236 h46 M211 224 v12" stroke="#a8743f" stroke-width="3"/><rect x="214" y="244" width="14" height="10" fill="#fff" stroke="#a8743f" stroke-width="1.5"/></g>`,
    // 삽
    `<g transform="rotate(14 214 236)"><rect x="210" y="150" width="8" height="122" rx="3" fill="#b07a45" ${s}/><rect x="203" y="142" width="22" height="10" rx="5" fill="#b07a45" ${s}/><path d="M198 268 L230 268 L226 300 Q214 312 202 300 Z" fill="#9aa3ad" ${s}/></g>`,
    // 배달통
    `<g><path d="M200 232 q10 -14 20 0" fill="none" ${s}/><rect x="188" y="232" width="44" height="36" rx="5" fill="#2ac1bc" ${s}/><text x="210" y="256" text-anchor="middle" font-size="14">🍗</text></g>`,
  ];
  const tool = (!home && job >= 0 && tools[job]) ? `<g class="tool">${tools[job]}</g>` : '';

  // ---------- 팔 ----------
  let arms;
  if (raised) {
    const vHand = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip * 1.25} 1.25)">
      <rect x="-10" y="-30" width="8" height="25" rx="4" fill="${HAND}" ${s} transform="rotate(-16 -6 -5)"/>
      <rect x="2" y="-30" width="8" height="25" rx="4" fill="${HAND}" ${s} transform="rotate(16 6 -5)"/>
      <circle cx="0" cy="2" r="12" fill="${HAND}" ${s}/></g>`;
    const arm = (d) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="25" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.dark}" stroke-width="19" stroke-linecap="round"/>`;
    arms = arm('M86 206 Q60 196 56 150') + arm('M174 206 Q200 196 204 150') + vHand(55, 140, 1) + vHand(205, 140, -1);
  } else if (home) {
    arms = `<ellipse cx="80" cy="238" rx="11" ry="27" fill="${C.dark}" ${s} transform="rotate(8 80 238)"/>
      <ellipse cx="180" cy="238" rx="11" ry="27" fill="${C.dark}" ${s} transform="rotate(-8 180 238)"/>
      <circle cx="77" cy="264" r="9" fill="${HAND}" ${s}/><circle cx="183" cy="264" r="9" fill="${HAND}" ${s}/>`;
  } else {
    arms = `<ellipse cx="78" cy="238" rx="11" ry="27" fill="${C.dark}" ${s} transform="rotate(14 78 238)"/>
      <circle cx="73" cy="263" r="9" fill="${HAND}" ${s}/>
      <g class="arm-r">${tool}
      <ellipse cx="184" cy="234" rx="11" ry="25" fill="${C.dark}" ${s} transform="rotate(-28 184 234)"/>
      <circle cx="201" cy="250" r="9" fill="${HAND}" ${s}/></g>`;
  }

  // ---------- 모자 ----------
  const hatG = (inner, scale = 1) => `<g transform="translate(${H.hatX} ${hatY}) rotate(${H.tilt}) scale(${H.hatS * scale})">${inner}</g>`;
  const uniHats = {
    1: `<path d="M-46 4 C-48 -42 48 -42 46 4 Z" fill="#2fb36b" ${s}/><path d="M-10 2 L64 4 Q60 16 -10 14 Z" fill="#23905a" ${s}/><circle cx="0" cy="-20" r="9" fill="#fff"/><text x="0" y="-15" text-anchor="middle" font-size="12" font-weight="900" fill="#2fb36b" font-family="sans-serif">24</text>`,
    2: `<path d="M-50 6 C-52 -30 52 -30 50 6 Z" fill="#6b4430" ${s}/><path d="M-52 4 h104 v8 h-104 Z" fill="#8b5a3c" ${s}/><text x="0" y="-6" text-anchor="middle" font-size="14">☕</text>`,
    4: `<path d="M-50 4 C-52 -48 52 -48 50 4 Z" fill="#ffcc2e" ${s}/><path d="M-8 -40 L-8 2 M8 -40 L8 2" stroke="#e6a800" stroke-width="5"/><rect x="-64" y="0" width="128" height="13" rx="6.5" fill="#ffd84d" ${s}/><path d="M-30 -30 q10 -9 22 -10" fill="none" stroke="#fff6c4" stroke-width="5" stroke-linecap="round"/>`,
    5: `<path d="M-56 14 C-60 -52 60 -52 56 14 Z" fill="#e8413c" ${s}/><path d="M-40 -6 C-30 -30 30 -30 40 -6" fill="none" stroke="#fff" stroke-width="6" opacity=".5"/><rect x="-58" y="8" width="116" height="10" rx="5" fill="#c22f2b" ${s}/>`,
  };
  const skinHats = {
    beanie: `<path d="M-50 8 C-52 -46 52 -46 50 8 Z" fill="#e85d5d" ${s}/><rect x="-54" y="0" width="108" height="16" rx="7" fill="#c94444" ${s}/>${[-36, -18, 0, 18, 36].map(x => `<path d="M${x} 2 v12" stroke="#a83636" stroke-width="3"/>`).join('')}<circle cx="0" cy="-44" r="11" fill="#fff" ${s}/>`,
    ribbon: `<g transform="translate(34 -6) rotate(18)"><path d="M0 0 L-28 -16 L-28 16 Z M0 0 L28 -16 L28 16 Z" fill="#ff7aa8" ${s}/><circle r="8" fill="#ff4f8b" ${s}/></g>`,
    cat: `<path d="M-52 4 L-40 -46 L-12 -14 Z" fill="#2a2626" ${s}/><path d="M-42 -4 L-38 -32 L-22 -14 Z" fill="#ffb3c8"/><path d="M52 4 L40 -46 L12 -14 Z" fill="#2a2626" ${s}/><path d="M42 -4 L38 -32 L22 -14 Z" fill="#ffb3c8"/>`,
    frog: `<path d="M-54 10 C-56 -40 56 -40 54 10 Z" fill="#6cc357" ${s}/><circle cx="-26" cy="-34" r="16" fill="#6cc357" ${s}/><circle cx="26" cy="-34" r="16" fill="#6cc357" ${s}/><circle cx="-26" cy="-34" r="9" fill="#fff"/><circle cx="26" cy="-34" r="9" fill="#fff"/><circle cx="-24" cy="-33" r="5" fill="${L}"/><circle cx="28" cy="-33" r="5" fill="${L}"/><path d="M-20 -6 q20 12 40 0" fill="none" stroke="#2f7a24" stroke-width="3"/>`,
    crown: `<path d="M-42 6 L-46 -38 L-22 -16 L0 -46 L22 -16 L46 -38 L42 6 Z" fill="#ffd23f" ${s}/><circle cx="0" cy="-10" r="7" fill="#e83f5b"/><circle cx="-26" cy="-6" r="5" fill="#3fa9f5"/><circle cx="26" cy="-6" r="5" fill="#3fa9f5"/>`,
  };
  let hat = '';
  if (face !== 'sleep') {
    if (useUni && uniHats[job]) hat = hatG(uniHats[job]);
    else if (skinHats[sk.hat]) hat = hatG(skinHats[sk.hat]);
  } else if (skinHats[sk.hat] && sk.hat !== 'crown') {
    hat = hatG(skinHats[sk.hat]);
  }

  // ---------- 얼굴 소품 ----------
  const E = H.eye, M = H.mouth, k = E.d / 48;
  const eyeG = (inner) => `<g transform="translate(${E.x} ${E.y}) rotate(${E.a}) scale(${k})">${inner}</g>`;
  let acc = '';
  if (sk.acc === 'glasses') acc = eyeG(`<circle cx="-24" cy="0" r="17" fill="rgba(255,255,255,.15)" stroke="#2a2a2a" stroke-width="4"/><circle cx="24" cy="0" r="17" fill="rgba(255,255,255,.15)" stroke="#2a2a2a" stroke-width="4"/><path d="M-7 -2 q7 -6 14 0" fill="none" stroke="#2a2a2a" stroke-width="4"/>`);
  if (sk.acc === 'shades') acc = eyeG(`<path d="M-46 -12 h38 q2 22 -18 22 q-20 0 -20 -22 Z M8 -12 h38 q0 22 -20 22 q-20 0 -18 -22 Z" fill="#111" stroke="#111" stroke-width="3"/><path d="M-8 -10 h16" stroke="#111" stroke-width="4"/><path d="M-36 -6 l10 0" stroke="#fff" stroke-width="3" opacity=".7"/>`);
  if (sk.acc === 'sticker') acc = eyeG(`<text x="-46" y="38" font-size="20">💗</text><text x="30" y="38" font-size="20">💗</text>`);
  if (sk.acc === 'mask' && face !== 'laugh') {
    acc = `<g transform="translate(${M.x} ${M.y - 4}) rotate(${E.a}) scale(${k})"><path d="M-36 -22 Q0 -30 36 -22 L32 18 Q0 30 -32 18 Z" fill="#f4f6f8" ${s} stroke-width="2.5"/><path d="M-28 -8 h56 M-28 4 h56" stroke="#d6dbe0" stroke-width="2"/></g>`;
  }
  if (face === 'sleep') acc += eyeG(`<path d="M-48 -14 Q0 -24 48 -14 L46 12 Q0 22 -46 12 Z" fill="#ff9fc0" ${s} stroke-width="2.5"/><path d="M-36 0 q8 6 16 0 M20 0 q8 6 16 0" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`);

  // ---------- 상태 표시 ----------
  let status = '';
  if (face === 'tired') status = `<path d="M190 70 q7 12 0 19 q-7 -7 0 -19Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
    <path d="M58 96 q6 10 0 16 q-6 -6 0 -16Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
    <text x="192" y="52" font-size="22" font-weight="900" fill="#7a6fd0" font-family="sans-serif">헥헥</text>`;
  if (face === 'sleep') status = `<text class="zzz" x="190" y="60" font-size="26" font-weight="900" fill="#7aa2ff" font-family="sans-serif">Z</text>
    <text class="zzz" style="animation-delay:.7s" x="210" y="40" font-size="18" font-weight="900" fill="#7aa2ff" font-family="sans-serif">z</text>`;

  const imgStyle = face === 'tired' ? 'filter:brightness(.82) saturate(.6)' : '';
  return `<svg class="char-svg" viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg">
    ${fxBack}
    <ellipse cx="130" cy="310" rx="70" ry="8" fill="rgba(0,0,0,.13)"/>
    <g class="body-g">
      ${legs}
      <image href="${imgBase}${H.file}" x="${130 - H.w / 2}" y="${top}" width="${H.w}" height="${H.h}" style="${imgStyle}"/>
      ${torso}${uniOver}
      ${arms}
      ${acc}${hat}
    </g>
    ${status}${fxFront}
  </svg>`;
}
