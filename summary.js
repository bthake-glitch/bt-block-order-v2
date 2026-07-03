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
      rows.push({code:b.code, name:b.name, series:b.series || '200', onQty, orderQty, rowTotal});
    }
  }
  return {jobName, siteAddress, supplierName, supplierPhone, supplierEmail, onTotal, orderTotal, usedTypes, rows, grandTotal:onTotal + orderTotal};
}

function escHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
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
    const series = row.series || block?.series || '200';
    if(!groups.has(series)) groups.set(series, []);
    groups.get(series).push(row);
  }
  return order.filter(series => groups.has(series)).map(series => ({series, rows:groups.get(series)}));
}

function getOrderRows(){
  const data = getMaterialsSummaryData();
  return {data, orderRows:data.rows.filter(r => r.orderQty > 0)};
}

function buildShareSummary(){
  const {data, orderRows} = getOrderRows();
  if(!orderRows.length) return '';
  const groups = getRowsGroupedBySeries(orderRows);
  const lines = ['BT BLOCK ORDER', 'MATERIALS SUMMARY', ''];
  if(data.jobName) lines.push('Job: ' + data.jobName);
  if(data.siteAddress) lines.push('Address: ' + data.siteAddress);
  if(data.supplierName) lines.push('Supplier: ' + data.supplierName);
  if(data.jobName || data.siteAddress || data.supplierName) lines.push('');

  for(const group of groups){
    const seriesTotal = group.rows.reduce((sum, r) => sum + r.orderQty, 0);
    lines.push(getSeriesLabel(group.series) + ' - ' + palletLabel(seriesTotal));
    for(const r of group.rows){
      lines.push(`${r.code}  ${r.name}  -  ${palletLabel(r.orderQty)}`);
    }
    lines.push('');
  }
  lines.push('TOTAL PALLETS TO ORDER: ' + palletLabel(data.orderTotal));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function buildMaterialsSummary(){
  return buildShareSummary();
}

function buildMaterialsSummaryHtml(){
  const {data, orderRows} = getOrderRows();
  if(!orderRows.length) return '';
  const groups = getRowsGroupedBySeries(orderRows);
  const today = new Date().toLocaleDateString('en-AU', {day:'2-digit', month:'short', year:'numeric'});
  let html = '';

  html += '<div class="summary-title-card">';
  html += '<div class="summary-brand">BT BLOCK ORDER</div>';
  html += '<div class="summary-main-title">Materials Summary</div>';
  html += '<div class="summary-sub-title">Pallet order sheet</div>';
  html += '</div>';

  html += '<div class="summary-status"><span>Ready to order</span><strong>'+escHtml(today)+'</strong></div>';

  html += '<div class="summary-job summary-meta-grid">';
  html += '<div class="summary-meta-item"><span>Job</span><strong>'+escHtml(data.jobName || 'Not entered')+'</strong></div>';
  html += '<div class="summary-meta-item"><span>Site</span><strong>'+escHtml(data.siteAddress || 'Not entered')+'</strong></div>';
  html += '<div class="summary-meta-item"><span>Supplier</span><strong>'+escHtml(data.supplierName || 'Not entered')+'</strong></div>';
  html += '<div class="summary-meta-item"><span>Order Date</span><strong>'+escHtml(today)+'</strong></div>';
  html += '</div>';

  html += '<div class="summary-series-list">';
  for(const group of groups){
    const seriesTotal = group.rows.reduce((sum, r) => sum + r.orderQty, 0);
    const itemText = group.rows.length === 1 ? '1 block type' : group.rows.length + ' block types';
    html += '<section class="summary-series-card summary-series-'+escHtml(group.series)+'">';
    html += '<div class="summary-series-head">';
    html += '<div class="summary-series-title-wrap"><span>'+escHtml(getSeriesLabel(group.series))+'</span><em>'+itemText+'</em></div>';
    html += '<strong>'+palletLabel(seriesTotal)+'</strong>';
    html += '</div>';
    html += '<div class="summary-row summary-row-heading"><div>Code</div><div>Block Type</div><div>Pallets</div></div>';
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
  const html = buildMaterialsSummaryHtml();
  if(!html){ alert('No order quantities filled in yet.'); return; }
  const w = window.open('', '_blank');
  if(!w){ alert('Pop-up blocked. Please allow pop-ups to print.'); return; }
  const css = `
    body{font-family:Arial,sans-serif;padding:20px;color:#111;background:#fff;}
    .summary-title-card{border:3px solid #111;padding:14px;text-align:center;margin-bottom:12px;background:#ffea00;}
    .summary-brand{font-size:24px;font-weight:900;letter-spacing:1px;}
    .summary-main-title{font-size:18px;font-weight:900;text-transform:uppercase;margin-top:4px;}
    .summary-sub-title{font-size:12px;font-weight:900;margin-top:4px;}
    .summary-status,.summary-job,.summary-series-card,.summary-grand-total{border:2px solid #111;margin-bottom:10px;padding:9px;}
    .summary-status{display:flex;justify-content:space-between;font-weight:900;}
    .summary-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .summary-meta-item span{display:block;font-size:10px;text-transform:uppercase;color:#555;font-weight:900;}
    .summary-meta-item strong{display:block;font-size:13px;font-weight:900;}
    .summary-series-head{display:flex;justify-content:space-between;background:#111;color:#fff;padding:8px;font-weight:900;margin:-9px -9px 0;}
    .summary-series-head strong{color:#ffea00;}
    .summary-series-head em{display:block;color:#ffea00;font-size:10px;font-style:normal;}
    .summary-row{display:grid;grid-template-columns:80px 1fr 110px;gap:8px;padding:7px 0;border-bottom:1px solid #ddd;align-items:center;}
    .summary-row-heading{font-size:10px;text-transform:uppercase;color:#555;font-weight:900;}
    .summary-row-code,.summary-row-name,.summary-row-qty{font-weight:900;}
    .summary-row-qty{text-align:right;}
    .summary-grand-total{text-align:center;background:#ffea00;}
    .summary-grand-total span{display:block;font-size:12px;font-weight:900;}
    .summary-grand-total strong{display:block;font-size:28px;font-weight:900;}
  `;
  w.document.write('<!doctype html><html><head><title>Materials Summary</title><style>'+css+'</style></head><body>'+html+'<script>window.onload=function(){window.print();}<\/script></body></html>');
  w.document.close();
}

function closeMaterialsSummary(){
  const modal = document.getElementById('summaryModal');
  if(modal) modal.style.display = 'none';
}
