
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
    lines.push(`  On Site: ${palletLabel(r.onQty)}   Order: ${palletLabel(r.orderQty)}   Total: ${palletLabel(r.rowTotal)}`);
  }
  lines.push('');
  lines.push('ON SITE TOTAL: '+palletLabel(data.onTotal));
  lines.push('ORDER TOTAL: '+palletLabel(data.orderTotal));
  lines.push('TOTAL PALLETS: '+palletLabel(data.grandTotal));
  lines.push('BLOCK TYPES USED: '+data.usedTypes);
  return lines.join('\n');
}

function buildShareSummary(){
  const data = getMaterialsSummaryData();
  const orderRows = data.rows.filter(r => r.orderQty > 0);
  if(!orderRows.length) return '';
  let lines=['BT MATERIALS SUMMARY',''];
  if(data.jobName) lines.push('Job: '+data.jobName);
  if(data.siteAddress) lines.push('Address: '+data.siteAddress);
  if(data.supplierName) lines.push('Supplier: '+data.supplierName);
  if(data.jobName || data.siteAddress || data.supplierName) lines.push('');
  lines.push('BLOCKS TO ORDER');
  for(const r of orderRows){
    lines.push(`${r.code}  ${r.name}  -  ${palletLabel(r.orderQty)}`);
  }
  lines.push('');
  lines.push('ORDER TOTAL: '+palletLabel(data.orderTotal));
  return lines.join('\n');
}

function escHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function getSeriesLabel(series){
  const labels = {
    '200':'200 SERIES',
    '150':'150 SERIES',
    '100':'100 SERIES',
    '300':'300 SERIES',
    'Capping':'CAPPING SERIES'
  };
  return labels[series || '200'] || String(series || 'OTHER').toUpperCase();
}

function getRowsGroupedBySeries(rows){
  const order = ['200','150','100','300','Capping'];
  const groups = new Map();
  for(const row of rows){
    const block = blocks.find(b => b.code === row.code && b.name === row.name) || blocks.find(b => b.code === row.code);
    const series = block?.series || '200';
    if(!groups.has(series)) groups.set(series, []);
    groups.get(series).push(row);
  }
  return order.filter(series => groups.has(series)).map(series => ({series, rows:groups.get(series)}));
}

function buildMaterialsSummaryHtml(){
  const data = getMaterialsSummaryData();
  const orderRows = data.rows.filter(r => r.orderQty > 0);
  if(!orderRows.length) return '';

  const groups = getRowsGroupedBySeries(orderRows);
  let html = '<div class="summary-title-card"><div class="summary-main-title">BT BLOCK ORDER</div><div class="summary-sub-title">Materials Summary</div></div>';

  if(data.jobName || data.siteAddress || data.supplierName){
    html += '<div class="summary-job">';
    if(data.jobName) html += '<div class="summary-job-title">📦 '+escHtml(data.jobName)+'</div>';
    if(data.siteAddress) html += '<div class="summary-job-address">'+escHtml(data.siteAddress)+'</div>';
    if(data.supplierName) html += '<div class="summary-job-address">Supplier: '+escHtml(data.supplierName)+'</div>';
    html += '</div>';
  }

  html += '<div class="summary-series-list">';
  for(const group of groups){
    const seriesTotal = group.rows.reduce((sum, r) => sum + r.orderQty, 0);
    html += '<section class="summary-series-card summary-series-'+escHtml(group.series)+'">';
    html += '<div class="summary-series-head"><span>'+escHtml(getSeriesLabel(group.series))+'</span><strong>'+palletLabel(seriesTotal)+'</strong></div>';
    html += '<div class="summary-series-rows">';
    for(const r of group.rows){
      html += '<div class="summary-row">';
      html += '<div class="summary-row-code">'+escHtml(r.code)+'</div>';
      html += '<div class="summary-row-name">'+escHtml(r.name)+'</div>';
      html += '<div class="summary-row-qty">'+palletLabel(r.orderQty)+'</div>';
      html += '</div>';
    }
    html += '</div></section>';
  }
  html += '</div>';

  html += '<div class="summary-grand-total"><span>TOTAL PALLETS TO ORDER</span><strong>'+palletLabel(data.orderTotal)+'</strong></div>';
  return html;
}

function showMaterialsSummary(){
  const html = buildMaterialsSummaryHtml();
  if(!html){ alert('No order quantities filled in yet.'); return; }
  const modal = document.getElementById('summaryModal');
  const output = document.getElementById('summaryText');
  if(output) output.innerHTML = html;
  if(modal) modal.style.display = 'flex';
}

function getCurrentSummaryText(){
  return buildMaterialsSummary();
}

function getShareSummaryText(){
  return buildShareSummary();
}

async function copyMaterialsSummary(){
  const text = getShareSummaryText();
  if(!text){ alert('No order quantities filled in yet.'); return; }
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
  const text = getShareSummaryText();
  if(!text){ alert('No order quantities filled in yet.'); return; }
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
  const text = getShareSummaryText();
  if(!text){ alert('No order quantities filled in yet.'); return; }
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

