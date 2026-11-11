# -*- coding: utf-8 -*-
"""Приёмник снимков экранов: POST /save?name=<file> пишет тело запроса в папку OUT. Только для локальной выгрузки."""
import os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


class H(BaseHTTPRequestHandler):
    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        name = q.get("name", [""])[0]
        if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,80}\.(html|json|md)", name):
            self.send_response(400); self.end_headers(); return
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n)
        open(os.path.join(OUT, name), "wb").write(data)
        self.send_response(200); self.send_header("Access-Control-Allow-Origin", "*"); self.end_headers(); self.wfile.write(b"ok")

    def log_message(self, *a):
        pass


HTTPServer(("127.0.0.1", 8767), H).serve_forever()
