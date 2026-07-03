let updateReady = false;

async function clearAppCaches(){
  if('caches' in window){
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
}

async function applyUpdate(){
  try{
    await clearAppCaches();
    const base = location.origin + location.pathname;
    location.replace(base + '?updated=' + Date.now());
  }catch(e){
    location.reload();
  }
}

async function checkForUpdate(){
  try{
    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        await reg.update();
      }
    }
    await clearAppCaches();
    alert('Update check done. The app will reload now.');
    applyUpdate();
  }catch(e){
    alert('Update check done. The app will reload now.');
    applyUpdate();
  }
}


async function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;
  try{
    const reg = await navigator.serviceWorker.register('./sw.js');
    await reg.update();
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
    if(reg.waiting || reg.installing){
      const banner = document.getElementById('updateBanner');
      if(banner) banner.style.display = 'block';
    }
  }catch(e){}
}

window.addEventListener('load', () => {
  registerServiceWorker();
  setTimeout(autoCheckForUpdate, 1500);
});

