"""Лицензионные иллюстрации DiCreate вместо вырезок из превью: экраны новой палитры, паттерн чата, дизайн-система.

python3 licensed_illus.py <папка SVG набора> <папка досок> <папка для экспорта svg>
Правит на месте: V-Main, V-M-S5-S9, V-M-S4-dop, V-M-global, V-M-C1-C3, V-M-C4-C7, V-M-C8-C12, N-DS (+ canvas.json).
"""
import json
import os
import re
import sys
from urllib.parse import quote

SRC, D, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
BLUE, CREAM, MIST = "#3352a3", "#fbf6ec", "#e4f1fa"
INK = "#1d1d1b"  # цвет линий в исходниках набора

# сюжет -> (номер элемента в наборе, кадр viewBox или None)
DOGS = {
    "skate": (38, None), "hug": (24, "-2 56 257 275"), "bow": (39, None), "leash": (31, "-2 26 168 168"),
    "letter": (25, None), "bandana": (14, None), "cyclist": (36, None), "dachs": (34, None),
    "sniff": (29, None), "tongue": (28, None), "sit": (35, None),
}


def raw(n):
    return open(f"{SRC}/Element {n}.svg", encoding="utf-8").read()


def body(n):
    t = raw(n)
    return re.search(r"<svg[^>]*>(.*)</svg>", t, re.S).group(1).strip()


def vbox(n):
    return [float(x) for x in re.search(r'viewBox="([^"]+)"', raw(n)).group(1).split()]


def svg(n, color, crop=None, big=1000):
    vb = [float(x) for x in crop.split()] if crop else vbox(n)
    k = big / max(vb[2], vb[3])
    inner = re.sub(r'\s(id|data-name)="[^"]*"', "", body(n)).replace(INK, color)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f"{v:g}" for v in vb)}" '
            f'width="{vb[2] * k:.0f}" height="{vb[3] * k:.0f}">{inner}</svg>')


def uri(s):
    # без кавычек, пробелов и скобок: годится и в src="", и в url() внутри style=""
    s = re.sub(r"\s+", " ", s).replace('"', "'")
    return "data:image/svg+xml," + quote(s, safe="=:/,.-")


def flowers(color):
    """Две ромашки и росток в одной картинке, как было в превью."""
    parts, x, h = [], 0, 80
    for n in (20, 23, 19):
        vb = vbox(n)
        k = h / vb[3] if n != 19 else 45 / vb[3]
        y = h - vb[3] * k
        parts.append(f'<g transform="translate({x:.1f} {y:.1f}) scale({k:.4f})">'
                     + re.sub(r'\s(id|data-name)="[^"]*"', "", body(n)).replace(INK, color) + "</g>")
        x += vb[2] * k + 10
    w = x - 10
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h}" width="{w * 10:.0f}" '
            f'height="{h * 10}">' + "".join(parts) + "</svg>")


# паттерн чата: та же раскладка, что у прежней плитки, элементы из лицензионного набора
STARS = {"star1": 1, "star2": 4, "star3": 6, "star4": 8}  # отдельные звёздочки из элемента 3
PIECES = {"bone1": 15, "bone2": 16, "flower1": 23, "flower2": 20, "sprout": 19}
LAYOUT = [
    ("bone1", 46, 44, -18, 30), ("star1", 128, 30, 10, 15), ("flower1", 206, 52, 8, 30), ("star2", 296, 34, 0, 13),
    ("sprout", 92, 122, -6, 36), ("star3", 176, 128, 20, 14), ("bone2", 268, 118, 14, 34),
    ("star4", 30, 188, 0, 13), ("flower2", 136, 196, -8, 28), ("star1", 226, 186, 30, 15), ("sprout", 318, 196, 8, 34),
    ("flower1", 62, 278, 12, 28), ("bone1", 170, 282, 40, 30), ("star2", 252, 262, 0, 15), ("flower2", 312, 300, 6, 28),
    ("star3", 112, 338, 0, 13), ("star4", 226, 338, 12, 13),
]
# габариты звёздочек в элементе 3 (getBBox в браузере): x, y, w, h
STAR_BOX = {1: (191.1, 21.9, 24.4, 29.3), 4: (162.4, 39.6, 18.0, 21.4), 6: (207.4, 80.4, 16.1, 18.1), 8: (127.9, 51.4, 9.2, 16.0)}


def pattern(T=360):
    defs, paths3 = [], re.findall(r"<path[^>]*/>", body(3))
    for key, n in PIECES.items():
        vb = vbox(n)
        defs.append((key, re.sub(r'\s(id|data-name)="[^"]*"', "", body(n)), vb[0], vb[1], vb[2], vb[3]))
    for key, i in STARS.items():
        x, y, w, h = STAR_BOX[i]
        defs.append((key, paths3[i], x, y, w, h))
    box = {k: (x, y, w, h) for k, _, x, y, w, h in defs}
    out = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
           f'viewBox="0 0 {T} {T}" width="{T}" height="{T}"><defs>']
    for k, b, *_ in defs:
        out.append(f'<g id="{k}">{b}</g>')
    out.append(f'</defs><g fill="{MIST}">')
    for name, x, y, rot, w in LAYOUT:
        bx, by, bw, bh = box[name]
        k = w / bw
        for ox in (-T, 0, T):
            for oy in (-T, 0, T):
                cx, cy = x + ox, y + oy
                if cx < -60 or cy < -60 or cx > T + 60 or cy > T + 60:
                    continue
                out.append(f'<use href="#{name}" xlink:href="#{name}" transform="translate({cx} {cy}) rotate({rot}) '
                           f'scale({k:.4f}) translate({-(bx + bw / 2):.2f} {-(by + bh / 2):.2f})"/>')
    out.append("</g></svg>")
    return "".join(out).replace(INK, MIST)


def rw(n, fn):
    p = f"{D}/{n}"
    t = open(p, encoding="utf-8").read()
    t2 = fn(t)
    assert t2 != t, n
    open(p, "w", encoding="utf-8").write(t2)


IMG = re.compile(r'(<img class="dg[^"]*" src=")data:image/[^"]+(")')


def swap_imgs(t, uris):
    """Меняет картинки .dg по порядку их появления."""
    it = iter(uris)
    n = len(IMG.findall(t))
    assert n == len(uris), (n, len(uris))
    return IMG.sub(lambda m: m.group(1) + next(it) + m.group(2), t)


PAT = uri(pattern())
PAT_RE = re.compile(r'url\("?data:image/png;base64,[A-Za-z0-9+/=]+"?\)')


def swap_pattern(t):
    old = PAT_RE.findall(t)
    known = [o for o in old if len(o) > 5000]
    assert known, "нет паттерна"
    for o in set(known):
        t = t.replace(o, f"url({PAT})")
    return t


U = {k: {c: uri(svg(n, c, crop)) for c in (BLUE, CREAM)} for k, (n, crop) in DOGS.items()}

rw("V-Main.dc.html", lambda t: swap_imgs(t, [U["skate"][CREAM]]))
rw("V-M-S5-S9.dc.html", lambda t: swap_imgs(t, [U["hug"][BLUE], U["leash"][BLUE]]))
rw("V-M-S4-dop.dc.html", lambda t: swap_imgs(t, [U["bow"][CREAM]] * 2).replace(
    'style="width: 164px; height: 125px"', 'style="width: 164px; height: 125px; object-fit: contain"'))
rw("V-M-global.dc.html", lambda t: swap_pattern(swap_imgs(t, [U["letter"][CREAM]])))
for n in ("V-M-C1-C3.dc.html", "V-M-C4-C7.dc.html", "V-M-C8-C12.dc.html"):
    rw(n, swap_pattern)

# дизайн-система: образцы по подписи, текст, весь набор
NUM = {k: v[0] for k, v in DOGS.items()}


def ds(t):
    t = swap_pattern(t)
    i = t.index("<h2>Иллюстрации</h2>")
    j = t.index("</section>", i)
    s = t[i:j]
    a = ("Линейные собаки из купленного пакета. Это композиционный акцент: чёткая линия, без рамок и не бледный фон. "
         "На экран ставим одну собаку, и не на каждый экран. Сюжет подбираем по смыслу. На светлом фоне линия синяя #3352a3, "
         "на синем кремовая. Сейчас стоят вырезки из превью, лицензионные исходники встанут на те же места.")
    assert s.count(a) == 1
    s = s.replace(a, "Линейные собаки из купленного набора DiCreate Dog illustrations, векторные SVG. Это композиционный акцент: "
                     "чёткая линия, без рамок и не бледный фон. На экран ставим одну собаку, и не на каждый экран. Сюжет подбираем "
                     "по смыслу. Иллюстрация одноцветная и перекрашивается целиком: на светлом фоне синяя #3352a3, на синем "
                     "кремовая #fbf6ec. Номер — как у файла в наборе (Element N.svg).")

    def fig(m):
        pic, name, cap = m.group(1), m.group(2), m.group(3)
        g = 'class="pic g"' in pic
        col = CREAM if g else BLUE
        src = uri(flowers(col)) if name == "flowers" else U[name][col]
        num = "№20, 23, 19" if name == "flowers" else f"№{NUM[name]}"
        pic = IMG.sub(lambda mm: mm.group(1) + src + mm.group(2), pic)
        return f"<figure>{pic}<b>{name}</b>{cap} · {num}</figure>"

    s, k = re.subn(r"<figure>(<div class=\"pic[^\"]*\"><img[^>]*></div>)<b>([a-z]+)</b>([^<]*)</figure>", fig, s)
    assert k == 11, k
    lib = "".join(f'<figure><div class="pic"><img class="dg" src="{uri(svg(n, BLUE, big=400))}" alt=""></div>'
                  f"<b>№{n}</b></figure>" for n in range(1, 42))
    s += ('<p style="margin:32px 0 12px;font-size:15px;font-weight:600;color:#1b2440">Весь набор · 41 элемент</p>'
          f'<div class="dogs2 lib">{lib}</div>')
    t = t[:i] + s + t[j:]
    css = "\n/* весь набор иллюстраций */\n.dogs2.lib{grid-template-columns:repeat(6,1fr);gap:12px}\n.dogs2.lib .pic{height:120px;padding:10px}\n"
    assert t.count("</style>\n</helmet>") == 1
    return t.replace("</style>\n</helmet>", css + "</style>\n</helmet>", 1)


rw("N-DS.dc.html", ds)

# экспорт перекрашенных файлов для сайта и дизайн-системы
os.makedirs(OUT, exist_ok=True)
for k, (n, crop) in DOGS.items():
    for c, nm in ((BLUE, "blue"), (CREAM, "cream")):
        open(f"{OUT}/{k}-{nm}.svg", "w", encoding="utf-8").write(svg(n, c, crop))
for c, nm in ((BLUE, "blue"), (CREAM, "cream")):
    open(f"{OUT}/flowers-{nm}.svg", "w", encoding="utf-8").write(flowers(c))
open(f"{OUT}/chat-pattern.svg", "w", encoding="utf-8").write(pattern())
json.dump({k: v[0] for k, v in DOGS.items()}, open(f"{OUT}/map.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(PAT))
