"""Hand-drawn (marker) icons for Хвостун: pet-themed variants on a 24-unit grid.

Each icon is a list of strokes built from simple geometry. A stroke is a calm, confident line:
corners softly rounded, a slight bow along its length, and pen-pressure changes in thickness.
Strokes are written as filled outlines in currentColor, so they drop into the icon slots as is.
"""
import math
import random

BOW = 0.11      # slow sideways drift of a line, grid units
PRESS = 0.1     # pen-pressure change of thickness, share of width
CORNER = 3      # corner softening passes
STEP = 0.75     # path point spacing


def arc(cx, cy, rx, ry, a0, a1, n=None):
    n = n or max(6, int(abs(a1 - a0) / 12))
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def rrect(x, y, w, h, r):
    pts = []
    pts += arc(x + w - r, y + r, r, r, -90, 0, 4)
    pts += arc(x + w - r, y + h - r, r, r, 0, 90, 4)
    pts += arc(x + r, y + h - r, r, r, 90, 180, 4)
    pts += arc(x + r, y + r, r, r, 180, 270, 4)
    return pts + [pts[0]]


def heart(cx, cy, s):
    """Heart outline points, size s ≈ width."""
    k = s / 16
    pts = []
    for i in range(41):
        t = math.pi * 2 * i / 40
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * k / 2, cy + y * k / 2))
    return pts


def resample(pts, step):
    out = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        d = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(d / step))
        for i in range(1, n + 1):
            out.append((x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n))
    return out


def soften(pts, closed=False, passes=CORNER):
    """Round corners a little: repeated local averaging of finely spaced points."""
    for _ in range(passes):
        n, out = len(pts), []
        for i in range(n):
            w = 2
            if closed:
                idx = [(i + j) % n for j in range(-w, w + 1)]
            else:
                k = min(w, i, n - 1 - i)
                idx = range(i - k, i + k + 1)
            xs = [pts[j] for j in idx]
            out.append((sum(p[0] for p in xs) / len(xs), sum(p[1] for p in xs) / len(xs)))
        pts = out
    return pts


def lengths(pts):
    L = [0.0]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L.append(L[-1] + math.hypot(x1 - x0, y1 - y0))
    return L


def normals(pts):
    out = []
    for i in range(len(pts)):
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        dl = math.hypot(dx, dy) or 1
        out.append((-dy / dl, dx / dl))
    return out


def drift(pts, rnd, amp=BOW):
    """A single slow bow plus a fainter one: the line stays clean, just not ruler-straight."""
    L = lengths(pts)
    l1, l2 = rnd.uniform(16, 24), rnd.uniform(8, 11)
    p1, p2 = rnd.uniform(0, 6.28), rnd.uniform(0, 6.28)
    N = normals(pts)
    return [(x + nx * (amp * math.sin(6.283 * s / l1 + p1) + amp * .3 * math.sin(6.283 * s / l2 + p2)),
             y + ny * (amp * math.sin(6.283 * s / l1 + p1) + amp * .3 * math.sin(6.283 * s / l2 + p2)))
            for (x, y), (nx, ny), s in zip(pts, N, L)]


def ribbon(pts, rnd, width):
    """Outline of a pen stroke: thickness breathes along the line, ends are round and a touch thinner."""
    pts = thin(pts, STEP * .8)
    L = lengths(pts)
    total = L[-1] or 1
    N = normals(pts)
    lam, ph = rnd.uniform(11, 16), rnd.uniform(0, 6.28)
    left, right = [], []
    for (x, y), (nx, ny), s in zip(pts, N, L):
        end = min(1.0, .86 + .14 * min(s, total - s) / 1.2)
        h = width / 2 * end * (1 + PRESS * math.sin(6.283 * s / lam + ph))
        left.append((x + nx * h, y + ny * h))
        right.append((x - nx * h, y - ny * h))

    def cap(c, n, h, sign):
        """Round end: from one edge, around the tip, to the other (sign +1 end, -1 start)."""
        tx, ty = n[1] * sign, -n[0] * sign
        return [(c[0] + sign * h * n[0] * math.cos(a) + h * tx * math.sin(a),
                 c[1] + sign * h * n[1] * math.cos(a) + h * ty * math.sin(a))
                for a in (math.pi / 4, math.pi / 2, math.pi * 3 / 4)]

    he = math.hypot(left[-1][0] - pts[-1][0], left[-1][1] - pts[-1][1])
    hs = math.hypot(left[0][0] - pts[0][0], left[0][1] - pts[0][1])
    return left + cap(pts[-1], N[-1], he, 1) + right[::-1] + cap(pts[0], N[0], hs, -1)


def thin(pts, step):
    out, acc = [pts[0]], 0.0
    for a, b in zip(pts, pts[1:]):
        acc += math.hypot(b[0] - a[0], b[1] - a[1])
        if acc >= step:
            out.append(b)
            acc = 0.0
    if out[-1] != pts[-1]:
        out.append(pts[-1])
    return out


def to_path(pts, close=False):
    f = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")
    d = [f"M{f(pts[0][0])} {f(pts[0][1])}"]
    P = [pts[0]] + pts + [pts[-1]]
    if close:
        P = [pts[-1]] + pts + [pts[0], pts[1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}")
    return "".join(d) + ("Z" if close else "")


def stroke(kind, pts, rnd, width=2):
    if kind == "fill":
        ring = soften(resample(pts + [pts[0]], .12)[:-1], closed=True, passes=1)
        ring = drift(ring + ring[:1], rnd, BOW * .3)[:-1]
        return f'<path d="{to_path(thin(ring, .35), close=True)}"/>'
    if kind == "loop":
        k = rnd.randrange(len(pts) - 1)
        ring = soften(resample(pts[k:-1] + pts[:k] + [pts[k]], .25)[:-1], closed=True)
        over = int(1.1 / .25)  # the pen closes the shape with a short overlap
        line = drift(ring + ring[:over], rnd)
    else:
        line = drift(soften(resample(pts, .25)), rnd)
    return f'<path d="{to_path(ribbon(line, rnd, width), close=True)}"/>'


def paw(cx, cy, s, kind="fill"):
    """Paw print: main pad + 4 toes. s = overall scale (≈ width / 10)."""
    out = [(kind, arc(cx, cy + 1.3 * s, 2.3 * s, 1.9 * s, 0, 360, 14))]
    for dx, dy, r in ((-3.1, -1.2, .95), (-1.15, -3.0, 1.0), (1.15, -3.0, 1.0), (3.1, -1.2, .95)):
        out.append((kind, arc(cx + dx * s, cy + dy * s, r * s, r * 1.15 * s, 0, 360, 10)))
    return out


def bone(cx, cy, w, h, ang=0):
    """Bone outline centred at cx,cy: w long, h tall at the knobs; rotated by ang degrees."""
    r = h / 4
    c = r * .85
    x0, x1 = -w / 2 + r, w / 2 - r
    pts = (arc(x1, -c, r, r, 150, 420, 10) + arc(x1, c, r, r, -60, 210, 10)
           + arc(x0, c, r, r, -30, 240, 10) + arc(x0, -c, r, r, 120, 390, 10))
    pts.append(pts[0])
    co, si = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    return [(cx + x * co - y * si, cy + x * si + y * co) for x, y in pts]


# ---------------- icons ----------------

def house(roof_y=10.5):
    return [("line", [(3.4, roof_y + .6), (12, 3.9), (20.6, roof_y + .6)]),
            ("line", [(5.6, roof_y - .9), (5.5, 20), (18.5, 20), (18.4, roof_y - .9)])]


def bubble():
    x, y, w, h, r = 3.6, 4.6, 16.8, 12.2, 3.6
    p = (arc(x + w - r, y + r, r, r, -90, 0, 4) + arc(x + w - r, y + h - r, r, r, 0, 90, 4)
         + [(10.4, y + h), (6.2, 20.3)] + arc(x + r, y + h - r, r, r, 90, 180, 4) + arc(x + r, y + r, r, r, 180, 270, 4))
    return p + [p[0]]


ICONS = {
    # главная
    "home-a": house() + [("line", [(9.3, 20), *arc(12, 15.9, 2.7, 2.9, 180, 360, 8), (14.7, 20)])],
    "home-b": house() + paw(12, 15.3, .74),
    "home-c": house() + [("fill", heart(12, 15.2, 6.4))],
    # чат
    "chat-a": [("loop", bubble())] + paw(12, 11, .7),
    "chat-b": [("loop", bubble()), ("loop", bone(12, 10.7, 9.2, 4.2, -14))],
    "chat-c": [("loop", bubble()),
               ("line", [(6.6, 5), (4.2, 3.8), (2.6, 6.6), (3.6, 10.8)]),
               ("line", [(17.4, 5), (19.8, 3.8), (21.4, 6.6), (20.4, 10.8)]),
               ("fill", arc(8.6, 10.7, .9, .9, 0, 360, 8)), ("fill", arc(12, 10.7, .9, .9, 0, 360, 8)),
               ("fill", arc(15.4, 10.7, .9, .9, 0, 360, 8))],
    # профиль питомца
    "pet-a": [("loop", arc(12, 13, 5.6, 6.6, 0, 360, 24)),
              ("loop", [(8.4, 7.2), (4.3, 6.2), (2.7, 11.6), (4.5, 14.4), (7.1, 12.8), (8.4, 7.2)]),
              ("loop", [(15.6, 7.2), (19.7, 6.2), (21.3, 11.6), (19.5, 14.4), (16.9, 12.8), (15.6, 7.2)]),
              ("fill", arc(9.9, 11.9, .85, .95, 0, 360, 8)), ("fill", arc(14.1, 11.9, .85, .95, 0, 360, 8)),
              ("fill", [(10.6, 15.1), (13.4, 15.1), (12.9, 16.5), (12, 17), (11.1, 16.5)])],
    "snout": [("fill", [(7.6, 6.6), (16.4, 6.6), (15.9, 9), (12, 11.8), (8.1, 9)]),
              ("line", [(12, 11.2), (12, 14.2)]),
              ("line", arc(8.7, 14.2, 3.3, 3.4, 0, 165, 10)),
              ("line", arc(15.3, 14.2, 3.3, 3.4, 180, 15, 10))],
    "pet-b": paw(12, 12.9, 2.0),
    "pet-c": [("line", arc(12, 6.5, 8.2, 5.2, 15, 165, 14)),
              ("line", [(12, 11.7), (12, 13)]),
              ("loop", arc(12, 17, 3.9, 3.9, 0, 360, 18)),
              ("fill", heart(12, 17.1, 3.6))],
    # план адаптации
    "plan-a": [("loop", rrect(5, 3.6, 14, 17, 2.4)),
               ("line", [(8, 9), (9.1, 10.2), (10.9, 7.8)]), ("line", [(12.6, 9.2), (16.2, 9.2)]),
               ("line", [(8, 14.2), (9.1, 15.4), (10.9, 13)]), ("line", [(12.6, 14.4), (16.2, 14.4)])],
    "plan-b": paw(7.3, 16.2, 1.0) + paw(16.7, 8.4, 1.0),
    "plan-c": [("loop", rrect(5, 4.8, 14, 15.8, 2.4)), ("loop", rrect(8.4, 2.5, 7.2, 4.6, 1.5)),
               ("loop", bone(12, 13.2, 8.4, 3.8, -20))],
    # специалист
    "spec-a": [("line", [(6.5, 3.6), (5.6, 3.8), (5.4, 9.6), *arc(9, 9.6, 3.6, 4.2, 180, 0, 10)[1:-1], (12.6, 9.6), (12.4, 3.8), (11.5, 3.6)]),
               ("line", [(9, 13.8), (9, 16.2), *arc(13.2, 16.2, 4.2, 3.8, 180, 0, 10)[1:], (17.4, 13.4)]),
               ("loop", arc(17.4, 11.4, 2, 2, 0, 360, 12))],
    "spec-b": [("loop", heart(12, 12.6, 17)), ("line", [(12, 8.8), (12, 15.4)]), ("line", [(8.7, 12.1), (15.3, 12.1)])],
    # замок (недоступно)
    "lock-a": [("loop", rrect(4.8, 10.4, 14.4, 10.2, 2.6)),
               ("line", [(8.3, 10.3), *arc(12, 8, 3.7, 4.1, 180, 360, 10)[1:-1], (15.7, 10.3)])],
    "lock-b": [("loop", rrect(4.8, 10.4, 14.4, 10.2, 2.6)),
               ("line", [(8.3, 10.3), *arc(12, 8, 3.7, 4.1, 180, 360, 10)[1:-1], (15.7, 10.3)]),
               ("fill", heart(12, 15.4, 4.6))],
    # служебные — одна версия
    "back": [("line", [(19, 12.2), (5.2, 11.8)]), ("line", [(10.8, 6.2), (5, 12), (11, 17.8)])],
    "next": [("line", [(5, 11.8), (18.8, 12.2)]), ("line", [(13.2, 6.2), (19, 12), (13, 17.8)])],
    "chev": [("line", [(9.4, 5.8), (15.6, 12.1), (9.6, 18.2)])],
    "close": [("line", [(6.4, 6.6), (17.6, 17.4)]), ("line", [(17.4, 6.4), (6.6, 17.6)])],
    "check": [("line", [(4.8, 12.6), (9.4, 17.2), (19.2, 7.2)])],
    "send": [("line", [(12.1, 19.2), (11.9, 5.2)]), ("line", [(6, 11), (12, 5), (18, 11.2)])],
    "info": [("loop", arc(12, 12, 8.6, 8.4, 0, 360, 28)), ("line", [(12, 11), (12.1, 16.2)]),
             ("fill", arc(12, 7.9, .95, .95, 0, 360, 8))],
    "cal": [("loop", rrect(4, 5.6, 16, 14.6, 2.8)), ("line", [(4.2, 10.2), (19.8, 10)]),
            ("line", [(8.6, 3.4), (8.5, 7.6)]), ("line", [(15.4, 3.4), (15.5, 7.6)])],
    "eye": [("loop", arc(12, 12, 9.6, 6.4, 0, 360, 26)), ("loop", arc(12, 12, 2.9, 2.9, 0, 360, 12))],
    "up": [("fill", heart(12, 12.6, 15.6))],
    "down": [("loop", heart(12, 12.6, 15.6)), ("line", [(12.3, 10.4), (10.7, 13), (13.1, 14.8), (11.7, 17.4)])],
    "warn": [("loop", arc(12, 12, 8.6, 8.4, 0, 360, 28)), ("line", [(12, 7.6), (12.1, 12.8)]),
             ("fill", arc(12, 16.2, .95, .95, 0, 360, 8))],
    "spin": [("line", arc(12, 12, 8.6, 8.6, -80, 200, 24))],
}

TITLES = {
    "home": ("Главная", {"a": "Будка", "b": "Домик с лапкой", "c": "Домик с сердцем"}),
    "chat": ("Чат", {"a": "Облачко с лапкой", "b": "Облачко с косточкой", "c": "Облачко с ушками"}),
    "pet": ("Профиль питомца", {"a": "Мордочка", "b": "Лапка", "c": "Ошейник с жетоном"}),
    "plan": ("План адаптации", {"a": "Список с галочками", "b": "Следы — шаг за шагом", "c": "Планшет с косточкой"}),
    "spec": ("Специалист", {"a": "Стетоскоп", "b": "Сердце с крестом"}),
    "lock": ("Недоступно", {"a": "Замок с лапкой", "b": "Замок с сердцем"}),
}
UTIL = [("back", "Назад"), ("next", "Далее"), ("chev", "Перейти"), ("close", "Закрыть"), ("check", "Выбрано"),
        ("send", "Отправить"), ("info", "Подсказка"), ("cal", "Дата"), ("eye", "Пароль"), ("up", "Полезно")]


def body(name, seed=7, width=1.9):
    rnd = random.Random(f"{name}-{seed}")
    return "".join(stroke(k, p, rnd, width) for k, p in ICONS[name])


def svg(name, size=24, sw=1.9, seed=7, cls="i"):
    return (f'<svg class="{cls}" width="{size}" height="{size}" viewBox="0 0 24 24" fill="currentColor" '
            f'aria-hidden="true">{body(name, seed, sw)}</svg>')
