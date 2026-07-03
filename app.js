let currentSeries = localStorage.getItem('bt_block_order_current_series') || '200';
const list=document.getElementById('list');

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

const DIMENSIONS_BY_CODE = {"20.01": "390 × 190 × 190", "20.011": "390 × 190 × 140", "20.02": "290 × 190 × 190", "20.03": "190 × 190 × 190", "20.09": "390 × 190 × 190", "20.10": "190 × 190 × 190", "20.12": "390 × 190 × 190", "20.13": "190 × 190 × 190", "20.18": "190 × 190 × 390", "20.20": "390 × 190 × 190", "20.21": "390 × 190 × 190", "20.22": "340 × 190 × 190", "20.25": "190 × 190 × 290", "20.42": "390 × 190 × 190", "20.45": "390 × 190 × 190", "20.45A": "288 × 35 × 190", "20.48": "390 × 190 × 190", "20.61": "390 × 190 × 190", "20.71": "390 × 190 × 90", "20.739": "290 × 190 × 190", "20.925": "390 × 190 × 190"};
Object.assign(DIMENSIONS_BY_CODE, {"10.01": "390 \u00d7 190 \u00d7 90", "10.31": "390 \u00d7 190 \u00d7 90", "15.01": "390 \u00d7 190 \u00d7 140", "15.02": "290 \u00d7 190 \u00d7 140", "15.03": "190 \u00d7 190 \u00d7 140", "15.12": "390 \u00d7 190 \u00d7 140", "15.20": "390 \u00d7 190 \u00d7 140", "15.22": "340 \u00d7 190 \u00d7 140", "15.42": "390 \u00d7 190 \u00d7 140", "15.45": "390 \u00d7 190 \u00d7 140", "20.45A": "325 \u00d7 190 \u00d7 30", "15.48": "390 \u00d7 190 \u00d7 140", "15.71": "390 \u00d7 90 \u00d7 140", "15.801": "390 \u00d7 190 \u00d7 140", "30.02": "290 \u00d7 190 \u00d7 290", "30.03": "190 \u00d7 190 \u00d7 290", "30.925": "390 \u00d7 190 \u00d7 290", "30.18": "390 \u00d7 190 \u00d7 290", "30.48": "390 \u00d7 190 \u00d7 290", "30.45": "390 \u00d7 190 \u00d7 290", "20.45A": "390 \u00d7 190 \u00d7 30", "40.925": "390 \u00d7 190 \u00d7 390", "50.31c": "390 \u00d7 40 \u00d7 190"});
function sid(code,type){return type+'_'+code.replace(/[^a-zA-Z0-9]/g,'_')}

function readQty(id){
  const el = document.getElementById(id);
  if(!el) return 0;
  const n = parseInt(el.value || '0', 10);
  return Number.isFinite(n) ? n : 0;
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
  for(const b of blocks){
    orderTotal += readQty(sid(b.code,'order'));
  }
  const el = document.getElementById('orderTotal');
  if(el) el.textContent = String(orderTotal);
}

function selectSeries(series){
  currentSeries = series;
  localStorage.setItem('bt_block_order_current_series', series);
  document.querySelectorAll('.series-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.series === series));
  renderBlocks();
}

function renderBlocks(){
 list.innerHTML='';
 document.querySelectorAll('.series-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.series === currentSeries));
 const visibleBlocks = blocks.filter(b => currentSeries === 'All' || b.series === currentSeries);
 const title=document.createElement('div');
 title.className='series-title';
 title.textContent = SERIES_LABELS[currentSeries] || 'Block Series';
 list.appendChild(title);
 for(const b of [...visibleBlocks].sort((a,b)=>(isFav(b.code)-isFav(a.code)))){
 const on=sid(b.code,'on'), order=sid(b.code,'order');
 const card=document.createElement('section'); card.className='card';
 card.innerHTML=`<div class="head"><div class="code">${b.code}</div><div class="name"><button class="fav-star ${isFav(b.code) ? 'fav' : ''}" onclick="toggleFav('${b.code}')" type="button">★</button><span class="name-text">${b.name}</span></div></div>
 <div class="body"><div class="drawing series-${b.series || '200'}"><img src="${b.img}" alt="${b.code} ${b.name}"><div class="dim-big">${b.dim || DIMENSIONS_BY_CODE[b.code] || ""}</div></div>
 <div class="fields"><label class="on">ON SITE<div class="qty-wrap"><button class="qty-step" type="button" onclick="stepQty('${on}',-1)">−</button><input inputmode="numeric" pattern="[0-9]*" id="${on}" value="${localStorage.getItem(on)||''}" oninput="localStorage.setItem('${on}',this.value);updateTotals()"><button class="qty-step" type="button" onclick="stepQty('${on}',1)">+</button></div></label>
 <label class="order">ORDER<div class="qty-wrap"><button class="qty-step" type="button" onclick="stepQty('${order}',-1)">−</button><input inputmode="numeric" pattern="[0-9]*" id="${order}" value="${localStorage.getItem(order)||''}" oninput="localStorage.setItem('${order}',this.value);updateTotals()"><button class="qty-step" type="button" onclick="stepQty('${order}',1)">+</button></div></label></div></div>`;
 list.appendChild(card);
}
}
renderBlocks();
updateTotals();
async function copyOrder(){
  let lines=['BT BLOCK ORDER',''];
  const jobName=(document.getElementById('jobName')?.value||'').trim();
  const siteAddress=(document.getElementById('siteAddress')?.value||'').trim();
  if(jobName) lines.push('Job: '+jobName);
  if(siteAddress) lines.push('Address: '+siteAddress);
  if(jobName || siteAddress) lines.push('');
  for(const b of blocks){
    const v=document.getElementById(sid(b.code,'order')).value.trim();
    if(v) lines.push(`${b.code}  ${b.name}  -  ${v}`);
  }
  const hasOrder = blocks.some(b => document.getElementById(sid(b.code,'order')).value.trim());
  if(!hasOrder){alert('No order quantities filled in yet.');return}
  const text=lines.join('\n');
  try{
    await navigator.clipboard.writeText(text);
    alert('Order copied. Paste into SMS, email or notes.');
  }catch(e){
    prompt('Copy this order:',text);
  }
}

function getMaterialsSummaryData(){
  const jobName=(document.getElementById('jobName')?.value||'').trim();
  const siteAddress=(document.getElementById('siteAddress')?.value||'').trim();
  const supplierName=(document.getElementById('supplierName')?.value||'').trim();
  const supplierPhone=(document.getElementById('supplierPhone')?.value||'').trim();
  const supplierEmail=(document.getElementById('supplierEmail')?.value||'').trim();
  let onTotal=0, orderTotal=0, usedTypes=0;
  const rows=[];
  for(const b of blocks){
    const onQty=readQty(sid(b.code,'on'));
    const orderQty=readQty(sid(b.code,'order'));
    const rowTotal=onQty + orderQty;
    if(onQty || orderQty){
      usedTypes++;
      onTotal += onQty;
      orderTotal += orderQty;
      rows.push({code:b.code, name:b.name, onQty, orderQty, rowTotal});
    }
  }
  return {jobName, siteAddress, supplierName, supplierPhone, supplierEmail, onTotal, orderTotal, usedTypes, rows, grandTotal:onTotal + orderTotal};
}

function buildMaterialsSummary(){
  const data = getMaterialsSummaryData();
  if(!data.rows.length) return '';
  let lines=['BT MATERIALS SUMMARY',''];
  if(data.jobName) lines.push('Job: '+data.jobName);
  if(data.siteAddress) lines.push('Address: '+data.siteAddress);
  if(data.supplierName) lines.push('Supplier: '+data.supplierName);
  if(data.jobName || data.siteAddress || data.supplierName) lines.push('');
  lines.push('BLOCKS');
  for(const r of data.rows){
    lines.push(`${r.code}  ${r.name}`);
    lines.push(`  On Site: ${r.onQty}   Order: ${r.orderQty}   Total: ${r.rowTotal}`);
  }
  lines.push('');
  lines.push('ON SITE TOTAL: '+data.onTotal);
  lines.push('ORDER TOTAL: '+data.orderTotal);
  lines.push('TOTAL BLOCKS: '+data.grandTotal);
  lines.push('BLOCK TYPES USED: '+data.usedTypes);
  return lines.join('\n');
}

function escHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function buildMaterialsSummaryHtml(){
  const data = getMaterialsSummaryData();
  if(!data.rows.length) return '';
  let html = '';
  if(data.jobName || data.siteAddress){
    html += '<div class="summary-job">';
    if(data.jobName) html += '<div class="summary-job-title">📦 '+escHtml(data.jobName)+'</div>';
    if(data.siteAddress) html += '<div class="summary-job-address">'+escHtml(data.siteAddress)+'</div>';
    if(data.supplierName) html += '<div class="summary-job-address">Supplier: '+escHtml(data.supplierName)+'</div>';
    html += '</div>';
  }
  html += '<div class="summary-list">';
  for(const r of data.rows){
    html += '<div class="summary-block">';
    html += '<div class="summary-block-head"><div class="summary-block-code">'+escHtml(r.code)+'</div><div class="summary-block-name">'+escHtml(r.name)+'</div></div>';
    html += '<div class="summary-block-qty">';
    html += '<div class="summary-on"><span class="summary-label">ON SITE</span><span class="summary-num">'+r.onQty+'</span></div>';
    html += '<div class="summary-order"><span class="summary-label">ORDER</span><span class="summary-num">'+r.orderQty+'</span></div>';
    html += '<div><span class="summary-label">TOTAL</span><span class="summary-num">'+r.rowTotal+'</span></div>';
    html += '</div></div>';
  }
  html += '</div>';
  html += '<div class="summary-totals">';
  html += '<div><span class="summary-label">ON SITE TOTAL</span><span class="summary-num">'+data.onTotal+'</span></div>';
  html += '<div><span class="summary-label">ORDER TOTAL</span><span class="summary-num">'+data.orderTotal+'</span></div>';
  html += '<div class="summary-total-wide"><span class="summary-label">TOTAL BLOCKS</span><span class="summary-num">'+data.grandTotal+'</span></div>';
  html += '<div><span class="summary-label">BLOCK TYPES USED</span><span class="summary-num">'+data.usedTypes+'</span></div>';
  html += '</div>';
  return html;
}

function showMaterialsSummary(){
  const text = buildMaterialsSummary();
  if(!text){ alert('No quantities filled in yet.'); return; }
  const modal = document.getElementById('summaryModal');
  const output = document.getElementById('summaryText');
  if(output) output.innerHTML = buildMaterialsSummaryHtml();
  if(modal) modal.style.display = 'flex';
}

function getCurrentSummaryText(){
  const output = document.getElementById('summaryText');
  return buildMaterialsSummary();
}

async function copyMaterialsSummary(){
  const text = getCurrentSummaryText();
  if(!text){ alert('No quantities filled in yet.'); return; }
  try{
    await navigator.clipboard.writeText(text);
    alert('Summary copied.');
  }catch(e){
    prompt('Copy this summary:', text);
  }
}

function cleanPhone(value){
  return String(value || '').replace(/[^0-9+]/g, '');
}

function textMaterialsSummary(){
  const text = getCurrentSummaryText();
  if(!text){ alert('No quantities filled in yet.'); return; }
  const data = getMaterialsSummaryData();
  const phone = cleanPhone(data.supplierPhone);
  const body = encodeURIComponent(text);
  if(phone){
    window.location.href = 'sms:' + encodeURIComponent(phone) + '?&body=' + body;
  }else{
    window.location.href = 'sms:?&body=' + body;
  }
}

function emailMaterialsSummary(){
  const text = getCurrentSummaryText();
  if(!text){ alert('No quantities filled in yet.'); return; }
  const jobName=(document.getElementById('jobName')?.value||'Block Order').trim() || 'Block Order';
  const subject = encodeURIComponent('BT Materials Summary - ' + jobName);
  const body = encodeURIComponent(text);
  const data = getMaterialsSummaryData();
  const to = data.supplierEmail ? encodeURIComponent(data.supplierEmail) : '';
  window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
}

function printMaterialsSummary(){
  const text = getCurrentSummaryText();
  if(!text){ alert('No quantities filled in yet.'); return; }
  const safe = text.replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
  const w = window.open('', '_blank');
  if(!w){ alert('Pop-up blocked. Please allow pop-ups to print.'); return; }
  w.document.write('<!doctype html><html><head><title>Materials Summary</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#111;}pre{font-size:14px;line-height:1.35;font-weight:700;white-space:pre-wrap;}</style></head><body><pre>'+safe+'</pre><script>window.onload=function(){window.print();}<\/script></body></html>');
  w.document.close();
}

function closeMaterialsSummary(){
  const modal = document.getElementById('summaryModal');
  if(modal) modal.style.display = 'none';
}

function clearAll(){
 if(!confirm('Clear all On Site and Order quantities?')) return;
 for(const b of blocks){for(const t of ['on','order']){const id=sid(b.code,t);localStorage.removeItem(id);document.getElementById(id).value=''}}
 updateTotals();
}



const JOBS_KEY = 'bt_block_order_jobs_v3';
const CURRENT_JOB_KEY = 'bt_block_order_current_job_v3';

function getJobs(){
  try { return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]'); }
  catch(e){ return []; }
}
function setJobs(jobs){ localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)); }

function toggleJobPanel(){
  const panel=document.getElementById('jobPanel');
  const arrow=document.getElementById('jobArrow');
  if(!panel) return;
  const collapsed=panel.classList.toggle('collapsed');
  if(arrow) arrow.textContent = collapsed ? '▼' : '▲';
}

function updateJobSummary(statusText){
  const name=(document.getElementById('jobName')?.value||'').trim();
  const address=(document.getElementById('siteAddress')?.value||'').trim();
  const supplier=(document.getElementById('supplierName')?.value||'').trim();
  const summary=document.getElementById('jobSummary');
  if(!summary) return;
  if(!name && !address){
    summary.textContent = statusText || 'No saved job selected';
  } else {
    summary.textContent = (name || 'Unnamed Job') + (address ? ' — ' + address : '') + (supplier ? ' — ' + supplier : '') + (statusText ? ' ('+statusText+')' : '');
  }
}

function refreshJobSelect(){
  const sel=document.getElementById('jobSelect');
  if(!sel) return;
  const current=localStorage.getItem(CURRENT_JOB_KEY) || '';
  sel.innerHTML='<option value="">Saved Jobs</option>';
  getJobs().forEach((job,idx)=>{
    const opt=document.createElement('option');
    opt.value=String(idx);
    opt.textContent=(job.name || 'Unnamed Job') + (job.address ? ' — ' + job.address : '');
    sel.appendChild(opt);
  });
  if(current !== '' && getJobs()[Number(current)]) sel.value=current;
  else sel.value='';
}

function loadSelectedJob(){
  const sel=document.getElementById('jobSelect');
  const idx=sel ? sel.value : '';
  localStorage.setItem(CURRENT_JOB_KEY, idx);
  if(idx===''){
    document.getElementById('jobName').value='';
    document.getElementById('siteAddress').value='';
    document.getElementById('supplierName').value='';
    document.getElementById('supplierPhone').value='';
    document.getElementById('supplierEmail').value='';
    updateJobSummary('Unsaved');
    return;
  }
  const job=getJobs()[Number(idx)];
  if(job){
    document.getElementById('jobName').value=job.name || '';
    document.getElementById('siteAddress').value=job.address || '';
    document.getElementById('supplierName').value=job.supplierName || '';
    document.getElementById('supplierPhone').value=job.supplierPhone || '';
    document.getElementById('supplierEmail').value=job.supplierEmail || '';
    updateJobSummary('Saved');
  }
}

function markJobChanged(){ updateJobSummary('Changed'); }

function saveJob(){
  const name=document.getElementById('jobName').value.trim();
  const address=document.getElementById('siteAddress').value.trim();
  const supplierName=document.getElementById('supplierName').value.trim();
  const supplierPhone=document.getElementById('supplierPhone').value.trim();
  const supplierEmail=document.getElementById('supplierEmail').value.trim();
  if(!name && !address && !supplierName && !supplierPhone && !supplierEmail){ alert('Enter a job name, site address or supplier details first.'); return; }
  let jobs=getJobs();
  let idx=document.getElementById('jobSelect').value;
  const data={name:name || 'Unnamed Job', address, supplierName, supplierPhone, supplierEmail};
  if(idx===''){
    jobs.push(data);
    idx=String(jobs.length-1);
  }else{
    jobs[Number(idx)]=data;
  }
  setJobs(jobs);
  localStorage.setItem(CURRENT_JOB_KEY,idx);
  refreshJobSelect();
  document.getElementById('jobSelect').value=idx;
  updateJobSummary('Saved');
  alert('Job saved.');
}

function newJob(){
  document.getElementById('jobSelect').value='';
  document.getElementById('jobName').value='';
  document.getElementById('siteAddress').value='';
  document.getElementById('supplierName').value='';
  document.getElementById('supplierPhone').value='';
  document.getElementById('supplierEmail').value='';
  localStorage.setItem(CURRENT_JOB_KEY,'');
  updateJobSummary('Unsaved');
}

function deleteJob(){
  const sel=document.getElementById('jobSelect');
  const idx=sel ? sel.value : '';
  if(idx===''){ alert('Select a saved job to delete.'); return; }
  if(!confirm('Delete this saved job?')) return;
  let jobs=getJobs();
  jobs.splice(Number(idx),1);
  setJobs(jobs);
  newJob();
  refreshJobSelect();
}

function initJobs(){
  refreshJobSelect();
  const current=localStorage.getItem(CURRENT_JOB_KEY) || '';
  if(current !== '' && getJobs()[Number(current)]){
    document.getElementById('jobSelect').value=current;
    loadSelectedJob();
  }else{
    updateJobSummary();
  }
}
setTimeout(initJobs,0);





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
