(function(){
const T=window.__T, ICON=window.__ICON;
const app=document.getElementById('app'), frame=document.getElementById('frame'), toastEl=document.getElementById('toast');
const blank=()=>({profile:'none',survey:'none',draft:{},score:null,chat:[],greeted:false});
let st=blank(), cur='s1', stack=[], busy=false, timers=[];
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
const clearTimers=()=>{timers.forEach(clearTimeout);timers=[]};
const $=(s,r=app)=>r.querySelector(s), $$=(s,r=app)=>[...r.querySelectorAll(s)];
function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>toastEl.classList.remove('on'),2200)}

function homeKey(){if(st.profile==='none')return 'a';if(st.profile==='partial')return 'a2';if(st.survey==='none')return 'b';return st.survey==='started'?'c':'d'}
function navHTML(active){
  const ready=st.profile==='done', plan=ready&&st.survey!=='none';
  const items=[['home','Главная',true],['profile','Профиль',ready||active==='profile'],['plan','План адаптации',plan||active==='plan'],['chat','Чат',ready]];
  return '<nav class="nv" aria-label="Меню">'+items.map(([r,l,ok])=>{
    if(r===active)return `<a class="on" data-r="${r}" aria-current="page">${l}</a>`;
    return ok?`<a data-r="${r}">${l}</a>`:`<a class="off" aria-disabled="true">${l}</a>`}).join('')+'</nav>';
}
const wide=()=>window.matchMedia('(min-width:760px) and (min-height:560px)').matches;
/* прокрутка только внутри экрана: scrollIntoView в рамке claude.ai двигал бы и саму страницу */
function reveal(el){const sc=el.parentElement&&el.parentElement.closest('.mn,.ms,.ce');if(!sc)return;const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect();sc.scrollTop+=(r.top+r.height/2)-(s.top+s.height/2)}
const CSS=window.__CSS,sheet=document.getElementById('board');let sheetKey='';
function useSheet(key){
  const k=key.startsWith('h_')?'home':key.startsWith('s4b')?'s4b':key;
  if(k===sheetKey)return;sheetKey=k;
  sheet.textContent=CSS.screens[k].map(i=>CSS.pool[i]).join('');
}
function mount(key,cls){
  useSheet(key);
  const box=document.createElement('div');box.innerHTML=T[key];const ph=box.firstElementChild;
  app.querySelector('.ph')?.remove();app.prepend(ph);
  const nv=ph.querySelector(':scope>.nv');if(nv)nv.outerHTML=navHTML(cls);
  const top=ph.classList.contains('g')?'#3352a3':'#ffffff',bot=nv?'#ffffff':top;
  document.documentElement.style.background=wide()?'':`linear-gradient(${top} 50%,${bot} 50%)`;
  return ph;
}
function saveDraft(){
  const f=$('form.mn');if(!f)return;
  const d={};d.name=$('#f-name').value.trim();d.date=$('#f-date').value.trim();
  $$('input[type=radio]:checked',f).forEach(r=>d[r.name]=r.value);
  st.draft=d;
  if(st.profile!=='done')st.profile=Object.values(d).some(Boolean)?'partial':'none';
}
function go(r,o={}){
  if(cur==='s4'&&r!=='s4'&&!o.keep)saveDraft();
  clearTimers();busy=false;
  if(r==='plan')r=st.survey==='none'?'s5':st.survey==='started'?'s6':'s9';
  if(r==='profile')r=st.profile==='done'?'s4b':'s4';
  if(r==='home')r='s3';
  if(!o.back&&cur!==r){stack.push(cur);try{history.pushState({n:stack.length},'')}catch(e){}}
  cur=r;({s1:s1,s2:s2,s3:s3,s4:s4,s4b:s4b,s5:s5,s6:s6,s9:s9,chat:chat,e6:e6})[r](o);
  paintPanel();
}
function s1(){mount('s1')}
function s2(o){
  const p=mount('s2');
  const b=$('.b1,.b0',p),ch=$('input[type=checkbox]',p);
  const sync=()=>{const on=ch.checked;b.className=(on?'b1':'b0')+' w';b.disabled=!on};
  ch.addEventListener('change',sync);sync();
  $('.ib',p)?.addEventListener('click',()=>{const i=$('.iw .in',p);i.type=i.type==='password'?'text':'password'});
  b.addEventListener('click',()=>{
    const l=$('.fl .in',p),pw=$('.iw .in',p);
    if(l.value.trim().toLowerCase()==='сбой'){go('e6');return}
    const bad=!l.value.trim()||!pw.value||l.value.trim().toLowerCase()==='ошибка';
    if(bad){$('.eslot',p).innerHTML=T.e2;return}
    $('.eslot',p).innerHTML='';b.setAttribute('aria-busy','true');b.innerHTML=ICON.spin+'Войти';
    $$('input',p).forEach(i=>i.disabled=true);busy=true;
    later(()=>{busy=false;go('s3')},800);
  });
  if(o.err)$('.eslot',p).innerHTML=T.e2;
}
function s3(){const k=homeKey();const p=mount('h_'+k,'home');const nm=$('.hn .nm',p);if(nm&&st.draft.name){nm.textContent=st.draft.name;fitName()}}
/* длинная кличка уменьшается, чтобы помещаться в строку, и переносится только если совсем не влезает */
function fitName(){
  const el=$('.hn .nm');if(!el)return;el.style.fontSize='';el.style.whiteSpace='nowrap';
  let fs=parseFloat(getComputedStyle(el).fontSize);
  while(el.scrollWidth>el.clientWidth+1&&fs>30){fs-=2;el.style.fontSize=fs+'px'}
  el.style.whiteSpace='';
}
/* ошибка стоит справа в строке названия поля; если вместе не помещаются (узкий экран, крупный шрифт),
   название переносится, а длинная ошибка занимает не больше 60% строки */
function fitErr(el){
  const et=el.querySelector(':scope>.et'),lb=el.querySelector(':scope>label,:scope>legend');if(!et||!lb)return;
  const nx=[...el.children].find(c=>c!==lb&&c!==et&&getComputedStyle(c).position!=='absolute');
  et.style.whiteSpace='';et.style.maxWidth='';et.style.textAlign='';lb.style.maxWidth='';if(nx)nx.style.marginTop='';
  const W=el.clientWidth;if(!W)return;
  if(et.getBoundingClientRect().width>W*.6){et.style.whiteSpace='normal';et.style.maxWidth=Math.floor(W*.6)+'px';et.style.textAlign='right'}
  lb.style.maxWidth=Math.max(60,W-Math.ceil(et.getBoundingClientRect().width)-10)+'px';
  // ошибка в две строки не наезжает на поле или чипы под ней
  if(nx){const ov=et.getBoundingClientRect().bottom+4-nx.getBoundingClientRect().top;if(ov>0)nx.style.marginTop=Math.ceil(parseFloat(getComputedStyle(nx).marginTop)+ov)+'px'}
}
new ResizeObserver(()=>{fitName();$$('.miss').forEach(fitErr)}).observe(app);
new ResizeObserver(()=>viewport()).observe(document.documentElement); // клавиатура, которая сжимает страницу, тоже заметна
function s4b(){const k=st.survey==='none'?'s4b1':'s4b2';const p=mount(k,'profile');fillProfile(p)}
const AGE={};
function fillProfile(p){
  const d=st.draft,rows=$$('.dl dd',p);
  if(!rows.length)return;
  const val=[d.name,d.age,d.sex,d.date,d.from,d.first];
  rows.forEach((r,i)=>{if(val[i])r.textContent=val[i]});
}
function s5(){const p=mount('s5','plan');$('.b1',p).addEventListener('click',e=>{e.preventDefault();st.survey='started';go('s6')})}
function s6(){
  const p=mount('s6');const btn=$('.ft .b0,.ft .b1',p);
  const paint=()=>{$$('.s11 button',p).forEach(b=>{const on=+b.textContent===st.score;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    const ok=st.score!==null;btn.className=ok?'b1':'b0';btn.disabled=!ok};
  paint();
  $$('.s11 button',p).forEach(b=>b.addEventListener('click',()=>{st.score=+b.textContent;paint()}));
  btn.addEventListener('click',()=>{if(st.score===null)return;st.survey='done';go('s9')});
}
function s9(){mount('s9','plan')}
function e6(){const p=mount('e6');$('.ce .b1',p).addEventListener('click',()=>go('s3'))}

/* профиль: форма */
function s4(){
  const p=mount('s4','profile'),f=$('form.mn',p);
  f.addEventListener('submit',e=>e.preventDefault());
  const name=$('.fl input.in',f),date=$('.iw .in',f);name.id='f-name';name.maxLength=30;name.autocomplete='off';date.id='f-date';name.value=st.draft.name||'';date.value=st.draft.date||'';
  const groups={};
  $$('fieldset',f).forEach(fs=>{const leg=$('legend',fs).textContent.trim();const key={'Возраст':'age','Пол':'sex','Откуда собака':'from','Это ваша первая собака?':'first'}[leg];groups[key]=fs;
    $$('input[type=radio]',fs).forEach(r=>{r.name=key;r.value=r.parentElement.textContent.trim();if(st.draft[key]===r.value){r.checked=true;mark(r)}})});
  $$('input[type=radio]',f).forEach(r=>r.addEventListener('change',()=>{mark(r);clear(r.closest('fieldset'))}));
  function mark(r){$$('.cx',r.closest('.cs')).forEach(l=>{const on=l.contains(r)&&r.checked||l.querySelector('input').checked;l.classList.toggle('on',on);const s=l.querySelector('svg');if(on&&!s)l.querySelector('input').insertAdjacentHTML('afterend',ICON.check);if(!on&&s)s.remove()})}
  function clear(el){el.classList.remove('miss');el.querySelector(':scope>.et')?.remove()}
  function err(el,txt){clear(el);el.classList.add('miss');el.insertAdjacentHTML('beforeend',`<div class="et" role="alert">${ICON.warn}<span>${txt}</span></div>`);fitErr(el)}
  name.addEventListener('input',()=>clear(name.closest('.fl')));
  picker(date,()=>clear(date.closest('.fl')));
  const btn=$('.b1.w',f);btn.removeAttribute('data-r');
  btn.addEventListener('click',()=>{
    if(busy)return;const bad=[];
    if(!name.value.trim()){err(name.closest('.fl'),'Укажите кличку');bad.push(name)}
    const chk=(k,t)=>{if(!$('input:checked',groups[k])){err(groups[k],t);bad.push(groups[k])}};
    chk('age','Выберите возраст');chk('sex','Выберите пол');
    const m=date.value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);let dt=null;
    if(m){dt=new Date(+m[3],+m[2]-1,+m[1]);if(dt.getMonth()!==+m[2]-1)dt=null}
    if(!dt){err(date.closest('.fl'),'Укажите дату');bad.push(date)}
    else if(dt>new Date()){err(date.closest('.fl'),'Дата в будущем');bad.push(date)}
    chk('from','Выберите, откуда собака');
    chk('first','Выберите вариант');
    if(bad.length){reveal(bad[0].closest('.fl,fieldset,.sub')||bad[0]);return}
    saveDraft();busy=true;
    btn.setAttribute('aria-busy','true');btn.innerHTML=ICON.spin+'Готово';
    $$('input',f).forEach(i=>i.disabled=true);$$('.cx',f).forEach(c=>c.classList.add('dis'));
    later(()=>{busy=false;st.profile='done';go('s3',{keep:true})},900);
  });
}

/* отзыв «Неполезно»: нижний лист поверх чата, сам чат не сдвигается */
function feedback(i){
  const p=$('.ph');if(!p||$('.bs',p))return;
  p.insertAdjacentHTML('beforeend',`<div class="ov"></div><div class="bs" role="dialog" aria-modal="true" aria-labelledby="bs-t"><div class="bs-h"><b id="bs-t">Что не так?</b><button class="x" type="button" aria-label="Закрыть">${ICON.close}</button></div><textarea aria-labelledby="bs-t" maxlength="500"></textarea><button class="b0" type="button" disabled>Отправить</button></div>`);
  const ov=$('.ov',p),s=$('.bs',p),ta=$('textarea',s),btn=$('.bs>button',s);
  ta.addEventListener('input',()=>{const ok=!!ta.value.trim();btn.disabled=!ok;btn.className=ok?'b1':'b0'});
  const esc=e=>{if(e.key==='Escape')close()};
  function close(){ov.remove();s.remove();document.removeEventListener('keydown',esc)}
  document.addEventListener('keydown',esc);ov.addEventListener('click',close);
  // нажатие не снимает фокус с поля, поэтому клавиатура не прячется до нажатия и кнопка не уезжает из-под пальца
  [btn,$('.x',s)].forEach(b=>b.addEventListener('pointerdown',e=>e.preventDefault()));
  $('.x',s).addEventListener('click',close);
  btn.addEventListener('click',()=>{if(btn.disabled)return;st.chat[i].sent=true;close()});
}

/* выпадающий календарь для даты */
const MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
function picker(input,onPick){
  const wrap=input.closest('.iw'),field=input.closest('.fl');
  input.readOnly=true;input.setAttribute('inputmode','none');input.setAttribute('aria-haspopup','dialog');input.setAttribute('aria-expanded','false');
  const p2=n=>String(n).padStart(2,'0');
  const parse=v=>{const m=v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?new Date(+m[3],+m[2]-1,+m[1]):null};
  let view=null,box=null;
  function draw(){
    const today=new Date(),sel=parse(input.value),y=view.getFullYear(),m=view.getMonth();
    const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();
    const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
    const atNow=y===today.getFullYear()&&m===today.getMonth();
    let g='';for(let i=0;i<first;i++)g+='<span></span>';
    for(let d=1;d<=days;d++){const dt=new Date(y,m,d);
      g+=`<button type="button" class="dp-d${same(dt,sel)?' on':''}${same(dt,today)?' td':''}" data-d="${d}"${dt>today?' disabled':''} aria-label="${d} ${MONTHS[m].toLowerCase()}">${d}</button>`}
    box.innerHTML=`<div class="dp-h"><button type="button" class="dp-n" data-m="-1" aria-label="Предыдущий месяц">${ICON.chev}</button><b aria-live="polite">${MONTHS[m]} ${y}</b><button type="button" class="dp-n" data-m="1" aria-label="Следующий месяц"${atNow?' disabled':''}>${ICON.chev}</button></div>
<div class="dp-w" aria-hidden="true"><span>пн</span><span>вт</span><span>ср</span><span>чт</span><span>пт</span><span>сб</span><span>вс</span></div><div class="dp-g">${g}</div>`;
  }
  function open(){
    if(box||input.disabled)return;const now=new Date();view=parse(input.value)||now;view=new Date(view.getFullYear(),view.getMonth(),1);
    box=document.createElement('div');box.className='dp';box.setAttribute('role','dialog');box.setAttribute('aria-label','Выбор даты');
    field.append(box);wrap.classList.add('open');input.setAttribute('aria-expanded','true');draw();
    box.addEventListener('click',e=>{const n=e.target.closest('.dp-n'),d=e.target.closest('.dp-d');
      if(n&&!n.disabled){view=new Date(view.getFullYear(),view.getMonth()+ +n.dataset.m,1);draw()}
      if(d&&!d.disabled){input.value=`${p2(d.dataset.d)}.${p2(view.getMonth()+1)}.${view.getFullYear()}`;close();onPick()}});
    setTimeout(()=>{document.addEventListener('pointerdown',outside,true);const sc=field.closest('.mn'),r=field.getBoundingClientRect(),s=sc.getBoundingClientRect(),bx=box.getBoundingClientRect();if(bx.bottom>s.bottom||r.top<s.top)sc.scrollTop+=Math.min(r.top-s.top-8,bx.bottom-s.bottom+12)},0);
  }
  function close(){if(!box)return;box.remove();box=null;wrap.classList.remove('open');input.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',outside,true)}
  function outside(e){if(box&&!box.contains(e.target)&&!wrap.contains(e.target))close()}
  wrap.addEventListener('click',()=>box?close():open());
  input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();box?close():open()}if(e.key==='Escape')close()});
  box=null;
}

/* чат */
const A={ai:ICON.ai,answer:'[Текст ответа ассистента по материалам книг: пояснение и шаги]',
 greet:'Привет! Я ИИ-помощник по вопросам ухода за питомцем. Помогу разобраться в вашем вопросе. <br>Что вас интересует?',
 off:'Кажется, вопрос не про собаку',none:'В моих материалах нет ответа на этот вопрос. Лучше уточнить у ветеринара или кинолога.',
 urgent:'Это требует очной помощи. Обратитесь в ветеринарную клинику.'};
const ai=()=>`<span class="ai" role="img" aria-label="ИИ-помощник">${A.ai}</span>`;
function msgHTML(m,i){
  if(m.t==='u')return `<div class="mu">${m.x}</div>`;
  if(m.t==='uf')return `<div class="mu fl">${m.x}</div><div class="mt"><span class="et" role="alert">${ICON.warn}Не отправлено</span><button class="tb" type="button" data-c="resend" data-i="${i}">Повторить</button><button class="tb" type="button" data-c="del" data-i="${i}">Удалить</button></div>`;
  if(m.t==='typing')return `<div class="ma" role="status">${ai()}<span class="dt" aria-hidden="true"><i></i><i style="background: #8a8a8a"></i><i style="background: #c4c4c4"></i></span><span>Печатает…</span></div>`;
  if(m.t==='fail')return `<div class="ma" role="alert" style="border-style: dashed"><span class="et">${ICON.warn}<span>Не удалось получить ответ</span></span><button class="b2" type="button" data-c="retry" data-i="${i}" style="align-self: flex-start">Повторить</button></div>`;
  if(m.t==='ur')return `<div class="ma ur" role="alert">${ai()}<span>${m.x}</span></div>`;
  let h=`<div class="ma">${ai()}<span>${m.x}</span></div>`;
  if(m.rate){const up=m.v==='up',dn=m.v==='down';
    h+=`<div class="ac"><button class="${up?'b1':'b2'}" type="button" aria-pressed="${up}" data-c="up" data-i="${i}">Полезно</button><button class="${dn?'b1':'b2'}" type="button" aria-pressed="${dn}" data-c="down" data-i="${i}">Неполезно</button></div>`;
  }
  return h;
}
function drawChat(){
  const ms=$('.ms');if(!ms)return;
  ms.innerHTML=st.chat.map(msgHTML).join('');ms.scrollTop=st.chat.length>1?ms.scrollHeight:0;
}
function reply(q,i){
  const low=q.toLowerCase();
  st.chat.push({t:'typing'});drawChat();syncSend();
  later(()=>{
    st.chat=st.chat.filter(m=>m.t!=='typing');
    if(/таймаут/.test(low))st.chat.push({t:'fail',q});
    else if(/укус|кров|отрав|судорог|срочно/.test(low))st.chat.push({t:'ur',x:A.urgent});
    else if(/(^|[^а-яё])кот(а|у|ом|е|ы|ик|ёнок|енок)?([^а-яё]|$)|кошк|погод/.test(low))st.chat.push({t:'a',x:A.off});
    else if(/нет ответа/.test(low))st.chat.push({t:'a',x:A.none});
    else st.chat.push({t:'a',x:A.answer,rate:true});
    drawChat();syncSend();
  },1300);
}
function send(text){
  const esc=text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  if(/сбой/.test(text.toLowerCase())){st.chat.push({t:'uf',x:esc,q:text});drawChat();return}
  st.chat.push({t:'u',x:esc});reply(text);
}
const typing=()=>st.chat.some(m=>m.t==='typing');
function syncSend(){const ta=$('.ta'),b=$('.sn');if(ta&&b)b.disabled=!ta.value.trim()||typing()}
function chat(){
  const p=mount('chat','chat');  /* дисклеймер остаётся над лентой, сообщения прокручиваются под ним */
  if(!st.greeted){st.greeted=true;st.chat.unshift({t:'a',x:A.greet})}
  drawChat();
  const ta=$('.ta',p),b=$('.sn',p);
  const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,128)+'px';syncSend()};
  ta.addEventListener('input',grow);grow();
  b.addEventListener('pointerdown',e=>e.preventDefault());
  b.addEventListener('click',()=>{const v=ta.value.trim();if(!v||typing())return;ta.value='';grow();send(v);ta.focus()});
  $('.ms',p).addEventListener('click',e=>{
    const t=e.target.closest('[data-c]');if(!t)return;const i=+t.dataset.i,m=st.chat[i],c=t.dataset.c;
    if(c==='up'){m.v=m.v==='up'?null:'up';m.sent=false}
    if(c==='down'){if(m.v==='down')m.v=null;else{m.v='down';m.sent=false;feedback(i)}}
    if(c==='del')st.chat.splice(i,1);
    if(c==='resend'){const q=m.q;st.chat[i]={t:'u',x:m.x};reply(q);return}
    if(c==='retry'){const q=m.q;st.chat.splice(i,1);reply(q);return}
    const top=$('.ms').scrollTop;drawChat();$('.ms').scrollTop=top;
  });
}

/* переходы */
app.addEventListener('click',e=>{
  const a=e.target.closest('[data-r]');
  if(a){e.preventDefault();if(!busy)go(a.dataset.r);return}
  const x=e.target.closest('[data-x]');
  if(x){e.preventDefault();toast(x.dataset.x);return}
  if(e.target.closest('a[href="#"]'))e.preventDefault();
});
window.addEventListener('popstate',()=>{const r=stack.pop();if(r&&!busy)go(r,{back:true})});

/* клавиатура и видимая область */
/* Режим «клавиатура открыта» включается только по факту: видимая область стала ниже.
   По фокусу его не включаем: на Android клавиатуру закрывают «Назад», а поле остаётся в фокусе,
   и тогда меню и «Готово» пропадали бы при уже закрытой клавиатуре. */
let base=0,baseW=0;
function viewport(){
  const v=window.visualViewport;if(!v||frame.classList.contains('kbsim'))return;
  if(wide())return;
  if(Math.abs(v.width-baseW)>1){baseW=v.width;base=0}
  base=Math.max(base,v.height);
  const kb=base-v.height>120;
  app.classList.toggle('kb',kb);
  const cs=getComputedStyle(document.documentElement),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
  app.style.height=kb?(v.height-pad)+'px':'';
  app.style.flex=kb?'none':'';
  app.style.transform=kb&&v.offsetTop?`translateY(${v.offsetTop}px)`:'';
  if(kb)window.scrollTo(0,0);
}
window.visualViewport?.addEventListener('resize',viewport);
window.visualViewport?.addEventListener('scroll',viewport);
window.addEventListener('orientationchange',()=>{base=0;setTimeout(viewport,300)});
const typing_=el=>el&&el.matches&&el.matches('input:not([type=checkbox]):not([type=radio]):not([readonly]),textarea');
app.addEventListener('focusout',e=>{
  if(!typing_(e.target))return;
  setTimeout(()=>{const a=document.activeElement;if(typing_(a)&&app.contains(a))return;
    if(wide()){if(kbs){kbs=false;device()}}else viewport()},80);
});
app.addEventListener('focusin',e=>{
  const el=e.target;if(!typing_(el))return;
  if(wide()){if(!kbs){kbs=true;device()}}
  setTimeout(()=>{viewport();if(el.classList.contains('ta')){const m=$('.ms');if(m)m.scrollTop=m.scrollHeight;return}
    reveal(el.closest('.fl,.sub,.fb')||el)},320);
});

/* пульт на широком экране */
const DEV={s:{w:320,h:568,t:20,b:0,k:216,n:'Маленький, 320 × 568'},m:{w:390,h:844,t:47,b:34,k:291,n:'Средний, 390 × 844'},l:{w:430,h:932,t:59,b:34,k:301,n:'Большой, 430 × 932'}};
let dev='m',safe=true,kbs=false;
function device(){
  const d=DEV[dev];frame.style.setProperty('--fw',d.w+'px');frame.style.setProperty('--fh',d.h+'px');frame.style.setProperty('--kh',d.k+'px');
  /* на телефоне отступы берутся из настоящих безопасных зон (--sat/--sab в :root), пульт их не трогает */
  if(!wide()){app.style.removeProperty('--sat');app.style.removeProperty('--sab');frame.classList.remove('kbsim');kbs=false;paintPanel();return}
  app.style.setProperty('--sat',safe?d.t+'px':'0px');app.style.setProperty('--sab',safe&&!kbs?d.b+'px':'0px');
  frame.classList.toggle('kbsim',kbs);app.classList.toggle('kb',kbs);
  frame.style.setProperty('--fs',Math.min(1,(window.innerHeight-48)/d.h));
  paintPanel();
}
const JUMP=[['S1','s1',{}],['S2','s2',{}],['E2','s2',{err:1}],['Главная A','s3',{}],['A2','s3',{profile:'partial'}],['B','s3',{profile:'done'}],['C','s3',{profile:'done',survey:'started'}],['D','s3',{profile:'done',survey:'done'}],['S4','s4',{}],['S4b, первый','s4b',{profile:'done'}],['S4b, повторный','s4b',{profile:'done',survey:'started'}],['S5','s5',{profile:'done'}],['S6','s6',{profile:'done',survey:'started'}],['S9','s9',{profile:'done',survey:'done'}],['Чат','chat',{profile:'done'}],['E6','e6',{}]];
const SAMPLE={name:'Васёк',age:'старше 7 лет',sex:'мальчик',date:'07.07.2026',from:'из приюта',first:'нет, раньше были собаки'};
function preset(i){const[, r,o]=JUMP[i];const keep=st.chat;st=Object.assign(blank(),o);st.chat=r==='chat'?keep:[];st.greeted=r==='chat'&&keep.length>0;if(o.profile==='done')st.draft={...SAMPLE};else if(o.profile==='partial')st.draft={name:'Васёк'};stack=[];cur='';go(r,{back:true,err:o.err,keep:true})}
function paintPanel(){
  const p=document.getElementById('panel');if(!p)return;
  p.querySelectorAll('[data-d]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.d===dev));
  p.querySelector('#t-kb').setAttribute('aria-pressed',kbs);p.querySelector('#t-safe').setAttribute('aria-pressed',safe);
}
document.getElementById('panel').innerHTML=`<h1>Хвостун</h1><p>Кликабельный прототип. На телефоне экран занимает всю область, здесь можно проверить размеры.</p>
<div><h2>Размер телефона</h2><div class="seg">${Object.entries(DEV).map(([k,d])=>`<button type="button" data-d="${k}">${d.n}</button>`).join('')}</div></div>
<div><h2>Проверка</h2><div class="seg"><button type="button" id="t-kb" hidden>Клавиатура открыта</button><button type="button" id="t-safe">Безопасные зоны</button></div><p style="margin-top:8px">Клавиатура появляется сама, когда нажимаете на поле ввода.</p></div>
<div><h2>Перейти к экрану</h2><div class="list">${JUMP.map((j,i)=>`<button type="button" data-j="${i}">${j[0]}</button>`).join('')}</div></div>
<div><button type="button" id="t-reset">Начать сначала</button></div>
<p>В чате: <code>кот</code> вопрос не про собаку, <code>нет ответа</code>, <code>укус</code> срочная тема, <code>сбой</code> не отправилось, <code>таймаут</code> нет ответа ассистента. На входе логин <code>ошибка</code> даёт E2, логин <code>сбой</code> даёт E6.</p>`;
document.getElementById('panel').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.d){dev=b.dataset.d;device()}
  if(b.id==='t-kb'){kbs=!kbs;device()}
  if(b.id==='t-safe'){safe=!safe;device()}
  if(b.dataset.j)preset(+b.dataset.j);
  if(b.id==='t-reset'){st=blank();stack=[];cur='';go('s1',{back:true,keep:true})}
});
window.addEventListener('resize',()=>{device();viewport()});
window.__p={refit:()=>$$('.miss').forEach(fitErr),viewport,go,preset,JUMP,get st(){return st},set st(v){st=v},send,device:(d,k,s)=>{dev=d;kbs=!!k;safe=s!==false;device()},cur:()=>cur};
device();
viewport(); // запомнить высоту экрана без клавиатуры сразу при загрузке
function start(){go('s1',{back:true,keep:true})}
start();
})();
