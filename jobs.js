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
    summary.textContent = statusText || 'No job selected';
  } else {
    summary.textContent = (name || 'Unnamed Job') + (address ? ' • ' + address : '') + (supplier ? ' • ' + supplier : '') + (statusText ? ' • '+statusText : '');
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


