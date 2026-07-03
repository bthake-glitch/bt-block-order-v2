const APP_VERSION = '8.5-update-button-fix';
let refreshingForUpdate = false;
let updateRegistration = null;
let updateCheckStarted = false;

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
  try{
    hideUpdateBanner();

    // If a new worker is waiting, activate it first.
    if(updateRegistration && updateRegistration.waiting){
      updateRegistration.waiting.postMessage({type:'SKIP_WAITING'});
      setTimeout(reloadFresh, 1200);
      return;
    }

    // Strong fallback: remove the old service worker/cache and reload from the network.
    await clearAppCaches();

    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(reg => reg.unregister()));
    }

    reloadFresh();
  }catch(e){
    reloadFresh();
  }
}

async function checkForUpdate(){
  try{
    if(!('serviceWorker' in navigator)){
      reloadFresh();
      return;
    }

    const reg = await navigator.serviceWorker.getRegistration();
    if(reg){
      updateRegistration = reg;
      await reg.update();
      if(reg.waiting){
        showUpdateBanner();
        return;
      }
    }

    // Manual Update button now does a real fresh reload instead of only showing the banner.
    await applyUpdate();
  }catch(e){
    reloadFresh();
  }
}

function watchRegistration(reg){
  updateRegistration = reg;

  if(reg.waiting){
    showUpdateBanner();
  }

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

    const reg = await navigator.serviceWorker.register('./sw.js?v=' + APP_VERSION, {updateViaCache:'none'});
    watchRegistration(reg);
    await reg.update();

    if(!updateCheckStarted){
      updateCheckStarted = true;
      setInterval(() => {
        if(updateRegistration) updateRegistration.update().catch(()=>{});
      }, 60000);
    }
  }catch(e){
    console.log('Service worker registration failed', e);
  }
}

async function autoCheckForUpdate(){
  try{
    if(updateRegistration) await updateRegistration.update();
  }catch(e){}
}

window.addEventListener('load', () => {
  registerServiceWorker();
  setTimeout(autoCheckForUpdate, 1200);
});

document.addEventListener('visibilitychange', () => {
  if(!document.hidden) autoCheckForUpdate();
});
