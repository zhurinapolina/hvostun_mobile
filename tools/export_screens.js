/* Выгрузка эталонных экранов из прототипа.
   Подключить к prototype/index.html вместе с локальным приёмником (tools/receiver.py) и вызвать в консоли: await __exportScreens()
   Каждый экран и состояние сохраняется отдельной страницей handoff/screens/<id>.html:
   точная разметка экрана в том виде, как её показывает прототип, общие правила адаптива (prototype/src/app.css)
   и только правила доски этого экрана. Плюс handoff/screens/index.json — список экранов. */
(function(){
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=()=>window.__p;
const filled=()=>({name:'Васёк',age:'старше 7 лет',sex:'мальчик',date:'07.07.2026',from:'из приюта',first:'нет, раньше были собаки'});
const base=o=>Object.assign({profile:'none',survey:'none',draft:{},pos:'aq:vv',ans:{},vv:{},free:{},chat:[],greeted:false},o);
const show=async(r,st)=>{P().st=st;P().go(r,{back:true,keep:true});await wait(80)};
const aq=(pos,x={})=>()=>show(pos,base({profile:'done',survey:'started',draft:filled(),...x}));
const GREET='Привет! Я ИИ-помощник по вопросам ухода за питомцем. Помогу разобраться в вашем вопросе. <br>Что вас интересует?';
const ANS='[Текст ответа ассистента по материалам книг: пояснение и шаги]';
const chatAll=()=>[{t:'a',x:GREET},{t:'u',x:'Как приучить собаку спать на месте?'},{t:'a',x:ANS,rate:true,v:'up'},{t:'u',x:'кот'},{t:'a',x:'Кажется, вопрос не про собаку'},
 {t:'u',x:'нет ответа'},{t:'a',x:'В моих материалах нет ответа на этот вопрос. Лучше уточнить у ветеринара или кинолога.'},
 {t:'u',x:'укус'},{t:'ur',x:'Это требует очной помощи. Обратитесь в ветеринарную клинику.'},{t:'uf',x:'сбой',q:'сбой'},{t:'u',x:'таймаут'},{t:'fail',q:'таймаут'},{t:'u',x:'ещё вопрос'},{t:'typing'}];
const click=async(s,ms=40)=>{$(s).click();await wait(ms)};
const setv=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};

/* [id, название, раздел, подготовка] */
const LIST=[
 ['s1-welcome','S1 · Приветствие','Вход',()=>show('s1',base())],
 ['s2-login','S2 · Вход','Вход',()=>show('s2',base())],
 ['s2-login-error','S2 · Ошибка входа (E2)','Вход',async()=>{P().st=base();P().go('s2',{back:true,err:1});await wait(80)}],
 ['s2-login-loading','S2 · Вход: проверка','Вход',async()=>{await show('s2',base());const i=$$('#app input.in');setv(i[0],'anna@mail.ru');setv(i[1],'12345678');$('#app input[type=checkbox]').click();await wait(20);$('#app .b1').click();await wait(60)}],
 ['e6-unavailable','E6 · Сервис временно недоступен','Ошибки',()=>show('e6',base())],
 ['home-a','S3 · Главная A: первый вход','Главная',()=>show('s3',base())],
 ['home-a2','S3 · Главная A2: профиль заполнен частично','Главная',()=>show('s3',base({profile:'partial',draft:{name:'Васёк'}}))],
 ['home-b','S3 · Главная B: профиль готов','Главная',()=>show('s3',base({profile:'done',draft:filled()}))],
 ['home-c','S3 · Главная C: анкета в процессе','Главная',()=>show('s3',base({profile:'done',survey:'started',pos:'aq:q:12',draft:filled()}))],
 ['home-d','S3 · Главная D: анкета пройдена','Главная',()=>show('s3',base({profile:'done',survey:'done',pos:null,draft:filled()}))],
 ['s4-empty','S4 · Профиль: пустая форма','Профиль',()=>show('s4',base())],
 ['s4-errors','S4 · Профиль: все поля не заполнены','Профиль',async()=>{await show('s4',base());await click('#app form .b1.w')}],
 ['s4-date-future','S4 · Профиль: дата в будущем','Профиль',async()=>{await show('s4',base({draft:{...filled(),date:'01.01.2031'}}));await click('#app form .b1.w')}],
 ['s4-calendar','S4 · Профиль: выбор даты','Профиль',async()=>{await show('s4',base({draft:filled()}));await click('#app .iw',80)}],
 ['s4-filled','S4 · Профиль: заполнено','Профиль',()=>show('s4',base({draft:filled()}))],
 ['s4-saving','S4 · Профиль: сохранение','Профиль',async()=>{await show('s4',base({draft:filled()}));await click('#app form .b1.w')}],
 ['s4b-first','S4b · Вкладка «Профиль», первый заход','Профиль',()=>show('s4b',base({profile:'done',draft:filled()}))],
 ['s4b-repeat','S4b · Вкладка «Профиль», повторный заход','Профиль',()=>show('s4b',base({profile:'done',survey:'started',draft:filled()}))],
 ['s5-survey-start','S5 · Анкета: вход','Анкета',()=>show('s5',base({profile:'done',draft:filled()}))],
 ['s7-intro-form','S7 · Раздел 1 «Введение»: форма (собака из приюта)','Анкета',aq('aq:vv')],
 ['s7-intro-form-not-shelter','S7 · «Введение»: собака не из приюта — без вопроса о сроке в приюте','Анкета',aq('aq:vv',{draft:{...filled(),from:'от заводчика'}})],
 ['s7-intro-form-errors','S7 · «Введение»: не заполнены обязательные поля','Анкета',async()=>{await aq('aq:vv')();await click('#app .ft .b1')}],
 ['s7-intro-form-filled','S7 · «Введение»: заполнено','Анкета',aq('aq:vv',{vv:{t0:'3',f0:'нет',f1:'да',f2:'~ 1 год',f3:'метис',t1:'18,5',t2:'52',t3:'Жил в приюте с другими собаками, гуляли раз в день',f4:'нет'}})],
 ...[1,2,3,4,5,6,7,8].map(n=>[`s7-break-${n}`,`S7 · Перебивка после раздела ${n}`,'Анкета',aq(`aq:pb:${n}`)]),
 ...[2,3,4,5,6,7,8].map(n=>[`s7-section-${n}-intro`,`S7 · Вступление раздела ${n}`,'Анкета',aq(`aq:in:${n}`)]),
 ['s7-question','S7 · Вопрос: ответ не выбран, «Далее» неактивна','Анкета',aq('aq:q:1')],
 ['s7-question-selected','S7 · Вопрос: ответ выбран','Анкета',aq('aq:q:2',{ans:{2:'3'}})],
 ['s7-question-long-x','S7 · Длинный вопрос, выбрано «Не наблюдалось»','Анкета',aq('aq:q:16',{ans:{16:'X'}})],
 ['s7-question-frequency','S7 · Вопрос со шкалой частоты','Анкета',aq('aq:q:22')],
 ['s7-question-optional','S7 · Необязательный вопрос («Дрессируемость»): «Далее» активна','Анкета',aq('aq:q:27')],
 ['s7-free-answer','S7 · Свободный ответ в конце раздела','Анкета',aq('aq:fr:2')],
 ['s7-free-answer-filled','S7 · Свободный ответ: заполнено','Анкета',aq('aq:fr:3',{free:{3:'Лает на курьеров и на звонок в дверь, успокаивается за пару минут.'}})],
 ['s9-plan-stub','S9 · План: заглушка «Сервис в разработке»','План',()=>show('s9',base({profile:'done',survey:'done',pos:null,draft:filled()}))],
 ['chat-empty','S10 · Чат: первое открытие','Чат',()=>show('chat',base({profile:'done',draft:filled()}))],
 ['chat-all-states','S10 · Чат: все типы сообщений и ошибок','Чат',async()=>{await show('chat',base({profile:'done',draft:filled(),greeted:true,chat:chatAll()}))}],
 ['chat-feedback','S10 · Чат: отзыв «Неполезно»','Чат',async()=>{await show('chat',base({profile:'done',draft:filled(),greeted:true,chat:chatAll().slice(0,3).map((m,i)=>i===2?{...m,v:null}:m)}));await click('#app [data-c=down]')}],
];

function snapshot(){
  const ph=$('#app .ph').cloneNode(true),live=$('#app .ph');
  const a=$$('input,textarea',live),b=$$('input,textarea',ph);
  a.forEach((el,i)=>{const c=b[i];if(el.type==='checkbox'||el.type==='radio'){el.checked?c.setAttribute('checked',''):c.removeAttribute('checked')}
    else if(el.tagName==='TEXTAREA')c.textContent=el.value;else c.setAttribute('value',el.value)});
  $$('[data-r],[data-c],[data-x],[data-i],[data-v],[data-k],[data-d],[data-m]',ph).forEach(e=>{for(const k of [...e.attributes].map(x=>x.name))if(/^data-(r|c|x|i|k|d|m)$/.test(k))e.removeAttribute(k)});
  return ph.outerHTML;
}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
window.__exportScreens=async function(o={}){
  const URL=o.url||'http://127.0.0.1:8767/save';
  const appCss=$$('style').map(s=>s.textContent).find(t=>t.includes('/* Прототип:'));
  const fonts=$('link[href*="fonts.googleapis"]').outerHTML;
  const index=[];
  /* размер и режим: основной эталон 390 × 844; для ключевых экранов ещё маленький телефон, горизонтальное положение и открытая клавиатура */
  const frame=$('#frame'),app=$('#app');
  const SIZES={
    base:{label:'390 × 844',set:()=>P().device('m',false,true)},
    '320x568':{label:'маленький телефон 320 × 568',set:()=>P().device('s',false,true)},
    '667x375':{label:'горизонтально 667 × 375',set:()=>{P().device('m',false,false);frame.style.setProperty('--fw','667px');frame.style.setProperty('--fh','375px')}},
    kb:{label:'390 × 844, открыта клавиатура',set:()=>P().device('m',true,true)},
  };
  const VARIANTS=[['home-b',['320x568','667x375']],['s4-filled',['320x568','667x375','kb']],['s7-intro-form',['320x568','667x375','kb']],
    ['s7-section-4-intro',['320x568','667x375']],['s7-question-long-x',['320x568','667x375']],['s7-free-answer-filled',['320x568','kb']],
    ['s7-break-8',['320x568','667x375']],['chat-all-states',['320x568','667x375','kb']],['s2-login',['320x568','kb']]];
  const jobs=[];
  for(const e of LIST)jobs.push([e,'base']);
  for(const [id,vs] of VARIANTS){const e=LIST.find(x=>x[0]===id);vs.forEach(v=>jobs.push([e,v]))}
  for(const [[id0,title0,group,prep],v] of jobs){
    SIZES[v].set();await wait(60);
    await prep();await wait(80);
    const id=v==='base'?id0:`${id0}--${v}`,title=v==='base'?title0:`${title0} · ${SIZES[v].label}`;
    const board=$('#board').textContent;
    const fv=['--fw','--fh','--kh'].map(k=>`${k}:${frame.style.getPropertyValue(k)}`).join(';');
    const av=['--sat','--sab'].map(k=>`${k}:${app.style.getPropertyValue(k)||'0px'}`).join(';');
    const kb=frame.classList.contains('kbsim');
    const html=`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${fonts}
<style>/* база страницы */
html,body{margin:0;padding:0}[hidden]{display:none!important}img{max-width:100%}</style>
<style>/* общие правила адаптива — prototype/src/app.css, одинаковые для всех экранов */
${appCss}</style>
<style>/* стили этого экрана — точные правила его доски с макетов, ничего не добавлено и не слито с другими экранами */
${board}</style>
</head>
<body>
<!-- Рамка телефона и значения --sat/--sab ниже — только имитация устройства для эталона (${esc(SIZES[v].label)}).
     В продукте их не переносить: отступы берутся из env(safe-area-inset-*), см. :root в app.css.${kb?'\n     Блок #kbd — место, которое занимает экранная клавиатура; в продукте его нет, режим .kb включается по факту уменьшения видимой области (функция viewport в app.js).':''} -->
<div id="stage"><div id="frame"${kb?' class="kbsim"':''} style="${fv}"><div id="app"${kb?' class="kb"':''} style="${av}">
${snapshot()}
</div>${kb?'<div id="kbd">Клавиатура</div>':''}</div></div>
</body>
</html>
`;
    await fetch(URL+'?name='+id+'.html',{method:'POST',mode:'no-cors',body:html});
    index.push({id,title,group,size:SIZES[v].label,file:`screens/${id}.html`,route:P().cur()});
  }
  SIZES.base.set();
  await fetch(URL+'?name=index.json',{method:'POST',mode:'no-cors',body:JSON.stringify(index,null,1)});
  return index.length;
};
})();
