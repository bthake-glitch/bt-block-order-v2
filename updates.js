const APP_VERSION = '8.4-summary-polish';
let refreshingForUpdate = false;
let updateRegistration = null;
let updateCheckStarted = false;

function showUpdateBanner(){
  const banner = document.getElementById('updateBanner');
  if(banner) banner.style.display = 'block';
}

async function clearAppCaches(){
  if('caches' in window){
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
}

async function applyUpdate(){
  try{
    if(updateRegistration && updateRegistration.waiting){
      updateRegistration.waiting.postMessage({type:'SKIP_WAITING'});
      return;
    }

    await clearAppCaches();

    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        if(reg.waiting){
          reg.waiting.postMessage({type:'SKIP_WAITING'});
          return;
        }
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
    if(!('serviceWorker' in navigator)){
      location.reload();
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

    showUpdateBanner();
  }catch(e){
    location.reload();
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
      location.reload();
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
