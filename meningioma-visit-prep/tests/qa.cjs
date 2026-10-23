const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-output');fs.mkdirSync(out,{recursive:true});
(async()=>{
 let server;let origin=process.env.QA_URL;
 if(!origin){server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);const filename=path.resolve(root,'dist','.'+(pathname==='/'?'/index.html':pathname));if(!filename.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403);return res.end();}try{const ext=path.extname(filename);res.setHeader('Content-Type',{'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.zip':'application/zip'}[ext]||'application/octet-stream');res.end(fs.readFileSync(filename));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;}
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||chromium.executablePath()});
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage(),requests=[],errors=[];
 page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));page.on('pageerror',e=>errors.push(e.message));
 const checks=[];const ok=x=>checks.push(x);
 try{
 await page.goto(origin+'/index.html');await page.waitForLoadState('networkidle');const initialRequests=requests.length;
 assert.equal(await page.locator('#report-text').inputValue(),'');assert.equal(await page.locator('#download').isDisabled(),true);ok('empty state');
 await page.screenshot({path:path.join(out,'mobile-390.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);ok('390px no horizontal overflow');
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');ok('keyboard focus available');
 await page.locator('#report-date').fill('2999-01-01');await page.locator('button[type=submit]').click();assert.match(await page.locator('#errors').innerText(),/日期/);ok('future date rejected');
 await page.locator('#report-date').fill('2026-01-01');await page.locator('#size').fill('-1 x 0');await page.locator('button[type=submit]').click();assert.match(await page.locator('#errors').innerText(),/大于 0/);ok('negative and zero size rejected');
 await page.locator('#size').fill('12 × 8 × 6');await page.locator('button[type=submit]').click();assert.match(await page.locator('#errors').innerText(),/单位/);ok('missing unit rejected');
 await page.locator('#unit').selectOption('mm');
 const marker='SYNTHETIC_QA_ONLY 报告写“考虑，可能，待排”。<img src="https://invalid.example/LEAK_SENTINEL">';
 await page.locator('#report-text').fill(marker);await page.locator('#location').fill('合成部位，仅测试');await page.locator('[value=comparison]').check();await page.locator('#personal-questions').fill('合成测试问题，不是真实病情。');
 await page.locator('button[type=submit]').click();assert.equal(await page.locator('#quote').innerText(),marker);assert.equal(await page.locator('#quote img').count(),0);assert.match(await page.locator('#questions').innerText(),/既往影像/);ok('original qualifiers preserved and markup escaped');
 const dl=page.waitForEvent('download');await page.locator('#download').click();const download=await dl;const file=path.join(out,'summary.txt');await download.saveAs(file);const text=fs.readFileSync(file,'utf8');assert.match(text,/12 × 8 × 6 mm/);assert(text.includes(marker));assert.match(text,/不构成诊断/);ok('UTF-8 download includes exact user entry and limits');
 await page.evaluate(()=>{window.print=()=>{window.__printCalled=true;};});await page.locator('#print').click();assert.equal(await page.evaluate(()=>window.__printCalled),true);await page.emulateMedia({media:'print'});assert.equal(await page.locator('.editor').isVisible(),false);assert.equal(await page.locator('#summary-content').isVisible(),true);await page.pdf({path:path.join(out,'print-summary.pdf'),format:'A4'});await page.emulateMedia({media:'screen'});ok('print action and summary-only PDF');
 await page.locator('#report-text').fill(marker+' 修改');assert.equal(await page.locator('#download').isDisabled(),true);assert.equal(await page.locator('#quote').innerText(),'');ok('stale summary invalidated on edit');
 await page.locator('#location-unknown').check();await page.locator('#size-unknown').check();assert.equal(await page.locator('#size').inputValue(),'');assert.equal(await page.locator('#size').isDisabled(),true);await page.locator('button[type=submit]').click();assert.match(await page.locator('#facts').innerText(),/未知/);ok('unknown fields clear stale values');
 await page.locator('#clear').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#report-text').inputValue(),'');assert.equal(await page.locator('#quote').innerText(),'');assert.equal(await page.locator('#download').isDisabled(),true);ok('keyboard clear removes form and summary');
 assert.equal(requests.length,initialRequests);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);const cookies=await context.cookies();assert(cookies.every(c=>c.httpOnly&&['__Host-appgarden-visitor','__cf_bm'].includes(c.name)));assert(cookies.every(c=>!c.value.includes('SYNTHETIC')&&!c.value.includes('LEAK_SENTINEL')));ok('zero input-related requests; no local/session storage; only known HttpOnly hosting cookies, no patient text');
 await page.locator('#report-text').fill(marker);await page.reload();assert.equal(await page.locator('#report-text').inputValue(),'');ok('refresh clears input');
 await page.locator('#report-text').fill(marker);await page.locator('a[href="research.html"]').click();await page.waitForLoadState('networkidle');assert.match(await page.locator('h1').innerText(),/研究模型/);assert.match(await page.locator('.banner').innerText(),/尚未训练/);assert.match(await page.locator('.banner').innerText(),/未临床验证/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:path.join(out,'research-mobile.png'),fullPage:true});ok('research status and mobile layout');
 const zipPromise=page.waitForEvent('download');await page.locator('[href="research-scaffold.zip"]').click();await (await zipPromise).saveAs(path.join(out,'research-scaffold.zip'));ok('research ZIP download');
 await page.goBack();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#report-text').inputValue(),'');ok('back-navigation clears input');
 await page.goto(origin+'/privacy.html');await page.waitForLoadState('networkidle');assert.match(await page.locator('main').innerText(),/IP 地址/);assert.match(await page.locator('main').innerText(),/localStorage/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);ok('privacy boundaries present');
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/index.html');await page.screenshot({path:path.join(out,'desktop-1440.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);ok('desktop layout');
 await page.locator('#report-text').fill('SYNTHETIC '.repeat(1200));await page.locator('button[type=submit]').click();assert.equal(await page.locator('#quote').innerText(),(await page.locator('#report-text').inputValue()).trim());ok('long report');
 // A supported registry can be feature-injected without transmitting content.
 await page.addInitScript(()=>{window.__registered=[];Object.defineProperty(document,'modelContext',{value:{registerTool:(tool)=>{window.__registered.push(tool);}}});});await page.reload();await page.locator('#report-text').fill('SYNTHETIC WEBMCP');
 assert.equal(await page.evaluate(()=>window.__registered[0].name),'clear_visit_preparation');
 assert.equal(await page.evaluate(async()=>{try{await window.__registered[0].execute({confirm:false});return false;}catch{return true;}}),true);
 assert.equal(await page.locator('#report-text').inputValue(),'SYNTHETIC WEBMCP');assert.deepEqual(await page.evaluate(()=>window.__registered[0].execute({confirm:true})),{cleared:true});assert.equal(await page.locator('#report-text').inputValue(),'');ok('WebMCP mock contract: invalid input preserves state, valid clears; native browser support unavailable');
 assert.deepEqual(errors,[]);ok('no page runtime errors');
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({tested_at:new Date().toISOString(),origin,anonymous:true,checks,request_count:requests.length,input_network_requests:0,page_errors:errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,origin},null,2));
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
