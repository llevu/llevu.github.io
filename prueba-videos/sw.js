// Página: caché propia (funciona sin internet). Videos: si están en la caché "videos-v1", se sirven de ahí (con soporte de rangos para adelantar).
const APP='app-v1', VID='videos-v1', ARCHIVOS=['./','index.html','manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(ARCHIVOS)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.pathname.endsWith('.mp4')){e.respondWith(video(e.request));return}
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(APP).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
async function video(req){
  const c=await caches.open(VID);
  const path=new URL(req.url).pathname.split('/').slice(-2).join('/');
  const r=await c.match(path)||await c.match(req.url);
  if(!r)return fetch(req);              // no está guardado: va a internet
  const rango=req.headers.get('range');
  if(!rango)return r;
  const buf=await r.arrayBuffer(),n=buf.byteLength;
  let [,a,b]=/bytes=(\d*)-(\d*)/.exec(rango)||[];a=+a||0;b=b?+b:n-1;
  return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':`bytes ${a}-${b}/${n}`,'Content-Length':b-a+1,'Accept-Ranges':'bytes'}});
}
