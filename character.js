// 주인공 캐릭터: 실제 얼굴 사진 + 귀여운 몸통 (SVG)
// face: 'blank'(멍) | 'laugh'(활짝) | 'cute'(볼콕) | 'tired'(지침)
// pose: 'stand' | 'peace'(브이)
// imgBase: 이미지 폴더 경로 (기본 'img/')
let __charId = 0;
function characterSVG({ face = 'blank', pose = 'stand', imgBase = 'img/' } = {}) {
  const id = 'c' + (++__charId);
  const L = '#3b2f2f';
  const SKIN = '#ffe2cc';
  const HOOD = '#c4c6cc';
  const HOOD_D = '#a9acb4';
  const BLUE = '#4a6fd8';
  const s = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const file = { blank: 'face-blank.png', laugh: 'face-laugh.png', cute: 'face-cute.png', tired: 'face-blank.png' }[face];
  // 머리(사진) 영역
  const HX = 100, HY = 90, RX = 66, RY = 76;

  let arms;
  if (pose === 'peace') {
    const hand = (x, flip) => `
      <g transform="translate(${x} 150) scale(${flip} 1)">
        <path d="M0 40 Q-4 18 0 8" fill="none" stroke="${HOOD_D}" stroke-width="16" stroke-linecap="round"/>
        <rect x="-9" y="-26" width="7" height="22" rx="3.5" fill="${SKIN}" ${s} transform="rotate(-14 -5 -4)"/>
        <rect x="2" y="-26" width="7" height="22" rx="3.5" fill="${SKIN}" ${s} transform="rotate(14 5 -4)"/>
        <circle cx="0" cy="2" r="11" fill="${SKIN}" ${s}/>
      </g>`;
    arms = hand(34, 1) + hand(166, -1);
  } else {
    arms = `<ellipse cx="48" cy="196" rx="11" ry="26" fill="${HOOD_D}" ${s} transform="rotate(12 48 196)"/>
            <ellipse cx="152" cy="196" rx="11" ry="26" fill="${HOOD_D}" ${s} transform="rotate(-12 152 196)"/>
            <circle cx="44" cy="220" r="9" fill="${SKIN}" ${s}/>
            <circle cx="156" cy="220" r="9" fill="${SKIN}" ${s}/>`;
  }

  const tired = face === 'tired'
    ? `<path d="M150 40 q6 11 0 17 q-6 -6 0 -17Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
       <path d="M140 64 q5 9 0 14 q-5 -5 0 -14Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
       <rect x="${HX - RX}" y="${HY - RY}" width="${RX * 2}" height="${RY * 2}" fill="#7a6fd0" opacity=".18" clip-path="url(#${id})"/>`
    : '';

  return `<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}"><ellipse cx="${HX}" cy="${HY}" rx="${RX}" ry="${RY}"/></clipPath></defs>
    <ellipse cx="100" cy="262" rx="58" ry="7" fill="rgba(0,0,0,.12)"/>
    <!-- 다리 -->
    <rect x="72" y="228" width="22" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <rect x="106" y="228" width="22" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <!-- 후드티 몸통 -->
    <path d="M60 152 C40 164 38 206 42 238 L158 238 C162 206 160 164 140 152 Z" fill="${HOOD}" ${s}/>
    <text x="100" y="214" text-anchor="middle" font-size="19" font-weight="900" fill="${BLUE}"
          stroke="#fff" stroke-width="3" paint-order="stroke" font-family="sans-serif">노가다</text>
    ${pose === 'stand' ? arms : ''}
    <!-- 후드 테두리 -->
    <ellipse cx="${HX}" cy="${HY + 2}" rx="${RX + 9}" ry="${RY + 8}" fill="${HOOD}" ${s}/>
    <!-- 얼굴 사진 -->
    <ellipse cx="${HX}" cy="${HY}" rx="${RX}" ry="${RY}" fill="#e9e3dc"/>
    <image href="${imgBase}${file}" x="${HX - RX}" y="${HY - RY}" width="${RX * 2}" height="${RY * 2}"
           preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
    <ellipse cx="${HX}" cy="${HY}" rx="${RX}" ry="${RY}" fill="none" ${s}/>
    <!-- 후드 끈 -->
    <path d="M90 166 L88 186 M110 166 L112 186" ${s} stroke-width="2.5"/>
    <circle cx="88" cy="188" r="3" fill="#fff" ${s} stroke-width="2"/>
    <circle cx="112" cy="188" r="3" fill="#fff" ${s} stroke-width="2"/>
    ${tired}
    ${pose === 'peace' ? arms : ''}
  </svg>`;
}
