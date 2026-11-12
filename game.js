// =====================================================
//  알바 전전기 — 게임 로직
// =====================================================
(() => {
  'use strict';
  const SAVE_KEY = 'alba-save-v1';
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------------- 데이터 ----------------
  const JOBS = [
    { name: '전단지 돌리기', icon: '📄', click: 10,     cost: 0,         say: ['전단지 받아가세요~', '휙!', '한 장만요!'],
      worker: { name: '전단지 친구', icon: '🧒', rate: 3,     base: 150 } },
    { name: '편의점',       icon: '🏪', click: 60,     cost: 5000,      say: ['삑!', '봉투 필요하세요?', '어서오세요~'],
      worker: { name: '야간 알바생', icon: '🧑‍💼', rate: 20,   base: 2500 } },
    { name: '카페',         icon: '☕', click: 400,    cost: 80000,     say: ['아아 나왔습니다!', '샷 추가요~', '진동벨 울려요'],
      worker: { name: '바리스타', icon: '🧑‍🍳', rate: 150,  base: 40000 } },
    { name: '택배 상하차',   icon: '📦', click: 2500,   cost: 1200000,   say: ['영차!', '허리야…', '다음 박스!'],
      worker: { name: '상하차 형님', icon: '💪', rate: 1000, base: 600000 } },
    { name: '공사장',       icon: '🏗️', click: 15000,  cost: 20000000,  say: ['퍽!', '삽질 장인', '반장님 보세요!'],
      worker: { name: '반장님', icon: '👷', rate: 7500,  base: 9000000 } },
    { name: '배달 라이더',   icon: '🛵', click: 100000, cost: 350000000, say: ['배달 왔습니다~', '부릉부릉', '별점 5개요!'],
      worker: { name: '라이더 동료', icon: '🏍️', rate: 50000, base: 140000000 } },
  ];
  const END_COST = 5e9;
  const ENH_RATE = [100, 90, 80, 70, 60, 50, 40, 30, 25, 20];
  const PRESTIGE_JOB = 3;

  // ---------------- 상태 ----------------
  function fresh() {
    return {
      v: 1, money: 0, total: 0, job: 0, tool: 0, workers: [0, 0, 0, 0, 0, 0],
      stamina: 100, furn: { bed: 0, sink: 0, desk: 0, fridge: 0, house: 0 },
      career: 0, prestiges: 0, ended: false, karens: 0, clicks: 0,
      skin: { clothes: 'hoodie', hat: 'none', acc: 'none', shoes: 'boots', fx: 'none' },
      owned: { clothes: ['hoodie'], hat: ['none'], acc: ['none'], shoes: ['boots'], fx: ['none'] },
      uniform: true, tab: 'work', last: Date.now(), started: false,
    };
  }
  let S = fresh();
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (d && d.v === 1) {
        const f = fresh();
        S = Object.assign(f, d);
        S.furn = Object.assign(f.furn, d.furn);
        S.skin = Object.assign(f.skin, d.skin);
        S.owned = Object.assign(f.owned, d.owned);
      }
    } catch (e) { /* 무시 */ }
  }
  function save() {
    S.last = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 */ }
  }

  // ---------------- 계산 ----------------
  const golden = { until: 0 };
  const isGolden = () => Date.now() < golden.until;
  const mult = () => (1 + 0.1 * S.career) * (S.ended ? 2 : 1) * (isGolden() ? 2 : 1);
  const toolMult = (lv = S.tool) => Math.pow(1.3, lv);
  const maxStam = () => 100 + S.furn.desk * 40;
  const clickCost = () => 2 * (1 - S.furn.fridge * 0.15);
  const houseMult = () => 1 + S.furn.house * 0.25;
  const workRegen = () => (0.6 + S.furn.sink * 0.6) * houseMult();
  const homeRegen = () => (6 + S.furn.bed * 5) * houseMult();
  let tired = false;
  const clickIncome = () => JOBS[S.job].click * toolMult() * mult() * (tired ? 0.5 : 1);
  const autoIncome = () => S.workers.reduce((a, n, i) => a + n * JOBS[i].worker.rate, 0) * mult();
  const workerCost = (i) => Math.floor(JOBS[i].worker.base * Math.pow(1.15, S.workers[i]));
  const enhCost = () => Math.floor(JOBS[S.job].click * 40 * Math.pow(2.1, S.tool));
  const furnCost = (f) => Math.floor(f.base * Math.pow(f.mult || 8, S.furn[f.key]));
  const prestigeGain = () => Math.floor(Math.sqrt(S.total / 1e7));

  function fmt(n) {
    n = Math.floor(n);
    if (n < 10000) return n.toLocaleString('ko-KR');
    const U = [['경', 1e16], ['조', 1e12], ['억', 1e8], ['만', 1e4]];
    for (const [u, v] of U) {
      if (n >= v) {
        const x = n / v;
        return (x >= 1000 ? Math.floor(x).toLocaleString('ko-KR') : x >= 100 ? Math.floor(x) : x.toFixed(1).replace(/\.0$/, '')) + u;
      }
    }
    return String(n);
  }
  const won = (n) => fmt(n) + '원';

  // ---------------- 화면: 캐릭터 ----------------
  let tempFace = null, tempUntil = 0, lastCharKey = '';
  function setTempFace(f, ms) { tempFace = f; tempUntil = Date.now() + ms; renderChar_(); }
  function currentFace() {
    if (S.tab === 'home') return 'sleep';
    if (tempFace && Date.now() < tempUntil) return tempFace;
    return tired ? 'tired' : 'blank';
  }
  function renderChar_(force) {
    const face = currentFace();
    const key = [face, S.tab, S.job, S.uniform, JSON.stringify(S.skin)].join('|');
    if (!force && key === lastCharKey) return;
    lastCharKey = key;
    $('char').innerHTML = renderChar({ face, skin: S.skin, job: S.job, uniform: S.uniform, home: S.tab === 'home' });
    $('char').classList.toggle('sleepy', S.tab === 'home');
  }
  function retrigger(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  // ---------------- 화면: 장면 ----------------
  let lastBgKey = '';
  function renderScene(force) {
    const key = S.tab === 'work' ? 'w' + S.job : 'h' + JSON.stringify(S.furn);
    if (!force && key === lastBgKey) return;
    const swapped = lastBgKey && lastBgKey[0] !== key[0] || (lastBgKey && key[0] === 'w' && lastBgKey !== key);
    lastBgKey = key;
    $('bg').innerHTML = S.tab === 'work' ? JOB_SCENES[S.job]() : homeScene(S.furn);
    if (swapped) retrigger($('bg'), 'swap');
    $('place').textContent = S.tab === 'work' ? `${JOBS[S.job].icon} ${JOBS[S.job].name}` : `🏠 ${HOUSE_NAMES[S.furn.house]}`;
    renderCrowd();
  }
  let crowdKey = '';
  function renderCrowd() {
    const key = S.tab + S.workers.join(',');
    if (key === crowdKey) return;
    crowdKey = key;
    const box = $('crowd'); box.innerHTML = '';
    if (S.tab !== 'work') return;
    let n = 0;
    S.workers.forEach((c, i) => {
      for (let k = 0; k < Math.min(c, 3) && n < 10; k++, n++) {
        const w = document.createElement('div');
        w.className = 'walker';
        const left = rand(2, 40);
        w.style.left = left + '%';
        w.style.bottom = rand(4, 16) + '%';
        w.style.setProperty('--dist', rand(80, 200) + 'px');
        w.style.animationDuration = rand(4, 9) + 's';
        w.style.animationDelay = -rand(0, 5) + 's';
        w.dataset.job = i;
        w.innerHTML = `<span>${JOBS[i].worker.icon}</span>`;
        box.appendChild(w);
      }
    });
  }

  // ---------------- 이펙트 ----------------
  function sceneXY(e) {
    const r = $('scene').getBoundingClientRect();
    if (e && e.clientX !== undefined) return { x: e.clientX - r.left, y: e.clientY - r.top };
    return { x: r.width / 2, y: r.height * 0.45 };
  }
  function floatText(text, x, y, cls = '') {
    const d = document.createElement('div');
    d.className = 'float ' + cls; d.textContent = text;
    d.style.left = x + 'px'; d.style.top = y + 'px';
    $('fx').appendChild(d);
    setTimeout(() => d.remove(), 950);
  }
  function burst(emoji, x, y, n = 5, cls = 'coin', spread = 90) {
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = cls; d.textContent = Array.isArray(emoji) ? emoji[i % emoji.length] : emoji;
      d.style.left = (x - 10) + 'px'; d.style.top = (y - 10) + 'px';
      d.style.setProperty('--dx', rand(-spread, spread) + 'px');
      d.style.setProperty('--dy', rand(-spread, -spread / 3) + 'px');
      d.style.animationDelay = (i * 0.03) + 's';
      $('fx').appendChild(d);
      setTimeout(() => d.remove(), 1200);
    }
  }
  function confetti(n = 80) {
    const box = $('confetti');
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8fab', '#b48cff'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.style.left = rand(0, 100) + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = rand(1.6, 3.2) + 's';
      c.style.animationDelay = rand(0, 0.6) + 's';
      box.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }
  function shake() { retrigger($('app'), 'shake'); }
  function toast(msg, cls = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + cls; t.textContent = msg;
    const box = $('toasts');
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.remove(), 3100);
  }
  function modal(html, buttons = [{ label: '확인' }]) {
    $('modalBox').innerHTML = html + `<div class="btns">${buttons.map((b, i) =>
      `<button class="buy big ${b.cls || ''}" data-mi="${i}">${b.label}</button>`).join('')}</div>`;
    $('modal').classList.remove('hidden');
    $('modalBox').querySelectorAll('[data-mi]').forEach((btn) => {
      btn.onclick = () => {
        SFX.ui();
        $('modal').classList.add('hidden');
        const b = buttons[+btn.dataset.mi];
        if (b.fn) b.fn();
      };
    });
  }
  function bumpMoney() { retrigger(document.querySelector('.money'), 'bump'); }

  // ---------------- 돈 ----------------
  function earn(n) { S.money += n; S.total += n; }
  function spend(n) {
    if (S.money < n) { SFX.nope(); toast('돈이 부족해요 💸'); return false; }
    S.money -= n; return true;
  }

  // ---------------- 클릭(일하기) ----------------
  let hintHidden = false;
  function work(e) {
    SFX.unlock();
    const p = sceneXY(e);
    const ch = $('char');
    if (S.tab === 'home') {
      SFX.pop();
      burst(['💤', '💗'], p.x, p.y, 3, 'spark', 50);
      floatText('쿨쿨…', p.x, p.y - 20);
      retrigger(ch, 'squish');
      return;
    }
    if (!hintHidden) { hintHidden = true; $('hint').classList.add('hidden'); }
    const cost = clickCost();
    const wasTired = tired;
    if (S.stamina >= cost) S.stamina -= cost;
    else S.stamina = 0;
    if (S.stamina < cost && !tired) { tired = true; SFX.tired(); toast('기력이 바닥났어요… 집에서 쉬어요 🏠'); }
    const inc = clickIncome();
    earn(inc);
    S.clicks++;
    SFX.work(S.job);
    if (S.clicks % 5 === 0) SFX.coin();
    floatText('+' + won(inc), p.x, p.y, tired ? 'bad' : (isGolden() ? 'big' : ''));
    burst(isGolden() ? ['🪙', '✨'] : '🪙', p.x, p.y, tired ? 1 : 3);
    retrigger(ch, 'squish'); retrigger(ch, 'swing');
    if (Math.random() < 0.06) floatText(JOBS[S.job].say[Math.floor(Math.random() * 3)], p.x, p.y - 50, 'big');
    if (wasTired !== tired) renderChar_();
    bumpMoney();
    updateTop();
  }

  // ---------------- 행동: 이직 / 동료 / 강화 / 퇴사 ----------------
  function changeJob() {
    const next = S.job + 1;
    if (next >= JOBS.length) return;
    if (!spend(JOBS[next].cost)) return;
    S.job = next;
    SFX.levelup(); confetti(60);
    renderScene(true);
    setTempFace('peace', 3000);
    retrigger($('char'), 'hop');
    toast(`🎉 ${JOBS[next].name} 알바 시작!`, 'gold');
    if (S.job === PRESTIGE_JOB && S.prestiges === 0) setTimeout(() => toast('💼 이제 "퇴사"로 환생할 수 있어요!'), 1500);
    save(); renderPanel();
  }
  function hire(i) {
    if (!spend(workerCost(i))) return;
    S.workers[i]++;
    SFX.buy();
    const p = sceneXY();
    burst([JOBS[i].worker.icon, '✨'], p.x * 0.5, p.y * 1.4, 4, 'spark', 60);
    floatText(`${JOBS[i].worker.icon} ${S.workers[i]}명째!`, p.x * 0.5, p.y * 1.2, 'big');
    if (S.workers[i] === 1) toast(`${JOBS[i].worker.icon} 첫 ${JOBS[i].worker.name} 고용! 자동으로 돈을 벌어요`);
    crowdKey = ''; renderCrowd();
    save(); renderPanel();
  }
  let enhancing = false;
  function enhance() {
    if (enhancing || S.tool >= 10) return;
    if (!spend(enhCost())) return;
    enhancing = true;
    renderPanel();
    const p = sceneXY();
    const h = document.createElement('div');
    h.className = 'hammer'; h.textContent = '🔨';
    $('fx').appendChild(h);
    [0, 250, 500].forEach((t) => setTimeout(() => SFX.hit(), t));
    setTimeout(() => {
      h.remove();
      const ok = Math.random() * 100 < ENH_RATE[S.tool];
      if (ok) {
        S.tool++;
        SFX.success();
        burst(['✨', '⭐', '💫'], p.x, p.y, 12, 'spark', 130);
        floatText(`강화 성공! +${S.tool}`, p.x, p.y - 40, 'big');
        setTempFace('laugh', 2200);
        retrigger($('char'), 'hop');
        if (S.tool >= 10) unlockSkin('fx', 'rainbow');
      } else {
        const down = S.tool >= 5;
        if (down) S.tool--;
        SFX.fail(); shake();
        burst('💨', p.x, p.y, 5, 'smoke', 60);
        floatText(down ? `강화 실패… -1 (+${S.tool})` : '강화 실패…', p.x, p.y - 40, 'bad');
        setTempFace('tired', 1800);
      }
      enhancing = false;
      save(); renderPanel();
    }, 800);
  }
  function prestige() {
    const g = prestigeGain();
    if (S.job < PRESTIGE_JOB || g < 1) { SFX.nope(); return; }
    modal(`<div class="big-emoji">💼</div><h2>정말 퇴사할까요?</h2>
      <p>돈, 알바 단계, 동료, 장비 강화가 <b>처음으로 돌아가요.</b><br>
      대신 <b>경력 포인트 +${g}</b>을 받아서 앞으로 모든 수입이 <b>+${g * 10}%</b> 더 늘어나요.<br>
      <small>(집 가구와 옷장은 그대로 남아요)</small></p>`,
    [{ label: '그만두기', cls: 'cant' }, { label: '퇴사한다! 🏃', cls: 'orange', fn: () => {
      S.career += g; S.prestiges++;
      S.money = 0; S.total = 0; S.job = 0; S.tool = 0; S.workers = [0, 0, 0, 0, 0, 0];
      S.stamina = maxStam(); tired = false;
      SFX.fanfare(); confetti(100);
      unlockSkin('clothes', 'suit');
      renderScene(true); renderChar_(true); crowdKey = ''; renderCrowd();
      setTempFace('peace', 3000);
      toast(`📜 퇴사 완료! 경력 ${S.career}포인트 (수입 +${S.career * 10}%)`, 'gold');
      save(); renderPanel(); updateTop();
    } }]);
  }
  function openShop() {
    if (!spend(END_COST)) return;
    S.ended = true;
    unlockSkin('hat', 'crown', true);
    SFX.fanfare(); confetti(160);
    setTimeout(() => { confetti(120); SFX.levelup(); }, 1600);
    const ch = renderChar({ face: 'peace', skin: Object.assign({}, S.skin, { clothes: 'suit', hat: 'crown', fx: 'sparkle' }), job: -1 });
    modal(`<div class="ending-scene"><div class="bgE">${endingScene()}</div><div class="chE">${ch}</div></div>
      <h2>🎉 사장님이 되었어요! 🎉</h2>
      <p>전단지 한 장부터 시작해서 편의점, 카페, 택배, 공사장, 배달까지…<br>
      드디어 <b>내 가게</b>를 차렸어요!<br><br>
      👑 <b>왕관</b> 스킨 해금<br>💰 <b>사장님 보너스</b>: 앞으로 모든 수입 2배</p>`,
    [{ label: '계속 일하기 💪', cls: 'orange' }]);
    save(); renderPanel(); updateTop();
  }

  // ---------------- 집 / 옷장 ----------------
  function upgradeFurn(key) {
    const f = FURNITURE.find((x) => x.key === key);
    if (S.furn[key] >= 4) return;
    if (!spend(furnCost(f))) return;
    S.furn[key]++;
    SFX.buy(); setTimeout(() => SFX.pop(), 150);
    renderScene(true);
    retrigger($('bg'), 'swap');
    const p = sceneXY();
    burst(['✨', '⭐', f.icon], p.x, p.y, 10, 'spark', 140);
    toast(`${f.icon} ${f.name} → ${f.levels[S.furn[key]]}!`);
    save(); renderPanel(); updateTop();
  }
  function unlockSkin(slot, id, silent) {
    if (S.owned[slot].includes(id)) return;
    S.owned[slot].push(id);
    const it = SKINS[slot].find((x) => x.id === id);
    if (!silent) toast(`🎁 새 스킨 해금: ${it.name}!`, 'gold');
  }
  function buySkin(slot, id) {
    const it = SKINS[slot].find((x) => x.id === id);
    if (!spend(it.price)) return;
    S.owned[slot].push(id);
    SFX.buy();
    equip(slot, id);
  }
  function equip(slot, id) {
    S.skin[slot] = id;
    SFX.pop();
    renderChar_(true);
    retrigger($('char'), 'poof');
    const p = sceneXY();
    burst(['✨', '💫', '⭐'], p.x, p.y, 8, 'spark', 110);
    save(); renderPanel();
  }
  function setTab(tab) {
    if (S.tab === tab) return;
    S.tab = tab;
    SFX.door();
    document.querySelectorAll('.maintabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    sub = tab === 'work' ? 'job' : 'furn';
    renderScene(true); renderChar_(true);
    $('hint').classList.toggle('hidden', tab !== 'work' || hintHidden);
    clearEvents();
    renderPanel();
    if (tab === 'home') toast('🏠 집에서 쉬는 중… 기력이 빨리 차요');
  }

  // ---------------- 패널 ----------------
  let sub = 'job', wardSlot = 'clothes';
  const SUBS = {
    work: [['job', '🧭 이직'], ['crew', '👥 동료'], ['enh', '🔨 강화'], ['quit', '💼 퇴사']],
    home: [['furn', '🛋️ 가구'], ['ward', '👗 옷장']],
  };
  function btn(act, arg, cost, label, extraCls = '') {
    return `<button class="buy ${extraCls}" data-act="${act}" data-arg="${arg}" ${cost != null ? `data-cost="${cost}"` : ''}>${label}</button>`;
  }
  function renderSubtabs() {
    $('subtabs').innerHTML = SUBS[S.tab].map(([k, l]) =>
      `<button data-sub="${k}" class="${sub === k ? 'on' : ''}">${l}</button>`).join('');
  }
  function renderPanel() {
    renderSubtabs();
    let h = '';
    if (sub === 'job') {
      const next = JOBS[S.job + 1];
      h += `<div class="info">💡 돈을 모아 더 좋은 알바로 <b>이직</b>하면 한 번 클릭할 때 버는 돈이 크게 늘어요.${tired ? '<br>😵 지금은 <b>지쳐서 수입이 절반</b>이에요. 집에서 쉬고 오세요!' : ''}</div>`;
      JOBS.forEach((j, i) => {
        const cls = i < S.job ? 'done' : i === S.job ? 'cur' : i === S.job + 1 ? '' : 'locked';
        const show = i <= S.job + 1;
        h += `<div class="row ${cls}"><div class="ic">${show ? j.icon : '🔒'}</div><div class="tx">
          <div class="tt">${show ? j.name : '???'} ${i === S.job ? '<span class="badge">지금 여기</span>' : ''}</div>
          <div class="ds">${show ? `클릭당 ${won(j.click)}` : '이전 알바를 먼저 해야 해요'}</div></div>
          ${i < S.job ? '<span class="badge">✅ 경험함</span>' : i === S.job + 1 ? btn('job', i, j.cost, `이직하기<small>${won(j.cost)}</small>`, 'orange') : ''}</div>`;
      });
      const last = S.job === JOBS.length - 1;
      h += `<div class="row ${last ? (S.ended ? 'done' : '') : 'locked'}"><div class="ic">${last || S.ended ? '🏪' : '🔒'}</div><div class="tx">
        <div class="tt">${last || S.ended ? '내 가게 차리기' : '???'} <span class="badge">엔딩</span></div>
        <div class="ds">${S.ended ? '사장님 달성! 모든 수입 2배 중' : last ? '드디어 사장님이 될 시간!' : '모든 알바를 거쳐야 해요'}</div></div>
        ${S.ended ? '<span class="badge">👑 완료</span>' : last ? btn('shop', 0, END_COST, `가게 오픈<small>${won(END_COST)}</small>`, 'dark') : ''}</div>`;
      if (!next && S.ended) h += `<div class="info">🎉 엔딩을 봤어요! 퇴사(환생)해서 더 빨리 사장님이 되어 보세요.</div>`;
    } else if (sub === 'crew') {
      h += `<div class="info">👥 동료를 고용하면 <b>가만히 있어도 돈이 들어와요.</b> 게임을 꺼놔도 최대 8시간치가 쌓여요!<br>지금 자동 수입: <b>초당 ${won(autoIncome())}</b></div>`;
      JOBS.forEach((j, i) => {
        if (i > S.job) return;
        const w = j.worker;
        h += `<div class="row"><div class="ic">${w.icon}</div><div class="tx">
          <div class="tt">${w.name} <span class="badge">${S.workers[i]}명</span></div>
          <div class="ds">${j.name} · 1명당 초당 ${won(w.rate * mult())}</div></div>
          ${btn('hire', i, workerCost(i), `고용<small>${won(workerCost(i))}</small>`)}</div>`;
      });
      if (S.job < JOBS.length - 1) h += `<div class="row locked"><div class="ic">🔒</div><div class="tx"><div class="tt">???</div><div class="ds">다음 알바로 이직하면 새 동료가 생겨요</div></div></div>`;
    } else if (sub === 'enh') {
      const lv = S.tool, maxed = lv >= 10;
      h += `<div class="enh"><div class="tool-ic ${lv >= 5 ? 'glow' : ''}">${JOBS[S.job].icon}</div>
        <div class="lv">내 장비 +${lv}</div>
        <div class="stats">
          <div>클릭 수입 배율<b>×${toolMult(lv).toFixed(2)}${maxed ? '' : ` → ×${toolMult(lv + 1).toFixed(2)}`}</b></div>
          <div>성공 확률<b>${maxed ? '-' : ENH_RATE[lv] + '%'}</b></div>
        </div>
        ${maxed ? '<button class="buy big max">🌈 최대 강화 달성!</button>'
          : enhancing ? '<button class="buy big cant">🔨 깡! 깡! 깡!…</button>'
          : btn('enh', 0, enhCost(), `🔨 강화하기 (${won(enhCost())})`, 'big orange')}
        <div class="ds" style="margin-top:10px;font-size:12px;color:var(--muted)">⚠️ +5부터는 실패하면 1단계 내려가요<br>🌈 +10 달성 시 "무지개 오라" 스킨 해금</div></div>`;
    } else if (sub === 'quit') {
      const g = prestigeGain();
      const can = S.job >= PRESTIGE_JOB && g >= 1;
      h += `<div class="info">💼 <b>퇴사</b>하면 처음부터 다시 시작하지만, <b>경력 포인트</b>를 받아서 모든 수입이 영구적으로 늘어나요. (1포인트당 +10%)<br>
        집 가구와 옷장은 그대로 남아요.</div>
        <div class="enh"><div class="tool-ic">📜</div>
        <div class="stats"><div>지금 경력<b>${S.career}포인트 (+${S.career * 10}%)</b></div><div>퇴사하면 받는 경력<b>+${g}포인트</b></div></div>
        ${can ? btn('quit', 0, null, '🏃 퇴사하기', 'big dark') : `<button class="buy big cant">${S.job < PRESTIGE_JOB ? `🔒 ${JOBS[PRESTIGE_JOB].name}부터 가능` : '🔒 조금 더 벌어야 해요'}</button>`}
        <div class="ds" style="margin-top:10px;font-size:12px;color:var(--muted)">이번 회차에 번 돈: ${won(S.total)} · 퇴사 횟수: ${S.prestiges}회</div></div>
        <button class="reset" data-act="reset">데이터 전부 초기화</button>`;
    } else if (sub === 'furn') {
      h += `<div class="rest-box">😴 집에서 쉬는 중… 기력 +${homeRegen().toFixed(1)}/초<small>집에 있는 동안에도 동료들이 계속 돈을 벌어요</small></div>`;
      FURNITURE.forEach((f) => {
        const lv = S.furn[f.key], max = lv >= 4;
        h += `<div class="row"><div class="ic">${f.icon}</div><div class="tx">
          <div class="tt">${f.name} <span class="badge">${f.levels[lv]}</span></div>
          <div class="ds">${f.desc}${max ? '' : ` · 다음: ${f.levels[lv + 1]}`}</div></div>
          ${max ? '<button class="buy max">MAX</button>' : btn('furn', f.key, furnCost(f), `업그레이드<small>${won(furnCost(f))}</small>`)}</div>`;
      });
      h += `<div class="info">📊 최대 기력 ${maxStam()} · 클릭당 기력 -${clickCost().toFixed(1)} · 알바 중 회복 +${workRegen().toFixed(1)}/초</div>`;
    } else if (sub === 'ward') {
      h += `<div class="toggle"><span>🦺 알바할 때 유니폼 입기</span><button class="switch ${S.uniform ? 'on' : ''}" data-act="uni" aria-label="유니폼"></button></div>`;
      h += `<div class="slots">${SKIN_SLOTS.map((s) => `<button data-slot="${s.key}" class="${wardSlot === s.key ? 'on' : ''}">${s.label}</button>`).join('')}</div>`;
      h += `<div class="grid">${SKINS[wardSlot].map((it, idx) => {
        const own = S.owned[wardSlot].includes(it.id), on = S.skin[wardSlot] === it.id;
        const pv = renderChar({ face: 'blank', skin: Object.assign({}, S.skin, { [wardSlot]: it.id }), home: true });
        let act;
        if (on) act = '<button class="buy max">착용 중</button>';
        else if (own) act = btn('equip', wardSlot + ':' + it.id, null, '입기', 'orange');
        else if (it.unlock) act = `<div class="lock">🔒 ${it.hint}</div>`;
        else act = btn('skin', wardSlot + ':' + it.id, it.price, won(it.price));
        return `<div class="item ${on ? 'on' : ''}" style="animation-delay:${idx * 0.03}s">${on ? '<span class="eq">착용</span>' : ''}<div class="pv">${pv}</div><div class="nm">${it.name}</div>${act}</div>`;
      }).join('')}</div>`;
    }
    $('panel').innerHTML = h;
    updateAfford();
  }
  function updateAfford() {
    document.querySelectorAll('#panel [data-cost]').forEach((b) => b.classList.toggle('cant', S.money < +b.dataset.cost));
  }

  // ---------------- 상단 표시 ----------------
  function updateTop() {
    $('money').textContent = fmt(S.money);
    $('ps').textContent = `초당 ${won(autoIncome())} · 클릭당 ${won(clickIncome())}`;
    const m = maxStam();
    $('stamFill').style.width = (S.stamina / m * 100) + '%';
    $('stamFill').classList.toggle('low', tired);
    $('stamText').textContent = `⚡ ${Math.floor(S.stamina)}/${m}`;
    const cc = $('careerChip');
    cc.classList.toggle('hidden', !S.career && !S.ended);
    cc.textContent = (S.ended ? '👑 ' : '') + (S.career ? `경력 ${S.career}` : '사장님');
    if (isGolden()) {
      $('golden').classList.remove('hidden');
      $('golden').textContent = `⏰ 황금 시간 ×2 · ${Math.ceil((golden.until - Date.now()) / 1000)}초`;
    } else $('golden').classList.add('hidden');
    $('scene').classList.toggle('golden', isGolden());
  }

  // ---------------- 랜덤 이벤트 ----------------
  let nextEvent = Date.now() + rand(25000, 45000);
  let evTimers = [];
  function clearEvents() { $('ev').innerHTML = ''; evTimers.forEach(clearTimeout); evTimers = []; }
  function spawnEvent() {
    if (S.tab !== 'work' || !$('modal').classList.contains('hidden')) return;
    const r = Math.random();
    SFX.alert();
    if (r < 0.35) {
      const b = document.createElement('button');
      b.className = 'ev-boss';
      b.innerHTML = `<span>🤵💰</span><b>사장님 보너스! 눌러요</b>`;
      b.onpointerdown = (e) => {
        e.stopPropagation();
        const reward = Math.max(clickIncome() * 40, autoIncome() * 45);
        earn(reward);
        const p = sceneXY(e);
        SFX.success(); burst(['💰', '🪙', '💵'], p.x, p.y, 12, 'coin', 120);
        floatText('+' + won(reward), p.x, p.y, 'big');
        setTempFace('laugh', 2000);
        toast(`🤵 사장님: "수고했어~" +${won(reward)}`, 'gold');
        b.remove(); bumpMoney();
      };
      $('ev').appendChild(b);
      evTimers.push(setTimeout(() => b.remove(), 8200));
    } else if (r < 0.65) {
      let left = 10;
      const b = document.createElement('button');
      b.className = 'ev-karen';
      b.innerHTML = `<span>😡</span><b>진상 손님! 연타 <em>${left}</em></b><div class="bar"><i></i></div>`;
      const start = Date.now(), LIMIT = 6000;
      SFX.angry();
      const timer = setInterval(() => {
        const t = 1 - (Date.now() - start) / LIMIT;
        const bar = b.querySelector('.bar i'); if (bar) bar.style.width = Math.max(0, t * 100) + '%';
        if (t <= 0) {
          clearInterval(timer); b.remove();
          S.stamina = Math.max(0, S.stamina - 20);
          SFX.fail(); shake(); setTempFace('tired', 2000);
          toast('😡 진상 손님 때문에 기력 -20…');
        }
      }, 100);
      b.onpointerdown = (e) => {
        e.stopPropagation();
        left--; SFX.hit(); retrigger(b, 'hit');
        b.querySelector('em').textContent = left;
        const p = sceneXY(e);
        burst('💢', p.x, p.y, 1, 'spark', 30);
        if (left <= 0) {
          clearInterval(timer); b.remove();
          const reward = clickIncome() * 60;
          earn(reward); S.karens++;
          SFX.success(); burst(['😇', '🪙', '✨'], p.x, p.y, 10, 'spark', 110);
          floatText('처리 완료! +' + won(reward), p.x, p.y - 30, 'big');
          setTempFace('laugh', 2000);
          toast(`😇 진상 손님 처리! (${S.karens}명째)`);
          if (S.karens >= 30) unlockSkin('acc', 'shades');
          bumpMoney();
        }
      };
      $('ev').appendChild(b);
      evTimers.push(setTimeout(() => clearInterval(timer), LIMIT + 500));
    } else if (r < 0.85) {
      golden.until = Date.now() + 30000;
      SFX.levelup(); confetti(40);
      setTempFace('laugh', 2000);
      toast('⏰ 황금 시간! 30초 동안 수입 2배!', 'gold');
    } else {
      const reward = Math.max(autoIncome() * 90, clickIncome() * 30);
      earn(reward);
      SFX.success(); confetti(50);
      const p = sceneXY();
      burst(['💵', '💰'], p.x, p.y, 10, 'coin', 130);
      setTempFace('laugh', 2200);
      toast(`💵 월급날! +${won(reward)}`, 'gold');
      bumpMoney();
    }
  }

  // ---------------- 메인 루프 ----------------
  let lastT = performance.now(), saveAcc = 0, uiAcc = 0, snoreAcc = 0, popAcc = 0;
  function loop() {
    const now = performance.now();
    const dt = Math.min(1, (now - lastT) / 1000);
    lastT = now;
    const ai = autoIncome();
    if (ai > 0) earn(ai * dt);
    const m = maxStam();
    S.stamina = clamp(S.stamina + (S.tab === 'home' ? homeRegen() : workRegen()) * dt, 0, m);
    if (tired && S.stamina >= m * 0.3) { tired = false; toast('💪 기운 회복! 다시 일하러 가요'); renderChar_(); }
    if (tempFace && Date.now() >= tempUntil) { tempFace = null; renderChar_(); }
    if (Date.now() > nextEvent) { nextEvent = Date.now() + rand(35000, 70000); spawnEvent(); }

    uiAcc += dt; saveAcc += dt; snoreAcc += dt; popAcc += dt;
    if (uiAcc > 0.1) { uiAcc = 0; updateTop(); updateAfford(); }
    if (saveAcc > 3) { saveAcc = 0; save(); }
    if (S.tab === 'home' && snoreAcc > 5) { snoreAcc = 0; SFX.snore(); }
    // 동료가 일하는 모습: 가끔 돈 표시
    if (S.tab === 'work' && popAcc > 1.2 && ai > 0) {
      popAcc = 0;
      const ws = $('crowd').children;
      if (ws.length) {
        const w = ws[Math.floor(Math.random() * ws.length)];
        const p = document.createElement('div'); p.className = 'pop';
        p.textContent = '+' + fmt(JOBS[+w.dataset.job].worker.rate * mult());
        w.appendChild(p); setTimeout(() => p.remove(), 1000);
      }
    }
    requestAnimationFrame(loop);
  }

  // ---------------- 이벤트 연결 ----------------
  $('char').addEventListener('pointerdown', (e) => { e.preventDefault(); work(e); });
  $('bg').addEventListener('click', (e) => {
    if (e.target.closest('[data-act="wardrobe"]')) { SFX.ui(); sub = 'ward'; renderPanel(); }
  });
  document.querySelectorAll('.maintabs button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('subtabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sub]'); if (!b) return;
    SFX.ui(); sub = b.dataset.sub; renderPanel(); $('panel').scrollTop = 0;
  });
  $('panel').addEventListener('click', (e) => {
    const sl = e.target.closest('[data-slot]');
    if (sl) { SFX.ui(); wardSlot = sl.dataset.slot; renderPanel(); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act, arg = b.dataset.arg;
    if (a === 'job') changeJob();
    else if (a === 'hire') hire(+arg);
    else if (a === 'enh') enhance();
    else if (a === 'quit') prestige();
    else if (a === 'shop') openShop();
    else if (a === 'furn') upgradeFurn(arg);
    else if (a === 'skin') { const [s, id] = arg.split(':'); buySkin(s, id); }
    else if (a === 'equip') { const [s, id] = arg.split(':'); equip(s, id); }
    else if (a === 'uni') { S.uniform = !S.uniform; SFX.ui(); renderChar_(true); save(); renderPanel(); }
    else if (a === 'reset') {
      modal('<div class="big-emoji">⚠️</div><h2>정말 초기화할까요?</h2><p>모든 진행 상황(경력, 가구, 스킨 포함)이 사라져요.</p>',
        [{ label: '취소', cls: 'cant' }, { label: '초기화', cls: 'orange', fn: () => {
          try { localStorage.removeItem(SAVE_KEY); } catch (er) { /* 무시 */ }
          location.reload();
        } }]);
    }
  });
  $('sndBtn').addEventListener('click', () => { const m = SFX.toggle(); $('sndBtn').textContent = m ? '🔇' : '🔊'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);

  // ---------------- 시작 ----------------
  load();
  $('sndBtn').textContent = SFX.muted ? '🔇' : '🔊';
  document.querySelectorAll('.maintabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
  sub = S.tab === 'work' ? 'job' : 'furn';
  S.stamina = Math.min(S.stamina, maxStam());
  tired = S.stamina < clickCost();

  // 자리 비운 동안
  const away = Math.min((Date.now() - S.last) / 1000, 8 * 3600);
  if (S.started && away > 30) {
    const got = autoIncome() * away;
    if (got > 0) earn(got);
    S.stamina = clamp(S.stamina + (S.tab === 'home' ? homeRegen() : workRegen()) * away, 0, maxStam());
    tired = S.stamina < maxStam() * 0.3 && tired;
    const mins = Math.floor(away / 60);
    if (got > 0) setTimeout(() => modal(`<div class="big-emoji">💰</div><h2>다녀오셨어요!</h2>
      <p>자리 비운 ${mins >= 60 ? Math.floor(mins / 60) + '시간 ' : ''}${mins % 60}분 동안<br>동료들이 <b>${won(got)}</b>을 벌었어요!</p>`,
      [{ label: '받기 🪙', fn: () => { SFX.unlock(); SFX.coin(); confetti(40); } }]), 300);
  }

  renderScene(true); renderChar_(true); renderPanel(); updateTop();
  if (S.clicks > 0) { hintHidden = true; $('hint').classList.add('hidden'); }
  if (S.tab !== 'work') $('hint').classList.add('hidden');

  if (!S.started) {
    modal(`<div class="big-emoji">💸</div><h2>알바 전전기</h2>
      <p>통장 잔고 <b>0원</b>…<br>오늘부터 알바 인생 시작!<br><br>
      👆 캐릭터를 눌러서 일하고<br>💰 돈을 모아 더 좋은 알바로 이직해서<br>🏪 언젠가 <b>내 가게 사장님</b>이 되어 보세요!</p>`,
    [{ label: '알바 시작! 💪', cls: 'orange', fn: () => { SFX.unlock(); SFX.levelup(); S.started = true; save(); } }]);
  }
  requestAnimationFrame(loop);

  // 테스트/디버그용 (콘솔에서 사용)
  window.__alba = { get S() { return S; }, earn, renderPanel, spawnEvent, fmt };
})();
