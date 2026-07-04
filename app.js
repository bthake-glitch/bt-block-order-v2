let currentSeries = localStorage.getItem('bt_block_order_current_series') || '200';
const list = document.getElementById('list');

const FAV_KEY = 'bt_block_order_favourites_v1';
function getFavs(){
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '{}'); }
  catch(e){ return {}; }
}
function setFavs(favs){ localStorage.setItem(FAV_KEY, JSON.stringify(favs)); }
function isFav(code){ return !!getFavs()[code]; }
function toggleFav(code){
  const favs = getFavs();
  if(favs[code]) delete favs[code];
  else favs[code] = true;
  setFavs(favs);
  renderBlocks();
}

const DIMENSIONS_BY_CODE = {
  "20.01": "390 × 190 × 190", "20.011": "390 × 190 × 140", "20.02": "290 × 190 × 190",
  "20.03": "190 × 190 × 190", "20.09": "390 × 190 × 190", "20.10": "190 × 190 × 190",
  "20.12": "390 × 190 × 190", "20.13": "190 × 190 × 190", "20.18": "190 × 190 × 390",
  "20.20": "390 × 190 × 190", "20.21": "390 × 190 × 190", "20.22": "340 × 190 × 190",
  "20.25": "190 × 190 × 290", "20.42": "390 × 190 × 190", "20.45": "390 × 190 × 190",
  "20.45A": "390 × 190 × 30", "20.48": "390 × 190 × 190", "20.61": "390 × 190 × 190",
  "20.71": "390 × 190 × 90", "20.739": "290 × 190 × 190", "20.925": "390 × 190 × 190",
  "10.01": "390 × 190 × 90", "10.31": "390 × 190 × 90",
  "15.01": "390 × 190 × 140", "15.02": "290 × 190 × 140", "15.03": "190 × 190 × 140",
  "15.12": "390 × 190 × 140", "15.20": "390 × 190 × 140", "15.22": "340 × 190 × 140",
  "15.42": "390 × 190 × 140", "15.45": "390 × 190 × 140", "15.48": "390 × 190 × 140",
  "15.71": "390 × 90 × 140", "15.801": "390 × 190 × 140",
  "30.02": "290 × 190 × 290", "30.03": "190 × 190 × 290", "30.925": "390 × 190 × 290",
  "30.18": "390 × 190 × 290", "30.48": "390 × 190 × 290", "30.45": "390 × 190 × 290",
  "40.925": "390 × 190 × 390", "50.31c": "390 × 40 × 190", "50.31C": "390 × 40 × 190"
};

function sid(code,type){ return type + '_' + code.replace(/[^a-zA-Z0-9]/g,'_'); }
function readQty(id){
  const el = document.getElementById(id);
  const raw = el ? el.value : localStorage.getItem(id);
  const n = parseInt(raw || '0', 10);
  return Number.isFinite(n) ? n : 0;
}
function palletLabel(value){
  const n = parseInt(value || '0', 10) || 0;
  return n === 1 ? '1 pallet' : n + ' pallets';
}
function palletWord(value){
  const n = parseInt(value || '0', 10) || 0;
  return n === 1 ? 'pallet' : 'pallets';
}
function writeQty(id, value){
  const el = document.getElementById(id);
  if(!el) return;
  const n = Math.max(0, parseInt(value || '0', 10) || 0);
  el.value = String(n);
  localStorage.setItem(id, el.value);
}
function stepQty(id, delta){
  writeQty(id, readQty(id) + delta);
  updateTotals();
}
function updateTotals(){
  let orderTotal = 0;
  for(const b of blocks){ orderTotal += readQty(sid(b.code,'order')); }
  const el = document.getElementById('orderTotal');
  if(el) el.textContent = palletLabel(orderTotal);
}
function selectSeries(series){
  currentSeries = series;
  localStorage.setItem('bt_block_order_current_series', series);
  document.querySelectorAll('.series-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.series === series));
  renderBlocks();
}
function escAttr(value){
  return String(value ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}
function renderBlocks(){
  if(!list) return;
  list.innerHTML = '';
  document.querySelectorAll('.series-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.series === currentSeries));
  const visibleBlocks = blocks.filter(b => currentSeries === 'All' || b.series === currentSeries);
  const title = document.createElement('div');
  title.className = 'series-title';
  title.textContent = (typeof SERIES_LABELS !== 'undefined' && SERIES_LABELS[currentSeries]) ? SERIES_LABELS[currentSeries] : 'Block Series';
  list.appendChild(title);

  for(const b of [...visibleBlocks].sort((a,b)=>(isFav(b.code)-isFav(a.code)))){
    const on = sid(b.code,'on');
    const order = sid(b.code,'order');
    const card = document.createElement('section');
    card.className = 'card';
    const code = escAttr(b.code);
    const name = escAttr(b.name);
    const dim = escAttr(b.dim || DIMENSIONS_BY_CODE[b.code] || '');
    const img = escAttr(b.img || '');
    const series = escAttr(b.series || '200');
    card.innerHTML = `<div class="head"><div class="code">${code}</div><div class="name"><button class="fav-star ${isFav(b.code) ? 'fav' : ''}" onclick="toggleFav('${code}')" type="button">★</button><span class="name-text">${name}</span></div></div>
      <div class="body"><div class="drawing series-${series}"><img src="${img}" alt="${code} ${name}"><div class="dim-big">${dim}</div></div>
      <div class="fields"><label class="on">ON SITE <span class="qty-label-unit">PALLETS</span><div class="qty-wrap"><button class="qty-step" type="button" onclick="stepQty('${on}',-1)">−</button><input inputmode="numeric" pattern="[0-9]*" id="${on}" value="${localStorage.getItem(on)||''}" oninput="localStorage.setItem('${on}',this.value);updateTotals()"><button class="qty-step" type="button" onclick="stepQty('${on}',1)">+</button></div></label>
      <label class="order">ORDER <span class="qty-label-unit">PALLETS</span><div class="qty-wrap"><button class="qty-step" type="button" onclick="stepQty('${order}',-1)">−</button><input inputmode="numeric" pattern="[0-9]*" id="${order}" value="${localStorage.getItem(order)||''}" oninput="localStorage.setItem('${order}',this.value);updateTotals()"><button class="qty-step" type="button" onclick="stepQty('${order}',1)">+</button></div></label></div></div>`;
    list.appendChild(card);
  }
}

renderBlocks();
updateTotals();

async function copyOrder(){
  const text = typeof getShareSummaryText === 'function' ? getShareSummaryText() : '';
  if(!text){ alert('No order quantities filled in yet.'); return; }
  try{
    await navigator.clipboard.writeText(text);
    alert('Order copied. Paste into SMS, email or notes.');
  }catch(e){
    prompt('Copy this order:', text);
  }
}

function clearAll(){
  if(!confirm('Clear all On Site and Order quantities?')) return;
  for(const b of blocks){
    for(const t of ['on','order']){
      const id = sid(b.code,t);
      localStorage.removeItem(id);
      const el = document.getElementById(id);
      if(el) el.value = '';
    }
  }
  updateTotals();
}
