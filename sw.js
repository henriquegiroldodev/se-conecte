// Se Conecte v2: não armazenar API, sessões ou dados pessoais em cache.
const CACHE='se-conecte-v9';
const STATIC=['./assets/brand/icon.svg','./assets/brand/logo-horizontal.svg','./assets/brand/logo-completa.svg','./v2/theme-original.css','./v2/accessibility.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('se-conecte-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(u.origin!==self.location.origin)return;
 if(u.pathname.endsWith('.php')||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/v2/')||u.pathname.endsWith('/se-conecte/'))return;
 e.respondWith(fetch(req).catch(()=>caches.match(req)));
});
