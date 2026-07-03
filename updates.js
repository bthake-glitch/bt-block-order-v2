const APP_VERSION = '8.2-update-fix';
let refreshingForUpdate = false;

async function clearAppCaches(){
  if('caches' in window){
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
}

async function applyUpdate(){
  try{
    await clearAppCaches();
    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
        await reg.update();
      }
    }
    location.reload();
  }catch(e){
    location.reload();
  }
}

async function checkForUpdate(){
  try{
    await applyUpdate();
  }catch(e){
    location.reload();
  }
}

async function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;
  try{
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if(refreshingForUpdate) return;
      refreshingForUpdate = true;
      location.reload();
    });

    const reg = await navigator.serviceWorker.register('./sw.js?v=' + APP_VERSION, {updateViaCache:'none'});
    await reg.update();

    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if(!worker) return;
      worker.addEventListener('statechange', () => {
        if(worker.state === 'installed' && navigator.serviceWorker.controller){
          const banner = document.getElementById('updateBanner');
          if(banner) banner.style.display = 'block';
        }
      });
    });
  }catch(e){
    console.log('Service worker registration failed', e);
  }
}

async function autoCheckForUpdate(){
  try{
    if(!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    if(!reg) return;
    await reg.update();
  }catch(e){}
}

window.addEventListener('load', () => {
  registerServiceWorker();
  setTimeout(autoCheckForUpdate, 1200);
});
