"""Build the adaptive prototype from the final boards: same CSS, same markup, plus adaptive layer and app logic."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import doodle  # noqa: E402

SRC, PROTO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ORDER = ["V-Main", "V-M-S2-oshibki", "V-M-S3", "V-M-S4", "V-M-S4-pustye", "V-M-S4-dop", "V-M-S5-S9", "V-M-S6-S7",
         "V-M-C1-C3", "V-M-C4-C7", "V-M-C8-C12", "V-M-global"]
B = {n: open(f"{SRC}/{n}.dc.html", encoding="utf-8").read() for n in ORDER}

# стили: у каждого экрана точные правила его доски, общий пул убирает повторы
skip = re.compile(r"^(body|\.bd|\.col|\.lb|a\{|a:hover|\.dk|\.tn)")
pool, index, sheets = [], {}, {}
for n in ORDER:
    st = re.search(r"<style>(.*?)</style>", B[n], re.S).group(1)
    st = re.sub(r"/\*.*?\*/", "", st, flags=re.S)
    sheets[n] = []
    for r in st.split("}"):
        r = r.strip()
        if not r or skip.match(r):
            continue
        if r not in index:
            index[r] = len(pool)
            pool.append(r + "}")
        sheets[n].append(index[r])
SCREENS = {"s1": ["V-Main"], "s2": ["V-M-S2-oshibki", "V-Main"], "home": ["V-M-S3"], "s4": ["V-M-S4-dop", "V-M-S4", "V-M-S4-pustye"],
           "s4b": ["V-M-S4-dop"], "s5": ["V-M-S5-S9"], "s9": ["V-M-S5-S9"], "s6": ["V-M-S6-S7"],
           "chat": ["V-M-C8-C12", "V-M-C1-C3", "V-M-C4-C7"], "e6": ["V-M-global"]}
CSS = {"pool": pool, "screens": {k: sum((sheets[n] for n in v), []) for k, v in SCREENS.items()}}


def phones(n):
    t = B[n]
    body = t[t.index("</helmet>"):]
    out = []
    for m in re.finditer(r'<div class="ph[ "][^>]*>', body):
        depth, pos = 0, m.start()
        for d in re.finditer(r"<div\b|</div>", body[m.start():]):
            depth += 1 if d.group(0) != "</div>" else -1
            if depth == 0:
                pos = m.start() + d.end()
                break
        out.append(body[m.start():pos])
    return out


ROUTES = {"V-M-S3.dc.html": "home", "V-M-S4-dop.dc.html": "profile", "V-M-S4.dc.html": "s4", "V-M-S5-S9.dc.html": "s5",
          "V-M-S6-S7.dc.html": "s6", "V-M-C1-C3.dc.html": "chat", "V-Main.dc.html": "s1"}


def clean(h):
    def link(m):
        href = m.group(1).split("#")[0]
        return f'data-r="{ROUTES[href]}"' if href in ROUTES else m.group(0)
    h = re.sub(r'href="([^"#][^"]*)"', link, h)
    h = re.sub(r'\sdata-go="([^"]*)"', lambda m: (' data-r="' + {"V-M-S3.dc.html": "home", "V-Main.dc.html": "s1", "V-M-S5-S9.dc.html": "plan"}.get(m.group(1).split("#")[0], "") + '"') if not m.group(1).startswith("#") else ' data-r="s2"', h)
    h = re.sub(r'\s+id="(?:a|a2|b|c|d|s9)"', "", h, count=1)
    h = re.sub(r'<a ([^>]*)href="#"([^>]*)>Написать команде', r'<a \1href="#" data-x="Здесь откроется Telegram команды"\2>Написать команде', h)
    h = re.sub(r'<a ([^>]*)href="#"([^>]*)>согласие', r'<a \1href="#" data-x="Здесь откроется текст согласия"\2>согласие', h)
    return h


T = {}
main = [clean(p) for p in phones("V-Main")]
T["s1"], T["s2"] = main[0], main[1]
T["s1"] = T["s1"].replace('data-r="s2" href="#s2"', 'data-r="s2"').replace('href="#s2" data-r="s2"', 'data-r="s2"').replace('href="#s2"', 'data-r="s2"')
home = [clean(p) for p in phones("V-M-S3")]
for k, h in zip(("a", "a2", "b", "c", "d"), home):
    T["h_" + k] = h
T["s4"] = clean(phones("V-M-S4")[0])
d = [clean(p) for p in phones("V-M-S4-dop")]
T["s4b1"], T["s4b2"] = d[0], d[1]
T["s5"] = clean(phones("V-M-S5-S9")[0])
T["s9"] = clean(phones("V-M-S5-S9")[1])
T["s6"] = clean(phones("V-M-S6-S7")[0]).replace('data-r="s5"', 'data-r="s5"')
T["chat"] = clean(phones("V-M-C1-C3")[0])
T["e6"] = clean(phones("V-M-global")[0])
for k in ("s4b1", "s4b2"):
    T[k] = T[k].replace('<div style="flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center">',
                        '<div class="pic-b" style="display: flex; align-items: center; justify-content: center">')
    T[k] = re.sub(r'(<dd>)Васёк(</dd>)', r'\1Васёк\2', T[k])
pl = re.search(r'<div class="eslot">(.*?)</div>\s*<div class="fl">', B["V-M-S2-oshibki"][B["V-M-S2-oshibki"].index('</helmet>'):], re.S).group(1)
T["e2"] = pl
T["sf"] = ""
ICON = {k: f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{doodle.body(n, width=w)}</svg>'
        for k, n, s, w in [("spin", "spin", 20, 2.1), ("check", "check", 16, 2.5), ("warn", "warn", 16, 2.1), ("ai", "snout", 20, 2.3), ("chev", "chev", 20, 2.1), ("close", "close", 22, 1.9)]}

fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', B["V-Main"]).group(0)
app_css = open(f"{PROTO}/app.css", encoding="utf-8").read()
app_js = open(f"{PROTO}/app.js", encoding="utf-8").read()
html = f"""<title>Хвостун</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
{fonts}
<style id="board"></style>
<style>{app_css}</style>
<div id="stage"><aside id="panel" aria-label="Настройки просмотра"></aside><div id="frame"><div id="app"><div id="toast" role="status"></div></div><div id="kbd">Клавиатура</div></div></div>
<script>window.__T={json.dumps(T, ensure_ascii=False)};window.__ICON={json.dumps(ICON, ensure_ascii=False)};window.__CSS={json.dumps(CSS, ensure_ascii=False)};</script>
<script>{app_js}</script>
"""
open(OUT, "w", encoding="utf-8").write(html)
print(len(html) // 1024, "KB")
