/* Хвостун, мобильный прототип: логика экранов.
   Прототип только изображает сервис: данные живут в переменной st, пока открыта страница, сервер имитируется задержками later().
   Все места, которые в продукте заменяет сервер, помечены комментарием «СЕРВЕР:» с запросом из api/openapi.yaml.
   Соответствие «экран — запрос — состояния» — docs/handoff.md, раздел 9. */
(function(){
const T=window.__T, ICON=window.__ICON;
const app=document.getElementById('app'), frame=document.getElementById('frame'), toastEl=document.getElementById('toast');
const V=window.__PLAN,RC=V.recs;
const blank=()=>({profile:'none',survey:'none',draft:{},pos:'aq:vv',ans:{},vv:{},free:{},chat:[],greeted:false,plan:newPlan(),recI:null,recFrom:'plan'});
let st=blank(), cur='s1', stack=[], busy=false, timers=[];
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
const clearTimers=()=>{timers.forEach(clearTimeout);timers=[]};
const $=(s,r=app)=>r.querySelector(s), $$=(s,r=app)=>[...r.querySelectorAll(s)];
function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>toastEl.classList.remove('on'),2200)}

function homeKey(){if(st.profile==='none')return 'a';if(st.profile==='partial')return 'a2';if(st.survey==='none')return 'b';if(st.survey==='started')return 'c';if(!st.plan.ready)return 'd';return st.plan.done&&retIdx()<0?'f':'e'}
function navHTML(active){
  const ready=st.profile==='done', plan=ready&&(st.survey==='started'||st.plan.ready);
  const items=[['home','Главная',true],['profile','Профиль',ready||active==='profile'],['plan','План',plan||active==='plan'],['chat','Чат',ready]];
  return '<nav class="nv" aria-label="Меню">'+items.map(([r,l,ok])=>{
    if(r===active)return `<a class="on" data-r="${r}" aria-current="page">${l}</a>`;
    return ok?`<a data-r="${r}">${l}</a>`:`<a class="off" aria-disabled="true">${l}</a>`}).join('')+'</nav>';
}
const wide=()=>window.matchMedia('(min-width:500px) and (min-height:500px)').matches;
/* прокрутка только внутри экрана: scrollIntoView в рамке claude.ai двигал бы и саму страницу */
function reveal(el){const sc=el.parentElement&&el.parentElement.closest('.mn,.ms,.ce');if(!sc)return;const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect();sc.scrollTop+=(r.top+r.height/2)-(s.top+s.height/2)}
const CSS=window.__CSS,sheet=document.getElementById('board');let sheetKey='';
function useSheet(key){
  const k=/^(h_|s8|s14|pl_)/.test(key)?'route':key.startsWith('aq_')?'anq':/^pb\d$/.test(key)?'pb':key;
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
/* СЕРВЕР: PUT /profile/draft — черновик профиля (status=partial) */
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
  if(r==='plan')r=st.survey==='none'?'s5':st.survey==='started'?(st.pos||'aq:vv'):st.plan.ready?'pl':'s8';
  if(r==='rec'&&cur!=='rec'){if(!o.keep)st.recFrom=cur==='s3'?'home':'plan';if(o.i==null)st.recI=activeIdx()}
  if(r==='profile')r=st.profile==='done'?'s4b':'s4';
  if(r==='home')r='s3';
  if(!o.back&&cur!==r&&cur!=='s8'&&cur!=='s14'){stack.push(cur);try{history.pushState({n:stack.length},'')}catch(e){}}
  cur=r;if(r.startsWith('aq:')){st.pos=r;anketa(r)}else({s1:s1,s2:s2,s3:s3,s4:s4,s4b:s4b,s5:s5,s8:s8,pl:plan,rec:rec,s14:s14,chat:chat,e6:e6})[r](o);
  paintPanel();
}
function s1(){mount('s1')}
/* СЕРВЕР: POST /auth/login — здесь вход пускает с любым логином; «ошибка» и «сбой» в логине показывают E2 и E6 */
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
/* СЕРВЕР: GET /me — состояние главной и меню считается из статусов профиля, анкеты, портрета и плана (homeKey, navHTML) */
function s3(){const k=homeKey();const p=mount('h_'+k,'home');paintHome(k,p)}
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
/* СЕРВЕР: POST /survey/start */
function s5(){const p=mount('s5','plan');$('.b1',p).addEventListener('click',e=>{e.preventDefault();if(st.survey==='none'){st.survey='started';st.pos='aq:vv'}go('plan')})}
/* анкета: «Введение» одной формой, 7 разделов C-BARQ (вступление, вопрос на экран, свободный ответ), перебивка после каждого раздела.
   Позиция — маршрут aq:vv | aq:pb:N | aq:in:N | aq:q:N | aq:fr:N; ответы сохраняются сразу, «×» ведёт на главную C */
const Q=window.__Q,SEC=Q.s,START=[];{let n=1;SEC.forEach((s,i)=>{START[i]=n;n+=s.q.length})}
const secOf=n=>{for(let i=SEC.length-1;i>=0;i--)if(n>=START[i])return i;return 0};
const plural=n=>n%10===1&&n%100!==11?'вопрос':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'вопроса':'вопросов';
function where(){const[,k,v]=(st.pos||'aq:vv').split(':'),n=+v;
  if(k==='q')return `Вопрос ${n} из 42`;if(k==='vv')return 'Раздел 1 из 8';if(k==='pb')return `Раздел ${Math.min(n+1,8)} из 8`;return `Раздел ${n} из 8`}
function prevOf(r){const[,k,v]=r.split(':'),n=+v;
  if(k==='vv')return 's5';if(k==='in')return n===2?'aq:vv':`aq:fr:${n-1}`;
  if(k==='q'){const i=secOf(n);return n===START[i]?`aq:in:${i+2}`:`aq:q:${n-1}`}
  if(k==='fr'){const i=n-2;return `aq:q:${START[i]+SEC[i].q.length-1}`}return null}
function nextOf(r){const[,k,v]=r.split(':'),n=+v;
  if(k==='vv')return 'aq:pb:1';if(k==='pb')return n<8?`aq:in:${n+1}`:null;if(k==='in')return `aq:q:${START[n-2]}`;
  if(k==='q'){const i=secOf(n);return n<START[i]+SEC[i].q.length-1?`aq:q:${n+1}`:`aq:fr:${i+2}`}
  if(k==='fr')return `aq:pb:${n}`;return null}
function ft(p,r,ok){
  const b=$('.ft .b2',p),n=$('.ft .b1,.ft .b0',p);
  if(b){b.removeAttribute('data-r');b.removeAttribute('href');b.setAttribute('role','button');b.tabIndex=0;b.addEventListener('click',e=>{e.preventDefault();const pr=prevOf(r);if(pr)go(pr)})}
  const set=v=>{if(!n)return;n.className=v?'b1':'b0';n.disabled=!v};set(ok);return {next:n,set};
}
/* ползунок прокрутки как на макете: тонкая полоска справа, длина — видимая доля, двигается вместе с текстом */
function sbar(p){
  const mn=$('.mn.anq,.mn.vv',p);if(!mn)return;const sb=document.createElement('i');sb.className='sb';sb.setAttribute('aria-hidden','true');p.append(sb);
  const upd=()=>{const ch=mn.clientHeight,sh=mn.scrollHeight;if(sh<=ch+2){sb.style.display='none';return}sb.style.display='';
    const tr=ch-12,h=Math.max(28,Math.round(tr*ch/sh)),y=mn.offsetTop+6+Math.round((tr-h)*mn.scrollTop/(sh-ch));sb.style.top=y+'px';sb.style.height=h+'px'};
  mn.addEventListener('scroll',upd,{passive:true});new ResizeObserver(upd).observe(mn);upd();
}
/* СЕРВЕР: PUT /survey/answers/{n}, PUT /survey/free/{section}, PUT /survey/position; на последней перебивке POST /survey/finish */
function anketa(r){
  const[,k,v]=r.split(':'),n=+v;
  if(k==='vv')return vvForm(r);
  if(k==='pb'){const p=mount('pb'+n);const b=$('.ft .b1',p);b.addEventListener('click',()=>{if(n<8)go(nextOf(r));else{st.survey='done';st.pos=null;go('s8')}});return}
  if(k==='in'){const s=SEC[n-2],p=mount('aq_in');const m=$('.mn.anq',p);
    m.innerHTML=`<p class="st">Раздел ${n} из 8 · ${s.q.length} ${plural(s.q.length)}</p><h1 class="sec-t">${s.t}</h1>${s.in}`;
    ft(p,r,true).next.addEventListener('click',()=>go(nextOf(r)));sbar(p);return}
  if(k==='fr'){const s=SEC[n-2],p=mount('aq_fr');const m=$('.mn.anq',p);
    m.innerHTML=`<p class="st">Раздел ${n} из 8 · ${s.t}</p><label class="fl-h" for="fr${n}">${s.fl}</label><p class="fl-c">${s.fh}</p><textarea class="free" id="fr${n}" maxlength="2000"></textarea>`;
    const ta=$('textarea',m);ta.value=st.free[n]||'';ta.addEventListener('input',()=>st.free[n]=ta.value);
    ft(p,r,true).next.addEventListener('click',()=>go(nextOf(r)));sbar(p);return}
  if(k==='q'){const i=secOf(n),s=SEC[i],q=s.q[n-START[i]],p=mount('aq_q');const m=$('.mn.anq',p);
    const ops=s.sc.map((o,j)=>[String(j),o]).concat([['X',Q.x]]);
    m.innerHTML=`<p class="st">Вопрос ${n} из 42 · ${s.t}</p><div class="pg" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="42" aria-label="Прогресс анкеты"><i style="width: ${(n/42*100).toFixed(1)}%"></i></div>`+
      `<div class="qc plain" role="group" aria-labelledby="q${n}"><p class="q${q.length>110?' long':''}" id="q${n}">${q}</p><div class="ops" role="radiogroup" aria-labelledby="q${n}">`+
      ops.map(([c,o])=>`<label class="op${c==='X'?' x':''}" role="radio" tabindex="0" aria-checked="false" data-v="${c}"><span class="n" aria-hidden="true">${c}</span><span>${o}</span></label>`).join('')+'</div></div>';
    const f=ft(p,r,!s.req||st.ans[n]!=null);
    const paint=()=>{$$('.op',m).forEach(o=>{const on=o.dataset.v===st.ans[n];o.classList.toggle('on',on);o.setAttribute('aria-checked',on)});f.set(!s.req||st.ans[n]!=null)};
    $$('.op',m).forEach(o=>{const pick=()=>{st.ans[n]=o.dataset.v;paint()};o.addEventListener('click',pick);
      o.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();pick()}})});
    paint();f.next.addEventListener('click',()=>{if(f.next.disabled)return;go(nextOf(r))});sbar(p);return}
}
/* «Введение»: одна форма; вопрос о сроке в приюте — только если в профиле «Откуда собака» = «из приюта» (или не заполнено) */
/* СЕРВЕР: PUT /survey/intake — ответы «Введения» */
function vvForm(r){
  const p=mount('vv'),f=$('form.mn',p);f.addEventListener('submit',e=>e.preventDefault());
  const shelter=!st.draft.from||st.draft.from==='из приюта';
  $$('fieldset',f).forEach((fs,i)=>{fs.dataset.k='f'+i;if(!shelter&&/в приюте/.test($('legend',fs).textContent))fs.remove()});
  $$('.fl',f).forEach((fl,i)=>{fl.dataset.k='t'+i});
  $$('input.in,textarea',f).forEach(el=>{const k=el.closest('.fl').dataset.k;if(st.vv[k])el.value=st.vv[k];
    el.addEventListener('input',()=>{st.vv[k]=el.value;clr(el.closest('.fl'))})});
  const ppl=$$('input.in',f)[0];ppl.setAttribute('inputmode','numeric');ppl.maxLength=2;
  ppl.addEventListener('input',()=>{const v=ppl.value.replace(/\D/g,'');if(v!==ppl.value){ppl.value=v;st.vv[ppl.closest('.fl').dataset.k]=v}});
  /* вес и рост — только цифры: вес с одной десятичной (4,5 кг), рост в целых сантиметрах */
  $$('.fl',f).forEach(fl=>{const lb=fl.querySelector('label')?.textContent||'',el=fl.querySelector('input.in');if(!el)return;
    const kg=/вес/i.test(lb),cm=/рост/i.test(lb);if(!kg&&!cm)return;
    el.setAttribute('inputmode',kg?'decimal':'numeric');el.maxLength=kg?5:3;el.autocomplete='off';
    el.addEventListener('input',()=>{let v=el.value.replace(/\./g,',');
      if(kg){v=v.replace(/[^\d,]/g,'').replace(/^,+/,'');const i=v.indexOf(',');if(i>=0)v=v.slice(0,i+1)+v.slice(i+1).replace(/,/g,'').slice(0,1)}else v=v.replace(/\D/g,'');
      if(v!==el.value){el.value=v;st.vv[fl.dataset.k]=v}})});
  $$('fieldset',f).forEach(fs=>{const k=fs.dataset.k;$$('input[type=radio]',fs).forEach(rd=>{rd.name=k;rd.value=rd.parentElement.textContent.trim();
    if(st.vv[k]===rd.value){rd.checked=true}rd.addEventListener('change',()=>{st.vv[k]=rd.value;mark(fs);clr(fs)})});mark(fs)});
  function mark(fs){$$('.cx',fs).forEach(l=>{const on=l.querySelector('input').checked;l.classList.toggle('on',on);const s=l.querySelector('svg');if(on&&!s)l.querySelector('input').insertAdjacentHTML('afterend',ICON.check);if(!on&&s)s.remove()})}
  function clr(el){el.classList.remove('miss');el.querySelector(':scope>.et')?.remove();$('.in.er,.cs.er',el)?.classList.remove('er')}
  function err(el,txt){clr(el);el.classList.add('miss');el.insertAdjacentHTML('beforeend',`<div class="et" role="alert">${ICON.warn}<span>${txt}</span></div>`);fitErr(el)}
  const fb=ft(p,r,true);
  fb.next.addEventListener('click',()=>{
    const bad=[];const v=ppl.value.trim();
    if(!v||!(+v>=1)){err(ppl.closest('.fl'),'Укажите число');bad.push(ppl.closest('.fl'))}
    const br=$$('fieldset',f).find(fs=>/Метис/.test($('legend',fs).textContent));
    if(br&&!$('input:checked',br)){err(br,'Выберите вариант');bad.push(br)}
    if(bad.length){reveal(bad[0]);return}
    go(nextOf(r));
  });
  sbar(p);
}
function e6(){const p=mount('e6');$('.ce .b1',p).addEventListener('click',()=>go('s3'))}

/* профиль: форма */
/* СЕРВЕР: GET /profile, POST /profile — сохранение с проверкой полей на сервере */
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
/* СЕРВЕР: PUT /chat/messages/{id}/feedback */
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
/* СЕРВЕР: POST /chat/messages — здесь ответ заготовлен, тип ответа выбирается по словам в вопросе */
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

/* ===== портрет, план, рекомендации, результат =====
   Данные рекомендаций и текст портрета в продукте присылает бэкенд; здесь они зашиты (window.__PLAN, собирается из recommendations.json и portrait.json).
   Состояние маршрута: st.plan = {recs:[{s,ck,cm,ret,open}], cur, used, done, ready, results}
   s — none|new|work|helped|partial|notfit; ret — рекомендацию вернули из отложенных; used — сколько раз выбрано «Не подошла» (лимит 2). */
const IC=(n,s)=>V.ic[n+':'+s];
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const STAT={new:['Новая','dot'],work:['В работе','dot'],helped:['Помогла','check'],partial:['Помогла частично','half'],notfit:['Не подошла','pause']};
const RES=['helped','partial','notfit'];
const RSUB={helped:'стало заметно лучше',partial:'что-то изменилось, но трудность осталась',notfit:'нам это не подходит или не получилось применить'};
const LIMIT='Две рекомендации вы уже отложили. Можно вернуться к ним или попробовать эту';
function newPlan(){return {recs:RC.map(()=>({s:'none',ck:{},cm:'',ret:false,open:{0:true}})),cur:-1,used:0,done:false,ready:false,results:0}}
function mkPlan(code){
  const P=newPlan(),set=(i,s,n)=>{P.recs[i].s=s;for(let k=0;k<(n||0);k++)P.recs[i].ck['0.'+k]=1};
  P.ready=true;P.cur=0;set(0,'new');
  if(code==='work')set(0,'work',4);
  if(code==='mid'){set(0,'helped',5);set(1,'notfit');P.cur=2;set(2,'work',1);P.used=1;P.results=2}
  if(code==='limit'){set(0,'notfit');set(1,'notfit');P.cur=2;set(2,'new');P.used=2;P.results=2}
  if(code==='ret'){set(0,'notfit');P.cur=1;set(1,'new');set(0,'work',2);P.recs[0].ret=true;P.used=1;P.results=1}
  if(code==='last'){[['helped',5],['notfit',0],['helped',3],['partial',2]].forEach(([s,n],i)=>set(i,s,n));P.cur=4;set(4,'work',2);P.used=1;P.results=4}
  if(code==='done'){[['helped',5],['notfit',0],['helped',3],['partial',2],['helped',4]].forEach(([s,n],i)=>set(i,s,n));P.cur=4;P.used=1;P.done=true;P.results=5}
  return P;
}
const weekN=()=>Math.min(5,1+st.plan.results);
const chip=s=>`<span class="r-st ${s}">${IC(STAT[s][1],16)}${STAT[s][0]}</span>`;
const weekChip=()=>`<span class="r-wk">${IC('cal',18)}Неделя ${weekN()}</span>`;
const totalOf=i=>RC[i].g.reduce((a,g)=>a+g[1].length,0);
const doneOf=i=>Object.keys(st.plan.recs[i].ck).length;
const progress=(n,m)=>`<div class="r-pr"><b>Отмечено ${n} из ${m}</b><div class="r-bar" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${m}"><i style="width:${m?(n/m*100).toFixed(1):0}%"></i></div></div>`;
const retIdx=()=>st.plan.recs.findIndex(x=>x.ret&&x.s==='work');
const activeIdx=()=>{const r=retIdx();return r>=0?r:st.plan.cur};
const counts=()=>RES.map(s=>st.plan.recs.filter(x=>x.s===s).length);
/* вернуться к отложенной можно, пока текущая «Новая» (или маршрут пройден) и ни одна другая не возвращена */
const canReturn=()=>retIdx()<0&&(st.plan.done||st.plan.recs[st.plan.cur].s==='new');
function mountH(html,cls){T.pl_tmp=html;return mount('pl_tmp',cls)}

/* S8 — портрет собирается, готов, ошибка */
/* СЕРВЕР: GET /portrait (опрос, пока status=building) — здесь портрет «собирается» 1,8 секунды */
function s8(o){
  const P=st.plan;
  if(P.ready){mount('s8r');return}
  if(o&&o.err){const p=mount('s8e');$('.b1',p).addEventListener('click',()=>go('s8',{back:true}));return}
  const p=mount('s8w');$('.r-emp',p).classList.add('wait');
  later(()=>{P.ready=true;if(P.cur<0){P.cur=0;P.recs[0].s='new'}mount('s8r');paintPanel()},1800);
}

/* S4b — профиль: после формы; после анкеты добавляются данные анкеты и портрет */
/* СЕРВЕР: GET /profile + GET /portrait */
function s4b(){
  const d=st.draft,v=st.vv,ready=st.plan.ready,name=d.name||'Джесси';
  const pr=[['Возраст',d.age],['Пол',d.sex],['Дома с',d.date],['Откуда',d.from],['Первая собака',d.first]];
  if(ready)pr.push(['Порода',v.f3],['Стерилизация',v.f1],['Вес',v.t1&&v.t1+' кг'],['Рост в холке',v.t2&&v.t2+' см']);
  const pm=pr.filter(x=>x[1]).map(([k,x])=>`<div class="r-pi r-sh"${String(x).length>16?' style="grid-column:1/-1"':''}><span class="tt"><span>${k}</span><b>${escH(x)}</b></span></div>`).join('');
  const por=ready?'<h2 class="r-h2" style="margin-top:8px">Портрет</h2>'+V.portrait.map(([t,x])=>`<section class="r-pc r-sh"><div class="hh">${t}</div><p>${escH(x.replace(/\{N\}/g,name))}</p></section>`).join('')+`<p class="r-sub">Портрет составлен по анкете от ${new Date().toLocaleDateString('ru-RU')}</p>`:'';
  mountH(`<div class="ph">\n<div class="r-scr"><div><div class="r-pf"><div class="hd"><button class="ic" type="button" aria-label="Назад" data-r="home">${IC('back',22)}</button><span class="t"></span></div></div>`+
    `<div class="mn" style="flex:none;overflow:visible;padding-top:0"><div class="r-av"><img class="dg" src="${V.img.ava}" alt=""></div><div class="r-nc r-sh"><p class="nm">${escH(name)}</p></div>`+
    `<div class="r-pm">${pm}</div>${por}<h2 class="r-h2" style="margin-top:8px">Аккаунт</h2><div class="r-acct" style="margin-top:-12px"><a href="#" data-x="Здесь откроется Telegram команды">Написать команде</a><button type="button" data-r="s1">Выйти</button></div></div></div></div>\n<nav class="nv"></nav>\n</div>`,'profile');
  fitBig($('.r-nc .nm'),40);
}
/* длинная кличка в крупном заголовке уменьшается, чтобы поместиться */
function fitBig(el,max){if(!el)return;el.dataset.fit=max;let fs=max;el.style.fontSize=fs+'px';el.style.whiteSpace='nowrap';while(el.scrollWidth>el.clientWidth+1&&fs>24){fs-=2;el.style.fontSize=fs+'px'}el.style.whiteSpace=''}

/* главная в новом виде */
function homeCard(){
  const i=activeIdx(),r=RC[i],R=st.plan.recs[i];
  return `<article class="r-cur" style="--c:${r.c}"><div class="r-row">${weekChip()}</div><h2 class="t" style="max-width:none;min-height:0">${r.t}</h2><div class="r-row">${chip(R.s)}</div>${progress(doneOf(i),totalOf(i))}<a class="b1" data-r="rec">Открыть</a></article>`;
}
function paintHome(k,p){
  const nm=$('.r-day .big span',p);
  if(nm&&k!=='a'&&k!=='a2'&&st.draft.name){nm.textContent=st.draft.name;nm.style.display='block';nm.style.maxWidth='210px';nm.style.overflow='hidden';fitBig(nm,48)}
  if(k==='c'){const b=$('.r-cur .r-pr b',p),bar=$('.r-cur .r-bar i',p);const m=(st.pos||'').match(/^aq:q:(\d+)/);
    if(b)b.textContent=where();if(bar)bar.style.width=(m?(+m[1]/42*100):({vv:0,pb:1,in:1,fr:1}[(st.pos||'aq:vv').split(':')[1]]||0)*((+(st.pos||'').split(':')[2]||1)/8*100)).toFixed(1)+'%'}
  if(k==='e'){const c=$('.r-cur',p);if(c)c.outerHTML=homeCard()}
  if(k==='f'){const [h,pa,n]=counts(),row=$$('.r-cur .r-row',p).find(x=>/Помогло/.test(x.textContent));if(row)row.textContent=`Помогло: ${h} · Частично: ${pa} · Не подошло: ${n}`;const w=$('.r-cur .r-wk',p);if(w)w.outerHTML=weekChip()}
}

/* S9 — план: текущая рекомендация и пройденные; будущих шагов нет */
function curCard(i,anim){
  const r=RC[i],R=st.plan.recs[i],hint=R.s==='new'&&st.plan.used>=2?`<div class="r-hint" style="background:rgba(255,255,255,.7)">${IC('info',20)}<span>${LIMIT}</span></div>`:'';
  return `<article class="r-cur${anim?' r-anim':''}" style="--c:${r.c}"><div class="pic"><img class="dg" src="${r.ill}" alt=""></div><h2 class="t">${r.t}</h2><div class="r-row">${chip(R.s)}</div><p class="why">${r.why[0]}</p>${progress(doneOf(i),totalOf(i))}${hint}<a class="b1" data-rec="${i}">${R.s==='new'?'Посмотреть рекомендацию':'Открыть'}</a></article>`;
}
function passedCard(i,can){
  const s=st.plan.recs[i].s,sub=s==='notfit'&&can?'<span class="r-sub">Можно вернуться</span>':'';
  return `<a class="r-pd ${s}${s==='notfit'?'':' r-sh'}" data-rec="${i}" role="button" tabindex="0"><span class="mk">${IC(STAT[s][1],20)}</span><span class="bd2"><span class="t">${RC[i].t}</span><span class="r-row">${chip(s)}${sub}</span></span><span class="go">${IC('chev',20)}</span></a>`;
}
function finalCard(){const [h,p,n]=counts();
  return `<article class="r-day" style="min-height:0;gap:12px"><div class="big"><span style="font-size:32px">Вы прошли все шаги</span></div><div class="r-sum"><div><b>${h}</b>Помогло</div><div><b>${p}</b>Частично</div><div><b>${n}</b>Не подошло</div></div><p style="margin:0;font-size:14px;line-height:1.4">Рекомендации остаются в плане: к ним можно вернуться в любой момент</p></article>`}
/* СЕРВЕР: GET /plan — текущая рекомендация, пройденные, неделя, остаток «Не подошла» */
function plan(o){
  const P=st.plan,ret=retIdx(),show=ret>=0?ret:(P.done?-1:P.cur);let body='';
  if(show>=0)body+=curCard(show,o&&o.anim);
  if(ret>=0&&!P.done)body+=`<div class="r-wait">${IC('clock',22)}Следующая рекомендация ждёт</div>`;
  if(P.done)body+=finalCard();
  const passed=P.recs.map((x,i)=>i).filter(i=>i!==show&&RES.includes(P.recs[i].s));
  if(passed.length)body+='<h2 class="r-h2" style="margin-top:8px">Пройденные</h2>'+passed.map(i=>passedCard(i,canReturn())).join('');
  mountH(`<div class="ph">\n<div class="mn"><div class="r-row" style="justify-content:space-between;align-items:flex-end;margin-top:10px"><h1 class="r-h1">План<br>адаптации</h1>${weekChip()}</div>${body}</div>\n<nav class="nv"></nav>\n</div>`,'plan');
}

/* S12 — рекомендация */
function panelHTML(i,fail){
  const P=st.plan,R=P.recs[i],s=R.s,er=fail?`<div class="r-err s" role="alert"><span class="tt">${IC('warn',16)}<span>Не получилось сохранить. Попробуйте ещё раз</span></span></div>`:'';
  if(s==='new')return P.used>=2?`<div class="r-pn">${er}<div class="r-hint">${IC('info',20)}<span>${LIMIT}</span></div><button class="b1" type="button" data-a="take">Беру в работу</button></div>`
    :`<div class="r-pn">${er}<button class="b1" type="button" data-a="take">Беру в работу</button><a class="lk" href="#" data-a="nofit">Не подходит нам</a></div>`;
  if(s==='work'){const all=doneOf(i)===totalOf(i)?`<div class="r-ok">${IC('check',18)}Всё отмечено. Отметить результат?</div>`:'';
    return `<div class="r-pn">${all}<button class="b1" type="button" data-a="result">Отметить результат</button>${R.ret?'<a class="lk" href="#" data-a="again">Отложить снова</a>':''}</div>`}
  if(s==='helped'||s==='partial')return `<div class="r-pn"><div class="res"><span>Ваш результат:</span>${chip(s)}<a href="#" data-a="result">Изменить</a></div></div>`;
  const head='<p class="cap" style="font-size:15px;color:#1b2440;font-weight:500">Вы отложили эту рекомендацию</p>';
  return canReturn()?`<div class="r-pn">${er}${head}<button class="b1" type="button" data-a="retry">Попробовать ещё раз</button></div>`
    :`<div class="r-pn">${head}<button class="b0" type="button" disabled>Попробовать ещё раз</button><p class="cap">Сначала отметьте результат по текущей рекомендации</p></div>`;
}
function groupHTML(i,gi){
  const [t,items,note]=RC[i].g[gi],R=st.plan.recs[i],open=!!R.open[gi],n=items.filter((x,k)=>R.ck[gi+'.'+k]).length;
  const rows=open?'<div class="r-gb">'+items.map((x,k)=>{const on=!!R.ck[gi+'.'+k];
    return `<label class="r-it${on?' on':''}" data-k="${gi}.${k}"><span class="r-bx" role="checkbox" tabindex="0" aria-checked="${on}">${on?IC('check',18):''}</span><span>${x}</span></label>`}).join('')+(note?`<p class="r-nt">${note}</p>`:'')+'</div>':'';
  return `<section class="r-g r-sh${open?' open':''}" data-g="${gi}"><div class="r-gh" role="button" tabindex="0" aria-expanded="${open}"><span class="n">${gi+1}</span><span class="t">${t}</span><span class="r-ct${n===items.length?' all':''}">${n} из ${items.length}</span><span class="cv">${IC('chev',20)}</span></div>${rows}</section>`;
}
/* СЕРВЕР: GET /recommendations/{id}; POST …/take («Беру в работу»), PUT …/items/{item} (галочка), POST …/retry («Попробовать ещё раз»), POST …/postpone («Отложить снова») */
function rec(o){
  const P=st.plan,i=(o&&o.i!=null)?o.i:(st.recI!=null?st.recI:activeIdx());st.recI=i;
  const r=RC[i],R=P.recs[i],m=totalOf(i);
  const top=`<div class="r-top" style="--c:${r.c}"><div class="hd"><button class="ic" type="button" aria-label="Назад" data-r="${st.recFrom||'plan'}">${IC('back',22)}</button><span class="t"></span></div><div class="pic"><img class="dg" src="${r.ill}" alt=""></div><h1 class="t">${r.t}</h1><div class="r-row" id="rc-chip">${chip(R.s)}</div><div style="margin-top:14px" id="rc-pr">${progress(doneOf(i),m)}</div></div>`;
  const why=`<section class="r-b"><h2 class="r-bt"><span class="r-ti s wh">${IC('up',18)}</span>Почему это важно</h2><div class="r-clamp" id="rc-why" style="display:-webkit-box;flex-direction:column;gap:10px">${r.why.map(x=>`<p>${x}</p>`).join('')}</div><a class="r-more" href="#" data-a="more">Читать дальше</a></section>`;
  const todo='<h2 class="r-h2" style="margin-top:4px">Что сделать</h2>'+(r.intro?`<p class="r-tx" style="margin-top:-8px;color:#48506e">${r.intro}</p>`:'');
  const terms=r.terms.length?`<section class="r-b sky"><h2 class="r-bt"><span class="r-ti s wh">${IC('clock',18)}</span>Сроки</h2>${r.terms.map(x=>`<p>${x}</p>`).join('')}</section>`:'';
  const crit=`<section class="r-b"><h2 class="r-bt"><span class="r-ti s wh">${IC('target',18)}</span>Как понять, что получилось</h2><ul class="r-ul">${r.crit.map(x=>`<li>${IC('check',18)}<span>${x}</span></li>`).join('')}</ul></section>`;
  const p=mountH(`<div class="ph">\n<div class="r-scr"><div>${top}<div class="r-sheet"><span class="r-hdl"></span>${why}${todo}<div id="rc-g" style="display:flex;flex-direction:column;gap:16px">${r.g.map((g,gi)=>groupHTML(i,gi)).join('')}</div>${terms}${crit}</div></div></div>\n<div id="rc-pn">${panelHTML(i)}</div>\n</div>`);
  const sc=$('.r-scr',p);if(o&&o.top)sc.scrollTop=o.top;
  const locked=()=>R.s==='new'||R.s==='notfit';
  const lock=()=>{const l=locked();p.classList.toggle('r-lock',l);p.querySelectorAll('.r-bx').forEach(b=>{b.setAttribute('aria-disabled',l);b.tabIndex=l?-1:0})};
  const nudge=()=>{const b=$('#rc-pn .b1',p);if(!b)return;b.classList.remove('r-nudge');void b.offsetWidth;b.classList.add('r-nudge')};
  const repaint=()=>{$('#rc-chip',p).innerHTML=chip(R.s);$('#rc-pn',p).innerHTML=panelHTML(i);lock()};
  const count=()=>{const n=doneOf(i);$('#rc-pr b',p).textContent=`Отмечено ${n} из ${m}`;$('#rc-pr .r-bar i',p).style.width=(n/m*100).toFixed(1)+'%';$('#rc-pr .r-bar',p).setAttribute('aria-valuenow',n)};
  const toggle=lab=>{const k=lab.dataset.k,gi=+k.split('.')[0],on=!R.ck[k];if(on)R.ck[k]=1;else delete R.ck[k];
    lab.classList.toggle('on',on);const bx=lab.querySelector('.r-bx');bx.setAttribute('aria-checked',on);bx.innerHTML=on?IC('check',18):'';
    const items=RC[i].g[gi][1],n=items.filter((x,q)=>R.ck[gi+'.'+q]).length,ct=lab.closest('.r-g').querySelector('.r-ct');ct.textContent=`${n} из ${items.length}`;ct.classList.toggle('all',n===items.length);
    count();if(R.s==='work')$('#rc-pn',p).innerHTML=panelHTML(i)};
  p.addEventListener('click',e=>{
    const lab=e.target.closest('.r-it');if(lab){e.preventDefault();if(locked())nudge();else toggle(lab);return}
    const gh=e.target.closest('.r-gh');if(gh){const sec=gh.closest('.r-g'),gi=+sec.dataset.g;R.open[gi]=!R.open[gi];sec.outerHTML=groupHTML(i,gi);lock();return}
    const a=e.target.closest('[data-a]');if(!a)return;e.preventDefault();const act=a.dataset.a;
    if(act==='more'){const w=$('#rc-why',p),cl=w.classList.toggle('r-clamp');w.style.display=cl?'-webkit-box':'flex';a.textContent=cl?'Читать дальше':'Свернуть'}
    if(act==='take'){R.s='work';repaint()}
    if(act==='nofit')resSheet(i,'notfit');
    if(act==='result')resSheet(i,RES.includes(R.s)?R.s:null);
    if(act==='retry'){R.s='work';R.ret=true;repaint()}
    if(act==='again'){R.s='notfit';R.ret=false;go('plan')}
  });
  p.addEventListener('keydown',e=>{if(e.key!==' '&&e.key!=='Enter')return;const t=e.target.closest('.r-bx,.r-gh');if(t){e.preventDefault();t.click()}});
  lock();sbarRec(p);
}
function sbarRec(p){
  const mn=$('.r-scr',p);if(!mn)return;const sb=document.createElement('i');sb.className='sb';sb.setAttribute('aria-hidden','true');p.append(sb);
  const upd=()=>{const ch=mn.clientHeight,sh=mn.scrollHeight;if(sh<=ch+2){sb.style.display='none';return}sb.style.display='';
    const tr=ch-12,h=Math.max(28,Math.round(tr*ch/sh)),y=mn.offsetTop+6+Math.round((tr-h)*mn.scrollTop/(sh-ch));sb.style.top=y+'px';sb.style.height=h+'px'};
  mn.addEventListener('scroll',upd,{passive:true});new ResizeObserver(upd).observe(mn);new ResizeObserver(upd).observe(mn.firstElementChild);upd();
}

/* S13 — шторка результата и подтверждение */
function closeSheet(){$$('.r-ov,.r-bs').forEach(x=>x.remove());document.removeEventListener('keydown',closeSheet.esc)}
function dragClose(s,done){ /* шторка тянется за «ручку» и закрывается свайпом вниз */
  let y0=null;const h=e=>{if(e.target.closest('.r-hdl')||e.clientY-s.getBoundingClientRect().top<44){y0=e.clientY;s.setPointerCapture&&s.setPointerCapture(e.pointerId);s.style.transition='none'}};
  s.addEventListener('pointerdown',h);
  s.addEventListener('pointermove',e=>{if(y0===null)return;s.style.transform=`translateY(${Math.max(0,e.clientY-y0)}px)`});
  const up=e=>{if(y0===null)return;const d=e.clientY-y0;y0=null;s.style.transition='';if(d>90)done();else s.style.transform=''};
  s.addEventListener('pointerup',up);s.addEventListener('pointercancel',up);
}
function resSheet(i,pre){
  const p=$('.ph'),P=st.plan,R=P.recs[i],r=RC[i];closeSheet();
  const S={sel:pre||null,cm:RES.includes(R.s)?R.cm:'',crit:false,busy:false};
  const lim=P.used>=2&&R.s!=='notfit';if(lim&&S.sel==='notfit')S.sel=null;
  p.insertAdjacentHTML('beforeend','<div class="r-ov"></div><div class="r-bs" role="dialog" aria-modal="true" aria-label="Как прошло?"></div>');
  const ov=$('.r-ov',p),s=$('.r-bs',p);
  const draw=()=>{
    const cards=RES.map((k,q)=>{const dis=lim&&k==='notfit',on=S.sel===k;
      let h=`<label class="r-rc${on?' on':''}${dis?' dis':''}" data-s="${k}" role="radio" tabindex="${dis?-1:0}" aria-checked="${on}" aria-disabled="${dis}"><span class="r-ti ${['lime','lil','sand'][q]}">${IC(STAT[k][1],22)}</span><span class="tt"><b>${STAT[k][0]}</b><span class="d">${RSUB[k]}</span></span><span class="ck">${on?IC('check',16):''}</span></label>`;
      if(dis)h+=`<div class="r-hint">${IC('info',20)}<span>${LIMIT}</span></div>`;
      else if(k==='notfit'&&on&&R.s!=='notfit')h+=`<div class="r-hint">${IC('info',20)}<span>${P.used===0?'Отложить можно две рекомендации за всё время. Это первая':'Это вторая отложенная рекомендация. Больше откладывать будет нельзя'}</span></div>`;
      return h}).join('');
    const nf=S.sel==='notfit';
    s.innerHTML=`<span class="r-hdl"></span><button class="r-x" type="button" aria-label="Закрыть">${IC('close',20)}</button><div style="padding-right:44px"><p class="ttl">Как прошло?</p><p class="r-sub" style="margin-top:4px;font-size:14px">${r.t}</p></div>`+
      `<div class="r-acc${S.crit?' open':''}"><div class="hh" role="button" tabindex="0" aria-expanded="${S.crit}">${IC('target',18)}Как понять, что получилось<span class="cv">${IC('chev',18)}</span></div>${S.crit?'<ul class="r-ul">'+r.crit.map(x=>`<li>${IC('check',16)}<span>${x}</span></li>`).join('')+'</ul>':''}</div>`+
      `<div role="radiogroup" style="display:flex;flex-direction:column;gap:12px;flex:none">${cards}</div>`+
      `<div class="r-fl"><label for="rs-cm">${nf?'Что не подошло?':'Что получилось и что нет'}</label><textarea id="rs-cm" maxlength="500"${S.busy?' disabled':''}>${escH(S.cm)}</textarea>${nf?'<p class="r-sub">Комментарий увидит команда Хвостуна</p>':''}</div>`+
      (S.busy?`<button class="b1" type="button" aria-busy="true" disabled>${IC('spin',20)}Сохранить</button>`:S.sel?'<button class="b1" type="button" data-a="save">Сохранить</button>':'<button class="b0" type="button" disabled>Сохранить</button>');
  };
  draw();
  closeSheet.esc=e=>{if(e.key==='Escape')closeSheet()};document.addEventListener('keydown',closeSheet.esc);
  ov.addEventListener('click',()=>{if(!S.busy)closeSheet()});dragClose(s,closeSheet);
  s.addEventListener('input',e=>{if(e.target.id==='rs-cm')S.cm=e.target.value});
  s.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&e.target.matches('.r-rc,.hh')){e.preventDefault();e.target.click()}});
  s.addEventListener('click',e=>{
    if(S.busy)return;
    if(e.target.closest('.r-x')){closeSheet();return}
    if(e.target.closest('.hh')){S.crit=!S.crit;const y=s.scrollTop;draw();s.scrollTop=y;return}
    const c=e.target.closest('.r-rc');if(c&&!c.classList.contains('dis')){e.preventDefault();S.sel=c.dataset.s;const y=s.scrollTop;draw();s.scrollTop=y;return}
    if(e.target.closest('[data-a=save]')){S.busy=true;draw();later(()=>applyResult(i,S.sel,S.cm.trim()),700)}
  });
}
/* СЕРВЕР: POST /recommendations/{id}/result {status, comment} — очередь и лимит «Не подошла» в продукте считает сервер, здесь это делает сам прототип */
function applyResult(i,sel,cm){
  const P=st.plan,R=P.recs[i],edit=RES.includes(R.s),wasRet=R.ret;
  if(sel==='notfit'&&R.s!=='notfit')P.used++;
  R.s=sel;R.cm=cm;R.ret=false;
  if(edit){closeSheet();const top=$('.r-scr')?$('.r-scr').scrollTop:0;rec({i,top});return} // меняли результат у пройденной — подтверждения нет
  P.results++;
  if(wasRet){if(P.done){closeSheet();go('plan')}else confirmSheet('back',P.cur);return}
  if(P.cur<RC.length-1){P.cur++;P.recs[P.cur].s='new';confirmSheet('next',P.cur,sel==='notfit',!!cm)}
  else{P.done=true;closeSheet();go('s14')}
}
function confirmSheet(kind,nxt,notfit,commented){
  const s=$('.r-bs'),r=RC[nxt];if(!s)return;
  const calm=notfit?`<p class="r-tx" style="color:#48506e">Так бывает: не всё подходит каждой собаке.${commented?' Мы передали ваш комментарий команде':''}</p>`:'';
  s.setAttribute('aria-label','Готово');
  s.innerHTML=`<span class="r-hdl"></span><button class="r-x" type="button" aria-label="Закрыть">${IC('close',20)}</button><div class="r-cen" style="padding:6px 36px 0"><p class="ttl">${kind==='back'?'Готово. Возвращаемся к текущей рекомендации':'Готово. Открыли следующую рекомендацию'}</p>${calm}</div>`+
    `<div class="r-next" style="--c:${r.c}"><span class="t">${r.t}</span><img class="dg" src="${r.ill}" alt=""></div><button class="b1" type="button" data-a="open">Открыть</button><button class="b2" type="button" data-a="plan">К плану</button>`;
  const toPlan=()=>{closeSheet();go('plan',{anim:true})};
  const cl=s.cloneNode(true);s.replaceWith(cl); // снять обработчики прошлой шторки
  $('.r-ov').replaceWith($('.r-ov').cloneNode(true));$('.r-ov').addEventListener('click',toPlan);dragClose(cl,toPlan);
  document.removeEventListener('keydown',closeSheet.esc);
  closeSheet.esc=e=>{if(e.key==='Escape')toPlan()};document.addEventListener('keydown',closeSheet.esc);
  cl.addEventListener('click',e=>{if(e.target.closest('.r-x,[data-a=plan]'))toPlan();if(e.target.closest('[data-a=open]')){closeSheet();st.recFrom='plan';st.recI=nxt;go('rec',{i:nxt,keep:true})}});
}

/* S14 — маршрут пройден */
function s14(){
  const p=mount('s14'),c=counts();
  $$('.r-sum b',p).forEach((b,k)=>{const n=c[k];let t=0;b.textContent='0';const step=()=>{t++;b.textContent=Math.round(n*Math.min(1,t/12));if(t<12)later(step,45)};later(step,300)});
  if(!c[2])$('.r-fb .lk',p)?.remove();
}

/* переходы */
app.addEventListener('click',e=>{
  const rc=e.target.closest('[data-rec]');
  if(rc){e.preventDefault();if(!busy){st.recFrom=cur==='s3'?'home':'plan';go('rec',{i:+rc.dataset.rec})}return}
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
  frame.style.setProperty('--fs',Math.min(1,(window.innerHeight-48)/d.h,(window.innerWidth-(window.innerWidth>=760?368:48))/d.w));
  paintPanel();
}
const PD={profile:'done'},PS={profile:'done',survey:'started'},PV={profile:'done',survey:'done'};
const JUMP=[['S1','s1',{}],['S2','s2',{}],['E2','s2',{err:1}],['Главная A','s3',{}],['A2','s3',{profile:'partial'}],['B','s3',PD],['C','s3',{...PS,pos:'aq:q:12'}],
 ['D, портрет не собран','s3',PV],['E, шаг в работе','s3',{...PV,plan:'work'}],['F, маршрут пройден','s3',{...PV,plan:'done'}],
 ['S4','s4',{}],['Профиль до анкеты','s4b',PD],['Профиль с портретом','s4b',{...PV,plan:'new'}],['S5','s5',PD],
 ['Введение','aq:vv',PS],['Введение, не из приюта','aq:vv',{...PS,from:'от заводчика'}],['Перебивка 1','aq:pb:1',PS],['Вступление раздела','aq:in:4',PS],['Вопрос','aq:q:1',PS],['Длинный вопрос','aq:q:16',PS],['Свободный ответ','aq:fr:2',PS],['Последняя перебивка','aq:pb:8',PS],
 ['S8, портрет','s8',PV],['S8, ошибка','s8',{...PV,err:1}],['План, начало','pl',{...PV,plan:'new'}],['План, середина','pl',{...PV,plan:'mid'}],['План, лимит','pl',{...PV,plan:'limit'}],['План, вернули','pl',{...PV,plan:'ret'}],['План, пройден','pl',{...PV,plan:'done'}],
 ['Рекомендация','rec',{...PV,plan:'work'}],['Последняя рекомендация','rec',{...PV,plan:'last'}],['S14, финал','s14',{...PV,plan:'done'}],
 ['Чат','chat',PD],['E6','e6',{}]];
const SAMPLE={name:'Джесси',age:'6–12 месяцев',sex:'девочка',date:'05.11.2026',from:'из приюта',first:'нет, раньше были собаки'};
const SAMPLE_VV={t0:'3',f0:'нет',f1:'да',f2:'~ 1 год',f3:'метис',t1:'25',t2:'52',f4:'нет'};
function preset(i){const[, r,o]=JUMP[i];const keep=st.chat;const{from,plan:pc,err,...oo}=o;st=Object.assign(blank(),oo);st.chat=r==='chat'?keep:[];st.greeted=r==='chat'&&keep.length>0;
  if(o.profile==='done')st.draft={...SAMPLE,...(from?{from}:{})};else if(o.profile==='partial')st.draft={name:'Джесси'};
  if(o.survey==='done')st.vv={...SAMPLE_VV};if(pc)st.plan=mkPlan(pc);st.recI=null;
  stack=[];cur='';go(r,{back:true,err,keep:true})}
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
window.__p={refit:()=>{$$('.miss').forEach(fitErr);$$('#app [data-fit]').forEach(e=>fitBig(e,+e.dataset.fit))},viewport,go,preset,JUMP,get st(){return st},set st(v){st=v},send,mkPlan,newPlan,device:(d,k,s)=>{dev=d;kbs=!!k;safe=s!==false;device()},cur:()=>cur};
device();
viewport(); // запомнить высоту экрана без клавиатуры сразу при загрузке
function start(){go('s1',{back:true,keep:true})}
start();
})();

/* кнопка «Экраны»: в узком окне открывает пульт поверх телефона */
(function(){
  const b=document.createElement('button');b.id='pbtn';b.type='button';b.setAttribute('aria-expanded','false');
  const paint=()=>{const on=document.body.classList.contains('pn');b.textContent=on?'Закрыть':'Экраны';b.setAttribute('aria-expanded',on)};
  document.getElementById('stage').append(b);paint();
  const close=()=>{document.body.classList.remove('pn');paint()};
  b.addEventListener('click',()=>{document.body.classList.toggle('pn');paint()});
  document.getElementById('panel').addEventListener('click',e=>{const t=e.target.closest('button');if(t&&(t.dataset.j||t.id==='t-reset'))close()});
  document.addEventListener('click',e=>{if(document.body.classList.contains('pn')&&!e.target.closest('#panel,#pbtn'))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
