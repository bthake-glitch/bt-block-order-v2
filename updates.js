const APP_VERSION = '8.8';
let updateRegistration = null;
let refreshingForUpdate = false;

function showUpdateBanner(){
  const banner = document.getElementById('updateBanner');
  if(banner) banner.style.display = 'block';
}
function hideUpdateBanner(){
  const banner = document.getElementById('updateBanner');
  if(banner) banner.style.display = 'none';
}
async function clearAppCaches(){
  if(!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
}
function reloadFresh(){
  const url = new URL(window.location.href);
  url.searchParams.set('v', Date.now().toString());
  window.location.replace(url.toString());
}
async function applyUpdate(){
  hideUpdateBanner();
  try{
    await clearAppCaches();
    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
        if(reg.active) reg.active.postMessage({type:'CLEAR_CACHES'});
        await reg.update().catch(()=>{});
      }
    }
  }catch(e){}
  setTimeout(reloadFresh, 400);
}
async function checkVersionFile(){
  try{
    const res = await fetch('./version.json?v=' + Date.now(), {cache:'no-store'});
    if(!res.ok) return;
    const data = await res.json();
    if(data && data.version && data.version !== APP_VERSION) showUpdateBanner();
  }catch(e){}
}
async function checkForUpdate(){
  await applyUpdate();
}
function watchRegistration(reg){
  updateRegistration = reg;
  if(reg.waiting) showUpdateBanner();
  reg.addEventListener('updatefound', () => {
    const worker = reg.installing;
    if(!worker) return;
    worker.addEventListener('statechange', () => {
      if(worker.state === 'installed' && navigator.serviceWorker.controller){
        updateRegistration = reg;
        showUpdateBanner();
      }
    });
  });
}
async function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;
  try{
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if(refreshingForUpdate) return;
      refreshingForUpdate = true;
      reloadFresh();
    });
    // Stable service worker URL. Versioning happens inside sw.js and version.json.
    const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    watchRegistration(reg);
    await reg.update();
    setInterval(checkVersionFile, 60000);
  }catch(e){ console.log('Service worker registration failed', e); }
}
window.addEventListener('load', () => {
  registerServiceWorker();
  setTimeout(checkVersionFile, 1500);
});
document.addEventListener('visibilitychange', () => {
  if(!document.hidden) checkVersionFile();
});
