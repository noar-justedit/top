const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
let pass=0, fail=0;
const ok=(n,c,d='')=>{ c?pass++:fail++; console.log((c?'  ok  ':'  FAIL'), n, c?'':d); };

(async()=>{
  const b = await chromium.launch();

  // ---- core flows ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900}});
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(1000);
    const blur = async()=>{ await p.evaluate(()=>document.activeElement&&document.activeElement.blur()); };
    ok('boot without JS error', errs.length===0, errs.join('|'));
    ok('4 default cards', await p.$$eval('.grid > .card', n=>n.length)===4);
    ok('page revealed', await p.evaluate(()=>!document.documentElement.classList.contains('booting')));

    await p.click('#timerCard .label'); await blur();
    await p.keyboard.press('Space'); await p.waitForTimeout(1200);
    ok('timer counts down', (await p.textContent('#timerCard .readout')).trim()!=='05:00');
    await p.keyboard.press('Space'); await blur();
    await p.keyboard.press('r'); await p.waitForTimeout(200);
    ok('timer resets to zero', (await p.textContent('#timerCard .readout')).trim().startsWith('00:00'));
    await blur(); await p.keyboard.press('c'); await p.waitForTimeout(900);
    ok('stopwatch runs', !/^00:00:00[.,]?0?0?$/.test((await p.textContent('#chronoCard .readout')).trim()));
    await blur(); await p.keyboard.press('c'); await blur(); await p.keyboard.press('x'); await p.waitForTimeout(200);
    ok('stopwatch resets', (await p.textContent('#chronoCard .readout')).trim().startsWith('00:00:00'));

    for (const [k,type] of [['F1','clock'],['F2','timer'],['F3','chrono'],['F4','media']]) {
      await blur(); await p.keyboard.press(k); await p.waitForTimeout(400);
      const vis = await p.$$eval('.grid > .card', ns => ns.filter(n=>getComputedStyle(n).display!=='none').map(n=>n.dataset.type));
      ok('maximize '+k+' → '+type, vis.length===1 && vis[0]===type, JSON.stringify(vis));
      ok('  no page scroll in '+k, await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    }
    ok('back to 4 cards', await p.$$eval('.grid > .card', n=>n.filter(x=>getComputedStyle(x).display!=='none').length)===4);
    ok('AWAKE button present', await p.$('#wakeBtn')!==null);
    ok('SCREEN button on every card', await p.$$eval('.grid > .card', ns=>ns.every(n=>!!n.querySelector('.scrbtn'))));
    await p.fill('#gsCols','3'); await p.press('#gsCols','Enter'); await p.waitForTimeout(400);
    ok('grid 3 cols', (await p.evaluate(()=>getComputedStyle(document.querySelector('.grid')).gridTemplateColumns)).split(' ').length===3);
    await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open .cp-opt');
    await p.click('#cardPicker .cp-opt[data-type="timer"]'); await p.click('#cpOk');
    await p.waitForSelector('#timerModal.open');
    await p.fill('#tmName','Keynote'); await p.fill('#tmM','22'); await p.click('#tmOk'); await p.waitForTimeout(600);
    ok('card added', await p.$$eval('.grid > .card', n=>n.length)>=5);
    ok('new card has a SCREEN button', await p.evaluate(()=>{
        const c=[...document.querySelectorAll('.grid > .card')].find(x=>{const n=x.querySelector('.t-name');return n&&n.textContent.trim()==='Keynote';});
        return !!(c && c.querySelector('.scrbtn'));}));
    ok('no JS error overall', errs.length===0, errs.join('|'));
    await c.close();
  }

  // ---- clock never clipped when maximized ----
  for (const [w,h] of [[1920,1080],[1440,900],[1280,800],[1080,810],[810,1080],[1024,768],[768,1024],[390,844],[844,390]]) {
    const c = await b.newContext({viewport:{width:w,height:h}}); const p = await c.newPage();
    await p.goto(F); await p.waitForTimeout(800); await p.keyboard.press('F1'); await p.waitForTimeout(600);
    const r = await p.evaluate(()=>{const d=document.querySelector('#clockCard .dial-wrap').getBoundingClientRect();
      return {fits:d.bottom<=innerHeight+1&&d.right<=innerWidth+1&&d.top>=-1&&d.left>=-1,
              scroll:document.documentElement.scrollHeight<=innerHeight+1, size:Math.round(d.width)};});
    ok(`clock maximized ${w}x${h} (${r.size}px)`, r.fits && r.scroll, JSON.stringify(r));
    await c.close();
  }

  // ---- maximized dials fill the page ----
  for (const [w,h] of [[1920,1080],[1440,900],[810,1080]]) {
    const c = await b.newContext({viewport:{width:w,height:h}}); const p = await c.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(800);
    await p.keyboard.press('F4'); await p.waitForTimeout(700);
    let r = await p.evaluate(()=>{const d=document.querySelector('#mediaCard .dial-sm').getBoundingClientRect();
      return {size:Math.round(d.width), fits:d.bottom<=innerHeight+1, scroll:document.documentElement.scrollHeight<=innerHeight+1,
              use:d.width/Math.min(innerWidth,innerHeight)};});
    ok(`media dial maximized ${w}x${h} (${r.size}px)`, r.fits&&r.scroll&&r.use>0.4, JSON.stringify(r));
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    await p.click('#timerView'); await p.waitForTimeout(250);
    await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
    await p.keyboard.press('F2'); await p.waitForTimeout(800);
    r = await p.evaluate(()=>{const d=document.querySelector('#timerCard .dial-sm').getBoundingClientRect();
      return {size:Math.round(d.width), vis:d.height>0, fits:d.bottom<=innerHeight+1,
              scroll:document.documentElement.scrollHeight<=innerHeight+1, use:d.width/Math.min(innerWidth,innerHeight)};});
    ok(`timer dial maximized ${w}x${h} (${r.size}px)`, r.vis&&r.fits&&r.scroll&&r.use>0.35, JSON.stringify(r));
    ok(`  no JS error ${w}x${h}`, errs.length===0, errs.join('|'));
    await c.close();
  }

  // ---- OBS media scene name stays inside the ring ----
  for (const [w,h] of [[1440,900],[810,1080],[390,844]]) {
    const c = await b.newContext({viewport:{width:w,height:h}}); const p = await c.newPage();
    await p.goto(F); await p.waitForTimeout(800);
    await p.evaluate(()=>{document.getElementById('mSbScene').textContent='PLATEAU PRINCIPAL — CAMERA 3 LONGUE FOCALE';
      window.dispatchEvent(new Event('resize'));});
    await p.waitForTimeout(300);
    const r = await p.evaluate(()=>{const e=document.getElementById('mSbScene'),
      wr=document.querySelector('#mTdial .dial-wrap').getBoundingClientRect(), b=e.getBoundingClientRect();
      const cx=wr.left+wr.width/2, cy=wr.top+wr.height/2, R=wr.width*0.415;
      const far=Math.max(...[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].map(([x,y])=>Math.hypot(x-cx,y-cy)));
      return {far:Math.round(far), ring:Math.round(R), txt:e.textContent.slice(0,6)};});
    ok(`scene name inside ring ${w}x${h}`, r.far<=r.ring, JSON.stringify(r));
    ok(`  no "Scene:" prefix ${w}x${h}`, r.txt.indexOf('Scene')!==0);
    await c.close();
  }

  // ---- blocked localStorage ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900}});
    await c.addInitScript(()=>{ Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}}); });
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F); await p.waitForTimeout(900);
    ok('survives blocked storage', errs.length===0 && await p.$$eval('.grid > .card',n=>n.length)===4, errs.join('|'));
    await c.close();
  }

  // ---- OBS browser sources ----
  for (const q of ['?tool=clock&obs=1','?tool=timer&obs=1','?tool=timer&obs=1&dial=1','?tool=chrono&obs=1',
                   '?tool=chrono&obs=1&dial=1','?tool=media&obs=1','?tool=media',
                   '?tool=xtimer&obs=1&name=Keynote&color=%2300c2ff&dur=1320']) {
    const c = await b.newContext({viewport:{width:1280,height:720}}); const p = await c.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    await p.goto(F+q); await p.waitForTimeout(1300);
    const vis = await p.evaluate(()=>[...document.querySelectorAll('.grid > .card')]
      .filter(n=>{const s=getComputedStyle(n), r=n.getBoundingClientRect();
                  return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;}).length);
    ok('OBS '+q, errs.length===0 && vis===1, errs.join('|')+' visible='+vis);
    ok('  no second-screen chrome in OBS', await p.evaluate(()=>!document.querySelector('.sc-fs')));
    await c.close();
  }

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
