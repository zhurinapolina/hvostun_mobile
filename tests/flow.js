/* Сценарий всего пути: вход → профиль → анкета (Введение, 7 разделов, перебивки) → план → меню → чат.
   window.__flow() возвращает журнал шагов; строки «!!» и «EXC» — ошибки. */
window.__flow=async function(){
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),P=window.__p,log=[];
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=t=>$$('#app a,#app button').find(e=>e.textContent.trim().startsWith(t)&&e.offsetParent);
  const click=async(t,ms=60)=>{const e=typeof t==='string'?txt(t):t;if(!e){log.push('!! нет кнопки '+t);return}e.click();await wait(ms)};
  const card=t=>$$('#app .cd,#app .wg a').find(c=>c.textContent.includes(t));
  const setv=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const nav=()=>$$('#app .nv a').map(a=>a.textContent.trim()[0]+(a.classList.contains('on')?'*':a.classList.contains('off')?'-':'')).join(' ');
  const s=m=>log.push(m+' → '+P.cur()+' ['+nav()+']');
  const expect=(ok,m)=>log.push((ok?'ok ':'!! ')+m);
  try{
  P.preset(0);await wait(30);s('старт');
  await click('Войти');s('S1 войти');
  const login=$$('#app input').filter(i=>i.type!=='checkbox');
  setv(login[0],'ошибка');setv(login[1],'123');$('#app input[type=checkbox]').click();await wait(30);
  await click('Войти',1000);expect(!!$('#app .eslot').textContent.trim(),'логин «ошибка» показывает E2');
  const l2=$$('#app input').filter(i=>i.type!=='checkbox');setv(l2[0],'polina');setv(l2[1],'123');
  const c2=$('#app input[type=checkbox]');if(!c2.checked)c2.click();await wait(30);
  await click('Войти',1000);s('логин ок');
  expect($('#app .nx')&&$('#app .nx').tagName!=='A'&&!$('#app .nx [data-r]'),'«Следующий шаг» — подсказка, не нажимается');
  await click(card('Профиль питомца'));s('карточка профиля');
  setv($('#app form input[type=text],#app form input:not([type])'),'Васёк');
  await click($('#app .hd .ic,#app .hd button,#app .hd a'));s('назад из S4');
  expect(P.cur()==='s3'&&/Продолжить заполнение/.test($('#app .nx').textContent),'A2: продолжить заполнение');
  await click(card('Профиль питомца'));expect($('#app form input').value==='Васёк','кличка сохранена');
  await click('Готово',50);expect($$('#app .miss').length>0,'ошибки пустых полей');
  const pick=async v=>{const l=$$('#app form label').find(e=>e.textContent.trim()===v);if(!l)log.push('!! нет '+v);else{l.click();await wait(15)}};
  await pick('старше 7 лет');await pick('мальчик');
  const d=$$('#app form input').filter(i=>!['radio','checkbox'].includes(i.type))[1];
  d.click();await wait(30);$('#app .dp-n').click();await wait(30);$$('#app .dp-d:not([disabled])')[6].click();await wait(30);
  await pick('из приюта');await pick('нет, раньше были собаки');
  await click('Готово',1200);s('профиль готов');
  await click(card('План адаптации'));s('B → S5');
  await click('Заполнить анкету');s('анкета');
  expect(P.cur()==='aq:vv'&&$$('#app legend').some(l=>/в приюте/.test(l.textContent)),'Введение: вопрос о сроке в приюте есть (из приюта)');
  await click('Далее');expect($$('#app .miss').length===2,'Введение: 2 обязательных поля');
  setv($('#app form input.in'),'2');await click($$('#app form label.cx').find(l=>l.textContent.trim()==='метис'),20);
  await click('Далее');expect(P.cur()==='aq:pb:1','перебивка 1');
  await click($('#app .hd [data-r]'));expect(P.cur()==='s3'&&/Раздел 2 из 8/.test(card('План адаптации').textContent),'× с перебивки → главная C, «Раздел 2 из 8»');
  await click(card('План адаптации'));expect(P.cur()==='aq:pb:1','продолжение с того же места');
  let n=0,guard=0;
  while(P.cur()!=='s9'&&guard++<200){
    const c=P.cur();
    if(c.startsWith('aq:q:')){const req=txt('Далее').disabled;n++;
      if(c==='aq:q:1')expect(req,'вопрос 1: «Далее» неактивна до ответа');
      if(c==='aq:q:27')expect(!req,'Дрессируемость: «Далее» активна без ответа');
      $$('#app .op')[c==='aq:q:16'?5:2].click();await wait(10)}
    if(c==='aq:fr:3')setv($('#app textarea'),'лает на курьеров');
    if(c==='aq:pb:8'){expect(/Сформировать профиль/.test($('#app .ft .b1').textContent),'последняя перебивка: «Сформировать профиль»')}
    await click($('#app .ft .b1'),15);
  }
  expect(n===42,'пройдено вопросов: '+n);s('конец анкеты');
  expect(P.st.ans[16]==='X'&&P.st.free[3]==='лает на курьеров','ответы и свободный текст сохранены');
  $$('#app .nv a')[0].click();await wait(40);expect(!$('#app .nx'),'главная D без «Следующего шага»');s('меню главная');
  $$('#app .nv a')[1].click();await wait(40);s('меню профиль');
  $$('#app .nv a')[2].click();await wait(40);s('меню план');
  $$('#app .nv a')[3].click();await wait(40);s('меню чат');
  const ta=$('#app .ta'),sn=$('#app .sn');
  const ask=async(q,ms)=>{setv(ta,q);sn.click();await wait(ms);log.push('чат «'+q+'» → '+$$('#app .ms>*').slice(-1)[0].textContent.trim().slice(0,60))};
  await ask('как отучить от лая',1800);await ask('кот',1800);await ask('укус',1800);await ask('сбой',300);
  }catch(e){log.push('EXC '+e.stack.split('\n').slice(0,3).join(' '))}
  return log.join('\n');
};
