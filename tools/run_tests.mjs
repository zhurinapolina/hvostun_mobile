// Проверки прототипа в браузере без установки зависимостей: нужен Node 22+ и Google Chrome.
//   node tools/run_tests.mjs            — сценарий полного пути и матрица размеров
//   node tools/run_tests.mjs flow       — только сценарий
//   node tools/run_tests.mjs matrix     — только матрица размеров
//   node tools/run_tests.mjs matrix 667x375 — один размер
import {launch, sleep} from './cdp.mjs';
import {readFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const what = process.argv[2] || 'all';
// телефоны в портрете от самых узких до самых крупных и горизонтальное положение
const SIZES = [[280, 653], [320, 568], [360, 640], [360, 800], [375, 667], [390, 844], [393, 852], [412, 915], [430, 932], [667, 375], [844, 390], [932, 430]];
const c = await launch(9351, mkdtempSync(join(tmpdir(), 'hvostun-')), 1500, 1100);
await c.send('Emulation.setDeviceMetricsOverride', {width: 1500, height: 1100, deviceScaleFactor: 1, mobile: false});
await c.send('Page.navigate', {url: 'file://' + encodeURI(join(root, 'prototype/index.html'))});
await sleep(2500);
await c.ev('document.fonts.ready.then(()=>1)');
for (const f of ['flow.js', 'matrix.js']) await c.ev(readFileSync(join(root, 'tests', f), 'utf8') + ';1');
let bad = 0;
const only = process.argv[3]; // необязательно: один размер, например 667x375
if (what !== 'matrix') {
  const log = await c.ev('__flow()');
  const lines = log.split('\n'), fail = lines.filter(l => !l.startsWith('ok'));
  console.log(`Сценарий: шагов ${lines.length}, не прошло ${fail.length}`);
  fail.forEach(l => console.log('  ' + l)); bad += fail.length;
  // клавиатура как на телефоне: видимая область становится ниже, экран должен остаться на месте и ужаться по высоте
  // (матрица ниже задаёт размеры экрана сама и настоящую функцию viewport не проверяет)
  for (const [w, h, k] of [[390, 844, 510], [360, 615, 330]]) {
    await c.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 2, mobile: true});
    await c.ev('__p.device("m",false,false);__p.preset(1);new Promise(r=>setTimeout(()=>r(1),300))');
    await c.send('Emulation.setDeviceMetricsOverride', {width: w, height: k, deviceScaleFactor: 2, mobile: true});
    const r = await c.ev(`new Promise(r=>setTimeout(()=>{__p.viewport();const a=document.getElementById('app'),b=a.getBoundingClientRect(),f=document.querySelector('#app input.in').getBoundingClientRect();
      r({kb:a.classList.contains('kb'),w:Math.round(b.width),h:Math.round(b.height),field:f.width>100&&f.bottom<=b.bottom+1})},300))`);
    const ok = r.kb && r.w === w && r.h === k && r.field;
    console.log(`Клавиатура на ${w} × ${h}: ${ok ? 'экран на месте, поле видно' : 'ОШИБКА ' + JSON.stringify(r)}`); if (!ok) bad++;
    await c.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 2, mobile: true});
    await c.ev('new Promise(r=>setTimeout(()=>{__p.viewport();r(1)},200))');
  }
  const zoom = await c.ev(`document.querySelector('meta[name=viewport]').content`);
  if (!/user-scalable=no/.test(zoom) || !/maximum-scale=1/.test(zoom)) { console.log('  !! масштабирование страницы не выключено'); bad++ }
  await c.send('Emulation.setDeviceMetricsOverride', {width: 1500, height: 1100, deviceScaleFactor: 1, mobile: false});
  await c.ev('__p.device("m",false,true);new Promise(r=>setTimeout(()=>r(1),200))');
}
if (what !== 'flow') {
  for (const [opt, title] of [[{}, 'обычный шрифт'], [{kb: true}, 'с клавиатурой'], [{font: 1.3}, 'шрифт × 1,3']]) {
    for (const s of SIZES.filter(x => !only || x.join('x') === only)) {
      // каждый размер эмулируется как экран телефона: приложение занимает его целиком, как на устройстве
      await c.send('Emulation.setDeviceMetricsOverride', {width: s[0], height: s[1], deviceScaleFactor: 2, mobile: true});
      await c.ev('__p.device("m",false,false);new Promise(r=>setTimeout(()=>r(1),300))');
      const res = await c.ev(`__matrix(${JSON.stringify({...opt, sizes: [s]})})`);
      const keys = Object.keys(res);
      console.log(`${s[0]} × ${s[1]}, ${title}: ${keys.length ? 'замечаний ' + keys.length : 'чисто'}`);
      keys.forEach(k => console.log('  ' + k + ': ' + res[k].join('; '))); bad += keys.length;
    }
  }
}
c.close();
process.exit(bad ? 1 : 0);
