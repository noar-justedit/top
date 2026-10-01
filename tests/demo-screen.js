const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:1920,height:1080}, deviceScaleFactor:1});
  const p=await c.newPage(); p.on('dialog',d=>d.accept());
  await p.goto(F); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1100);
  await p.fill('#gsCols','3'); await p.dispatchEvent('#gsCols','change'); await p.waitForTimeout(300);
  for(const [t,n,col,m] of [['timer','Keynote','#00c2ff','22'],['chrono','Chrono régie','#ffb000',null]]){
    await p.click('#newCardBtn'); await p.waitForTimeout(220);
    await p.click(`.cp-opt[data-type="${t}"]`); await p.click('#cpOk'); await p.waitForTimeout(240);
    await p.fill('#tmName',n); await p.click(`.tm-sw[data-c="${col}"]`);
    if(m) await p.fill('#tmM',m);
    await p.click('#tmOk'); await p.waitForTimeout(300);
  }
  const [s] = await Promise.all([ c.waitForEvent('page'), p.click('#screenBtn') ]);
  await s.waitForLoadState(); await s.waitForTimeout(1600);
  await p.evaluate(()=>{
    const t=TIMERS.find(x=>x.name==='Keynote');
    t.el.inM.value=18; t.el.inS.value=42; t.el.inS.dispatchEvent(new Event('change')); t.toggle();
    const m=TIMERS[0]; m.el.inM.value=0; m.el.inS.value=24; m.el.inS.dispatchEvent(new Event('change')); m.toggle();
    CHRONOS[1] && CHRONOS[1].toggle();
    document.getElementById('mDlDigits').textContent='00:01:23';
    document.getElementById('mDlDigits').classList.remove('sb-standby');
    document.getElementById('mSbScene').textContent='PLATEAU PRINCIPAL';
    document.getElementById('mCapDial').textContent='Remaining';
    document.getElementById('mRing').style.strokeDashoffset='260';
    document.getElementById('mMediaName').textContent='Generique_ouverture.mov';
    document.getElementById('mMediaName').className='np-val np-live';
    document.getElementById('mSceneName').textContent='PLATEAU PRINCIPAL';
  });
  await s.waitForTimeout(2600);
  await s.evaluate(()=>{const f=document.querySelector('.sc-fs'); if(f) f.remove();});
  await s.screenshot({path: require('path').resolve(__dirname, '..', 'demo-ecran2.png')});
  await p.screenshot({path: require('path').resolve(__dirname, '..', 'demo-regie.png')});
  await b.close();
})();
