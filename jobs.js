const JOBS_KEY = 'bt_block_order_jobs_v4';
const OLD_JOBS_KEY = 'bt_block_order_jobs_v3';
const CURRENT_JOB_KEY = 'bt_block_order_current_job_v4';
const OLD_CURRENT_JOB_KEY = 'bt_block_order_current_job_v3';

const JOB_FIELDS = [
  'jobName','siteAddress','builderName','supervisorName','supervisorPhone',
  'purchaseOrder','deliveryDate','deliveryTime','supplierName','supplierContact',
  'supplierPhone','supplierEmail','deliveryInstructions'
];

function getValue(id){ return (document.getElementById(id)?.value || '').trim(); }
function setValue(id, value){ const el=document.getElementById(id); if(el) el.value = value || ''; }

function migrateOldJobs(){
  const existing = localStorage.getItem(JOBS_KEY);
  if(existing) return;
  const old = localStorage.getItem(OLD_JOBS_KEY);
  if(!old) return;
  try{
    const oldJobs = JSON.parse(old) || [];
    const migrated = oldJobs.map(job => ({
      jobName: job.name || '',
      siteAddress: job.address || '',
      builderName: job.builderName || '',
      supervisorName: job.supervisorName || '',
      supervisorPhone: job.supervisorPhone || '',
      purchaseOrder: job.purchaseOrder || '',
      deliveryDate: job.deliveryDate || '',
      deliveryTime: job.deliveryTime || '',
      supplierName: job.supplierName || '',
      supplierContact: job.supplierContact || '',
      supplierPhone: job.supplierPhone || '',
      supplierEmail: job.supplierEmail || '',
      deliveryInstructions: job.deliveryInstructions || ''
    }));
    localStorage.setItem(JOBS_KEY, JSON.stringify(migrated));
    const oldCurrent = localStorage.getItem(OLD_CURRENT_JOB_KEY);
    if(oldCurrent !== null) localStorage.setItem(CURRENT_JOB_KEY, oldCurrent);
  }catch(e){}
}

function getJobs(){
  migrateOldJobs();
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
  const name=getValue('jobName');
  const address=getValue('siteAddress');
  const builder=getValue('builderName');
  const supplier=getValue('supplierName');
  const po=getValue('purchaseOrder');
  const summary=document.getElementById('jobSummary');
  if(!summary) return;
  if(!name && !address && !builder && !supplier && !po){
    summary.textContent = statusText || 'No job selected';
  } else {
    const parts=[];
    parts.push(name || 'Unnamed Job');
    if(address) parts.push(address);
    if(builder) parts.push(builder);
    if(supplier) parts.push(supplier);
    if(po) parts.push('PO ' + po);
    if(statusText) parts.push(statusText);
    summary.textContent = parts.join(' • ');
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
    const name = job.jobName || job.name || 'Unnamed Job';
    const address = job.siteAddress || job.address || '';
    opt.textContent=name + (address ? ' — ' + address : '');
    sel.appendChild(opt);
  });
  if(current !== '' && getJobs()[Number(current)]) sel.value=current;
  else sel.value='';
}

function clearJobFields(){ JOB_FIELDS.forEach(id => setValue(id, '')); }

function fillJobFields(job){
  setValue('jobName', job.jobName || job.name || '');
  setValue('siteAddress', job.siteAddress || job.address || '');
  setValue('builderName', job.builderName || '');
  setValue('supervisorName', job.supervisorName || '');
  setValue('supervisorPhone', job.supervisorPhone || '');
  setValue('purchaseOrder', job.purchaseOrder || '');
  setValue('deliveryDate', job.deliveryDate || '');
  setValue('deliveryTime', job.deliveryTime || '');
  setValue('supplierName', job.supplierName || '');
  setValue('supplierContact', job.supplierContact || '');
  setValue('supplierPhone', job.supplierPhone || '');
  setValue('supplierEmail', job.supplierEmail || '');
  setValue('deliveryInstructions', job.deliveryInstructions || '');
}

function loadSelectedJob(){
  const sel=document.getElementById('jobSelect');
  const idx=sel ? sel.value : '';
  localStorage.setItem(CURRENT_JOB_KEY, idx);
  if(idx===''){
    clearJobFields();
    updateJobSummary('Unsaved');
    return;
  }
  const job=getJobs()[Number(idx)];
  if(job){
    fillJobFields(job);
    updateJobSummary('Saved');
  }
}

function markJobChanged(){ updateJobSummary('Changed'); }

function collectJobData(){
  const data={};
  JOB_FIELDS.forEach(id => data[id] = getValue(id));
  data.name = data.jobName || 'Unnamed Job';
  data.address = data.siteAddress || '';
  return data;
}

function saveJob(){
  const data = collectJobData();
  const hasAny = JOB_FIELDS.some(id => data[id]);
  if(!hasAny){ alert('Enter job, site, builder, supplier or delivery details first.'); return; }
  let jobs=getJobs();
  let idx=document.getElementById('jobSelect').value;
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
  clearJobFields();
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
