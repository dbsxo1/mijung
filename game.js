// 몽글이 키우기 — 저장은 브라우저(localStorage)에 됩니다.
(() => {
  const SAVE_KEY = 'monggeul-save-v1';
  const STAGES = [
    { key: 'egg',   label: '알',     need: 0 },
    { key: 'baby',  label: '아기',   need: 50 },
    { key: 'child', label: '어린이', need: 400 },
    { key: 'adult', label: '어른',   need: 1200 },
  ];
  // 분당 변화량
  const DECAY = { hunger: 1.2, happy: 1.0, clean: 0.6, energy: 0.8 };
  const MAX_OFFLINE_MIN = 12 * 60;

  const $ = (id) => document.getElementById(id);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  let S = null;          // 게임 상태
  let busy = false;      // 애니메이션/미니게임 중
  let bubbleTimer = null;

  // ---------- 저장/불러오기 ----------
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 환경 */ }
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  }
  function newGame(name) {
    const now = Date.now();
    return {
      name, born: now, last: now,
      hunger: 80, happy: 80, clean: 100, energy: 100,
      growth: 0, coins: 10, asleep: false,
      poops: [], nextPoop: null,
    };
  }

  // ---------- 계산 ----------
  function stageIndex() {
    let i = 0;
    STAGES.forEach((s, idx) => { if (S.growth >= s.need) i = idx; });
    return i;
  }
  const stage = () => STAGES[stageIndex()];
  const isEgg = () => stage().key === 'egg';

  function mood() {
    if (S.asleep) return 'sleep';
    const avg = (S.hunger + S.happy + S.clean + S.energy) / 4;
    if (avg >= 70) return 'happy';
    if (avg >= 35) return 'normal';
    return 'sad';
  }

  // 경과 시간(분)만큼 상태 변화
  function simulate(min) {
    if (min <= 0 || isEgg()) return;
    const poopPenalty = 1 + S.poops.length * 0.5;
    if (S.asleep) {
      S.hunger = clamp(S.hunger - DECAY.hunger * 0.5 * min);
      S.energy = clamp(S.energy + 4 * min);
      S.clean = clamp(S.clean - DECAY.clean * 0.5 * poopPenalty * min);
    } else {
      S.hunger = clamp(S.hunger - DECAY.hunger * min);
      S.happy = clamp(S.happy - DECAY.happy * min);
      S.clean = clamp(S.clean - DECAY.clean * poopPenalty * min);
      S.energy = clamp(S.energy - DECAY.energy * min);
    }
    // 잘 돌보고 있으면 저절로 자람
    const avg = (S.hunger + S.happy + S.clean + S.energy) / 4;
    if (avg >= 50) S.growth += 1.5 * min;
  }

  // ---------- 그리기 ----------
  function petSVG() {
    const st = stage().key;
    const m = mood();
    if (st === 'egg') {
      const crack = S.growth >= 25;
      return `<svg viewBox="0 0 200 200">
        <ellipse cx="100" cy="185" rx="50" ry="8" fill="rgba(0,0,0,.08)"/>
        <path d="M100 30 C145 30 160 110 160 135 C160 172 133 188 100 188 C67 188 40 172 40 135 C40 110 55 30 100 30Z" fill="#fffaf0" stroke="#ecd9c6" stroke-width="3"/>
        <circle cx="78" cy="90" r="10" fill="#ffd0dc"/><circle cx="125" cy="120" r="14" fill="#cfe9ff"/>
        <circle cx="85" cy="150" r="8" fill="#ffe7a6"/>
        ${crack ? '<path d="M60 110 L75 100 L85 115 L100 102 L112 116 L126 104 L140 112" fill="none" stroke="#b9a08c" stroke-width="3" stroke-linejoin="round"/>' : ''}
      </svg>`;
    }
    const scale = { baby: 0.62, child: 0.82, adult: 1 }[st];
    const body = { baby: '#ffd6e0', child: '#ffc2d1', adult: '#ffb0c4' }[st];
    const dark = '#3b2f2f';

    let eyes, mouth, brows = '';
    if (m === 'sleep') {
      eyes = `<path d="M70 118 q10 6 20 0 M110 118 q10 6 20 0" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      mouth = `<circle cx="100" cy="142" r="4" fill="${dark}"/>`;
    } else if (m === 'happy') {
      eyes = `<path d="M70 120 q10 -12 20 0 M110 120 q10 -12 20 0" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M86 136 q14 16 28 0 Z" fill="#e8657d" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>`;
    } else if (m === 'normal') {
      eyes = `<circle cx="80" cy="117" r="8" fill="${dark}"/><circle cx="120" cy="117" r="8" fill="${dark}"/>
              <circle cx="83" cy="114" r="3" fill="#fff"/><circle cx="123" cy="114" r="3" fill="#fff"/>`;
      mouth = `<path d="M92 138 q8 7 16 0" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    } else {
      eyes = `<circle cx="80" cy="120" r="7" fill="${dark}"/><circle cx="120" cy="120" r="7" fill="${dark}"/>
              <path d="M88 132 l4 10" stroke="#6ec6ff" stroke-width="4" stroke-linecap="round"/>`;
      brows = `<path d="M68 104 l20 -6 M132 104 l-20 -6" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;
      mouth = `<path d="M90 146 q10 -9 20 0" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }

    let extra = '';
    if (st === 'child' || st === 'adult') {
      extra += `<path d="M100 42 C100 30 100 24 100 18" stroke="#6fbf5a" stroke-width="5" stroke-linecap="round"/>
                <path d="M100 22 C88 6 70 12 72 22 C82 28 94 26 100 22Z" fill="#8ad46f"/>
                <path d="M100 22 C112 6 130 12 128 22 C118 28 106 26 100 22Z" fill="#8ad46f"/>`;
    }
    if (st === 'adult') {
      extra += `<circle cx="100" cy="12" r="9" fill="#ffd36e"/><circle cx="100" cy="12" r="4" fill="#ff9f43"/>
                <ellipse cx="28" cy="140" rx="12" ry="18" fill="${body}" transform="rotate(25 28 140)"/>
                <ellipse cx="172" cy="140" rx="12" ry="18" fill="${body}" transform="rotate(-25 172 140)"/>`;
    }

    return `<svg viewBox="0 0 200 200">
      <ellipse cx="100" cy="190" rx="${70 * scale}" ry="8" fill="rgba(0,0,0,.08)"/>
      <g transform="translate(100 190) scale(${scale}) translate(-100 -190)">
        ${extra}
        <path d="M100 40 C152 40 176 92 176 140 C176 176 146 190 100 190 C54 190 24 176 24 140 C24 92 48 40 100 40Z" fill="${body}"/>
        <ellipse cx="80" cy="70" rx="16" ry="9" fill="#fff" opacity=".45" transform="rotate(-25 80 70)"/>
        <ellipse cx="62" cy="136" rx="11" ry="7" fill="#ff8fa3" opacity=".55"/>
        <ellipse cx="138" cy="136" rx="11" ry="7" fill="#ff8fa3" opacity=".55"/>
        ${brows}${eyes}${mouth}
      </g>
    </svg>`;
  }

  let lastPetKey = '';
  function render() {
    $('petName').textContent = S.name;
    $('stageLabel').textContent = stage().label;
    const days = Math.floor((Date.now() - S.born) / 86400000) + 1;
    $('ageLabel').textContent = `${days}일째`;
    $('coins').textContent = S.coins;

    // 성장 바
    const i = stageIndex();
    const next = STAGES[i + 1];
    if (next) {
      const pct = Math.floor(((S.growth - STAGES[i].need) / (next.need - STAGES[i].need)) * 100);
      $('growthFill').style.width = pct + '%';
      $('growthText').textContent = `다음 성장까지 ${pct}%`;
    } else {
      $('growthFill').style.width = '100%';
      $('growthText').textContent = '다 자랐어요! 🎉';
    }

    for (const k of ['hunger', 'happy', 'clean', 'energy']) {
      const el = $('bar-' + k);
      el.style.width = S[k] + '%';
      el.classList.toggle('low', S[k] < 20);
    }

    // 펫 (바뀔 때만 다시 그림)
    const key = stage().key + mood();
    if (key !== lastPetKey) { $('pet').innerHTML = petSVG(); lastPetKey = key; }
    const petEl = $('pet');
    if (!busy) petEl.className = 'pet ' + (S.asleep ? 'sleeping' : 'idle');

    $('room').classList.toggle('night', S.asleep);
    $('zzz').classList.toggle('hidden', !S.asleep);
    $('sleepBtn').innerHTML = S.asleep ? '☀️<small>깨우기</small>' : '🌙<small>재우기</small>';

    // 버튼 활성/비활성
    document.querySelectorAll('.actions button').forEach((b) => {
      const act = b.dataset.act;
      let off = busy;
      if (isEgg()) off = act !== 'pet';
      else if (S.asleep) off = act !== 'sleep';
      b.disabled = off;
    });
    document.querySelector('[data-act="pet"] small').textContent = isEgg() ? '알 품기' : '쓰다듬기';

    // 똥
    const pz = $('poops');
    if (pz.childElementCount !== S.poops.length) {
      pz.innerHTML = '';
      S.poops.forEach((x, idx) => {
        const p = document.createElement('span');
        p.className = 'poop'; p.textContent = '💩'; p.style.left = x + '%';
        p.onclick = () => { if (!S.asleep) act('wash'); };
        pz.appendChild(p);
        void idx;
      });
    }
  }

  // ---------- 연출 ----------
  function say(text, ms = 2200) {
    const b = $('bubble');
    b.textContent = text; b.classList.remove('hidden');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => b.classList.add('hidden'), ms);
  }
  function log(text) { $('log').textContent = text; }
  function particles(emoji, n = 5) {
    const fx = $('fx');
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle'; p.textContent = emoji;
      p.style.left = rand(30, 65) + '%'; p.style.top = rand(35, 60) + '%';
      p.style.animationDelay = (i * 0.08) + 's';
      fx.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  }
  function anim(cls) {
    const el = $('pet');
    el.className = 'pet ' + cls;
    setTimeout(() => render(), 600);
  }

  function addGrowth(n) {
    const before = stageIndex();
    S.growth += n;
    const after = stageIndex();
    if (after > before) {
      lastPetKey = '';
      particles('✨', 10);
      if (STAGES[after].key === 'baby') {
        say('삐약! 안녕?', 3000);
        log(`알이 깨졌어요! ${S.name}(이)가 태어났어요 🎉`);
      } else {
        say('나 컸어!', 3000);
        log(`${S.name}(이)가 ${STAGES[after].label}(으)로 자랐어요! 🎉`);
      }
    }
  }

  // ---------- 행동 ----------
  function act(type) {
    if (busy) return;
    if (isEgg() && type !== 'pet') return;
    if (S.asleep && type !== 'sleep') { say('쿨쿨…'); return; }

    switch (type) {
      case 'feed':
        if (S.hunger >= 95) { say('배불러요~'); anim('shake'); return; }
        S.hunger = clamp(S.hunger + 30);
        S.clean = clamp(S.clean - 3);
        if (!S.nextPoop) S.nextPoop = Date.now() + rand(20, 45) * 1000;
        addGrowth(6);
        particles('🍙', 3); say('냠냠!'); anim('jump');
        log('밥을 먹었어요.');
        break;
      case 'snack':
        if (S.coins < 5) { say('별이 부족해요… 놀아서 모아요!'); return; }
        S.coins -= 5;
        S.hunger = clamp(S.hunger + 15);
        S.happy = clamp(S.happy + 22);
        addGrowth(8);
        particles('🍰', 4); say('맛있다!!'); anim('jump');
        log('간식을 먹었어요. (⭐-5)');
        break;
      case 'play':
        if (S.energy < 15) { say('너무 피곤해요…'); anim('shake'); return; }
        startMini();
        return;
      case 'wash': {
        const had = S.poops.length;
        S.clean = 100; S.poops = [];
        S.happy = clamp(S.happy - 2);
        addGrowth(4 + had * 2);
        particles('🫧', 6); say('뽀득뽀득'); anim('shake');
        log(had ? `깨끗하게 치웠어요! (💩 ${had}개)` : '깨끗해졌어요.');
        break;
      }
      case 'sleep':
        if (S.asleep) {
          S.asleep = false; say('잘 잤다!'); log('일어났어요.');
        } else {
          if (S.energy >= 90) { say('하나도 안 졸려요!'); return; }
          S.asleep = true; log(`${S.name}(이)가 잠들었어요. 기운이 차오르는 중…`);
        }
        lastPetKey = '';
        break;
      case 'pet':
        if (isEgg()) {
          addGrowth(5);
          particles('💗', 2);
          if (isEgg()) {
            log(S.growth >= 25 ? '알이 꿈틀거려요! 조금만 더…' : '따뜻하게 품어줬어요.');
            anim('shake');
          }
        } else {
          S.happy = clamp(S.happy + 6);
          addGrowth(2);
          particles('💗', 3); say(['헤헤', '좋아~', '♪', '또 해줘!'][Math.floor(Math.random() * 4)]);
          anim('jump');
        }
        break;
    }
    save(); render();
  }

  // ---------- 미니게임: 별 잡기 ----------
  function startMini() {
    busy = true; render();
    const field = $('miniField');
    let score = 0, time = 10;
    field.innerHTML = '';
    $('miniScore').textContent = 0; $('miniTime').textContent = time;
    $('mini').classList.remove('hidden');

    const spawn = () => {
      const s = document.createElement('span');
      s.className = 'star'; s.textContent = Math.random() < 0.15 ? '🌟' : '⭐';
      const big = s.textContent === '🌟';
      s.style.left = rand(5, 85) + '%'; s.style.top = rand(5, 85) + '%';
      const grab = (e) => {
        e.preventDefault();
        score += big ? 3 : 1; $('miniScore').textContent = score; s.remove();
      };
      s.addEventListener('pointerdown', grab);
      field.appendChild(s);
      setTimeout(() => s.remove(), big ? 700 : 1100);
    };
    const spawner = setInterval(spawn, 450);
    spawn();
    const timer = setInterval(() => {
      time--; $('miniTime').textContent = time;
      if (time <= 0) {
        clearInterval(timer); clearInterval(spawner);
        $('mini').classList.add('hidden');
        busy = false;
        S.coins += score;
        S.happy = clamp(S.happy + 10 + score);
        S.energy = clamp(S.energy - 15);
        S.hunger = clamp(S.hunger - 8);
        addGrowth(8 + score);
        particles('⭐', 5); say(score >= 10 ? '최고야!!' : '재밌었다!'); anim('jump');
        log(`별 ${score}개를 모았어요! (⭐+${score})`);
        save(); render();
      }
    }, 1000);
  }

  // ---------- 주기 업데이트 ----------
  function tick() {
    if (!S) return;
    const now = Date.now();
    const min = Math.min((now - S.last) / 60000, MAX_OFFLINE_MIN);
    S.last = now;
    simulate(min);

    if (S.asleep && S.energy >= 100) {
      S.asleep = false; lastPetKey = ''; say('잘 잤다!'); log('푹 자고 일어났어요.');
    }
    if (S.nextPoop && now >= S.nextPoop && !isEgg()) {
      if (S.poops.length < 5) S.poops.push(Math.round(rand(8, 85)));
      S.nextPoop = null;
      if (!S.asleep) say('뿌직…');
    }
    // 가끔 필요한 걸 말함
    if (!busy && !S.asleep && !isEgg() && Math.random() < 0.06) {
      if (S.hunger < 25) say('배고파요…');
      else if (S.clean < 25) say('찝찝해요…');
      else if (S.energy < 20) say('졸려요…');
      else if (S.happy < 25) say('심심해요…');
    }
    // 가끔 방 안을 돌아다님
    if (!busy && !S.asleep && Math.random() < 0.08) {
      $('pet').style.left = rand(30, 70) + '%';
    }
    save(); render();
  }

  // ---------- 시작 ----------
  function startGame() {
    $('start').classList.add('hidden');
    $('game').classList.remove('hidden');
    lastPetKey = '';
    tick();
    if (isEgg()) log('알을 눌러 따뜻하게 품어주세요.');
  }

  $('startForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('nameInput').value.trim() || '몽글이';
    S = newGame(name); save(); startGame();
  });
  document.querySelectorAll('.actions button').forEach((b) => {
    b.addEventListener('click', () => act(b.dataset.act));
  });
  $('pet').addEventListener('click', () => { if (!S.asleep) act('pet'); });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('정말 처음부터 다시 할까요? 지금 키우던 아이는 사라져요.')) {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 무시 */ }
      location.reload();
    }
  });

  S = load();
  if (S && S.name) startGame();
  setInterval(tick, 3000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
