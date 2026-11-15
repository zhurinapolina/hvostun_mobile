// Пересборка эталонов экранов: node tools/export_screens.mjs  (нужен Node 22+ и Google Chrome)
import {launch, sleep} from './cdp.mjs';
import {readFileSync, writeFileSync, readdirSync, unlinkSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), out = join(root, 'handoff/screens');
const c = await launch(9352, mkdtempSync(join(tmpdir(), 'hvostun-')), 1500, 1100);
await c.send('Emulation.setDeviceMetricsOverride', {width: 1500, height: 1100, deviceScaleFactor: 1, mobile: false});
await c.send('Page.navigate', {url: 'file://' + encodeURI(join(root, 'prototype/index.html'))});
await sleep(2500);
await c.ev('document.fonts.ready.then(()=>1)');
await c.ev(readFileSync(join(root, 'tools/export_screens.js'), 'utf8') + ';1');
const n = await c.ev('__exportScreens()');
const names = await c.ev('Object.keys(__screens)');
for (const f of readdirSync(out)) if (!names.includes(f)) unlinkSync(join(out, f));
for (const f of names) writeFileSync(join(out, f), await c.ev(`__screens[${JSON.stringify(f)}]`));
c.close();

// карта эталонов в handoff/README.md — между заголовками «Карта эталонов» и «Как пересобрать эталоны»
const index = JSON.parse(readFileSync(join(out, 'index.json'), 'utf8'));
const table = rows => '| Эталон | Экран и состояние | Маршрут в прототипе |\n|---|---|---|\n' + rows.map(e => `| [\`${e.id}.html\`](screens/${e.id}.html) | ${e.title} | \`${e.route}\` |`).join('\n') + '\n';
const groups = list => [...new Set(list.map(e => e.group))].map(g => `### ${g}\n\n` + table(list.filter(e => e.group === g))).join('\n');
const base = index.filter(e => !e.id.includes('--')), sized = index.filter(e => e.id.includes('--'));
const map = `## Карта эталонов\n\n${groups(base)}\n## Эталоны на других размерах\n\n${groups(sized)}\n`;
const p = join(root, 'handoff/README.md'), t = readFileSync(p, 'utf8');
const a = t.indexOf('## Карта эталонов'), b = t.indexOf('## Как пересобрать эталоны');
writeFileSync(p, t.slice(0, a) + map + '\n' + t.slice(b));
console.log('эталонов:', n);
