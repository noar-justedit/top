const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
let pass=0, fail=0;
const ok=(n,c,d='')=>{ c?pass++:fail++; console.log((c?'  ok  ':'  FAIL'), n, c?'':d); };
const num = t => t.replace(/[^\d]/g,'');

(async()=>{
  const b = await chromium.launch();
  const c = await b.newContext({viewport:{width:1280,height:800}});
  const p = await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('MASTER '+e));
  await p.goto(F); await p.waitForTimeout(1100);

  // --- open the timer's second screen ---
  const [scr] = await Promise.all([
    c.waitForEvent('page'),
    p.click('#timerCard .scrbtn')
  ]);
  scr.on('pageerror',e=>errs.push('SCREEN '+e));
  await scr.waitForLoadState(); await scr.waitForTimeout(1400);

  ok('second window opened', true);
  ok('screen mode classes', await scr.evaluate(()=>document.body.className).then(s=>/screen-mode/.test(s)&&/obs-mode/.test(s)));
  ok('one card visible', await scr.evaluate(()=>[...document.querySelectorAll('.grid > .card')]
       .filter(n=>{const s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden';}).length)===1);
  ok('it is the timer', await scr.evaluate(()=>document.querySelector('.card.solo-on').dataset.type)==='timer');
  ok('no controls on the screen', await scr.evaluate(()=>{
       const vis = s => {const e=document.querySelector('.card.solo-on '+s); if(!e) return false;
                         const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;};
       return !vis('.btns') && !vis('.presets') && !vis('.time-input') && !vis('.cardbtns');}));
  ok('card name is shown', await scr.evaluate(()=>{
       const e=document.querySelector('.card.solo-on .t-name'); const r=e.getBoundingClientRect();
       return r.width>0 && e.textContent.trim().length>0;}));
  ok('not stale', await scr.evaluate(()=>!document.body.classList.contains('sc-stale')));
  ok('SCREEN button lit on master', await p.evaluate(()=>document.querySelector('#timerCard .scrbtn').classList.contains('act')));

  // --- run the timer, check the screen follows ---
  await p.evaluate(()=>{ const t=TIMERS[0]; t.el.inM.value=3; t.el.inS.value=0;
                         t.el.inS.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(300);
  await p.click('#timerCard .btns .btn.go');
  await p.waitForTimeout(1500);

  const a = await p.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
  const s1 = await scr.evaluate(()=>document.querySelector('.card.solo-on .readout.tmr').textContent.trim());
  ok('screen counts down with the master', a===s1, 'master='+a+' screen='+s1);

  // millisecond agreement: sample both at the same instant
  const drift = await (async()=>{
    const out=[];
    for(let i=0;i<6;i++){
      const [ma,sa] = await Promise.all([
        p.evaluate(()=>{const t=TIMERS[0];return t.end-performance.now();}),
        scr.evaluate(()=>{const t=TIMERS.find(x=>x.card.classList.contains('solo-on'));return t.end-performance.now();})
      ]);
      out.push(Math.abs(ma-sa)); await p.waitForTimeout(250);
    }
    return Math.max(...out);
  })();
  ok('deadline agreement under 60 ms (max '+Math.round(drift)+' ms)', drift<60);

  // --- pause / resume / adjust ---
  await p.click('#timerCard .btns .btn.pause');
  await p.waitForTimeout(500);
  const mp = await p.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
  await p.waitForTimeout(900);
  const sp = await scr.evaluate(()=>document.querySelector('.card.solo-on .readout.tmr').textContent.trim());
  ok('pause is mirrored (frozen)', mp===sp, mp+' vs '+sp);

  await p.click('#timerCard .presets button');   // +1 MIN
  await p.waitForTimeout(600);
  const m2 = await p.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
  const s2 = await scr.evaluate(()=>document.querySelector('.card.solo-on .readout.tmr').textContent.trim());
  ok('preset adjust is mirrored', m2===s2, m2+' vs '+s2);

  // --- rename / recolour ---
  await p.click('#timerCard .editbtn'); await p.waitForSelector('#timerModal.open');
  await p.fill('#tmName','PLATEAU'); await p.click('.tm-sw[data-c="#00c2ff"]'); await p.click('#tmOk');
  await p.waitForTimeout(700);
  ok('rename is mirrored', (await scr.evaluate(()=>document.querySelector('.card.solo-on .t-name').textContent.trim()))==='PLATEAU');
  ok('colour is mirrored', (await scr.evaluate(()=>document.querySelector('.card.solo-on').style.getPropertyValue('--tcol')))==='#00c2ff');

  // --- dial view follows ---
  await p.click('#timerView'); await p.waitForTimeout(600);
  ok('dial view is mirrored', await scr.evaluate(()=>document.querySelector('.card.solo-on').classList.contains('dialmode')));
  await p.click('#timerView'); await p.waitForTimeout(500);

  // --- the screen never speaks ---
  ok('sound disabled on the screen', await scr.evaluate(()=>{
       const t=TIMERS.find(x=>x.card.classList.contains('solo-on')); return t.sound===false;}));

  // --- the screen dims when the control window stops talking ---
  // an orphan screen (its own tab, no control window) must dim, then recover
  {
    const cid = await p.evaluate(()=>document.querySelector('#timerCard').dataset.cid);
    const orphanCtx = await b.newContext({viewport:{width:900,height:600}});
    const orphan = await orphanCtx.newPage();
    orphan.on('pageerror',e=>errs.push('ORPHAN '+e));
    await orphan.goto(F+'?tool=timer&screen=1&cid='+cid);
    await orphan.waitForTimeout(3600);
    ok('an orphan screen dims', await orphan.evaluate(()=>document.body.classList.contains('sc-stale')));
    await orphanCtx.close();
  }
  // and BroadcastChannel keeps a reloaded screen alive without its opener
  {
    const cid = await p.evaluate(()=>document.querySelector('#timerCard').dataset.cid);
    const solo = await c.newPage();
    solo.on('pageerror',e=>errs.push('RELOADED '+e));
    await solo.goto(F+'?tool=timer&screen=1&cid='+cid);
    await solo.waitForTimeout(1800);
    ok('a screen with no opener still syncs (BroadcastChannel)',
       await solo.evaluate(()=>!document.body.classList.contains('sc-stale')));
    const ms = await p.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
    const ss = await solo.evaluate(()=>document.querySelector('.card.solo-on .readout.tmr').textContent.trim());
    ok('  and shows the same time', ms===ss, ms+' vs '+ss);
    await solo.close();
  }

  // --- toggling the button closes the screen ---
  const closed = new Promise(r=>scr.once('close',r));
  await p.click('#timerCard .scrbtn');
  await Promise.race([closed, new Promise(r=>setTimeout(r,2500))]);
  ok('button closes the second screen', scr.isClosed());
  await p.waitForTimeout(400);
  ok('button no longer lit', await p.evaluate(()=>!document.querySelector('#timerCard .scrbtn').classList.contains('act')));

  // --- closing the control window takes its screens with it ---
  const [scrB] = await Promise.all([ c.waitForEvent('page'), p.click('#clockCard .scrbtn') ]);
  await scrB.waitForLoadState(); await scrB.waitForTimeout(900);
  ok('clock screen opened', await scrB.evaluate(()=>document.querySelector('.card.solo-on').dataset.type)==='clock');
  ok('clock screen is never stale', await scrB.evaluate(()=>!document.body.classList.contains('sc-stale')));
  const closedB = new Promise(r=>scrB.once('close',r));
  await p.close();
  await Promise.race([closedB, new Promise(r=>setTimeout(r,2500))]);
  ok('closing the control window closes its screens', scrB.isClosed());

  ok('no JS error anywhere', errs.length===0, errs.join(' | '));
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
