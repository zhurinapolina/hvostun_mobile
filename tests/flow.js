/* Сквозной сценарий полного пути: вход → профиль → анкета → портрет → все рекомендации → маршрут пройден.
   window.__flow() возвращает журнал; строки «!!» и «EXC» — ошибки. */
window.__flow=async function(){
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),P=window.__p,log=[];
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=t=>$$('#app a,#app button').find(e=>e.textContent.trim().startsWith(t)&&e.offsetParent);
  const click=async(t,ms=60)=>{const e=typeof t==='string'?txt(t):t;if(!e){log.push('!! нет кнопки '+t);return}e.click();await wait(ms)};
  const setv=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const nav=()=>$$('#app .nv a').map(a=>a.textContent.trim()[0]+(a.classList.contains('on')?'*':a.classList.contains('off')?'-':'')).join(' ');
  const ok=(c,m)=>log.push((c?'ok ':'!! ')+m);
  const all=()=>$('#app').textContent;
  const noFuture=m=>ok(!/шаг \d+ из \d+/i.test(all())&&!/из 5\b/.test(all()),m+': нет номера шага и общего числа шагов');
  const result=async(sel,cm)=>{await click($('#app [data-a=result]')||$('#app [data-a=nofit]'),380);
    const c=$(`#app .r-rc[data-s=${sel}]`);if(c.classList.contains('dis'))return false;c.click();await wait(30);
    if(cm)setv($('#app #rs-cm'),cm);await click($('#app [data-a=save]'),900);return true};
  try{
  P.preset(0);await wait(30);
  await click('Войти');const lg=$$('#app input').filter(i=>i.type!=='checkbox');setv(lg[0],'polina');setv(lg[1],'123');$('#app input[type=checkbox]').click();await wait(30);
  await click('Войти',1000);ok(P.cur()==='s3'&&/Привет/.test(all()),'вход → главная A ['+nav()+']');
  ok(!!$('#app .r-sc.lk'),'A: план и чат закрыты плитками');
  await click('Заполнить профиль');ok(P.cur()==='s4','карточка шага → форма профиля');
  ok($('#app form .b1.w').disabled&&!$('#app form .et'),'профиль: «Готово» неактивна на пустой форме, подсказок об ошибках нет');
  setv($('#app form input[type=text],#app form input:not([type])'),'Джесси');
  const pick=async v=>{const l=$$('#app form label').find(e=>e.textContent.trim()===v);if(!l)log.push('!! нет '+v);else{l.click();await wait(15)}};
  await pick('6–12 месяцев');await pick('девочка');
  const d=$$('#app form input').filter(i=>!['radio','checkbox'].includes(i.type))[1];d.click();await wait(30);$('#app .dp-n').click();await wait(30);$$('#app .dp-d:not([disabled])')[4].click();await wait(30);
  await pick('из приюта');ok($('#app form .b1.w').disabled,'профиль: «Готово» неактивна, пока не заполнено последнее поле');
  await pick('нет, раньше были собаки');ok(!$('#app form .b1.w').disabled,'профиль: всё заполнено — «Готово» активна');
  await click('Готово',1200);ok(P.cur()==='s3'&&/Получить план/.test(all())&&/Джесси/i.test($('#app .r-day').textContent),'главная B с кличкой ['+nav()+']');
  await click($$('#app .nv a')[1]);ok(P.cur()==='s4b'&&!/Портрет/.test(all())&&/Первая собака/.test(all()),'профиль до анкеты: данные формы, портрета нет');
  await click($('#app .hd .ic'));await click('Получить план');await click('Заполнить анкету');
  // «Введение»: обязательны все пункты, кроме текста об условиях жизни; «Далее» неактивна, пока они не заполнены
  ok(!!$('#app .ft .b0')&&$('#app .ft .b0').disabled&&!$('#app form .et'),'«Введение»: на пустой форме «Далее» неактивна, подсказок об ошибках нет');
  setv($('#app form input.in'),'3');for(const fs of $$('#app form fieldset')){fs.querySelector('label.cx').click();await wait(10)}
  await click($$('#app form label.cx').find(l=>l.textContent.trim()==='метис'),20);
  const kg=$$('#app .fl').find(f=>/вес/i.test(f.textContent)).querySelector('input'),cm=$$('#app .fl').find(f=>/рост/i.test(f.textContent)).querySelector('input');setv(kg,'25');setv(cm,'52');
  ok(!!$('#app .ft .b1')&&!$('#app .ft .b1').disabled&&!$('#app form textarea').value,'«Введение»: обязательные заполнены, текст об условиях жизни пуст — «Далее» активна');
  setv(cm,'');ok(!!$('#app .ft .b0'),'«Введение»: стёрли рост — «Далее» снова неактивна');setv(cm,'52');
  await click('Далее');ok(P.cur()==='aq:pb:1','«Введение» заполнено → перебивка 1');
  // вопросы: «Далее» нет, выбор варианта сам ведёт дальше
  const PICK=340,fw=()=>$('#app .ft .fw'),back=()=>$('#app .ft .b2:not(.fw)');let g=0,n=0;
  while(!/^s8|^s3/.test(P.cur())&&g++<200){const c=P.cur();
    if(c==='aq:q:1'){ok(!$('#app .ft .b1,#app .ft .b0')&&fw().hidden&&!!back(),'вопрос без ответа: внизу только «Назад», кнопок «Далее» и «Вперёд» нет')}
    if(c==='aq:q:7'){ // вернуться на три шага назад, пройти вперёд, поменять ответ
      for(let k=0;k<3;k++)await click(back(),20);
      ok(P.cur()==='aq:q:4'&&$('#app .op.on')?.dataset.v==='1'&&!fw().hidden&&P.st.pos==='aq:q:7','три шага назад: ответ на месте, появилась «Вперёд», место в анкете не потеряно');
      await click(fw(),20);ok(P.cur()==='aq:q:5'&&$('#app .op.on')?.dataset.v==='1','«Вперёд» ведёт дальше, ответ не меняется');
      $$('#app .op')[3].click();await wait(PICK);ok(P.cur()==='aq:q:6'&&P.st.ans[5]==='3'&&P.st.ans[6]==='1','другой вариант у пройденного вопроса: ответ заменён, перешли к следующему');
      await click($('#app .hd .cl'),60);ok(P.cur()==='s3'&&/Вопрос 7 из 42/.test(all()),'«×» с пройденного вопроса: на главной самый дальний вопрос');
      await click('Продолжить анкету',60);ok(P.cur()==='aq:q:7'&&fw().hidden,'«Продолжить анкету» → первый вопрос без ответа')}
    if(c.startsWith('aq:q:')){n++;$$('#app .op')[1].click();await wait(40);if(n===1)ok(P.cur()===c&&$('#app .op.on')?.dataset.v==='1','выбранный вариант успевает подсветиться');await wait(PICK-40);continue}
    if(c==='aq:pb:8')ok(/Собрать портрет/.test($('#app .ft .b1').textContent),'последняя перебивка: «Собрать портрет»');await click($('#app .ft .b1'),12)}
  ok(n===42&&P.cur()==='s8'&&Object.keys(P.st.ans).length===42,'анкета 42 вопроса → сборка портрета');
  await wait(2300);ok(/готов/i.test(all()),'портрет готов');
  await click('Посмотреть портрет');ok(P.cur()==='s4b'&&/Портрет/.test(all())&&/Рост в холке/.test(all())&&/25 кг/.test(all()),'профиль обогатился: портрет, вес, рост');
  await click($('#app .hd .ic'));ok(P.cur()==='s3'&&!!$('#app .r-cur [data-r=rec]'),'назад из профиля → главная E ['+nav()+']');noFuture('главная E');
  await click($$('#app .nv a')[2]);ok(P.cur()==='pl'&&/Неделя 1/.test(all())&&!/Пройденные/.test(all()),'план: первая рекомендация, пройденных нет');noFuture('план');
  ok($$('#app .r-cur').length===1&&!/Создайте безопасное место/.test(all()),'будущих рекомендаций не видно');
  // рекомендация 1: в работу, галочки, «Помогла»
  await click('Посмотреть рекомендацию');ok(P.cur()==='rec'&&/Новая/.test($('#rc-chip').textContent),'рекомендация 1 «Новая»');
  $$('#app .r-it')[0].click();await wait(20);ok(/Отмечено 0 из 20/.test(all())&&!$('#app .r-it.on')&&/Проверьте/.test($('#app .r-it').textContent+all()),'в «Новой» пункты видны, но не отмечаются');
  ok(/Возьмите в работу/.test($('#rc-pn .cap').textContent)&&getComputedStyle($('#app .r-bx'),'::after').content!=='none','в «Новой» вместо боксов точки, над кнопкой подсказка «Возьмите в работу»');
  await click('Беру в работу');ok(/В работе/.test($('#rc-chip').textContent)&&$('#app [data-a=result]').className==='b2'&&/Завершить рекомендацию/.test($('#rc-pn').textContent)&&/Отмечайте пункты/.test($('#rc-pn .cap').textContent),'взяли в работу: кнопка «Завершить рекомендацию» спокойная, пока отмечено не всё');
  $$('#app .r-it')[0].click();$$('#app .r-it')[1].click();$$('#app .r-it')[0].click();await wait(20);ok(/Отмечено 1 из 20/.test(all()),'в работе отметки ставятся и снимаются');
  await click($('#app .hd .ic'));await click('Открыть');ok(/Отмечено 1 из 20/.test(all()),'отметки сохраняются между экранами');
  ok(await result('helped','Убрали провода'),'результат «Помогла» сохранён');
  ok(/Открыли следующую рекомендацию/.test(all())&&/Создайте безопасное место/.test($('#app .r-next').textContent),'подтверждение с карточкой следующей');
  await click('К плану',700);ok(P.cur()==='pl'&&/Пройденные/.test(all())&&/Неделя 2/.test(all()),'план: шаг 2, пройденная в списке');
  ok($('#app .r-cur').offsetHeight>=$('#app .r-cur').scrollHeight-1&&!!$('#app .r-cur .b1')?.offsetParent,'карточка новой рекомендации показана целиком');
  ok($$('#app .r-st.work').length===0,'в работе нет ни одной рекомендации');
  // рекомендация 2: «Не подходит нам»
  await click('Посмотреть рекомендацию');await click($('#app [data-a=nofit]'),380);
  ok($('#app .r-rc.on')?.dataset.s==='notfit'&&/Это первая/.test(all()),'«Не подходит нам» → шторка с выбранным «Не подошла» и предупреждением о лимите');
  ok($$('#app .r-rc').length===1&&!$('#app .r-bs .r-acc')&&$('#app .r-bs .ttl').textContent==='Не подходит нам','в этой шторке только «Не подошла»: остальных вариантов и критериев нет');
  setv($('#app #rs-cm'),'нет места');await click($('#app [data-a=save]'),900);ok(/Так бывает/.test(all())&&/передали ваш комментарий/.test(all()),'спокойное подтверждение с комментарием');
  await click('Открыть',80);ok(P.cur()==='rec'&&/Дозируйте стресс/.test(all()),'«Открыть» → рекомендация 3');
  // рекомендация 3: вторая «Не подошла» → лимит
  await click($('#app [data-a=nofit]'),380);ok(/Это вторая/.test(all()),'второй раз: предупреждение «последняя»');await click($('#app [data-a=save]'),900);await click('К плану',80);
  ok(P.st.plan.used===2&&/Две рекомендации вы уже отложили/.test(all()),'лимит исчерпан: подсказка на карточке плана');
  ok($$('#app .r-pd.notfit').length===2&&/Можно вернуться/.test(all()),'две отложенные, «Можно вернуться»');
  await click('Посмотреть рекомендацию');ok(!$('#app [data-a=nofit]')&&/Две рекомендации/.test($('#rc-pn').textContent),'рекомендация 4: ссылки «Не подходит нам» нет');
  await click('Беру в работу');await click($('#app [data-a=result]'),380);ok($('#app .r-rc[data-s=notfit]').classList.contains('dis'),'в шторке «Не подошла» недоступна');
  await click($('#app .r-x'),80);ok(!$('#app .r-bs'),'шторка закрывается крестиком');
  // к отложенной вернуться нельзя, пока текущая в работе
  await click($('#app .hd .ic'));ok(!/Можно вернуться/.test(all()),'текущая в работе: «Можно вернуться» скрыто');
  await click($('#app .r-pd.notfit'));ok(!!$('#rc-pn button[disabled]')&&/Сначала завершите текущую/.test(all()),'у отложенной кнопка неактивна');
  await click($('#app .hd .ic'));await click('Открыть');ok(await result('partial'),'рекомендация 4 «Помогла частично»');await click('К плану',80);
  // выход 1: вернуться к отложенной
  await click($('#app .r-pd.notfit'));await click('Попробовать ещё раз');ok(/В работе/.test($('#rc-chip').textContent)&&!!$('#app [data-a=again]'),'вернули отложенную: «В работе», есть «Отложить снова»');
  await click($('#app .hd .ic'));ok(/Следующая рекомендация ждёт/.test(all())&&$$('#app .r-st.work').length===1,'план: возвращённая в работе, следующая ждёт; в работе одна');
  await click('Открыть');await click($('#app [data-a=again]'),80);ok(P.cur()==='pl'&&P.st.plan.used===2&&$$('#app .r-pd.notfit').length===2,'«Отложить снова» не тратит лимит');
  await click($('#app .r-pd.notfit'));await click('Попробовать ещё раз');ok(await result('helped'),'возвращённая «Помогла»');
  ok(/Возвращаемся к текущей рекомендации/.test(all()),'подтверждение после возвращённой');await click('Открыть',80);
  // рекомендация 5: последняя → S14
  ok(/Грызть, рвать/.test(all()),'рекомендация 5');await click('Беру в работу');ok(await result('helped'),'последняя «Помогла»');
  ok(P.cur()==='s14'&&/Вы прошли/i.test(all()),'маршрут пройден');await wait(900);
  ok($$('#app .r-sum b').map(b=>b.textContent).join(',')==='3,1,1','сводка 3 · 1 · 1');
  await click('К плану');ok(/Вы прошли все шаги/i.test(all())&&$$('#app .r-pd').length===5,'план: итог и пять пройденных');
  // изменить результат у пройденной
  await click($('#app .r-pd.partial'));await click($('#app [data-a=result]'),380);$('#app .r-rc[data-s=helped]').click();await wait(20);await click($('#app [data-a=save]'),900);
  ok(!$('#app .r-bs')&&/Помогла$/.test($('#rc-chip').textContent.trim()),'изменили результат: шторка закрылась, чип сменился');
  await click($('#app .hd .ic'));await click($$('#app .nv a')[0]);ok(/Все шаги пройдены/.test(all()),'главная F ['+nav()+']');
  // после маршрута вернуться к отложенной
  await click($('#app [data-r=plan]'));await click($('#app .r-pd.notfit'));await click('Попробовать ещё раз');await click($('#app .hd .ic'));
  ok($$('#app .r-cur').length===1&&/Вы прошли все шаги/i.test(all()),'маршрут пройден + вернулись к отложенной: карточка в работе и итог');
  await click($$('#app .nv a')[3]);ok(P.cur()==='chat','чат');
  // кличка и род берутся из профиля, а не из примера
  P.st.draft.name='Барсик';P.st.draft.sex='мальчик';P.go('s8',{back:true});await wait(60);
  ok(/Портрет Барсика/i.test(all())&&!/Джесси/i.test(all()),'S8: «Портрет Барсика готов»');
  P.go('s3',{back:true});await wait(60);ok(/Барсик/i.test($('#app .r-day').textContent)&&/Портрет Барсика/.test(all())&&!/Джесси/i.test(all()),'главная: кличка из профиля во всех подписях');
  P.go('s4b',{back:true});await wait(60);ok(/Кто он[^а]/.test(all())&&/Барсик — метис, ему/.test(all())&&!/Джесси/i.test(all()),'профиль: портрет в мужском роде с кличкой из профиля');
  }catch(e){log.push('EXC '+e.stack.split('\n').slice(0,3).join(' '))}
  return log.join('\n');
};
