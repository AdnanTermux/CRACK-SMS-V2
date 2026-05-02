"""Premium web shells served by api_server (hub home + temp-number flow)."""

PREMIUM_HUB_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Virtual Number Suite</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg0:#05080f;
  --bg1:#0a101c;
  --card:rgba(14,22,38,.82);
  --stroke:rgba(255,255,255,.09);
  --text:#f2f7ff;
  --muted:#92a4bf;
  --a:#5eead4;
  --b:#fda4af;
  --c:#fcd34d;
  --d:#93c5fd;
}
body{
  font-family:'DM Sans',system-ui,sans-serif;
  min-height:100vh;
  color:var(--text);
  background:
    radial-gradient(900px 500px at 12% -10%,rgba(94,234,212,.18),transparent),
    radial-gradient(700px 420px at 92% 8%,rgba(253,164,175,.14),transparent),
    radial-gradient(600px 400px at 40% 110%,rgba(147,197,253,.12),transparent),
    linear-gradient(185deg,var(--bg0),var(--bg1));
}
body::before{
  content:'';
  position:fixed;inset:0;pointer-events:none;opacity:.35;
  background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:56px 56px;
  mask-image:linear-gradient(180deg,#000 0%,transparent 85%);
}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}
  50%{box-shadow:0 0 0 6px rgba(74,222,128,0)}
}
.shell{
  position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:28px 18px 56px;
  animation:fadeIn 350ms ease both;
}
.top{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  flex-wrap:wrap;margin-bottom:28px;
}
.logo{display:flex;align-items:center;gap:14px;text-decoration:none;color:inherit}
.logo-mark{
  width:54px;height:54px;border-radius:18px;display:grid;place-items:center;font-size:1.5rem;
  background:linear-gradient(145deg,rgba(94,234,212,.25),rgba(253,164,175,.18));
  border:1px solid var(--stroke);box-shadow:0 18px 40px rgba(0,0,0,.35);
}
.logo h1{font-size:1.35rem;letter-spacing:-.03em}
.logo span{display:block;font-size:.82rem;color:var(--muted);margin-top:4px}
.logo-status{display:flex;align-items:center;gap:7px;margin-top:5px}
.pulse-dot{
  display:inline-block;width:8px;height:8px;border-radius:50%;
  background:#4ade80;
  animation:pulse 2s ease-in-out infinite;
  flex-shrink:0;
}
.online-label{font-size:.75rem;color:#4ade80;font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.nav-chip{font-size:.78rem;color:var(--muted);font-family:'JetBrains Mono',monospace}
/* ── Stats bar ── */
#statsBar{
  display:flex;flex-wrap:wrap;gap:12px;
  margin-bottom:28px;
  padding:16px 20px;
  border-radius:18px;
  background:var(--card);
  border:1px solid var(--stroke);
  backdrop-filter:blur(16px);
}
.stat-slot{display:flex;flex-direction:column;gap:3px;min-width:110px}
.stat-label{font-size:.72rem;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
.stat-val{font-size:1.35rem;font-weight:700;letter-spacing:-.03em;color:var(--text);font-family:'JetBrains Mono',monospace}
/* ── Section ── */
h2{font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:-.04em;line-height:1.08;margin-bottom:12px}
.lead{color:var(--muted);max-width:54ch;line-height:1.65;margin-bottom:28px;font-size:1.05rem}
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:18px;
}
.card{
  position:relative;
  border-radius:22px;
  padding:22px 20px 20px;
  background:var(--card);
  border:1px solid var(--stroke);
  backdrop-filter:blur(16px);
  text-decoration:none;color:inherit;
  overflow:hidden;
  transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;
  display:flex;flex-direction:column;gap:10px;min-height:168px;
}
.card:hover{
  transform:translateY(-4px);
  border-color:rgba(94,234,212,.35);
  box-shadow:0 22px 50px rgba(0,0,0,.38);
}
.card::after{
  content:'';position:absolute;inset:auto -30% -40% auto;width:180px;height:180px;border-radius:50%;
  background:radial-gradient(circle,var(--glow,rgba(94,234,212,.15)),transparent 65%);
  pointer-events:none;
}
.card span.icon{font-size:1.55rem}
.card h3{font-size:1.08rem;letter-spacing:-.02em}
.card p{font-size:.88rem;color:var(--muted);line-height:1.55;flex:1}
.card .go{margin-top:auto;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--a)}
.card.pink{--glow:rgba(253,164,175,.2)}
.card.sun{--glow:rgba(252,211,77,.18)}
.card.ice{--glow:rgba(147,197,253,.22)}
footer{margin-top:40px;padding-top:22px;border-top:1px solid var(--stroke);color:var(--muted);font-size:.86rem;display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between}
footer a{color:var(--text);text-decoration:none}
footer a:hover{text-decoration:underline}
@media(max-width:520px){
  .shell{padding:20px 14px 40px}
  #statsBar{gap:10px;padding:14px 16px}
  .stat-val{font-size:1.1rem}
}
@media(max-width:320px){
  .grid{grid-template-columns:1fr}
  #statsBar{flex-direction:column}
}
</style>
</head>
<body>
<div class="shell">
  <header class="top">
    <a class="logo" href="/">
      <div class="logo-mark">◇</div>
      <div>
        <h1>Virtual Number Suite</h1>
        <span>Premium console · pick a workspace below</span>
        <div class="logo-status">
          <span class="pulse-dot"></span>
          <span class="online-label">ONLINE</span>
        </div>
      </div>
    </a>
    <div class="nav-chip">secure · isolated pages</div>
  </header>

  <div id="statsBar">
    <div class="stat-slot">
      <span class="stat-label">Total OTPs</span>
      <span class="stat-val" id="statTotal">—</span>
    </div>
    <div class="stat-slot">
      <span class="stat-label">OTPs Today</span>
      <span class="stat-val" id="statToday">—</span>
    </div>
    <div class="stat-slot">
      <span class="stat-label">Available Numbers</span>
      <span class="stat-val" id="statAvail">—</span>
    </div>
  </div>

  <section>
    <h2>Where do you want to go?</h2>
    <p class="lead">Each tool opens on its own page — nothing loads until you choose. Use temp-number pickup for fresh lines, the live wall for OTP traffic, or the API docs for integrations.</p>
    <div class="grid">
      <a class="card" href="/get-number">
        <span class="icon">📱</span>
        <h3>Get number</h3>
        <p>Browse countries as cards, pick a route, and receive a random live line with inbox history — temp-site style.</p>
        <span class="go">Open →</span>
      </a>
      <a class="card pink" href="/live-otp">
        <span class="icon">⚡</span>
        <h3>Live OTP wall</h3>
        <p>Charts, analytics, searchable feed, CSV export, and display preferences on a dedicated dashboard.</p>
        <span class="go">Open →</span>
      </a>
      <a class="card ice" href="/api/docs">
        <span class="icon">📡</span>
        <h3>API reference</h3>
        <p>Public JSON endpoints, authenticated SMS feeds, token routes, and integration examples.</p>
        <span class="go">Open →</span>
      </a>
      <a class="card sun" href="/create-my-bot">
        <span class="icon">🤖</span>
        <h3>Create my bot</h3>
        <p>Submit panel details for the guided Telegram approval queue with owner handoff.</p>
        <span class="go">Open →</span>
      </a>
      <a class="card" href="/track-request">
        <span class="icon">📋</span>
        <h3>Track request</h3>
        <p>Check whether your website packet synced into the admin bot and follow review milestones.</p>
        <span class="go">Open →</span>
      </a>
      <a class="card ice" href="/health">
        <span class="icon">✓</span>
        <h3>Health JSON</h3>
        <p>Quick machine-readable heartbeat for uptime monitors and deployment checks.</p>
        <span class="go">Open →</span>
      </a>
    </div>
  </section>
  <footer>
    <span>Virtual Number Suite · public tooling</span>
    <span><a href="/live-otp">Live OTP</a> · <a href="/get-number">Get number</a> · <a href="/api/docs">API</a></span>
  </footer>
</div>
<script>
(async function loadStats(){
  try{
    const r=await fetch('/api/public/stats');
    const d=await r.json();
    document.getElementById('statTotal').textContent=d.total_otps??'—';
    document.getElementById('statToday').textContent=d.otps_today??'—';
    document.getElementById('statAvail').textContent=d.available_numbers??'—';
  }catch(e){
    document.querySelectorAll('.stat-val').forEach(el=>el.textContent='—');
  }
})();
</script>
</body>
</html>"""


GET_NUMBER_PAGE_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get Number · Virtual Number</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070d18;
  --panel:rgba(12,20,36,.9);
  --line:rgba(255,255,255,.08);
  --txt:#f4f8ff;
  --muted:#8fa3bf;
  --mint:#5eead4;
  --rose:#fb7185;
}
body{
  font-family:'DM Sans',system-ui,sans-serif;
  color:var(--txt);
  min-height:100vh;
  background:
    radial-gradient(700px 420px at 15% 0%,rgba(94,234,212,.14),transparent),
    radial-gradient(600px 380px at 95% 10%,rgba(251,113,133,.12),transparent),
    linear-gradient(180deg,#070d18,#0a1224);
}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.wrap{
  max-width:1100px;margin:0 auto;padding:22px 16px 48px;
  animation:fadeIn 350ms ease both;
}
.top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:22px}
a.home{
  display:inline-flex;align-items:center;gap:8px;color:var(--mint);text-decoration:none;font-weight:600;font-size:.92rem;
}
.brand{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--muted)}
.steps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.steps span{
  padding:8px 14px;border-radius:999px;font-size:.74rem;border:1px solid var(--line);color:var(--muted);
  transition:background .18s ease,border-color .18s ease,color .18s ease;
}
.steps span.on{background:rgba(94,234,212,.12);border-color:rgba(94,234,212,.35);color:#cbfff5;font-weight:600}
h1{font-size:clamp(1.6rem,4vw,2.15rem);letter-spacing:-.03em;margin-bottom:8px}
.sub{color:var(--muted);margin-bottom:22px;line-height:1.55;max-width:62ch}
/* Country grid — minmax(180px, 1fr) */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.c-card{
  cursor:pointer;text-align:left;border-radius:18px;padding:20px 16px 16px;border:1px solid var(--line);
  background:var(--panel);backdrop-filter:blur(14px);color:inherit;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.c-card:hover{transform:translateY(-3px);border-color:rgba(94,234,212,.4);box-shadow:0 16px 36px rgba(0,0,0,.35)}
.c-card .flag{font-size:2.2rem;line-height:1;display:block;margin-bottom:10px}
.c-card .name{font-weight:700;font-size:1rem;margin-bottom:6px}
.c-card .badge{
  display:inline-block;font-size:.72rem;color:var(--mint);font-family:'JetBrains Mono',monospace;
  background:rgba(94,234,212,.1);border:1px solid rgba(94,234,212,.2);
  border-radius:6px;padding:2px 7px;margin-top:4px;
}
/* Service panel */
.panel{display:none;margin-top:22px;padding:22px;border-radius:22px;border:1px solid var(--line);background:var(--panel)}
.panel.show{display:block}
.panel h2{font-size:1.15rem;margin-bottom:6px}
.panel .hint{color:var(--muted);font-size:.88rem;margin-bottom:16px;line-height:1.5}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.svc-btn{
  border-radius:16px;padding:16px;border:1px solid var(--line);
  background:var(--panel);backdrop-filter:blur(14px);
  color:var(--txt);cursor:pointer;font-weight:600;text-align:left;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.svc-btn:hover{transform:translateY(-2px);border-color:rgba(94,234,212,.45);box-shadow:0 10px 24px rgba(0,0,0,.3)}
.svc-btn small{display:block;font-weight:500;color:var(--muted);font-size:.74rem;margin-top:6px;font-family:'JetBrains Mono',monospace}
/* Toolbar + buttons */
.toolbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px}
.btn{
  border:none;border-radius:14px;padding:12px 18px;font-weight:700;cursor:pointer;font-family:inherit;
  transition:opacity .15s ease,transform .15s ease;
}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.btn-mint{background:linear-gradient(135deg,var(--mint),#99f6e4);color:#042f2e}
.btn-ghost{background:rgba(255,255,255,.06);color:var(--txt);border:1px solid var(--line)}
/* Result panel */
.result{display:none;margin-top:22px;padding:24px;border-radius:22px;border:1px solid var(--line);background:linear-gradient(165deg,rgba(94,234,212,.08),rgba(12,20,36,.95))}
.result.show{display:block}
.phone{font-family:'JetBrains Mono',monospace;font-size:clamp(1.5rem,4vw,2.35rem);letter-spacing:.04em;margin:12px 0}
/* Inbox */
.history{margin-top:18px;display:grid;gap:12px}
.h-item{padding:16px;border-radius:16px;background:rgba(0,0,0,.22);border:1px solid var(--line)}
.h-item .ts-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.h-item .ts{font-size:.74rem;color:var(--muted);font-family:'JetBrains Mono',monospace}
.h-item .msg{color:#dfe7f5;font-size:.9rem;line-height:1.6;word-break:break-word}
.h-item .otp-row{margin-top:10px;display:flex;align-items:center;gap:8px}
.h-item .otp-label{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.h-item .otp-val{font-family:'JetBrains Mono',monospace;color:var(--mint);font-size:1.05rem;font-weight:700}
.empty{text-align:center;padding:48px 16px;color:var(--muted);border:1px dashed var(--line);border-radius:18px}
.toast{
  position:fixed;right:18px;bottom:18px;padding:12px 16px;border-radius:14px;background:var(--mint);color:#042f2e;
  font-weight:700;opacity:0;transform:translateY(12px);transition:.22s ease;pointer-events:none;z-index:20;
}
.toast.show{opacity:1;transform:translateY(0)}
@media(max-width:480px){
  .grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .phone{font-size:1.5rem}
}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="home" href="/">← Back to hub</a>
    <span class="brand">GET NUMBER · PUBLIC POOL</span>
  </div>
  <div class="steps" id="steps">
    <span class="on" id="step1Lbl">1 · Country</span>
    <span id="step2Lbl">2 · Service</span>
    <span id="step3Lbl">3 · Your line</span>
  </div>
  <h1>Choose a country</h1>
  <p class="sub">Cards show live inventory from your bot. Pick a country, then a service — we assign one random available number and keep refreshing OTP history below.</p>
  <div id="countryGrid" class="grid"><div class="empty" style="grid-column:1/-1">Loading countries…</div></div>

  <div id="servicePanel" class="panel">
    <h2 id="svcTitle">Services</h2>
    <p class="hint" id="svcHint"></p>
    <div class="toolbar">
      <button type="button" class="btn btn-mint" id="btnRandomSvc">Random service</button>
      <button type="button" class="btn btn-ghost" id="btnBackCountries">← Countries</button>
    </div>
    <div id="serviceGrid" class="svc-grid"></div>
  </div>

  <div id="resultPanel" class="result">
    <div class="toolbar">
      <button type="button" class="btn btn-mint" id="btnCopy">Copy number</button>
      <button type="button" class="btn btn-ghost" id="btnRefresh">Refresh inbox</button>
      <button type="button" class="btn btn-ghost" id="btnChange">New number</button>
      <button type="button" class="btn btn-ghost" id="btnPickAgain">Pick another route</button>
    </div>
    <div id="resultMeta" class="hint"></div>
    <div class="phone" id="phoneDisplay">—</div>
    <div id="historyBox" class="history"></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
let countries=[],selectedCountry=null,selectedService=null,current=null,pollTimer=null;
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove('show'),2200);}
function setStep(n){
  document.getElementById('step1Lbl').classList.toggle('on',n>=1);
  document.getElementById('step2Lbl').classList.toggle('on',n>=2);
  document.getElementById('step3Lbl').classList.toggle('on',n>=3);
}
async function init(){
  try{
    const r=await fetch('/api/public/get-number/countries');
    const d=await r.json();
    if(d.status!=='success') throw new Error(d.message||'Failed');
    countries=d.data||[];
    renderCountries();
  }catch(e){
    document.getElementById('countryGrid').innerHTML='<div class="empty" style="grid-column:1/-1">Could not load countries. '+esc(e.message)+'</div>';
  }
}
function renderCountries(){
  const g=document.getElementById('countryGrid');
  if(!countries.length){g.innerHTML='<div class="empty" style="grid-column:1/-1">No countries in stock. Add numbers in the bot first.</div>';return;}
  g.innerHTML=countries.map((c,i)=>`<button type="button" class="c-card" data-idx="${i}">
    <span class="flag">${esc(c.flag||'\uD83C\uDF0D')}</span>
    <span class="name">${esc(c.country)}</span>
    <span class="badge">${c.numbers} lines · ${c.services} svc</span>
  </button>`).join('');
  g.querySelectorAll('.c-card').forEach(btn=>{
    const i=parseInt(btn.getAttribute('data-idx'),10);
    btn.onclick=()=>openCountry(countries[i].country);
  });
}
async function openCountry(name){
  selectedCountry=name;
  selectedService=null;
  current=null;
  document.getElementById('resultPanel').classList.remove('show');
  document.getElementById('servicePanel').classList.add('show');
  document.getElementById('svcTitle').textContent='Services in '+name;
  document.getElementById('svcHint').textContent='Select a service to receive one random number from the live pool.';
  document.getElementById('serviceGrid').innerHTML='<div class="empty" style="grid-column:1/-1">Loading\u2026</div>';
  setStep(2);
  document.getElementById('countryGrid').style.display='none';
  try{
    const r=await fetch('/api/public/get-number/services?country='+encodeURIComponent(name));
    const d=await r.json();
    if(d.status!=='success') throw new Error(d.message||'Failed');
    const svcs=d.data||[];
    if(!svcs.length){document.getElementById('serviceGrid').innerHTML='<div class="empty" style="grid-column:1/-1">No services for this country.</div>';return;}
    window.__services=svcs;
    document.getElementById('serviceGrid').innerHTML=svcs.map((s,i)=>`<button type="button" class="svc-btn" data-si="${i}">${esc(s.service)}<small>${s.numbers} available</small></button>`).join('');
    document.getElementById('serviceGrid').querySelectorAll('.svc-btn').forEach(b=>{
      const si=parseInt(b.getAttribute('data-si'),10);
      b.onclick=()=>assign(window.__services[si].service);
    });
  }catch(e){
    document.getElementById('serviceGrid').innerHTML='<div class="empty" style="grid-column:1/-1">'+esc(e.message)+'</div>';
  }
}
function randomService(){
  const svcs=window.__services;
  if(!svcs||!svcs.length){toast('No services');return;}
  const pick=svcs[Math.floor(Math.random()*svcs.length)];
  assign(pick.service);
}
async function assign(service,excludeNum){
  selectedService=service;
  try{
    const body={country:selectedCountry,service};
    if(excludeNum) body.previous_number=excludeNum.replace(/^\+/,'');
    const r=await fetch('/api/public/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json();
    if(d.status!=='success'||!d.number) throw new Error(d.message||'Assign failed');
    current={number:d.number,service:d.service,country:d.country,history:d.history||[],expires_in:d.expires_in||3600};
    showResult();
    toast('Number assigned');
    startPoll();
  }catch(e){toast(e.message||'Error');}
}
function showResult(){
  setStep(3);
  document.getElementById('resultPanel').classList.add('show');
  document.getElementById('phoneDisplay').textContent=current.number;
  document.getElementById('resultMeta').textContent=(current.country||'')+' \u00b7 '+(current.service||'')+' \u00b7 session '+String(current.expires_in||3600)+'s \u2014 inbox refreshes every few seconds';
  renderHistory(current.history||[]);
}
function renderHistory(rows){
  const box=document.getElementById('historyBox');
  if(!rows.length){box.innerHTML='<div class="empty">No messages yet \u2014 waiting for SMS.</div>';return;}
  box.innerHTML=rows.map(h=>`<div class="h-item">
    <div class="ts-row"><span class="ts">${esc(h.received_at||'')}</span></div>
    <div class="msg">${esc(h.message||'')}</div>
    <div class="otp-row"><span class="otp-label">OTP</span><span class="otp-val">${esc(h.otp||'\u2014')}</span></div>
  </div>`).join('');
}
async function refreshHistory(){
  if(!current?.number) return;
  try{
    const r=await fetch('/api/public/get-number/history?number='+encodeURIComponent(current.number));
    const d=await r.json();
    if(d.status==='success'&&d.data){current.history=d.data.history||[];renderHistory(current.history);}
  }catch(_){}
}
function startPoll(){if(pollTimer) clearInterval(pollTimer);pollTimer=setInterval(refreshHistory,4000);}
function stopPoll(){if(pollTimer){clearInterval(pollTimer);pollTimer=null;}}
document.getElementById('btnBackCountries').onclick=()=>{
  stopPoll();
  document.getElementById('servicePanel').classList.remove('show');
  document.getElementById('resultPanel').classList.remove('show');
  document.getElementById('countryGrid').style.display='grid';
  setStep(1);
};
document.getElementById('btnRandomSvc').onclick=randomService;
document.getElementById('btnCopy').onclick=()=>{
  const n=current?.number||''; if(!n){toast('No number');return;}
  navigator.clipboard.writeText(n.replace(/\s/g,'')).then(()=>toast('Copied')).catch(()=>toast('Copy failed'));
};
document.getElementById('btnRefresh').onclick=()=>{refreshHistory();toast('Refreshed');};
document.getElementById('btnChange').onclick=()=>{if(current) assign(selectedService,current.number);};
document.getElementById('btnPickAgain').onclick=()=>{
  stopPoll();
  document.getElementById('resultPanel').classList.remove('show');
  document.getElementById('servicePanel').classList.remove('show');
  document.getElementById('countryGrid').style.display='grid';
  setStep(1);
};
init();
</script>
</body>
</html>"""
