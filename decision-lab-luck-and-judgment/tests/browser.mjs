import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const pw=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await pw.chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
await fs.mkdir('evidence',{recursive:true});
const checks=[],errors=[],external=[];
function check(name){checks.push(name);console.log('PASS '+name);}
async function viewportFit(page,label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label+' horizontal overflow');}
async function choose(page,round,{investigate=true,wait=false}={}){
 if(investigate)await page.locator('[data-action=investigate]').click();
 await page.locator(`input[name=stake][value="${wait?0:round===1?200000:100000}"]`).check();
 await page.locator('input[name=reason][value=boundary]').check();
 await page.locator('input[name=reason][value=condition]').check();
 await page.locator('textarea').fill(round===0?'<img src=x onerror=alert(1)> 等待公告证据。':'如果关键证据改变，我会重新评估。');
 await page.locator('input[name=confidence][value="50"]').check();
 if(investigate)await page.locator('select[name=update]').selectOption('reduce');
 await page.getByRole('button',{name:'锁定决定，看模拟结果'}).click();
 await page.getByRole('heading',{name:'同一个选择，五条模拟路径'}).waitFor();
}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await context.newPage();page.setDefaultTimeout(10000);
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(base);await page.getByRole('heading',{name:'你赚了钱， 但你真的 做对了吗？'}).waitFor();
 await page.screenshot({path:'evidence/01-desktop-intro.png',fullPage:true,animations:'disabled'});await viewportFit(page,'desktop');check('desktop landing and first render');
 await page.locator('[data-action=start]').click();await page.getByRole('button',{name:'锁定决定，看模拟结果'}).click();assert.match(await page.locator('#form-error').innerText(),/选择/);assert.equal(await page.locator('.path-card').count(),0);check('missing choice blocks reveal');
 for(let round=0;round<5;round++){
  await choose(page,round,{investigate:round!==2,wait:round===4});await viewportFit(page,'result '+round);
  assert.equal(await page.locator('.path-card').count(),5);
  if(round===0){await page.locator('.record summary').click();assert.ok((await page.locator('.saved-note').innerText()).includes('<img'));assert.equal(await page.locator('.saved-note img').count(),0);await page.screenshot({path:'evidence/02-desktop-result.png',fullPage:true,animations:'disabled'});}
  await page.locator('[data-action=next]').click();
 }
 await page.getByRole('heading',{name:'带走你的理由， 不只是一串数字。'}).waitFor();assert.equal(await page.locator('.summary-stats>div:nth-child(2) b').innerText(),'¥10,000');check('five-node mixed main flow, payment completion, safe note rendering');
 await page.locator('#replay-select').selectOption('2');assert.match(await page.locator('.replay-overview').innerText(),/它说得很确定/);check('locked per-round replay');
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-action=download]').click();const download=await downloadPromise;await download.saveAs('evidence/sample-report.json');const report=JSON.parse(await fs.readFile('evidence/sample-report.json','utf8'));assert.equal(report.records.length,5);assert.equal(report.paidExpensesCents,1000000);check('local JSON export');
 await page.screenshot({path:'evidence/03-desktop-summary.png',fullPage:true,animations:'disabled'});
 await page.locator('[data-action=same-seed]').click();assert.match(await page.locator('.cash-value').innerText(),/20,000/);check('same-seed replay resets state');
 await page.locator('[data-action=reset]').click();await page.getByRole('button',{name:'继续这一局'}).click();assert.equal(await page.locator('#reset-dialog').isVisible(),false);await page.locator('[data-action=reset]').click();await page.getByRole('button',{name:'清空并返回开场'}).click();assert.equal(await page.locator('[data-action=start]').count(),1);check('reset cancel and confirm');
 // Entire first decision and reset with keyboard only.
 await page.reload();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link');await page.keyboard.press('Enter');
 async function tabTo(selector){for(let i=0;i<90;i++){if(await page.locator(selector).evaluate(el=>el===document.activeElement))return;await page.keyboard.press('Tab');}throw Error('Keyboard focus unreachable: '+selector);}
 await tabTo('[data-action=start]');await page.keyboard.press('Enter');await tabTo('[data-action=investigate]');await page.keyboard.press('Enter');
 await tabTo('input[name=stake][value="0"]');await page.keyboard.press('Space');await tabTo('input[name=reason][value=boundary]');await page.keyboard.press('Space');await tabTo('input[name=confidence][value="25"]');await page.keyboard.press('Space');await tabTo('.commit-button');await page.keyboard.press('Enter');await page.locator('.path-card').first().waitFor();assert.equal(await page.locator('.result-number strong').innerText(),'¥0');check('keyboard-only investigate, wait, reason, confidence and reveal');
 await tabTo('[data-action=reset]');await page.keyboard.press('Enter');assert.equal(await page.locator('#cancel-reset').evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#reset-dialog').isVisible(),false);check('dialog keyboard focus and Escape');
 // 375px touch viewport, every phase and full all-wait run.
 const mobile=await browser.newContext({viewport:{width:375,height:812},deviceScaleFactor:2,isMobile:true,hasTouch:true});const m=await mobile.newPage();m.setDefaultTimeout(10000);m.on('pageerror',e=>errors.push(e.message));await m.goto(base);await viewportFit(m,'mobile landing');await m.screenshot({path:'evidence/04-mobile-intro.png',fullPage:true,animations:'disabled'});await m.locator('[data-action=start]').click();
 for(let round=0;round<5;round++){await viewportFit(m,'mobile decision '+round);if(round===0)await m.screenshot({path:'evidence/05-mobile-decision.png',fullPage:true,animations:'disabled'});await choose(m,round,{wait:true});await viewportFit(m,'mobile result '+round);if(round===0)await m.screenshot({path:'evidence/06-mobile-result.png',fullPage:true,animations:'disabled'});await m.locator('[data-action=next]').click();}
 await viewportFit(m,'mobile summary');assert.equal(await m.locator('.summary-stats>div:first-child b').innerText(),'¥10,000');await m.screenshot({path:'evidence/07-mobile-summary.png',fullPage:true,animations:'disabled'});check('375px touch viewport complete all-wait flow; no overflow');
 await m.locator('[data-action=new-seed]').click();assert.equal(await m.locator('.cash-value').innerText(),'¥20,000');check('new seed restart');
 await m.setViewportSize({width:320,height:740});await viewportFit(m,'320px');check('320px narrow layout');
 assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal(await page.evaluate(()=>sessionStorage.length),0);const cookieNames=(await context.cookies()).map(c=>c.name);console.log('Observed platform cookie names (no values): '+JSON.stringify(cookieNames));if(base.startsWith('http://127.0.0.1'))assert.deepEqual(cookieNames,[]);else assert.ok(cookieNames.every(n=>['__cf_bm','_cfuvid','__Host-appgarden-visitor'].includes(n)), 'Unexpected hosted cookie');assert.deepEqual(external,[]);assert.deepEqual(errors,[]);check('no external requests, client storage or JavaScript errors; hosting cookies checked separately');
 await fs.writeFile('evidence/browser-results.json',JSON.stringify({base,checks,errors,external,cookieNames,passed:true},null,2));
}finally{await browser.close();}
