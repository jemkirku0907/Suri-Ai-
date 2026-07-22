const tabs=document.querySelectorAll('.scan-tabs button');
const input=document.querySelector('#claimInput');
const scanner=document.querySelector('.scanner');
const result=document.querySelector('#result');

tabs.forEach(tab=>tab.addEventListener('click',()=>{
  tabs.forEach(item=>item.classList.remove('active'));
  tab.classList.add('active');
  input.placeholder=tab.dataset.mode==='url'?'Paste a news article URL here...':'Type the claim you want to verify...';
}));

document.querySelector('#scanBtn').addEventListener('click',()=>{
  if(!input.value.trim()){
    input.focus();
    input.parentElement.style.borderColor='#145cff';
    return;
  }
  scanner.classList.add('scanning');
  setTimeout(()=>{
    scanner.classList.remove('scanning');
    result.hidden=false;
    result.scrollIntoView({behavior:'smooth',block:'center'});
  },1500);
});

document.querySelector('#closeResult').addEventListener('click',()=>result.hidden=true);
document.querySelector('.menu').addEventListener('click',()=>{
  const nav=document.querySelector('nav');
  nav.classList.toggle('mobile-open');
  Object.assign(nav.style,{display:nav.classList.contains('mobile-open')?'flex':'none',position:'absolute',top:'78px',left:'0',right:'0',padding:'25px',background:'#0d0f13',flexDirection:'column'});
});
