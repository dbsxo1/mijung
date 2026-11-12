// 주인공 캐릭터 (SVG). 게임에서도 그대로 재사용할 예정.
// face: 'blank'(멍) | 'laugh'(활짝) | 'tired'(지침)
// pose: 'stand' | 'peace'(브이)
function characterSVG({ face = 'blank', pose = 'stand' } = {}) {
  const L = '#3b2f2f';          // 외곽선
  const SKIN = '#ffe2cc';
  const HAIR = '#22201f';
  const HOOD = '#c4c6cc';
  const HOOD_D = '#a9acb4';
  const BLUE = '#4a6fd8';
  const s = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  // ---- 얼굴 표정 ----
  let eyes = '', mouth = '', extra = '';
  if (face === 'blank') {
    // 짝짝이 점눈 + 삐뚤한 입
    eyes = `<circle cx="80" cy="114" r="5" fill="${L}"/><circle cx="121" cy="115" r="4" fill="${L}"/>`;
    mouth = `<path d="M92 139 q8 3 17 -2" fill="none" ${s}/>`;
  } else if (face === 'laugh') {
    // 눈 감고 콧구멍 보이게 크게 웃음
    eyes = `<path d="M71 116 q9 -10 18 0 M112 116 q9 -10 18 0" fill="none" ${s} stroke-width="4"/>`;
    mouth = `<path d="M81 131 Q100 162 120 131 Z" fill="#8a3434" ${s}/>
             <path d="M84 133 L117 133 L114 140 L87 140 Z" fill="#fff"/>
             <ellipse cx="100" cy="150" rx="8" ry="4" fill="#ff8f8f"/>`;
    extra = `<circle cx="96" cy="126" r="1.8" fill="${L}"/><circle cx="104" cy="126" r="1.8" fill="${L}"/>`;
  } else if (face === 'tired') {
    eyes = `<path d="M72 115 h16 M113 115 h16" ${s} stroke-width="4"/>
            <path d="M74 121 q6 4 12 0 M115 121 q6 4 12 0" fill="none" stroke="#b9a6c9" stroke-width="2.5"/>`;
    mouth = `<path d="M90 142 q10 -7 20 0" fill="none" ${s}/>`;
    extra = `<path d="M138 92 q4 8 0 12 q-4 -4 0 -12Z" fill="#8fd0ff" stroke="#4a9ad8" stroke-width="2"/>`;
  }

  // ---- 팔 ----
  let arms;
  if (pose === 'peace') {
    const hand = (x, flip) => `
      <g transform="translate(${x} 150) scale(${flip} 1)">
        <path d="M0 40 Q-4 18 0 8" fill="none" stroke="${HOOD_D}" stroke-width="16" stroke-linecap="round"/>
        <path d="M0 40 Q-4 18 0 8" fill="none" ${s} stroke-width="0"/>
        <rect x="-9" y="-26" width="7" height="22" rx="3.5" fill="${SKIN}" ${s} transform="rotate(-14 -5 -4)"/>
        <rect x="2" y="-26" width="7" height="22" rx="3.5" fill="${SKIN}" ${s} transform="rotate(14 5 -4)"/>
        <circle cx="0" cy="2" r="11" fill="${SKIN}" ${s}/>
      </g>`;
    arms = hand(44, 1) + hand(156, -1);
  } else {
    arms = `<ellipse cx="48" cy="196" rx="11" ry="26" fill="${HOOD_D}" ${s} transform="rotate(12 48 196)"/>
            <ellipse cx="152" cy="196" rx="11" ry="26" fill="${HOOD_D}" ${s} transform="rotate(-12 152 196)"/>
            <circle cx="44" cy="220" r="9" fill="${SKIN}" ${s}/>
            <circle cx="156" cy="220" r="9" fill="${SKIN}" ${s}/>`;
  }

  return `<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="262" rx="58" ry="7" fill="rgba(0,0,0,.12)"/>
    <!-- 다리 -->
    <rect x="72" y="228" width="22" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <rect x="106" y="228" width="22" height="30" rx="8" fill="#4b4f5a" ${s}/>
    <!-- 후드티 몸통 -->
    <path d="M60 152 C40 164 38 206 42 238 L158 238 C162 206 160 164 140 152 Z" fill="${HOOD}" ${s}/>
    <text x="100" y="212" text-anchor="middle" font-size="19" font-weight="900" fill="${BLUE}"
          stroke="#fff" stroke-width="3" paint-order="stroke" font-family="sans-serif">노가다</text>
    <path d="M92 156 L90 180 M108 156 L110 180" ${s} stroke-width="2.5"/>
    <circle cx="90" cy="182" r="3" fill="#fff" ${s} stroke-width="2"/>
    <circle cx="110" cy="182" r="3" fill="#fff" ${s} stroke-width="2"/>
    ${pose === 'stand' ? arms : ''}
    <!-- 후드 -->
    <ellipse cx="100" cy="100" rx="76" ry="72" fill="${HOOD}" ${s}/>
    <!-- 뒷머리 -->
    <ellipse cx="100" cy="100" rx="62" ry="60" fill="${HAIR}"/>
    <!-- 얼굴 (살짝 넙대대) -->
    <ellipse cx="100" cy="112" rx="56" ry="48" fill="${SKIN}" ${s}/>
    <!-- 옆머리 -->
    <path d="M44 88 L41 142 Q50 150 60 140 L60 100 Z" fill="${HAIR}"/>
    <path d="M156 88 L159 142 Q150 150 140 140 L140 100 Z" fill="${HAIR}"/>
    <!-- 앞머리 (삐죽 일자뱅) -->
    <path d="M42 98 C42 58 68 40 100 40 C132 40 158 58 158 98 L150 96 L141 90 L131 98 L121 89
             L111 97 L101 90 L91 98 L80 89 L70 97 L60 90 L50 99 Z" fill="${HAIR}"/>
    <path d="M70 58 q12 -8 24 -6" fill="none" stroke="#5b5755" stroke-width="3" stroke-linecap="round"/>
    <!-- 볼터치 -->
    <ellipse cx="68" cy="130" rx="11" ry="7" fill="#ff9f9f" opacity=".55"/>
    <ellipse cx="133" cy="130" rx="11" ry="7" fill="#ff9f9f" opacity=".55"/>
    ${face !== 'laugh' ? `<path d="M99 122 q3 4 0 6" fill="none" stroke="#d9a58a" stroke-width="2.5" stroke-linecap="round"/>` : ''}
    ${eyes}${mouth}${extra}
    ${pose === 'peace' ? arms : ''}
  </svg>`;
}
