(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }

  /* ===== STEP 1 五大装置の関係図 ===== */
  const NAMES = ['演算装置', '出力装置', '制御装置', '入力装置', '中央処理装置'];
  const ANS = { 'ア': '制御装置', 'イ': '演算装置', 'ウ': '入力装置', 'エ': '出力装置' };
  const WHY = {
    'ア': '制御（命令）の流れがすべての装置に向かっているので<strong>制御装置</strong>です。',
    'イ': 'CPUの中で【ア】が制御装置なので、もう一方は<strong>演算装置</strong>です。',
    'ウ': 'データの流れの始まりなので<strong>入力装置</strong>です。',
    'エ': 'データの流れの最後なので<strong>出力装置</strong>です。'
  };
  let picked = {}, cur = 'ア', showAns = false;
  const BPOS = { 'ア': [45, 45, 120, 34], 'イ': [45, 115, 120, 34], 'ウ': [420, 60, 120, 34], 'エ': [420, 140, 120, 34] };
  function drawFig() {
    const W = 580, H = 230;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'コンピュータの五大装置の関係図' });
    const defs = el('defs');
    [['ah1', '#123a6b'], ['ah2', '#8a5a00']].forEach(m => {
      const mk = el('marker', { id: m[0], markerWidth: 7, markerHeight: 7, refX: 6, refY: 3, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L6,3 L0,6 z', fill: m[1] }));
      defs.appendChild(mk);
    });
    svg.appendChild(defs);
    // 枠
    svg.appendChild(el('rect', { x: 28, y: 24, width: 154, height: 148, rx: 3, class: 'grp' }));
    svg.appendChild(el('text', { x: 34, y: 18, class: 'cap' }, 'CPU'));
    svg.appendChild(el('rect', { x: 236, y: 44, width: 150, height: 148, rx: 3, class: 'grp' }));
    svg.appendChild(el('text', { x: 242, y: 38, class: 'cap' }, '記憶装置'));
    // 固定の箱
    const box = (x, y, w, h, label) => {
      svg.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: 2, class: 'box' }));
      svg.appendChild(el('text', { x: x + w / 2, y: y + h / 2, class: 'tx' }, label));
    };
    box(250, 62, 122, 34, '主記憶装置');
    box(250, 140, 122, 34, '補助記憶装置');
    // データの流れ（点線）
    const path = (d, cls) => svg.appendChild(el('path', { d: d, class: cls }));
    path('M418,77 L378,77', 'dflow');                         // ウ → 主記憶装置
    path('M311,100 L311,136', 'dflow');                       // 主記憶 → 補助記憶
    path('M330,136 L330,100', 'dflow');                       // 補助記憶 → 主記憶
    path('M248,79 L172,110 ', 'dflow');                       // 主記憶 → 演算装置
    path('M172,126 L248,88', 'dflow');                        // 演算装置 → 主記憶
    path('M376,157 L418,157', 'dflow');                       // 補助記憶 → 出力装置
    path('M374,90 L400,90 L400,150 L418,150', 'dflow');       // 主記憶 → 出力装置
    // 制御の流れ（実線）
    path('M105,79 L105,113', 'cflow');                        // ア → イ
    path('M167,55 L206,55 L206,70 L248,70', 'cflow');         // ア → 主記憶
    path('M167,62 L216,62 L216,150 L248,150', 'cflow');       // ア → 補助記憶
    path('M167,48 L206,48 L206,14 L470,14 L470,56', 'cflow'); // ア → ウ
    path('M167,44 L200,44 L200,8 L556,8 L556,136', 'cflow');  // ア → エ
    // 凡例
    svg.appendChild(el('text', { x: 448, y: 205, class: 'cap' }, '‥‥→ データの流れ'));
    svg.appendChild(el('text', { x: 448, y: 220, class: 'cap' }, '──→ 制御の流れ'));
    // 空欄
    Object.keys(BPOS).forEach(k => {
      const p = BPOS[k], v = showAns ? ANS[k] : picked[k];
      let cls = 'blank';
      if (v) cls += (v === ANS[k] ? ' ok' : ' ng');
      else if (k === cur) cls += ' now';
      const r = el('rect', { x: p[0], y: p[1], width: p[2], height: p[3], rx: 2, class: cls, 'data-k': k });
      r.addEventListener('click', () => { cur = k; drawFig(); drawChoices(); });
      svg.appendChild(r);
      svg.appendChild(el('text', { x: p[0] + p[2] / 2, y: p[1] + p[3] / 2, class: 'tx' + (!v && k === cur ? ' w' : '') }, v || k));
    });
    const b = $('figBox'); b.innerHTML = ''; b.appendChild(svg);
    $('curBlank').textContent = cur;
  }
  function drawChoices() {
    $('figChoices').innerHTML = NAMES.map((n, i) =>
      '<button class="btn" data-n="' + n + '" style="text-align:center">' + '⓪①②③④'[i] + '　' + n + '</button>').join('');
    $('figChoices').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      picked[cur] = b.dataset.n;
      const ok = b.dataset.n === ANS[cur];
      const n = $('figNote');
      n.className = 'note ' + (ok ? 'ok' : 'ng');
      n.innerHTML = '【' + cur + '】：' + (ok ? '正解。' : '<strong>ちがいます。</strong>') + WHY[cur] +
        (b.dataset.n === '中央処理装置' ? '<br><span class="small">「中央処理装置（CPU）」は制御装置と演算装置をまとめた呼び方なので、図の中の1つの箱には入りません。</span>' : '');
      const done = Object.keys(picked).length, right = Object.keys(picked).filter(k => picked[k] === ANS[k]).length;
      if (done === 4) n.innerHTML += '<br>4つとも解答しました（正解 ' + right + ' / 4）。' +
        (right === 4 ? '本文の答えは【ア】②　【イ】⓪　【ウ】③　【エ】① です。' : 'もう一度考えてみましょう。');
      const order = ['ア', 'イ', 'ウ', 'エ'];
      const next = order.find(k => !picked[k]);
      if (next) cur = next;
      drawFig();
    }));
  }

  /* ===== STEP 2 役割マッチング ===== */
  const ROLES = [
    { n: '入力装置', r: '外界からの情報や指示を得る装置。', ex: 'キーボード・マウス・カメラ' },
    { n: '制御装置', r: '他の装置を制御する装置。', ex: 'CPUの一部' },
    { n: '演算装置', r: '演算処理を行う装置。', ex: 'CPUの一部' },
    { n: '主記憶装置', r: '演算装置と直接データをやりとりする装置。', ex: 'メモリ（RAM）' },
    { n: '補助記憶装置', r: '長期的にデータを保存する装置。', ex: 'SSD・HDD' },
    { n: '出力装置', r: '結果を出力する装置。', ex: 'ディスプレイ・プリンタ' }
  ];
  let rAns = {};
  function drawRoles() {
    const shuffled = ROLES.map(x => x.n).sort();
    $('roleBox').innerHTML = ROLES.map((x, i) =>
      '<div class="mrow"><div class="q">' + x.r + '</div>' +
      '<div class="choice4" data-i="' + i + '">' + shuffled.map(n =>
        '<button class="btn" data-i="' + i + '" data-n="' + n + '" style="text-align:center">' + n + '</button>').join('') + '</div>' +
      '<div class="note" id="rfb' + i + '" hidden style="margin-top:8px"></div></div>').join('');
    $('roleBox').querySelectorAll('button[data-n]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, x = ROLES[i], ok = b.dataset.n === x.n;
      const row = $('roleBox').querySelector('.choice4[data-i="' + i + '"]');
      row.classList.add('locked');
      [...row.children].forEach(c => { if (c.dataset.n === x.n) c.classList.add('correct'); else if (c === b) c.classList.add('wrong'); });
      const fb = $('rfb' + i);
      fb.hidden = false; fb.className = 'note ' + (ok ? 'ok' : 'ng');
      fb.innerHTML = (ok ? '正解。' : '正解は <strong>' + x.n + '</strong>。') + '例：' + x.ex;
      rAns[i] = ok;
      const done = Object.keys(rAns).length, right = Object.values(rAns).filter(Boolean).length;
      const n = $('roleNote');
      n.className = 'note ' + (done === ROLES.length ? (right === done ? 'ok' : 'warn') : 'info');
      n.innerHTML = done + ' / ' + ROLES.length + ' 問（正解 ' + right + ' 問）' +
        (done === ROLES.length ? '<br>制御装置と演算装置をまとめて <strong>CPU（中央処理装置）</strong>、コンピュータの頭脳にあたります。' : '');
    }));
    $('roleNote').className = 'note info';
    $('roleNote').textContent = '0 / ' + ROLES.length + ' 問';
  }

  /* ===== STEP 3 ===== */
  function drawTables() {
    $('memTable').innerHTML = '<thead><tr><th></th><th>主記憶装置</th><th>補助記憶装置</th></tr></thead><tbody>' +
      '<tr><td>読み書きの速さ</td><td class="y">速い</td><td class="n">遅い</td></tr>' +
      '<tr><td>保存できる量</td><td class="n">小さい</td><td class="y">大きい</td></tr>' +
      '<tr><td>電源を切ると</td><td class="n">消える</td><td class="y">残る</td></tr>' +
      '<tr><td>演算装置とのやりとり</td><td>直接やりとりする</td><td>主記憶装置を経由する</td></tr>' +
      '<tr><td>例</td><td>メモリ（RAM）</td><td>SSD・HDD・USBメモリ</td></tr></tbody>';
    $('ssdTable').innerHTML = '<thead><tr><th></th><th>SSD</th><th>HDD</th></tr></thead><tbody>' +
      '<tr><td>読み書きの速さ</td><td class="y">速い</td><td class="n">遅い</td></tr>' +
      '<tr><td>消費電力</td><td class="y">少ない</td><td class="n">多い</td></tr>' +
      '<tr><td>衝撃への強さ</td><td class="y">強い</td><td class="n">弱い（円盤が回る）</td></tr>' +
      '<tr><td>同じ容量あたりの値段</td><td class="n">高め</td><td class="y">安め</td></tr></tbody>';
    $('swTable').innerHTML = '<thead><tr><th>種類</th><th>はたらき</th><th>例</th></tr></thead><tbody>' +
      '<tr><td>基本ソフトウェア（OS）</td><td>ハードウェア全体を管理し、応用ソフトウェアが動く土台をつくる</td><td>Windows・macOS・Android・iOS</td></tr>' +
      '<tr><td>応用ソフトウェア</td><td>目的に応じた作業を行う</td><td>表計算ソフト・ブラウザ・ゲーム</td></tr>' +
      '<tr><td>デバイスドライバ</td><td>周辺機器を動かすためのソフトウェア</td><td>プリンタ用・スキャナ用</td></tr></tbody>';
  }

  /* ===== STEP 4 OSのはたらき ===== */
  const OS = [
    { n: 'タスク管理', d: '複数のタスクを瞬時に切り替えて、同時に動いているように見せる。', ok: true },
    { n: 'メモリ管理', d: '主記憶装置のどこを、どのプログラムが使うかを割り当てる。', ok: true },
    { n: 'ファイル管理', d: 'データをファイル・フォルダとして整理し、出し入れできるようにする。', ok: true },
    { n: '文書の作成', d: '文章を書いたり、レイアウトを整えたりする。', ok: false }
  ];
  let osAns = {};
  function drawOS() {
    $('osBox').innerHTML = '<p class="small" style="color:var(--muted);margin:0 0 8px">OSの管理機能にあてはまるものはどれ？</p>' +
      OS.map((o, i) => '<div class="mrow" style="margin-bottom:8px"><div class="q">' + o.n + '<br><span class="small" style="font-weight:400;color:var(--muted)">' + o.d + '</span></div>' +
        '<div class="choice4" data-i="' + i + '" style="grid-template-columns:1fr 1fr">' +
        '<button class="btn" data-i="' + i + '" data-v="1" style="text-align:center">OSのはたらき</button>' +
        '<button class="btn" data-i="' + i + '" data-v="0" style="text-align:center">ちがう</button></div></div>').join('');
    $('osBox').querySelectorAll('button[data-v]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, o = OS[i], ok = (b.dataset.v === '1') === o.ok;
      const row = $('osBox').querySelector('.choice4[data-i="' + i + '"]');
      row.classList.add('locked');
      [...row.children].forEach(c => { if ((c.dataset.v === '1') === o.ok) c.classList.add('correct'); else if (c === b) c.classList.add('wrong'); });
      osAns[i] = ok;
      const done = Object.keys(osAns).length, right = Object.values(osAns).filter(Boolean).length;
      const n = $('osNote');
      n.className = 'note ' + (done === OS.length ? (right === done ? 'ok' : 'warn') : 'info');
      n.innerHTML = done + ' / ' + OS.length + ' 問（正解 ' + right + ' 問）' +
        (done === OS.length ? '<br>OSの管理機能は<strong>タスク管理・メモリ管理・ファイル管理</strong>。文書作成は応用ソフトウェアの仕事です。' : '');
    }));
    $('osNote').className = 'note info';
    $('osNote').textContent = '0 / ' + OS.length + ' 問';
  }

  /* ===== STEP 5 ===== */
  const JUDGE = [
    { k: 'a', t: '補助記憶装置に保存された命令やデータは、コンピュータの電源を切ると失われる。', ok: false,
      why: '電源を切っても<strong>残ります</strong>。消えるのは主記憶装置のほうです。' },
    { k: 'b', t: '主記憶装置は大容量のデータを保存できるが、読み書き速度が遅いため、処理を行うためには補助記憶装置が必要である。', ok: false,
      why: '主記憶装置は<strong>読み書きが速いが容量が小さい</strong>。説明が逆になっています。' },
    { k: 'c', t: '補助記憶装置にはSSDとHDDがあり、SSDはHDDに比べると消費電力が少ないため、ノートパソコンなどで利用されることが多い。', ok: true,
      why: 'SSDは速く・消費電力が少なく・衝撃に強いので、持ち運ぶ機器に向いています。' },
    { k: 'd', t: 'OSは複数のタスクを同時に実行できるように、複数のタスクを瞬時に切り替えて実行している。', ok: true,
      why: 'OSの<strong>タスク管理</strong>のはたらきです。' },
    { k: 'e', t: '周辺機器をコンピュータに接続して動作させるには、デバイスドライバが必要である。', ok: true,
      why: '機器ごとに対応したデバイスドライバが必要です。' }
  ];
  let jAns = {};
  function drawJudge() {
    $('jBox').innerHTML = JUDGE.map((j, i) =>
      '<div><div class="st"><span class="k">' + j.k + '</span><span class="t">' + j.t + '</span>' +
      '<span class="jb" data-i="' + i + '"><button class="btn" data-i="' + i + '" data-v="1">○</button>' +
      '<button class="btn" data-i="' + i + '" data-v="0">×</button></span></div>' +
      '<div class="note" id="jfb' + i + '" hidden style="margin-top:8px"></div></div>').join('');
    $('jBox').querySelectorAll('button[data-v]').forEach(btn => btn.addEventListener('click', () => {
      const i = +btn.dataset.i, j = JUDGE[i], ok = (btn.dataset.v === '1') === j.ok;
      const row = $('jBox').querySelector('.jb[data-i="' + i + '"]');
      row.style.pointerEvents = 'none';
      [...row.children].forEach(x => { if ((x.dataset.v === '1') === j.ok) x.classList.add('correct'); else if (x === btn) x.classList.add('wrong'); });
      const fb = $('jfb' + i);
      fb.hidden = false; fb.className = 'note ' + (ok ? 'ok' : 'ng');
      fb.innerHTML = '<strong>' + (j.ok ? '正しい記述です。' : '誤りです。') + '</strong>' + j.why;
      jAns[i] = ok;
      const done = Object.keys(jAns).length;
      const n = $('jNote');
      n.className = 'note ' + (done === JUDGE.length ? 'ok' : 'info');
      n.innerHTML = done + ' / ' + JUDGE.length + ' 判定' +
        (done === JUDGE.length ? '<br>正しいものは <strong>c・d・e の3つ</strong>なので、【オ】の答えは <strong>③（3つ）</strong> です。' : '');
    }));
    $('jNote').className = 'note info';
    $('jNote').textContent = '0 / ' + JUDGE.length + ' 判定';
  }

  function init() {
    if (document.getElementById('chkBox')) {
      window.Quiz.order('chkBox', 'chkNote',
        [{ k: 'R', t: 'レジスタ' }, { k: 'M', t: '主記憶装置（メモリ）' }, { k: 'S', t: 'SSD' }, { k: 'H', t: 'HDD' }],
        'RMSH',
        { tags: ['いちばん速い', '2番目', '3番目', 'いちばん遅い'],
          why: '<strong>速いものほど容量が小さく、値段が高い</strong>という関係があります。' +
               'CPUのすぐそばにあるレジスタがいちばん速く、離れるほど遅く・大きくなります。' });
      window.Quiz.judge('chk2Box', 'chk2Note', [
        { k: '1', t: '主記憶装置（メモリ）は、電源を切っても内容が残る。', ok: false,
          why: 'メモリは<strong>電源を切ると消えます</strong>（揮発性）。だから作業中のファイルは保存が必要です。' },
        { k: '2', t: 'SSDは内部に動く部品がないため、HDDより衝撃に強い。', ok: true,
          why: 'HDDは円盤を回して読み書きするので、動作中の衝撃に弱いという弱点があります。' },
        { k: '3', t: '同じ容量なら、ふつうHDDのほうがSSDより高い。', ok: false,
          why: '逆です。<strong>SSDのほうが高価</strong>で、HDDは容量あたりの値段が安いという長所があります。' }
      ], '「速い・小さい・高い」と「遅い・大きい・安い」が対になっていることを、下の表でも確かめましょう。');
    }

    $('figReset').addEventListener('click', () => { picked = {}; showAns = false; cur = 'ア'; $('figNote').className = 'note info'; $('figNote').textContent = '空欄をクリックしてから装置名を選びましょう。'; drawFig(); });
    $('figAns').addEventListener('click', () => {
      showAns = true; drawFig();
      const n = $('figNote'); n.className = 'note ok';
      n.innerHTML = '【ア】制御装置（②）　【イ】演算装置（⓪）　【ウ】入力装置（③）　【エ】出力装置（①）<br>' +
        '制御の流れがすべての装置へ向かうのが制御装置、データの流れの始まりが入力装置、終わりが出力装置です。';
    });
    window.Terms.glossary($('glossBox'), ['五大装置', 'CPU', '制御装置', '演算装置', '主記憶装置', '補助記憶装置', 'OS', 'デバイスドライバ', 'ハードウェア', 'ソフトウェア']);
    drawFig(); drawChoices(); drawRoles(); drawTables(); drawOS(); drawJudge();
    $('figNote').className = 'note info';
    $('figNote').textContent = '空欄をクリックしてから装置名を選びましょう。';
    Worksheet.make('wsBox', {
      name: 'hard-and-soft',
      fields: [
        { id: 'h1', label: '① 調べた機器', hint: '機種名と、主な使い道。', rows: 2, ph: '例：学校のノートPC。レポート作成と動画編集' },
        { id: 'h2', label: '② 五大装置にあてはめる', hint: '入力・出力・記憶・演算・制御が、それぞれ何にあたるか。', rows: 3,
          ph: '例：入力＝キーボードとタッチパッド、出力＝画面、記憶＝メモリとSSD、演算・制御＝CPU' },
        { id: 'h3', label: '③ OSと応用ソフトウェア', hint: 'OSは何か。よく使うアプリは何か。', rows: 2, ph: '例：OSはWindows。アプリは文書作成ソフトと動画編集ソフト' },
        { id: 'h4', label: '④ 遅いと感じる場面', hint: 'いつ、どんな作業で。', rows: 2, ph: '例：動画を書き出すときと、アプリを同時に多く開いたとき' },
        { id: 'h5', label: '⑤ 原因はどこにありそうか', hint: 'CPU／メモリ／記憶装置のどれか。理由も。', rows: 3,
          ph: '例：同時に開くと遅い→メモリ不足の可能性。書き出しが遅い→CPUの性能' },
        { id: 'h6', label: '⑥ どう改善するか', hint: '買いかえ以外の方法も考える。', rows: 2, ph: '例：使わないアプリを閉じる／メモリを増設する／保存先を外部SSDにする' }
      ],
      build: function (v, e) {
        return '<h4>機器の構成シート</h4><dl>' +
          '<dt>① 機器</dt><dd>' + e(v.h1) + '</dd>' +
          '<dt>② 五大装置</dt><dd>' + e(v.h2) + '</dd>' +
          '<dt>③ ソフトウェア</dt><dd>' + e(v.h3) + '</dd>' +
          '<dt>④ 遅いと感じる場面</dt><dd>' + e(v.h4) + '</dd>' +
          '<dt>⑤ 原因の見立て</dt><dd>' + e(v.h5) + '</dd>' +
          '<dt>⑥ 改善案</dt><dd>' + e(v.h6) + '</dd></dl>';
      },
      note: '④→⑤のように「症状から原因を推測する」練習は、そのままトラブル対応の力になります。'
    });

    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
