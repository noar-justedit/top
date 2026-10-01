const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
let pass=0, fail=0;
const ok=(n,c,d='')=>{ c?pass++:fail++; console.log((c?'  ok  ':'  FAIL'), n, c?'':d); };

(async()=>{
  const b = await chromium.launch();
  const c = await b.newContext({viewport:{width:1440,height:900}});
  const p = await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('MASTER '+e));
  await p.goto(F); await p.waitForTimeout(1100);

  // ---- stopwatch ----
  const [sw] = await Promise.all([ c.waitForEvent('page'), p.click('#chronoCard .scrbtn') ]);
  sw.on('pageerror',e=>errs.push('SW '+e));
  await sw.waitForLoadState(); await sw.waitForTimeout(1200);
  ok('stopwatch screen opened', await sw.evaluate(()=>document.querySelector('.card.solo-on').dataset.type)==='chrono');

  await p.click('#chronoCard .btns .btn.go'); await p.waitForTimeout(1600);
  const drift = await (async()=>{ const o=[];
    for(let i=0;i<6;i++){
      const [a,s]=await Promise.all([
        p.evaluate(()=>CHRONOS[0].elapsed()),
        sw.evaluate(()=>CHRONOS.find(x=>x.card.classList.contains('solo-on')).elapsed())]);
      o.push(Math.abs(a-s)); await p.waitForTimeout(220);
    } return Math.max(...o); })();
  ok('stopwatch agreement under 60 ms (max '+Math.round(drift)+' ms)', drift<60);

  await p.click('#chronoCard .btns .btn.pause'); await p.waitForTimeout(900);
  const mp = await p.evaluate(()=>document.querySelector('#chronoCard .readout').textContent.trim());
  await p.waitForTimeout(700);
  const sp = await sw.evaluate(()=>document.querySelector('.card.solo-on .readout').textContent.trim());
  ok('stopwatch pause mirrored', mp===sp, mp+' vs '+sp);

  await p.click('#chronoCard .btns .btn.stop'); await p.waitForTimeout(700);
  ok('stopwatch reset mirrored',
     (await sw.evaluate(()=>document.querySelector('.card.solo-on .readout').textContent.trim())).startsWith('00:00:00'));
  await sw.screenshot({path:'/tmp/scr-chrono.png'});
  await sw.close();

  // ---- OBS media (display copy) ----
  const [md] = await Promise.all([ c.waitForEvent('page'), p.click('#mediaCard .scrbtn') ]);
  md.on('pageerror',e=>errs.push('MEDIA '+e));
  await md.waitForLoadState(); await md.waitForTimeout(1400);
  ok('media screen opened', await md.evaluate(()=>document.querySelector('.card.solo-on').dataset.type)==='media');
  ok('media screen not stale', await md.evaluate(()=>!document.body.classList.contains('sc-stale')));
  ok('media screen did not open its own OBS socket',
     await md.evaluate(()=>!document.body.classList.contains('screen-mode') ? true
        : !window.__obsConnected));  // no connection attempt path in screen mode

  // fake what OBS would be showing on the master and check it crosses
  await p.evaluate(()=>{
    document.getElementById('mDlDigits').textContent = '00:01:23';
    document.getElementById('mDlDigits').classList.remove('sb-standby');
    document.getElementById('mSbScene').textContent = 'PLATEAU PRINCIPAL';
    document.getElementById('mCapDial').textContent = 'Remaining';
    document.getElementById('mRing').style.strokeDashoffset = '210';
  });
  await p.waitForTimeout(700);
  const got = await md.evaluate(()=>({
    dg:document.getElementById('mDlDigits').textContent,
    sb:document.getElementById('mSbScene').textContent,
    cap:document.getElementById('mCapDial').textContent,
    off:document.getElementById('mRing').style.strokeDashoffset}));
  ok('media digits mirrored', got.dg==='00:01:23', JSON.stringify(got));
  ok('media scene mirrored', got.sb==='PLATEAU PRINCIPAL');
  ok('media ring mirrored', got.off==='210');
  await md.screenshot({path:'/tmp/scr-media.png'});
  await md.close();

  // ---- an extra timer, created at runtime, gets a working screen ----
  await p.fill('#gsCols','3'); await p.press('#gsCols','Enter'); await p.waitForTimeout(400);
  await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open .cp-opt');
  await p.click('.cp-opt[data-type="timer"]'); await p.click('#cpOk');
  await p.waitForSelector('#timerModal.open');
  await p.fill('#tmName','KEYNOTE'); await p.fill('#tmM','22');
  await p.click('.tm-sw[data-c="#00c2ff"]'); await p.click('#tmOk');
  await p.waitForTimeout(800);
  const newCard = await p.evaluate(()=>{
    const c=[...document.querySelectorAll('.grid > .card')].find(x=>{
      const n=x.querySelector('.t-name'); return n && n.textContent.trim()==='KEYNOTE';});
    return c ? c.dataset.cid : null;});
  ok('extra timer created', !!newCard);
  const [ex] = await Promise.all([ c.waitForEvent('page'),
    p.click('.card[data-cid="'+newCard+'"] .scrbtn') ]);
  ex.on('pageerror',e=>errs.push('EXTRA '+e));
  await ex.waitForLoadState(); await ex.waitForTimeout(1300);
  ok('extra-timer screen shows the right card',
     await ex.evaluate(()=>document.querySelector('.card.solo-on .t-name').textContent.trim())==='KEYNOTE');
  ok('extra-timer screen not stale', await ex.evaluate(()=>!document.body.classList.contains('sc-stale')));
  await p.click('.card[data-cid="'+newCard+'"] .btns .btn.go'); await p.waitForTimeout(1400);
  const em = await p.evaluate(c=>document.querySelector('.card[data-cid="'+c+'"] .readout.tmr').textContent.trim(), newCard);
  const es = await ex.evaluate(()=>document.querySelector('.card.solo-on .readout.tmr').textContent.trim());
  ok('extra-timer screen counts down', em===es, em+' vs '+es);
  await ex.screenshot({path:'/tmp/scr-timer.png'});

  // two screens at once
  const [ex2] = await Promise.all([ c.waitForEvent('page'), p.click('#timerCard .scrbtn') ]);
  await ex2.waitForLoadState(); await ex2.waitForTimeout(1200);
  ok('two screens at once, each on its own card',
     (await ex2.evaluate(()=>document.querySelector('.card.solo-on .t-name').textContent.trim()))!=='KEYNOTE' &&
     (await ex.evaluate(()=>document.querySelector('.card.solo-on .t-name').textContent.trim()))==='KEYNOTE');

  ok('no JS error anywhere', errs.length===0, errs.join(' | '));
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
