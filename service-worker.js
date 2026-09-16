const CACHE='moje-remeslo-v2';
const ASSETS=['./','./index.html','./app.css','./app.js','./offer-pdf.js','./vendor/jspdf.umd.min.js','./vendor/pdf-font.js','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
