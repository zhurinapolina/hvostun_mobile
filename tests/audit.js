window.__audit=function(){
  const P=window.__p,app=document.getElementById('app'),out=[];
  const R=app.getBoundingClientRect();
  const vis=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length};
  P.JUMP.forEach((j,i)=>{
    P.preset(i);const bad=[];
    const n=e=>e.tagName.toLowerCase()+'.'+String(e.className.baseVal??e.className).split(' ')[0]+':'+(e.textContent||'').trim().slice(0,18);
    if(document.documentElement.scrollWidth>innerWidth+1)bad.push('pageX');
    app.querySelectorAll('*').forEach(e=>{
      if(!vis(e)||e.closest('svg')&&e.tagName!=='svg'||e.id==='toast')return;
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);
      if(r.width&&(r.right>R.right+1||r.left<R.left-1)&&!e.closest('.pic-b,.art'))bad.push('X:'+n(e));
      if(e.scrollWidth>e.clientWidth+1&&s.overflowX!=='visible'&&!e.matches('input,textarea'))bad.push('clipX:'+n(e));
      if(!e.closest('.nv')&&e.children.length===0&&e.textContent.trim()&&s.whiteSpace==='nowrap'&&e.scrollWidth>e.clientWidth+1)bad.push('nowrap:'+n(e));
      if(e.matches('a,button,.cx,.s11 label')&&!e.matches('.nv a')&&r.height&&r.height<36&&!e.closest('p,.ch'))bad.push('tap'+Math.round(r.height)+':'+n(e));
    });
    app.querySelectorAll('.b1,.b0,.b2,.nx,.wg,.cd,.ic,.nv a').forEach(e=>{
      if(!vis(e))return;e.scrollIntoView({block:'nearest'});
      const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      const h=document.elementFromPoint(x,y);
      if(!h||!(h===e||e.contains(h)||h.contains(e)))bad.push('cover:'+n(e)+'<'+(h?n(h):'null'));
    });
    const sc=[...app.querySelectorAll('.mn,.ms,.ce')].filter(e=>e.scrollHeight>e.clientHeight+1).length;
    out.push(j[0]+(sc?' ↕':'')+': '+(bad.length?[...new Set(bad)].join(' | '):'ok'));
  });
  return out.join('\n');
};1
window.__errs=async function(){
  // длинные ошибки в строке подписи: не наезжают на название поля и на соседнее поле
  const P=window.__p,$=(s)=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],bad=[];
  P.preset(8);$$('#app form input[type=radio]').find(r=>r.parentElement.textContent.trim()==='другое').click();
  const d=$('#f-date');d.value='01.01.2030';$('#app form .b1.w').click();
  $$('#app .miss').forEach(m=>{const e=m.querySelector(':scope>.et'),l=m.querySelector('label,legend');if(!e||!l)return;
    const R=document.createRange();R.selectNodeContents(l);const a=R.getBoundingClientRect(),b=e.getBoundingClientRect();
    if(a.right>b.left-2&&a.bottom>b.top&&a.top<b.bottom)bad.push(l.textContent.trim()+' × '+e.textContent.trim()+' '+Math.round(a.right)+'>'+Math.round(b.left));
    if(b.right>$('#app').getBoundingClientRect().right)bad.push('вне экрана '+e.textContent)});
  return ($$('#app .miss').length)+' ошибок; '+(bad.join(' | ')||'наложений нет');
};1
