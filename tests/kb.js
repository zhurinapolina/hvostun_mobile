window.__kb=async function(d){
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),P=window.__p,log=[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const app=$('#app');
  const inView=e=>{const a=app.getBoundingClientRect(),r=e.getBoundingClientRect();return r.top>=a.top-1&&r.bottom<=a.bottom+1};
  const covered=(e)=>{const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(h===e||e.contains(h)||h?.contains(e))};
  for(const [name,idx,sel] of [['S2 логин',1,'.fl input,.iw input,input.in'],['S4 кличка',8,'#f-name'],['S4 дата',8,'#f-date'],['Чат',14,'.ta']]){
    P.device(d,false,true);P.preset(idx);await wait(40);
    P.device(d,true,true);await wait(40);
    const el=$('#app '+sel);el.focus();el.dispatchEvent(new FocusEvent('focusin',{bubbles:true}));await wait(800);
    const nav=$('#app .nv');
    log.push(name+': поле видно='+inView(el)+' не перекрыто='+!covered(el)+' меню='+(nav?getComputedStyle(nav).display:'нет')+' app='+Math.round(app.getBoundingClientRect().height));
    if(idx===14){const sn=$('#app .sn'),ai=$('#app .aiw');log.push('  отправить видно='+inView(sn)+' подпись ИИ='+(ai?getComputedStyle(ai).display:'нет'))}
    if(idx===8){const b=$('#app form .b1.w');log.push('  Готово видно='+inView(b)+' не перекрыто='+!covered(b))}
    el.blur();
  }
  P.device(d,false,true);
  // безопасные зоны
  const pad={};for(const [n,i] of [['S1',0],['A',3],['S4',8],['S6',12],['Чат',14],['E6',15]]){P.preset(i);await wait(30);
    const ph=$('#app .ph'),a=app.getBoundingClientRect();const f=$('#app .hd,#app .mn,#app .ms,#app .ce');const nv=$('#app .nv,#app .ft,#app .ip');
    const last=$$('#app .nv a,#app .ft button,#app .ip .ta,#app .ip .sn').slice(-1)[0];
    pad[n]='top '+Math.round(f.getBoundingClientRect().top-a.top)+' низ '+(last?Math.round(a.bottom-last.getBoundingClientRect().bottom):'-')}
  log.push(JSON.stringify(pad));
  return log.join('\n');
};1
