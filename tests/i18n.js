const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
let pass=0, fail=0;
const ok=(n,c,d='')=>{ c?pass++:fail++; console.log((c?'  ok  ':'  FAIL'), n, c?'':d); };

/* Chinese localization layer: OS-detected default language, runtime switch,
   dynamic retranslation of app-rewritten strings, persistence, full restore. */
(async()=>{
  const b = await chromium.launch();

  // ---- default follows OS locale: Chinese system → Chinese UI ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900},locale:'zh-CN'});
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(800);
    ok('boot without JS error', errs.length===0, errs.join('|'));
    ok('zh-CN locale defaults to Chinese (新建卡片)', (await p.textContent('#newCardBtn')).includes('新建卡片'));
    ok('lang button sits right after #shortcutsBtn', await p.evaluate(()=>{
      const s=document.getElementById('shortcutsBtn'), l=document.getElementById('langBtn');
      return !!l && s.nextSibling===l;
    }));
    ok('lang button shows EN', (await p.textContent('#langBtn span')).trim()==='EN');
    ok('document.title already Chinese', await p.title()==='TOP! — 现场活动时间控制');
    ok('html lang already zh-CN', await p.evaluate(()=>document.documentElement.lang)==='zh-CN');
    ok('no JS error', errs.length===0, errs.join('|'));
    await c.close();
  }

  // ---- default follows OS locale: non-Chinese system → English UI ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900},locale:'en-US'});
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(800);
    ok('en-US locale defaults to English (NEW CARD)', (await p.textContent('#newCardBtn')).includes('NEW CARD'));
    ok('lang button shows 中', (await p.textContent('#langBtn span')).trim()==='中');
    ok('document.title stays English', await p.title()==='TOP! — Live Event Time Control');
    ok('html lang stays fr (original)', await p.evaluate(()=>document.documentElement.lang)==='fr');
    ok('no JS error', errs.length===0, errs.join('|'));
    await c.close();
  }

  // ---- Chinese: static strings, attributes, meta (force zh-CN locale) ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900},locale:'zh-CN'});
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(800);

    ok('NEW CARD → 新建卡片', (await p.textContent('#newCardBtn')).includes('新建卡片'));
    ok('brand subtitle → 现场活动时间控制 · v…',
      /^(现场活动时间控制 · v).+$/.test((await p.textContent('.brand-txt .sub')).trim()),
      (await p.textContent('.brand-txt .sub')).trim());
    ok('fsBtn title → 全屏', await p.getAttribute('#fsBtn','title')==='全屏');
    ok('shortcutsBtn title → 键盘快捷键', await p.getAttribute('#shortcutsBtn','title')==='键盘快捷键');
    ok('gsCols title → 列', await p.getAttribute('#gsCols','title')==='列');
    ok('gsRows title → 行', await p.getAttribute('#gsRows','title')==='行');
    ok('wakeBtn title', (await p.getAttribute('#wakeBtn','title')).startsWith('保持唤醒'));
    ok('lang button shows EN', (await p.textContent('#langBtn span')).trim()==='EN');

    ok('timer name → 倒计时', (await p.textContent('#timerCard .t-name')).trim()==='倒计时');
    ok('timer armed → 待命', (await p.textContent('#timerCard .t-armed')).trim()==='待命');
    ok('timer start → 开始', (await p.textContent('#timerStart')).trim()==='开始');
    ok('timer reset → 重置', (await p.textContent('#timerReset')).trim()==='重置');
    const presets = await p.$$eval('#presets .preset', ns=>ns.map(n=>n.textContent.trim()));
    ok('presets → 分钟', presets[0]==='+1 分钟' && presets[6]==='−5 分钟' && presets[9]==='−20 分钟', JSON.stringify(presets));
    ok('SOUND → 提示音', (await p.textContent('#timerCard .sw-label')).trim()==='提示音');
    ok('view toggle → ◷ 表盘', (await p.textContent('#timerView')).trim()==='◷ 表盘');
    ok('time caps → 时/分/秒', await p.$$eval('#timeInput .cap', ns=>ns.map(n=>n.textContent.trim()).join('/')==='时/分/秒'),
      await p.$$eval('#timeInput .cap', ns=>ns.map(n=>n.textContent.trim()).join('/')));
    ok('clock label → 本机时间', (await p.textContent('#clockCard .label')).includes('本机时间'));
    ok('media label → OBS 媒体倒计时', (await p.textContent('#mediaCard .label')).trim()==='OBS 媒体倒计时');
    ok('media connect → 连接', (await p.textContent('#mConnectBtn')).trim()==='连接');
    ok('mConnDot title (dynamic status)', await p.getAttribute('#mConnDot','title')==='OBS WebSocket：未连接 — 点击打开设置',
      await p.getAttribute('#mConnDot','title'));
    ok('mPwd placeholder → （可选）', await p.getAttribute('#mPwd','placeholder')==='（可选）');
    ok('clock OBS popup labels', await p.evaluate(()=>{
      const t=document.querySelector('#timerCard .obs-popup-title').textContent.trim();
      const l=[...document.querySelectorAll('#timerCard .obs-row-label')].map(n=>n.textContent.trim());
      return t==='OBS 浏览器源 URL' && l[0]==='数字' && l[1]==='Gorgy 表盘';
    }));

    ok('document.title → TOP! — 现场活动时间控制', await p.title()==='TOP! — 现场活动时间控制');
    ok('html lang → zh-CN', await p.evaluate(()=>document.documentElement.lang)==='zh-CN');
    ok('clock date in Chinese', /^\d{4}年\d{1,2}月\d{1,2}日 星期[一二三四五六日]$/.test((await p.textContent('#clockDate')).trim()),
      (await p.textContent('#clockDate')).trim());

    // ---- Chinese: app-rewritten strings are re-translated, logic intact ----
    await p.click('#timerStart'); await p.waitForTimeout(300);
    ok('start → 暂停 while running', (await p.textContent('#timerStart')).trim()==='暂停');
    await p.waitForTimeout(1200);
    ok('timer still counts down', (await p.textContent('#timerCard .readout')).trim()!=='05:00');
    await p.click('#timerStart'); await p.waitForTimeout(300);
    ok('pause → 继续', (await p.textContent('#timerStart')).trim()==='继续');
    await p.click('#timerReset'); await p.waitForTimeout(300);
    ok('reset → 开始', (await p.textContent('#timerStart')).trim()==='开始');
    ok('timer resets to zero', (await p.textContent('#timerCard .readout')).trim().startsWith('00:00'));
    await p.click('#timerView'); await p.waitForTimeout(300);
    ok('view toggle → ▭ 数字', (await p.textContent('#timerView')).trim()==='▭ 数字');
    await p.click('#timerView'); await p.waitForTimeout(300);
    ok('view toggle back → ◷ 表盘', (await p.textContent('#timerView')).trim()==='◷ 表盘');

    // ---- Chinese: modals and dynamically created cards ----
    await p.click('#shortcutsBtn'); await p.waitForSelector('#shortcutsModal.open');
    ok('shortcuts title → ⌨ 键盘快捷键', (await p.textContent('#shortcutsModal .modal-title')).trim()==='⌨ 键盘快捷键');
    ok('shortcuts first section → 倒计时', (await p.textContent('#shortcutsModal .sc-section')).trim()==='倒计时');
    ok('Space row → 空格 / 开始 / 暂停', await p.evaluate(()=>{
      const r=[...document.querySelectorAll('#shortcutsModal .sc-row')].find(x=>x.querySelector('kbd')&&x.querySelector('kbd').textContent==='空格');
      return r && r.querySelector('span').textContent.trim()==='开始 / 暂停';
    }));
    ok('shortcuts note fragment translated', (await p.textContent('#shortcutsModal .sc-note')).includes('快捷键作用于选中的倒计时'));
    await p.click('#closeShortcuts'); await p.waitForTimeout(200);

    // a full 2×2 grid refuses new cards: the refusal toast is translated too
    await p.click('#newCardBtn'); await p.waitForTimeout(400);
    ok('grid-full toast translated', (await p.textContent('#toast')).startsWith('网格已满：'), (await p.textContent('#toast')));
    // shrinking the grid below the card count warns in Chinese too
    await p.fill('#gsRows','1'); await p.press('#gsRows','Enter'); await p.waitForTimeout(400);
    ok('grid-too-small toast translated',
      (await p.textContent('#toast')).startsWith('2 × 1 网格可容纳 2 张卡片，当前屏幕上有 4 张。'),
      (await p.textContent('#toast')));
    await p.fill('#gsRows','2'); await p.press('#gsRows','Enter'); await p.waitForTimeout(300);
    await p.fill('#gsCols','3'); await p.press('#gsCols','Enter'); await p.waitForTimeout(400);
    await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open');
    ok('picker title → 新建卡片', (await p.textContent('#cardPicker .modal-title')).trim()==='新建卡片');
    ok('picker ok → 添加', (await p.textContent('#cpOk')).trim()==='添加');
    ok('picker cancel → 取消', (await p.textContent('#cpCancel')).trim()==='取消');
    ok('picker timer kind translated', await p.evaluate(()=>{
      const o=document.querySelector('#cardPicker .cp-opt[data-type="timer"]');
      return o && o.textContent.includes('倒计时') && o.textContent.includes('倒计时，带预设、超时计时与语音提示。');
    }));
    await p.click('#cardPicker .cp-opt[data-type="timer"]'); await p.click('#cpOk');
    await p.waitForSelector('#timerModal.open');
    ok('timer modal title → 新建倒计时', (await p.textContent('#tmTitle')).trim()==='新建倒计时');
    ok('tmName placeholder', await p.getAttribute('#tmName','placeholder')==='例如：主题演讲、问答、茶歇');
    ok('duration caps → 时/分/秒', await p.$$eval('#tmDurField .tm-du span', ns=>ns.map(n=>n.textContent.trim()).join('/')==='时/分/秒'));
    ok('tmOk → 创建', (await p.textContent('#tmOk')).trim()==='创建');
    // the creation modal prefills the translated automatic name; left
    // untouched, the card keeps the English default internally
    ok('creation prefills 倒计时 2', await p.inputValue('#tmName')==='倒计时 2',
      await p.inputValue('#tmName'));
    await p.click('#tmOk'); await p.waitForTimeout(600);

    const findCard=(nm)=>p.evaluate((nm)=>{
      return [...document.querySelectorAll('.grid > .card')].some(x=>{
        const n=x.querySelector('.t-name,.c-name'); return n&&n.textContent.trim()===nm;
      });
    },nm);
    const storedNames=()=>p.evaluate(()=>{
      try{ return JSON.parse(localStorage.getItem('topCards')||'[]').map(c=>c.name||'').join('|'); }
      catch(e){ return 'ERR'; }
    });
    const openEditorOn=async(nm)=>{
      await p.evaluate((nm)=>{
        const c=[...document.querySelectorAll('.grid > .card')].find(x=>{
          const n=x.querySelector('.t-name,.c-name'); return n&&n.textContent.trim()===nm;});
        c.querySelector('.editbtn').click();
      },nm);
      await p.waitForSelector('#timerModal.open');
    };

    ok('auto-named card → 倒计时 2', await findCard('倒计时 2'));
    ok('auto name stored in English', (await storedNames()).split('|').includes('Timer 2'), await storedNames());
    ok('cloned card fully translated', await p.evaluate(()=>{
      const c=[...document.querySelectorAll('.grid > .card')].find(x=>{
        const n=x.querySelector('.t-name'); return n&&n.textContent.trim()==='倒计时 2';});
      if(!c) return false;
      const go=c.querySelector('.btn.go'), pr=c.querySelector('.preset'), sw=c.querySelector('.sw-label');
      return go&&go.textContent.trim()==='开始' && pr&&pr.textContent.trim()==='+1 分钟' && sw&&sw.textContent.trim()==='提示音';
    }));

    // the editor prefills the name the card actually shows, not the stored English
    await p.click('#timerCard .editbtn'); await p.waitForSelector('#timerModal.open');
    ok('editor title → 编辑倒计时', (await p.textContent('#tmTitle')).trim()==='编辑倒计时');
    ok('editor prefills the Chinese name', await p.inputValue('#tmName')==='倒计时',
      await p.inputValue('#tmName'));
    await p.click('#tmCancel'); await p.waitForTimeout(200);

    // saving without typing keeps the automatic name: still Chinese on the
    // card, still English in storage
    await openEditorOn('倒计时 2');
    ok('editor prefills 倒计时 2', await p.inputValue('#tmName')==='倒计时 2',
      await p.inputValue('#tmName'));
    await p.click('#tmOk'); await p.waitForTimeout(400);
    ok('untouched save still shows 倒计时 2', await findCard('倒计时 2'));
    ok('untouched save still stores Timer 2', (await storedNames()).split('|').includes('Timer 2'), await storedNames());

    // a hand-typed name is the user's own: shown and stored verbatim, even
    // when it matches an automatic name like 'Timer 2'
    await openEditorOn('倒计时 2');
    await p.fill('#tmName','Timer 2'); await p.click('#tmOk'); await p.waitForTimeout(400);
    ok('hand-typed Timer 2 shown verbatim', await findCard('Timer 2'));
    ok('user-typed name not translated', !(await findCard('倒计时 2')));
    ok('user name stored verbatim', (await storedNames()).split('|').includes('Timer 2'), await storedNames());

    // a locked card's editor prefills the user's own name, untranslated
    await openEditorOn('Timer 2');
    ok('locked card prefill stays Timer 2', await p.inputValue('#tmName')==='Timer 2',
      await p.inputValue('#tmName'));
    await p.fill('#tmName','主题演讲'); await p.click('#tmOk'); await p.waitForTimeout(400);
    ok('Chinese rename displayed as-is', await findCard('主题演讲'));

    // same rule for stopwatches: the automatic name is translated, a
    // hand-typed one is not — even when it matches the automatic pattern
    await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open');
    await p.click('#cardPicker .cp-opt[data-type="chrono"]'); await p.click('#cpOk');
    await p.waitForSelector('#timerModal.open');
    ok('stopwatch modal title → 新建秒表', (await p.textContent('#tmTitle')).trim()==='新建秒表');
    ok('creation prefills 秒表 2', await p.inputValue('#tmName')==='秒表 2',
      await p.inputValue('#tmName'));
    await p.click('#tmOk'); await p.waitForTimeout(600);
    ok('auto-named stopwatch → 秒表 2', await findCard('秒表 2'));
    await openEditorOn('秒表 2');
    ok('editor prefills 秒表 2', await p.inputValue('#tmName')==='秒表 2',
      await p.inputValue('#tmName'));
    await p.fill('#tmName','Stopwatch 2'); await p.click('#tmOk'); await p.waitForTimeout(400);
    ok('hand-typed Stopwatch 2 shown verbatim', await findCard('Stopwatch 2'));
    ok('typed stopwatch name not translated', !(await findCard('秒表 2')));

    // ---- persistence across reload (user names must stay verbatim) ----
    await p.reload(); await p.waitForTimeout(800);
    ok('still Chinese after reload', (await p.textContent('#newCardBtn')).includes('新建卡片'));
    ok('lang button still shows EN', (await p.textContent('#langBtn span')).trim()==='EN');
    ok('user name survives reload untranslated', await findCard('主题演讲'));
    ok('stopwatch name survives reload untranslated', await findCard('Stopwatch 2'));

    // confirm() is the only UI string that never enters the DOM
    let dialogMsg='';
    p.once('dialog', async d=>{ dialogMsg=d.message(); await d.accept(); });
    await p.evaluate(()=>{
      const c=[...document.querySelectorAll('.grid > .card')].find(x=>{
        const n=x.querySelector('.t-name'); return n&&n.textContent.trim()==='主题演讲';});
      c.querySelector('.closebtn').click();
    });
    await p.waitForTimeout(300);
    ok('confirm() translated', dialogMsg.includes('关闭“主题演讲”') && dialogMsg.includes('之后可以从“新建卡片”重新添加。'), dialogMsg.replace(/\n/g,'\\n'));
    ok('card closed, back to 5 cards', await p.$$eval('.grid > .card', n=>n.length)===5);

    // ---- switch back: exact restore ----
    await p.click('#langBtn'); await p.waitForTimeout(300);
    ok('back to English (NEW CARD)', (await p.textContent('#newCardBtn')).includes('NEW CARD'));
    ok('shortcutsBtn title restored', await p.getAttribute('#shortcutsBtn','title')==='Keyboard shortcuts');
    ok('fsBtn title restored', await p.getAttribute('#fsBtn','title')==='Full screen');
    ok('brand subtitle restored', (await p.textContent('.brand-txt .sub')).trim().startsWith('Live Event Time Control · v'));
    ok('timer name restored', (await p.textContent('#timerCard .t-name')).trim()==='Timer');
    ok('timer armed restored', (await p.textContent('#timerCard .t-armed')).trim()==='Armed');
    ok('timer start restored', (await p.textContent('#timerStart')).trim()==='Start');
    const presetsEn = await p.$$eval('#presets .preset', ns=>ns.map(n=>n.textContent.trim()));
    ok('presets restored', presetsEn[0]==='+1 min' && presetsEn[6]==='−5 mins', JSON.stringify(presetsEn));
    ok('view toggle restored', (await p.textContent('#timerView')).trim()==='◷ Dial');
    ok('time caps restored', await p.$$eval('#timeInput .cap', ns=>ns.map(n=>n.textContent.trim()).join('/')==='Hours/Min/Sec'));
    ok('media label restored', (await p.textContent('#mediaCard .label')).trim()==='OBS Media Countdown');
    ok('document.title restored', await p.title()==='TOP! — Live Event Time Control');
    ok('html lang restored', await p.evaluate(()=>document.documentElement.lang)==='fr');
    ok('clock date restored', /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),? \d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/.test((await p.textContent('#clockDate')).trim()),
      (await p.textContent('#clockDate')).trim());
    ok('lang button shows 中 again', (await p.textContent('#langBtn span')).trim()==='中');

    // timer still fully functional after the round trip — the reset above saved
    // dur=0, so give the timer a duration again via a preset before Space
    await p.click('#timerCard .label');
    await p.click('#presets .preset[data-min="5"][data-sign="1"]');
    await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
    await p.keyboard.press('Space'); await p.waitForTimeout(1200);
    ok('timer runs after round trip', (await p.textContent('#timerCard .readout')).trim().startsWith('04:'));
    ok('English state label after round trip', (await p.textContent('#timerStart')).trim()==='Pause');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);

    ok('no JS error overall', errs.length===0, errs.join('|'));
    await c.close();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
