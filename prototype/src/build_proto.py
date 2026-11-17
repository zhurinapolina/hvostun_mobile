"""Build the adaptive prototype from the final boards: same CSS, same markup, plus adaptive layer and app logic."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import doodle  # noqa: E402
from doodle import arc, rrect, bone  # noqa: E402
from urllib.parse import quote  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
arg = lambda i, d: sys.argv[i] if len(sys.argv) > i else os.path.normpath(os.path.join(HERE, d))
# доски холста, папка исходников прототипа, куда писать прототип, иллюстрации рекомендаций
SRC, PROTO, OUT, ILL = arg(1, "../../source/canvas"), arg(2, "."), arg(3, "../index.html"), arg(4, "../../illustrations/plan")
ORDER = ["V-Main", "V-M-S2-oshibki", "V-M-S3-AC", "V-M-S3-EF", "V-M-S8", "V-M-S13-S14", "V-M-S4", "V-M-S4-pustye", "V-M-S5-S9", "V-M-S7-vvedenie", "V-M-S7", "V-M-S7-perebivki",
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
SCREENS = {"s1": ["V-Main"], "s2": ["V-M-S2-oshibki", "V-Main"], "route": ["V-M-S13-S14"], "s4": ["V-M-S4", "V-M-S4-pustye"],
           "s5": ["V-M-S5-S9"], "vv": ["V-M-S7-vvedenie"], "anq": ["V-M-S7"], "pb": ["V-M-S7-perebivki"],
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


ROUTES = {"V-M-S3.dc.html": "home", "V-M-S4-dop.dc.html": "profile", "V-M-S4.dc.html": "s4", "V-M-S5-S9.dc.html": "plan",
          "V-M-S7.dc.html": "plan", "V-M-C1-C3.dc.html": "chat", "V-Main.dc.html": "s1", "V-M-S4b-portret.dc.html": "profile",
          "V-M-S9-plan.dc.html": "plan", "V-M-S8.dc.html": "s8", "V-M-S12-1.dc.html": "rec", "V-M-S3-EF.dc.html": "home", "V-M-S3-AC.dc.html": "home"}


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
def grown(h):
    """Новые экраны: на досках телефон растянут по содержимому, в прототипе он обычной высоты и прокручивается внутри."""
    h = clean(h).replace('class="ph lg"', 'class="ph"').replace(' style="flex:1 0 auto;overflow:visible"', "")
    # праздничные экраны (S8 «Портрет готов», S14): на досках искры стоят в пикселях от края телефона 390 px, картинка 342 × 250 с отступом 64 сверху.
    # В прототипе картинка занимает всё свободное место над заголовком, поэтому искры кладём внутрь её рамки .r-art и переводим в проценты от рамки:
    # они остаются вокруг собаки на любом экране
    m = re.search(r'(<div class="r-fest">)((?:<svg class="r-sp".*?</svg>)+)(<div class="pic">)(<img[^>]*>)(</div>)', h, re.S)
    if not m:
        return h
    sparks = re.sub(r'(class="r-sp" style="left:)([0-9]+)px;top:([0-9]+)px',
                    lambda s: s.group(1) + "%.1f%%;top:%.1f%%" % ((int(s.group(2)) - 24) / 3.42, (int(s.group(3)) - 64) / 2.5), m.group(2))
    return h[:m.start()] + m.group(1) + m.group(3) + '<div class="r-art">' + sparks + m.group(4) + "</div>" + m.group(5) + h[m.end():]


for k, h in zip(("a", "a2", "b", "c"), phones("V-M-S3-AC")):
    T["h_" + k] = grown(h)
ef = phones("V-M-S3-EF")
T["h_d"], T["h_e"], T["h_f"] = grown(ef[0]), grown(ef[1]), grown(ef[3])
s8 = phones("V-M-S8")
T["s8w"], T["s8r"], T["s8e"] = grown(s8[0]), grown(s8[1]), grown(s8[2])
T["s14"] = grown(phones("V-M-S13-S14")[-1])
T["s4"] = clean(phones("V-M-S4")[0])
T["s5"] = clean(phones("V-M-S5-S9")[0])
# анкета: форма «Введения», шаблоны вступления, вопроса и свободного ответа, 8 перебивок
nosb = lambda h: re.sub(r'\n?<i class="sb"[^>]*></i>', "", h)
T["vv"] = nosb(clean(phones("V-M-S7-vvedenie")[0]))
a7 = [clean(p) for p in phones("V-M-S7")]
T["aq_in"], T["aq_q"], T["aq_fr"] = nosb(a7[0]), a7[1], a7[5]
for i, p in enumerate(phones("V-M-S7-perebivki"), 1):
    T[f"pb{i}"] = clean(p)
assert len([k for k in T if k.startswith("pb")]) == 8
Q = json.load(open(f"{PROTO}/cbarq-questions.json", encoding="utf-8"))


def intro_html(text):
    out, ul = [], []
    for line in text.split("\n"):
        if line.startswith("- "):
            ul.append(f"<li>{line[2:]}</li>"); continue
        if ul:
            out.append('<ul class="sec-ul">' + "".join(ul) + "</ul>"); ul = []
        out.append(f'<p class="sec-tx">{line}</p>')
    if ul:
        out.append('<ul class="sec-ul">' + "".join(ul) + "</ul>")
    return "".join(out)


QD = {"x": Q["x"], "s": [{"t": s["title"], "in": intro_html(s["intro"]), "sc": s["scale"], "q": s["questions"], "req": s["required"],
                         "fl": s["free"]["label"], "fh": s["free"]["hint"]} for s in Q["sections"]]}
T["chat"] = clean(phones("V-M-C1-C3")[0])
T["e6"] = clean(phones("V-M-global")[0])
pl = re.search(r'<div class="eslot">(.*?)</div>\s*<div class="fl">', B["V-M-S2-oshibki"][B["V-M-S2-oshibki"].index('</helmet>'):], re.S).group(1)
T["e2"] = pl
T["sf"] = ""
ICON = {k: f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{doodle.body(n, width=w)}</svg>'
        for k, n, s, w in [("spin", "spin", 20, 2.1), ("check", "check", 16, 2.5), ("warn", "warn", 16, 2.1), ("ai", "snout", 20, 2.3), ("chev", "chev", 20, 2.1), ("close", "close", 22, 1.9)]}

# --- данные маршрута: рекомендации, портрет, иконки. В продукте всё это присылает сервер
doodle.ICONS.update({
    "clock": [("loop", arc(12, 12, 8.6, 8.6, 0, 360, 28)), ("line", [(12, 7.2), (12, 12.3), (15.4, 14.3)])],
    "weight": [("loop", rrect(4.6, 9.2, 14.8, 10.6, 2.8)), ("loop", arc(12, 6.3, 2.5, 2.5, 0, 360, 12))],
    "pause": [("line", [(9, 7), (9.1, 17)]), ("line", [(15, 7), (14.9, 17)])],
    "target": [("loop", arc(12, 12, 8.6, 8.6, 0, 360, 28)), ("fill", arc(12, 12, 2.7, 2.7, 0, 360, 12))],
    "bone": [("loop", bone(12, 12, 15, 6.2, -24))],
    "dot": [("fill", arc(12, 12, 3.2, 3.2, 0, 360, 12))],
    "half": [("loop", arc(12, 12, 8.6, 8.6, 0, 360, 28)), ("line", [(8.2, 12.1), (15.8, 11.9)])],
    "redo": [("line", arc(12, 12, 7.6, 7.6, 20, 300, 22)), ("line", [(14.2, 3.6), (18.1, 5.3), (16.6, 9.4)])],
})


def dog(file, color):
    svg = re.sub(r"\s+", " ", open(f"{ILL}/{file}", encoding="utf-8").read()).replace('"', "'").replace("#1d1d1b", color)
    return "data:image/svg+xml," + quote(svg, safe="=:/,.-")


RECS = json.load(open(f"{PROTO}/recommendations.json", encoding="utf-8"))["recommendations"]
PORTRAIT = json.load(open(f"{PROTO}/portrait.json", encoding="utf-8"))
PLAN = {"recs": [{"t": r["title"], "c": r["color"], "ill": dog(r["illustration"], "#24397a"), "why": r["why"], "intro": r["intro"],
                  "g": [[g["title"], [x["text"] for x in g["items"]], g["note"]] for g in r["groups"]], "terms": r["terms"], "crit": r["criteria"]} for r in RECS],
        "ic": {f"{n}:{s}": doodle.svg(n, s) for n in ("dot", "check", "half", "pause", "cal", "chev", "info", "warn", "target", "clock", "up", "close", "back", "spin")
               for s in (16, 18, 20, 22)},
        "img": {"ava": dog("avatar.svg", "#3352a3")},
        "portrait_m": [[p["title"], p["text"]] for p in PORTRAIT["blocks_male"]],
        "portrait": [[p["title"], p["text"]] for p in PORTRAIT["blocks"]]}

fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', B["V-Main"]).group(0)
app_css = open(f"{PROTO}/app.css", encoding="utf-8").read()
app_js = open(f"{PROTO}/app.js", encoding="utf-8").read()
html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Хвостун</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content">
{fonts}
<style id="board"></style>
<style>:root{{color-scheme:light}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<style>{app_css}</style>
</head>
<body>
<div id="stage"><aside id="panel" aria-label="Настройки просмотра"></aside><div id="frame"><div id="app"><div id="toast" role="status"></div></div><div id="kbd">Клавиатура</div></div></div>
<script>window.__T={json.dumps(T, ensure_ascii=False)};window.__ICON={json.dumps(ICON, ensure_ascii=False)};window.__CSS={json.dumps(CSS, ensure_ascii=False)};window.__Q={json.dumps(QD, ensure_ascii=False)};window.__PLAN={json.dumps(PLAN, ensure_ascii=False)};</script>
<script>{app_js}</script>
</body>
</html>
"""
open(OUT, "w", encoding="utf-8").write(html)
# версия для тестирования с пользователями: только экран телефона, без пульта и кнопки «Экраны»
open(os.path.join(os.path.dirname(OUT), "test.html"), "w", encoding="utf-8").write(html.replace("</head>", "<style>#stage #panel,#pbtn{display:none!important}</style>\n</head>"))
print(len(html) // 1024, "KB")
