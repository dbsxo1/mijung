// 주인공 캐릭터: 실제 사진 머리(배경 제거) + 만화 몸통 합성
// face: 'blank'(멍) | 'laugh'(활짝) | 'peace'(브이) | 'tired'(지침)
// tool: true 면 삽을 듦
function characterSVG({ face = 'blank', tool = true, hat = true, imgBase = 'img/' } = {}) {
  const L = '#3b2f2f';
  const SKIN = '#f6d3bd';
  const HOOD = '#c4c6cc';
  const HOOD_D = '#a9acb4';
  const BLUE = '#4a6fd8';
  const s = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  // 머리 사진 배치 (가로 w, 세로 h, 아래 끝이 y=208 근처)
  const HEADS = {
    blank: { file: 'head-blank.png', w: 140, h: 191, hatX: 130, hatS: 1.0, tilt: 0 },
    laugh: { file: 'head-laugh.png', w: 166, h: 192, hatX: 124, hatS: 1.1, tilt: -9 },
    peace: { file: 'head-peace.png', w: 250, h: 171, hatX: 131, hatS: 0.82, tilt: 0 },
    tired: { file: 'head-blank.png', w: 140, h: 191, hatX: 130, hatS: 1.0, tilt: 6 },
  };
  const H = HEADS[face] || HEADS.blank;
  const bottom = 212;
  const top = bottom - H.h;
  const hatY = top + 30 * H.hatS;

  const imgStyle = face === 'tired' ? 'filter:brightness(.82) saturate(.6) hue-rotate(-10deg)' : '';

  const hatSVG = !hat ? '' : `
    <g transform="translate(${H.hatX} ${hatY}) rotate(${H.tilt}) scale(${H.hatS})">
      <path d="M-50 4 C-52 -48 52 -48 50 4 Z" fill="#ffcc2e" ${s}/>
      <path d="M-8 -40 L-8 2 M8 -40 L8 2" stroke="#e6a800" stroke-width="5"/>
      <rect x="-64" y="0" width="128" height="13" rx="6.5" fill="#ffd84d" ${s}/>
      <path d="M-30 -30 q10 -9 22 -10" fill="none" stroke="#fff6c4" stroke-width="5" stroke-linecap="round"/>
    </g>`;

  const shovel = !tool ? '' : `
    <g transform="rotate(14 214 236)">
      <rect x="210" y="150" width="8" height="122" rx="3" fill="#b07a45" ${s}/>
      <rect x="203" y="142" width="22" height="10" rx="5" fill="#b07a45" ${s}/>
      <path d="M198 268 L230 268 L226 300 Q214 312 202 300 Z" fill="#9aa3ad" ${s}/>
    </g>`;

  const sweat = face === 'tired' ? `
    <path d="M190 70 q7 12 0 19 q-7 -7 0 -19Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
    <path d="M60 96 q6 10 0 16 q-6 -6 0 -16Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>
    <text x="196" y="52" font-size="22" font-weight="900" fill="#7a6fd0" font-family="sans-serif">헥헥</text>` : '';

  return `<svg viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="130" cy="310" rx="70" ry="8" fill="rgba(0,0,0,.13)"/>
    <!-- 다리 + 장화 -->
    <rect x="101" y="270" width="24" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <rect x="135" y="270" width="24" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <path d="M96 296 h32 v10 h-32 Z M132 296 h32 v10 h-32 Z" fill="#2f6f4f" ${s}/>
    <!-- 머리 (실제 사진) -->
    <image href="${imgBase}${H.file}" x="${130 - H.w / 2}" y="${top}" width="${H.w}" height="${H.h}" style="${imgStyle}"/>
    <!-- 후드티 몸통 -->
    <path d="M92 196 C72 206 68 248 72 280 L188 280 C192 248 188 206 168 196 Q130 214 92 196 Z" fill="${HOOD}" ${s}/>
    <path d="M100 198 Q130 222 160 198" fill="none" stroke="${HOOD_D}" stroke-width="7" stroke-linecap="round"/>
    <path d="M120 212 L118 232 M140 212 L142 232" ${s} stroke-width="2.5"/>
    <circle cx="118" cy="234" r="3" fill="#fff" ${s} stroke-width="2"/>
    <circle cx="142" cy="234" r="3" fill="#fff" ${s} stroke-width="2"/>
    <text x="130" y="262" text-anchor="middle" font-size="20" font-weight="900" fill="${BLUE}"
          stroke="#fff" stroke-width="3" paint-order="stroke" font-family="sans-serif">노가다</text>
    <!-- 팔 -->
    <ellipse cx="78" cy="238" rx="11" ry="27" fill="${HOOD_D}" ${s} transform="rotate(14 78 238)"/>
    <circle cx="73" cy="263" r="9" fill="${SKIN}" ${s}/>
    ${shovel}
    <ellipse cx="184" cy="234" rx="11" ry="25" fill="${HOOD_D}" ${s} transform="rotate(-28 184 234)"/>
    <circle cx="201" cy="250" r="9" fill="${SKIN}" ${s}/>
    ${hatSVG}
    ${sweat}
  </svg>`;
}
