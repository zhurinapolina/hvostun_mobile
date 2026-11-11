/* Полный прогон фронтенда: размеры экрана × состояния × клавиатура × крупный шрифт.
   Проверяет: наложения текста и элементов, кнопки вне экрана или под другими элементами,
   горизонтальный вылет, обрезанный текст, слишком мелкие цели нажатия.
   __matrix({sizes:[[w,h],...], kb:true|false, font:1|1.3, only:'имя состояния'}) */
(function(){
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app');
const vis=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0.05&&e.getClientRects().length>0};
const anc=e=>{for(let p=e.parentElement;p;p=p.parentElement){if(!vis(p))return false;if(p.id==='app')return true}return true};
const nm=e=>{const c=String(e.className?.baseVal??e.className??'').split(' ')[0];return e.tagName.toLowerCase()+(c?'.'+c:'')+':'+(e.textContent||e.value||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,22)};
const LONG='Барбарисочка Лапушка Длинноим';
const LONGMSG='Собака '+'очень'.repeat(40)+' долго не спит ночью, когда остаётся одна, и скулит под дверью уже вторую неделю подряд';
const P=()=>window.__p;
const filled=()=>({name:'Васёк',age:'старше 7 лет',sex:'мальчик',date:'07.07.2026',from:'из приюта',first:'нет, раньше были собаки'});
function base(o){const s={profile:'none',survey:'none',draft:{},pos:'aq:vv',ans:{},vv:{},free:{},chat:[],greeted:false};return Object.assign(s,o)}
async function show(r,st){P().st=st;P().go(r,{back:true,keep:true});await wait(60)}
const GREET='Привет! Я ИИ-помощник по вопросам ухода за питомцем. Помогу разобраться в вашем вопросе. <br>Что вас интересует?';
const ANS='[Текст ответа ассистента по материалам книг: пояснение и шаги]';
const chatAll=()=>[{t:'a',x:GREET},{t:'u',x:'Как приучить собаку спать на месте?'},{t:'a',x:ANS,rate:true,v:'up'},{t:'u',x:'кот'},{t:'a',x:'Кажется, вопрос не про собаку'},
  {t:'u',x:'укус'},{t:'a',x:'Это требует очной помощи. Обратитесь в ветеринарную клинику.'},{t:'u',x:LONGMSG},{t:'a',x:ANS,rate:true,v:'down',sent:true},{t:'uf',x:'сбой',q:'сбой'},{t:'u',x:'таймаут'},{t:'fail',q:'таймаут'},{t:'u',x:'ещё вопрос'},{t:'typing'}];

/* состояния: [имя, есть ли поле ввода, функция подготовки] */
const STATES=[
 ['S1',0,()=>show('s1',base())],
 ['S2',1,()=>show('s2',base())],
 ['S2 E2',1,async()=>{await show('s2',base());$('#app .b0,#app .b1').disabled=false;$('#app input[type=checkbox]').click();$('#app .b1').click();await wait(30)}],
 ['S2 вход',1,async()=>{await show('s2',base());const i=$$('#app input.in');i[0].value='anna@mail.ru';i[1].value='12345678';$('#app input[type=checkbox]').click();$('#app .b1').click();await wait(30)}],
 ['E6',0,()=>show('e6',base())],
 ['A',0,()=>show('s3',base())],
 ['A2',0,()=>show('s3',base({profile:'partial',draft:{name:'Васёк'}}))],
 ['B длинная кличка',0,()=>show('s3',base({profile:'done',draft:{...filled(),name:LONG}}))],
 ['C',0,()=>show('s3',base({profile:'done',survey:'started',draft:filled()}))],
 ['D',0,()=>show('s3',base({profile:'done',survey:'done',draft:filled()}))],
 ['S4 пустая',1,()=>show('s4',base())],
 ['S4 все ошибки',1,async()=>{await show('s4',base());$('#app form .b1.w').click();await wait(30)}],
 ['S4 дата в будущем',1,async()=>{await show('s4',base({draft:{...filled(),date:'01.01.2031'}}));$('#app form .b1.w').click();await wait(30)}],
 ['S4 календарь',0,async()=>{await show('s4',base({draft:filled()}));$('#app .iw').click();await wait(60)}],
 ['S4 заполнено',1,()=>show('s4',base({draft:{...filled(),name:LONG,from:'от прежних хозяев',first:'нет, сейчас в доме есть и другие собаки'}}))],
 ['S4 сохранение',1,async()=>{await show('s4',base({draft:filled()}));$('#app form .b1.w').click();await wait(30)}],
 ['S4b первый',0,()=>show('s4b',base({profile:'done',draft:{...filled(),name:LONG,from:'от прежних хозяев',first:'нет, сейчас в доме есть и другие собаки'}}))],
 ['S4b повторный',0,()=>show('s4b',base({profile:'done',survey:'started',draft:filled()}))],
 ['S5',0,()=>show('s5',base({profile:'done',draft:filled()}))],
 ['Введение',1,()=>show('aq:vv',base({profile:'done',survey:'started',draft:filled()}))],
 ['Введение ошибки',1,async()=>{await show('aq:vv',base({profile:'done',survey:'started',draft:filled()}));$('#app .ft .b1').click();await wait(30)}],
 ['Введение не из приюта',1,()=>show('aq:vv',base({profile:'done',survey:'started',draft:{...filled(),from:'от заводчика'}}))],
 ['Перебивка 1',0,()=>show('aq:pb:1',base({profile:'done',survey:'started',draft:filled()}))],
 ['Вступление длинное',0,()=>show('aq:in:4',base({profile:'done',survey:'started',draft:filled()}))],
 ['Вопрос',0,()=>show('aq:q:1',base({profile:'done',survey:'started',draft:filled()}))],
 ['Длинный вопрос, X',0,()=>show('aq:q:16',base({profile:'done',survey:'started',draft:filled(),ans:{16:'X'}}))],
 ['Свободный ответ',1,async()=>{await show('aq:fr:8',base({profile:'done',survey:'started',draft:filled(),free:{8:LONGMSG}}))}],
 ['Перебивка 8',0,()=>show('aq:pb:8',base({profile:'done',survey:'started',draft:filled()}))],
 ['S9',0,()=>show('s9',base({profile:'done',survey:'done',draft:filled()}))],
 ['Чат пустой',1,()=>show('chat',base({profile:'done',draft:filled()}))],
 ['Чат все сообщения',1,async()=>{await show('chat',base({profile:'done',draft:filled(),greeted:true,chat:chatAll()}));
   const ta=$('#app .ta');ta.value=LONGMSG;ta.dispatchEvent(new Event('input'));await wait(30)}],
 ['Чат отзыв',1,async()=>{await show('chat',base({profile:'done',draft:filled(),greeted:true,chat:chatAll().slice(0,3).map((m,i)=>i===2?{...m,v:null}:m)}));
   $('#app [data-c=down]').click();await wait(30);const ta=$('#app .bs textarea');ta.value=LONGMSG.repeat(3).slice(0,500);ta.dispatchEvent(new Event('input'));await wait(30)}],
];

function scroller(e){for(let p=e.parentElement;p&&p.id!=='app';p=p.parentElement){const s=getComputedStyle(p).overflowY;if((s==='auto'||s==='scroll')&&p.scrollHeight>p.clientHeight)return p}return null}
function clipRect(e){ // видимая часть с учётом прокручиваемых предков
  let r=e.getBoundingClientRect(),x0=r.left,y0=r.top,x1=r.right,y1=r.bottom;
  for(let p=e.parentElement;p&&p.id!=='app';p=p.parentElement){const s=getComputedStyle(p);
    if(s.overflowY!=='visible'||s.overflowX!=='visible'){const q=p.getBoundingClientRect();x0=Math.max(x0,q.left);y0=Math.max(y0,q.top);x1=Math.min(x1,q.right);y1=Math.min(y1,q.bottom)}}
  const a=app().getBoundingClientRect();x0=Math.max(x0,a.left);y0=Math.max(y0,a.top);x1=Math.min(x1,a.right);y1=Math.min(y1,a.bottom);
  return {x0,y0,x1,y1,ok:x1-x0>1&&y1-y0>1};
}
function textRects(root){ // строки текста как отдельные прямоугольники
  const out=[],tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){if(!n.textContent.trim())continue;const el=n.parentElement;if(!vis(el)||!anc(el)||el.closest('svg,#toast,option'))continue;
    const R=document.createRange();R.selectNodeContents(n);for(const r of R.getClientRects())if(r.width>1&&r.height>1)out.push({el,r,kind:'t',txt:n.textContent.trim().slice(0,22)})}
  return out;
}
function inOverlay(e){return e.closest('#app .bs,#app .dp,#app .ov')}
function issues(){
  const A=app(),a=A.getBoundingClientRect(),bad=[];
  const overlay=$('#app .bs,#app .dp');
  const ctrls=$$('#app [data-r],#app a,#app button,#app input:not([type=radio]):not([type=checkbox]),#app textarea,#app label.cx,#app .s11 button').filter(e=>vis(e)&&anc(e)&&!e.closest('svg'));
  // 1. каждую кнопку можно увидеть и нажать
  for(const e of ctrls){
    if(overlay&&!inOverlay(e))continue; // под открытым листом или календарём — так задумано
    const sc=scroller(e);
    if(sc){const r=e.getBoundingClientRect(),s=sc.getBoundingClientRect();const st=$('#app form.mn>.b1.w:last-child');const pad=sc.matches('form.mn')&&st&&getComputedStyle(st).position==='sticky'?84:0;
      if(r.top<s.top||r.bottom>s.bottom-pad)sc.scrollTop+=(r.top+r.height/2)-(s.top+(s.height-pad)/2)}
    const r=e.getBoundingClientRect();
    if(r.width<2||r.height<2){bad.push('нулевой размер '+nm(e));continue}
    const c=clipRect(e);
    if(!c.ok){bad.push('не видно '+nm(e));continue}
    const vh=(c.y1-c.y0)/r.height,vw=(c.x1-c.x0)/r.width;
    if(vh<.9||vw<.9)bad.push('обрезано '+Math.round(Math.min(vh,vw)*100)+'% '+nm(e));
    const x=(c.x0+c.x1)/2,y=(c.y0+c.y1)/2,h=document.elementFromPoint(x,y);
    if(!h||!(h===e||e.contains(h)||h.contains(e)||(e.matches('input,textarea')&&h.closest('.iw,.ir')===e.closest('.iw,.ir'))))bad.push('перекрыто '+nm(e)+' ← '+(h?nm(h):'пусто'));
    if(!e.closest('.nv,p,.mt,.ch,.tl,.dp')&&!e.matches('.tl,.tb,input,textarea')&&r.height<36)bad.push('мелко '+Math.round(r.height)+' '+nm(e));
  }
  // 2. наложения: текст на текст, текст на кнопку/иконку/картинку
  const atoms=textRects(A);
  $$('#app svg,#app img,#app .ti,#app .ar,#app .ic,#app .sn,#app input.in,#app .ta').forEach(e=>{if(vis(e)&&anc(e)&&!e.closest('button svg ~ *')&&e.getBoundingClientRect().width>2)atoms.push({el:e,r:e.getBoundingClientRect(),kind:'b'})});
  const clip=new Map();const cr=x=>{if(!clip.has(x.el))clip.set(x.el,clipRect(x.el));const c=clip.get(x.el);return {x0:Math.max(x.r.left,c.x0),y0:Math.max(x.r.top,c.y0),x1:Math.min(x.r.right,c.x1),y1:Math.min(x.r.bottom,c.y1)}};
  const stickies=$$('#app *').filter(e=>vis(e)&&getComputedStyle(e).position==='sticky');
  const inSticky=e=>stickies.find(s=>s.contains(e));
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const p=atoms[i],q=atoms[j];if(p.el===q.el||p.el.contains(q.el)||q.el.contains(p.el))continue;
    if(!!inOverlay(p.el)!==!!inOverlay(q.el))continue;
    if(inSticky(p.el)!==inSticky(q.el))continue; // контент прокручивается под закреплённой кнопкой — так задумано, конец проверяется ниже
    if(p.kind==='b'&&q.kind==='b'&&(p.el.closest('.iw,.ir,.ti,.ar,.ic,.sn')===q.el.closest('.iw,.ir,.ti,.ar,.ic,.sn')))continue;
    const A1=cr(p),B1=cr(q);const w=Math.min(A1.x1,B1.x1)-Math.max(A1.x0,B1.x0),h=Math.min(A1.y1,B1.y1)-Math.max(A1.y0,B1.y0);
    if(w>2&&h>2)bad.push('наложение '+(p.txt||nm(p.el))+' × '+(q.txt||nm(q.el)));
  }
  // 3. горизонтальный вылет и обрезанный текст
  if(document.documentElement.scrollWidth>innerWidth+1)bad.push('страница шире экрана');
  for(const t of atoms){if(t.kind!=='t')continue;if(t.r.right>a.right+1||t.r.left<a.left-1)bad.push('текст за краем '+t.txt)}
  $$('#app *').forEach(e=>{if(!vis(e)||!anc(e)||e.closest('svg'))return;const s=getComputedStyle(e);
    if(e.scrollWidth>e.clientWidth+1&&s.overflowX!=='visible'&&!e.matches('input,textarea,.ms,.mn,.ce'))bad.push('обрезан по ширине '+nm(e))});
  // 4. закреплённая кнопка не прячет конец содержимого: прокручиваем до конца и смотрим, что над ней
  for(const sticky of stickies){const f=sticky.parentElement;f.scrollTop=f.scrollHeight;
    const prev=[...f.children].filter(c=>c!==sticky&&vis(c)&&getComputedStyle(c).position!=='sticky'&&c.getBoundingClientRect().height>0).pop();
    if(prev&&prev.getBoundingClientRect().bottom>sticky.getBoundingClientRect().top+1)bad.push('конец под закреплённой '+nm(sticky))}
  return [...new Set(bad)];
}
function scaleFonts(f){if(f===1)return;const els=$$('#app *');const fs=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=fs[i]*f+'px')}

window.__issues=issues;window.__states=STATES;
window.__matrix=async function(o={}){
  const A=app(),sizes=o.sizes||[[360,640]],res={};
  const old=A.getAttribute('style')||'';
  for(const [W,H] of sizes){
    for(const [name,hasInput,prep] of STATES){
      if(o.only&&!name.includes(o.only))continue;
      const modes=o.kb&&hasInput?[false,true]:[false];
      for(const kb of modes){
        const h=kb?Math.round(H-(W>H?H*.55:Math.min(H*.42,330))):H;
        A.style.cssText=old+`;flex:none;width:${W}px;height:${h}px`;
        A.classList.toggle('kb',kb);
        await prep();A.classList.toggle('kb',kb);await wait(40);
        scaleFonts(o.font||1);P().refit&&P().refit();await wait(20);
        const b=issues();
        if(b.length)res[`${W}×${H}${kb?' клав.'+h:''}${o.font>1?' шрифт×'+o.font:''} · ${name}`]=b;
      }
    }
  }
  A.setAttribute('style',old);A.classList.remove('kb');
  return res;
};
})();1
