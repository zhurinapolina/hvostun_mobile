"""Формы «от руки» для карточек, кнопок и чипов: неровные углы, едва заметный изгиб сторон, контур маркером.

Линия спокойная, без дрожи: у каждого угла свой радиус, сторона чуть выгибается один-два раза на весь периметр,
толщина контура плавно дышит. Форма отдаётся SVG-строкой нужного размера.
"""
import math
import random
from urllib.parse import quote


def _corner(cx, cy, r, a0, a1, n=10):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def _resample(pts, step):
    out = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        d = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(d / step))
        for i in range(1, n + 1):
            out.append((x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n))
    return out[:-1]


def _smooth(pts, passes=3):
    n = len(pts)
    for _ in range(passes):
        pts = [((pts[i - 1][0] + 2 * pts[i][0] + pts[(i + 1) % n][0]) / 4,
                (pts[i - 1][1] + 2 * pts[i][1] + pts[(i + 1) % n][1]) / 4) for i in range(n)]
    return pts


def _normals(pts):
    n, out = len(pts), []
    for i in range(n):
        a, b = pts[i - 1], pts[(i + 1) % n]
        dx, dy = b[0] - a[0], b[1] - a[1]
        dl = math.hypot(dx, dy) or 1
        out.append((dy / dl, -dx / dl))  # наружу при обходе по часовой (ось y вниз)
    return out


def _arclen(pts):
    L = [0.0]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L.append(L[-1] + math.hypot(x1 - x0, y1 - y0))
    return L, L[-1] + math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1])


def _path(pts):
    f = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")
    n = len(pts)
    d = [f"M{f(pts[0][0])} {f(pts[0][1])}"]
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}")
    return "".join(d) + "Z"


def outline(w, h, r, seed, m=1.5, spread=.3, bow=.7):
    """Точки неровного скруглённого прямоугольника внутри поля m."""
    rnd = random.Random(seed)
    x0, y0, x1, y1 = m, m, w - m, h - m
    lim = min(x1 - x0, y1 - y0) / 2
    rs = [min(lim, r * (1 + rnd.uniform(-spread, spread))) for _ in range(4)]
    pts = []
    pts += _corner(x1 - rs[0], y0 + rs[0], rs[0], -90, 0)
    pts += _corner(x1 - rs[1], y1 - rs[1], rs[1], 0, 90)
    pts += _corner(x0 + rs[2], y1 - rs[2], rs[2], 90, 180)
    pts += _corner(x0 + rs[3], y0 + rs[3], rs[3], 180, 270)
    pts = _smooth(_resample(pts, 1.0), 2)
    L, total = _arclen(pts)
    k, ph = rnd.choice([2, 3]), rnd.uniform(0, 6.28)
    N = _normals(pts)
    amp = min(bow, lim * .08)
    pts = [(x + nx * amp * math.sin(6.283 * k * s / total + ph), y + ny * amp * math.sin(6.283 * k * s / total + ph))
           for (x, y), (nx, ny), s in zip(pts, N, L)]
    return pts[::2], rnd


def shape(w, h, r, seed, fill=None, line=None, sw=1.6, fill_op=None, spread=.3, bow=.7):
    """SVG формы: заливка и/или контур маркером (толщина плавно меняется ±18%)."""
    m = sw / 2 + 1.2 if line else 1.2
    pts, rnd = outline(w, h, r, seed, m, spread, bow)
    body = ""
    if fill:
        op = f' fill-opacity="{fill_op}"' if fill_op is not None else ""
        body += f'<path d="{_path(pts)}" fill="{fill}"{op}/>'
    if line:
        L, total = _arclen(pts)
        N = _normals(pts)
        k, ph = rnd.choice([2, 3]), rnd.uniform(0, 6.28)
        outer, inner = [], []
        for (x, y), (nx, ny), s in zip(pts, N, L):
            hw = sw / 2 * (1 + .18 * math.sin(6.283 * k * s / total + ph))
            outer.append((x + nx * hw, y + ny * hw))
            inner.append((x - nx * hw, y - ny * hw))
        body += f'<path d="{_path(outer)}{_path(inner[::-1])}" fill="{line}" fill-rule="evenodd"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'


def uri(svg):
    return "url(\"data:image/svg+xml," + quote(svg, safe=" =:/,.-") + "\")"


def bimg(w, h, r, s, seed, **kw):
    """CSS border-image: углы режутся по s, середина растягивается — подходит для любой ширины."""
    return f"border:0 solid transparent;border-image:{uri(shape(w, h, r, seed, **kw))} {s} fill / {s}px / 0 stretch"


def bg(w, h, r, seed, **kw):
    """CSS-фон для элементов постоянного размера (плитки, круглые кнопки)."""
    return f"background:{uri(shape(w, h, r, seed, **kw))} center/100% 100% no-repeat"
