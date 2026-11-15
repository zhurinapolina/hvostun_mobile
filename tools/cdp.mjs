// минимальный клиент Chrome DevTools без зависимостей
import {spawn} from 'node:child_process';
// путь к Chrome можно задать переменной окружения CHROME
const CHROME = process.env.CHROME || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : 'google-chrome');
export async function launch(port, dir, w, h){
  const ch = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--hide-scrollbars', '--no-first-run', '--force-device-scale-factor=1', `--window-size=${w},${h}`, 'about:blank'], {stdio: 'ignore'});
  let list;
  for (let i = 0; i < 60; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.some(t => t.type === 'page')) break } catch {} await new Promise(r => setTimeout(r, 250)) }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const wait = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { const [ok, no] = wait.get(m.id); wait.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result) } };
  const send = (method, params = {}) => new Promise((ok, no) => { wait.set(++id, [ok, no]); ws.send(JSON.stringify({id, method, params})) });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true}); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600)); return r.result.value };
  return {send, ev, close: () => { ws.close(); ch.kill() }};
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
