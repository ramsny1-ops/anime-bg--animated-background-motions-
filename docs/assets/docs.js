
const root=document.documentElement;const themeButton=document.querySelector('#themeButton');const mobileButton=document.querySelector('#mobileNavButton');const sidebar=document.querySelector('.sidebar');
const saved=localStorage.getItem('anime-bg:docs-theme');if(saved==='light'||saved==='dark')root.dataset.theme=saved;
function syncThemeLabel(){if(themeButton)themeButton.textContent=root.dataset.theme==='light'?'Dark':'Light';}syncThemeLabel();
themeButton?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem('anime-bg:docs-theme',root.dataset.theme);syncThemeLabel();});
mobileButton?.addEventListener('click',()=>{if(!sidebar)return;const open=sidebar.style.display==='block';sidebar.style.display=open?'none':'block';if(!open){sidebar.style.position='fixed';sidebar.style.inset='64px 0 0 0';sidebar.style.zIndex='40';sidebar.style.background='var(--bg)';sidebar.style.height='calc(100vh - 64px)';}});
document.querySelectorAll('pre').forEach(pre=>{const button=document.createElement('button');button.className='copy-code';button.type='button';button.textContent='Copy';button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.innerText.replace(/^Copy\n/,''));button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1200);}catch{button.textContent='Unavailable';}});pre.append(button);});
const current=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.nav-link').forEach(link=>{if(link.getAttribute('href')===current)link.setAttribute('aria-current','page');});

const docSearch=document.querySelector('.searchbox');
docSearch?.addEventListener('input',()=>{
  const query=docSearch.value.trim().toLowerCase();
  document.querySelectorAll('.sidebar .nav-link').forEach(link=>{
    const projectUtility=link.getAttribute('href')?.startsWith('../');
    if(projectUtility){link.hidden=false;return;}
    link.hidden=Boolean(query)&&!link.textContent.toLowerCase().includes(query);
  });
});
