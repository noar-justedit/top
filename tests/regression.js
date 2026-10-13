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

  // ---- empty cells and snap layouts ----
  {
    const c = await b.newContext({viewport:{width:1440,height:900}});
    const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(''+e));
    p.on('dialog', d=>d.accept());
    await p.goto(F); await p.waitForTimeout(1000);
    /* every cell of the grid covered exactly once, read from the cards' own placement */
    const cover = () => p.evaluate(()=>{
      const sh = window._topGridShapeNums(), cells = {};
      const cards = [...document.querySelectorAll('.grid > .card')];
      for(const el of cards){
        const pc = s => { const m = /(\d+) \/ span (\d+)/.exec(s); return m ? [+m[1]-1, +m[2]] : null; };
        const C = pc(el.style.gridColumn), R = pc(el.style.gridRow);
        if(!C || !R) return 'unplaced '+el.dataset.type;
        for(let x=C[0];x<C[0]+C[1];x++) for(let y=R[0];y<R[0]+R[1];y++){
          if(x>=sh.cols || y>=sh.rows) return 'outside';
          const k=x+','+y; if(cells[k]) return 'overlap'; cells[k]=1; }
      }
      return Object.keys(cells).length===sh.cols*sh.rows ? 'ok' : 'hole';
    });
    const span = sel => p.evaluate(sel=>{ const el=document.querySelector(sel);
      return el.style.gridColumn+' | '+el.style.gridRow; }, sel);
    const box = sel => p.evaluate(sel=>{ const r=document.querySelector(sel).getBoundingClientRect();
      return {x:r.x,y:r.y,w:r.width,h:r.height}; }, sel);

    ok('default 2 × 2: every cell covered', await cover()==='ok');
    await p.click('#mediaCard .closebtn'); await p.waitForTimeout(500);
    ok('3 cards in 2 × 2: no empty cell', await cover()==='ok');
    ok('  the card above the empty cell takes it', (await span('#timerCard'))==='2 / span 1 | 1 / span 2', await span('#timerCard'));
    const tb = await box('#timerCard'), cb = await box('#clockCard'), sb = await box('#chronoCard');
    ok('  it runs the full height', Math.abs(tb.h - (sb.y+sb.h-cb.y)) < 3, tb.h+' vs '+(sb.y+sb.h-cb.y));
    const rowSp = await p.$$eval('.grid-splitter.row', ns=>ns.map(n=>n.getBoundingClientRect().width));
    ok('  row splitter stops at the tall card', rowSp.length===1 && rowSp[0] < tb.x, JSON.stringify(rowSp));

    // a real drag: the bar appears, drop on the first zone of "one tall + two stacked"
    const h = await (await p.$('#timerCard .draghandle')).boundingBox();
    await p.mouse.move(h.x+h.width/2, h.y+h.height/2); await p.mouse.down();
    await p.mouse.move(h.x+60, h.y+40, {steps:6}); await p.waitForTimeout(200);
    ok('snap bar stays closed over the grid', await p.evaluate(()=>!document.getElementById('snapBar').classList.contains('open')));
    await p.mouse.move(720, 30, {steps:8}); await p.waitForTimeout(250);
    ok('snap bar opens at the top edge', await p.evaluate(()=>document.getElementById('snapBar').classList.contains('open')));
    const nLays = await p.$$eval('.snap-lay', n=>n.length);
    ok('  several layouts for 3 cards', nLays>=5, ''+nLays);
    const idx = await p.evaluate(()=>window._topLayoutsFor(3).findIndex(l=>
      l.cols===2 && l.rows===2 && l.zones[0].c===0 && l.zones[0].rs===2));
    const z = await (await p.$$('.snap-lay'))[idx].$('.snap-zone');
    const zb = await z.boundingBox();
    await p.mouse.move(zb.x+zb.width/2, zb.y+zb.height/2, {steps:8});
    /* a real browser repeats dragover while the pointer rests; the emulated
       drag only sends one per move, so nudge it once */
    await p.mouse.move(zb.x+zb.width/2+1, zb.y+zb.height/2+1); await p.waitForTimeout(150);
    ok('  hovered zone lit', await z.evaluate(n=>n.classList.contains('over')),
       await p.evaluate(()=>[...document.querySelectorAll('.snap-lay')].map((l,i)=>i+':'+[...l.children].map(z=>z.classList.contains('over')?1:0).join('')).join(' ')));
    await p.mouse.up(); await p.waitForTimeout(500);
    ok('  bar closes after the drop', await p.evaluate(()=>!document.getElementById('snapBar').classList.contains('open')));
    ok('dropped card takes the zone', (await p.$$eval('.grid > .card', n=>n[0].dataset.type))==='timer' &&
       (await span('#timerCard'))==='1 / span 1 | 1 / span 2', await span('#timerCard'));
    ok('  the others fill the rest', await cover()==='ok');
    ok('  order saved', JSON.parse(await p.evaluate(()=>localStorage.getItem('topCards')))[0].type==='timer');

    await p.reload(); await p.waitForTimeout(1000);
    ok('layout survives a reload', (await span('#timerCard'))==='1 / span 1 | 1 / span 2' && await cover()==='ok');
    ok('  grid shape survives a reload', await p.inputValue('#gsCols')==='2' && await p.inputValue('#gsRows')==='2');

    // a layout wider than the GRID field allows is not offered; every offered one is complete
    const allGood = await p.evaluate(()=>{
      for(let n=1;n<=8;n++) for(const l of window._topLayoutsFor(n)){
        const seen=new Set();
        if(l.zones.length!==n || l.cols>8 || l.rows>6) return 'bad size n='+n;
        for(const q of l.zones) for(let x=q.c;x<q.c+q.cs;x++) for(let y=q.r;y<q.r+q.rs;y++){
          const k=x+','+y; if(seen.has(k)||x>=l.cols||y>=l.rows) return 'overlap n='+n; seen.add(k); }
        if(seen.size!==l.cols*l.rows) return 'hole n='+n;
      }
      return 'ok';
    });
    ok('every offered layout fills its grid exactly', allGood==='ok', allGood);

    // maximizing a card that covers two cells still fills the screen
    await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
    await p.keyboard.press('F2'); await p.waitForTimeout(400);
    const gw = await p.evaluate(()=>document.querySelector('.grid').getBoundingClientRect().width);
    ok('maximized tall card fills the width', Math.abs((await box('#timerCard')).w - gw) < 3);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);

    // a fourth card: back to the plain grid; closing it brings the layout back
    await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open .cp-opt');
    await p.click('#cardPicker .cp-opt[data-type="media"]'); await p.click('#cpOk'); await p.waitForTimeout(500);
    ok('4 cards in 2 × 2: plain grid', await cover()==='ok' &&
       (await p.$$eval('.grid > .card', ns=>ns.every(n=>/span 1$/.test(n.style.gridColumn)&&/span 1$/.test(n.style.gridRow)))));
    await p.click('#mediaCard .closebtn'); await p.waitForTimeout(500);
    ok('  closing it brings the layout back', (await span('#timerCard'))==='1 / span 1 | 1 / span 2');

    // typing a shape returns to the plain grid, filled
    await p.fill('#gsCols','3'); await p.press('#gsCols','Enter'); await p.waitForTimeout(400);
    ok('typed 3 × 2 with 3 cards: each card runs both rows', await cover()==='ok' &&
       (await p.$$eval('.grid > .card', ns=>ns.every(n=>/span 2$/.test(n.style.gridRow)))));
    await p.fill('#gsRows','1'); await p.press('#gsRows','Enter'); await p.waitForTimeout(300);
    await p.fill('#gsCols','4'); await p.press('#gsCols','Enter'); await p.waitForTimeout(400);
    ok('typed 4 × 1 with 3 cards: the last card widens', await cover()==='ok' &&
       /span 2$/.test((await p.$$eval('.grid > .card', ns=>ns[2].style.gridColumn))));
    ok('no JS error in layouts', errs.length===0, errs.join('|'));
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
