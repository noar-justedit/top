const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
let pass=0, fail=0;
const ok=(n,c,d='')=>{ c?pass++:fail++; console.log((c?'  ok  ':'  FAIL'), n, c?'':d); };
const keys = pg => pg.evaluate(()=>[...document.querySelectorAll('.grid > .card')]
   .map(c=>c.dataset.type+'|'+(c.dataset.cid||'')));

(async()=>{
  const b = await chromium.launch();
  const c = await b.newContext({viewport:{width:1920,height:1080}});
  const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('MASTER '+e));
  await p.goto(F); await p.waitForTimeout(1100);

  const [s] = await Promise.all([ c.waitForEvent('page'), p.click('#screenBtn') ]);
  s.on('pageerror',e=>errs.push('SCREEN '+e));
  await s.waitForLoadState(); await s.waitForTimeout(1800);

  ok('grid screen opened', true);
  ok('screen-grid mode, not obs-mode', await s.evaluate(()=>
      document.body.classList.contains('screen-grid') && !document.body.classList.contains('obs-mode')));
  ok('top bar hidden', await s.evaluate(()=>getComputedStyle(document.querySelector('.topbar')).display==='none'));
  ok('same cards as the control window', JSON.stringify(await keys(s))===JSON.stringify(await keys(p)));
  ok('not stale', await s.evaluate(()=>!document.body.classList.contains('sc-stale')));
  ok('SCREEN button lit', await p.evaluate(()=>document.getElementById('screenBtn').classList.contains('act')));

  const hidden = sel => s.evaluate(sel=>{
      const els=[...document.querySelectorAll(sel)];
      return els.length===0 || els.every(e=>{const r=e.getBoundingClientRect();return r.width===0||r.height===0;});
    }, sel);
  ok('no card buttons',   await hidden('.grid .cardbtns'));
  ok('no start/reset',    await hidden('.grid .btns'));
  ok('no presets',        await hidden('.grid .presets'));
  ok('no +/- steppers',   await hidden('.grid .time-input'));
  ok('no sound switches', await hidden('.grid .sound-sw'));
  ok('no OBS settings',   await hidden('.grid .media-ws-settings'));
  ok('no drag handles',   await hidden('.grid .draghandle'));
  ok('no splitters',      await hidden('.grid-splitter'));
  ok('card names shown',  await s.evaluate(()=>[...document.querySelectorAll('.grid > .card .label')]
      .every(l=>{const r=l.getBoundingClientRect();return r.width>0&&l.textContent.trim().length>0;})));

  // ---- the timer and stopwatch follow ----
  await p.click('#timerCard .btns .btn.go');
  await p.click('#chronoCard .btns .btn.go');
  await p.waitForTimeout(1500);
  const mt = await p.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
  const st = await s.evaluate(()=>document.querySelector('#timerCard .readout.tmr').textContent.trim());
  ok('timer mirrored', mt===st, mt+' vs '+st);
  const drift = await (async()=>{ const o=[];
    for(let i=0;i<5;i++){
      const [a,x]=await Promise.all([p.evaluate(()=>TIMERS[0].end-performance.now()),
                                     s.evaluate(()=>TIMERS[0].end-performance.now())]);
      o.push(Math.abs(a-x)); await p.waitForTimeout(220);
    } return Math.max(...o); })();
  ok('timer agreement under 60 ms (max '+Math.round(drift)+' ms)', drift<60);
  const cdrift = await (async()=>{ const o=[];
    for(let i=0;i<5;i++){
      const [a,x]=await Promise.all([p.evaluate(()=>CHRONOS[0].elapsed()),
                                     s.evaluate(()=>CHRONOS[0].elapsed())]);
      o.push(Math.abs(a-x)); await p.waitForTimeout(220);
    } return Math.max(...o); })();
  ok('stopwatch agreement under 60 ms (max '+Math.round(cdrift)+' ms)', cdrift<60);
  await p.click('#timerCard .btns .btn.pause'); await p.click('#chronoCard .btns .btn.pause');
  await p.waitForTimeout(800);

  // ---- rename / recolour / dial view ----
  await p.click('#timerCard .editbtn'); await p.waitForSelector('#timerModal.open');
  await p.fill('#tmName','PLATEAU'); await p.click('.tm-sw[data-c="#00c2ff"]'); await p.click('#tmOk');
  await p.waitForTimeout(800);
  ok('rename mirrored', (await s.evaluate(()=>document.querySelector('#timerCard .t-name').textContent.trim()))==='PLATEAU');
  ok('colour mirrored', (await s.evaluate(()=>document.querySelector('#timerCard').style.getPropertyValue('--tcol')))==='#00c2ff');
  // ---- one view at a time, the one chosen on the control window ----
  const views = pg => pg.evaluate(()=>['#timerCard','#chronoCard','#mediaCard'].map(id=>{
      const c=document.querySelector(id);
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return id+':'+c.classList.contains('dialmode')+'/'+vis(c.querySelector('.flat-view'))
             +'/'+vis(c.querySelector('.dial-view'));
    }));
  const sameViews = async lbl => {
    const [a,x] = await Promise.all([views(p), views(s)]);
    ok('views match the control window — '+lbl, JSON.stringify(a)===JSON.stringify(x),
       JSON.stringify(a)+' vs '+JSON.stringify(x));
    const both = x.filter(v=>{const t=v.split(':')[1].split('/');
                              return v.indexOf('#mediaCard')!==0 && t[1]==='true' && t[2]==='true';});
    ok('  no card shows both views — '+lbl, both.length===0, both.join(','));
  };
  await sameViews('digital');
  await p.click('#timerView'); await p.click('#chronoView'); await p.waitForTimeout(900);
  ok('dial view mirrored', await s.evaluate(()=>document.querySelector('#timerCard').classList.contains('dialmode')));
  await sameViews('both on dial');
  await p.click('#timerView'); await p.waitForTimeout(800);
  await sameViews('mixed: timer digital, stopwatch dial');
  await p.click('#chronoView'); await p.waitForTimeout(700);

  // ---- the grid shape follows ----
  await p.fill('#gsCols','3'); await p.press('#gsCols','Enter'); await p.waitForTimeout(900);
  const mcols = await p.evaluate(()=>getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length);
  const scols = await s.evaluate(()=>getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length);
  ok('grid shape mirrored', mcols===3 && scols===3, mcols+' vs '+scols);

  // ---- adding a card appears on the screen ----
  await p.click('#newCardBtn'); await p.waitForSelector('#cardPicker.open .cp-opt');
  await p.click('.cp-opt[data-type="timer"]'); await p.click('#cpOk');
  await p.waitForSelector('#timerModal.open');
  await p.fill('#tmName','KEYNOTE'); await p.fill('#tmM','22');
  await p.click('.tm-sw[data-c="#ffb000"]'); await p.click('#tmOk');
  await p.waitForTimeout(1400);
  ok('added card appears on the screen', JSON.stringify(await keys(s))===JSON.stringify(await keys(p)),
     JSON.stringify(await keys(s))+' vs '+JSON.stringify(await keys(p)));
  ok('added card keeps its name', await s.evaluate(()=>
      [...document.querySelectorAll('.grid .t-name')].some(n=>n.textContent.trim()==='KEYNOTE')));
  const kcid = await p.evaluate(()=>{
    const c=[...document.querySelectorAll('.grid > .card')].find(x=>{const n=x.querySelector('.t-name');return n&&n.textContent.trim()==='KEYNOTE';});
    return c.dataset.cid;});
  await p.click('.card[data-cid="'+kcid+'"] .btns .btn.go'); await p.waitForTimeout(1400);
  const km = await p.evaluate(c=>document.querySelector('.card[data-cid="'+c+'"] .readout.tmr').textContent.trim(), kcid);
  const ks = await s.evaluate(c=>document.querySelector('.card[data-cid="'+c+'"] .readout.tmr').textContent.trim(), kcid);
  ok('the new card counts down on the screen', km===ks, km+' vs '+ks);

  // ---- closing a card removes it from the screen ----
  p.on('dialog', d=>d.accept());
  await p.click('.card[data-cid="'+kcid+'"] .closebtn'); await p.waitForTimeout(1400);
  ok('closed card disappears from the screen', JSON.stringify(await keys(s))===JSON.stringify(await keys(p)),
     JSON.stringify(await keys(s))+' vs '+JSON.stringify(await keys(p)));

  // ---- the screen never writes the saved layout ----
  const saved = await s.evaluate(()=>localStorage.getItem('topCards'));
  const savedM = await p.evaluate(()=>localStorage.getItem('topCards'));
  ok('screen did not rewrite the saved layout', saved===savedM);

  // ---- figures use the room the controls left ----
  const fill = await s.evaluate(()=>{
    const c=document.querySelector('#chronoCard'); const e=c.querySelector('.readout');
    const cr=c.getBoundingClientRect(), r=e.getBoundingClientRect();
    return {use:+(r.width/cr.width).toFixed(2), fits:r.width<=cr.width+1 && r.height<=cr.height+1};});
  ok('figures fill the card ('+fill.use+' of its width)', fill.use>0.5 && fill.fits, JSON.stringify(fill));
  ok('no page scroll', await s.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));

  ok('no JS error anywhere', errs.length===0, errs.join(' | '));
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
