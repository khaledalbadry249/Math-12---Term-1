/* Service Worker – شبكة أولًا: يفتح دائمًا أحدث نسخة عند وجود إنترنت، ويعمل بدون إنترنت من النسخة المخزنة */
const APP='m12-app-v1',CDN='m12-cdn-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(APP).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:'no-store'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==APP&&n!==CDN).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(u.origin===location.origin){if(u.searchParams.has('c'))return;e.respondWith(netFirst(r,u))}
else if(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname))e.respondWith(swr(r))});
async function netFirst(r,u){const c=await caches.open(APP),key=u.origin+u.pathname;
try{const res=await fetch(r,{cache:'no-cache'});if(res&&res.ok){c.put(key,res.clone());if(r.mode==='navigate'&&key.endsWith('/'))c.put(key+'index.html',res.clone())}return res}
catch(err){const m=(await c.match(key))||(await c.match(r,{ignoreSearch:true}));if(m)return m;if(r.mode==='navigate'){const i=(await c.match(key+'index.html'))||(await c.match('index.html'))||(await c.match('./'));if(i)return i}throw err}}
async function swr(r){const c=await caches.open(CDN),m=await c.match(r);const f=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>m);return m||f}
