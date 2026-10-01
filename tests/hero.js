const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '..', 'index.html');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1920,height:1080}, deviceScaleFactor:1});
  p.on('dialog',d=>d.accept());
  await p.goto(F); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  await p.fill('#gsCols','3'); await p.dispatchEvent('#gsCols','change'); await p.waitForTimeout(300);
  for(const [t,n,c,m] of [['timer','Keynote','#00c2ff','22'],['chrono','Chrono régie','#ffb000',null]]){
    await p.click('#newCardBtn'); await p.waitForTimeout(220);
    await p.click(`.cp-opt[data-type="${t}"]`); await p.click('#cpOk'); await p.waitForTimeout(240);
    await p.fill('#tmName',n); await p.click(`.tm-sw[data-c="${c}"]`);
    if(m) await p.fill('#tmM',m);
    await p.click('#tmOk'); await p.waitForTimeout(300);
  }
  await p.evaluate(()=>{
    const t=TIMERS.find(x=>x.name==='Keynote');
    t.el.inM.value=18; t.el.inS.value=42; t.el.inS.dispatchEvent(new Event('change')); t.toggle();
    const m=TIMERS[0]; m.el.inM.value=4; m.el.inS.value=7; m.el.inS.dispatchEvent(new Event('change')); m.toggle();
    CHRONOS[1] && CHRONOS[1].toggle();
    setActiveTimer(t);
  });
  await p.waitForTimeout(2600);
  await p.screenshot({path: require('path').resolve(__dirname, '..', 'screenshot-v2.png')});
  await b.close();
})();
