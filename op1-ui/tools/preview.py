#!/usr/bin/env python3
"""Serve the kit on loopback. Private fonts load only through the browser file picker."""
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if Path(path).name.lower() in {'opfont.svg', 'kerntable.db', 'colors.svg'}:
            self.send_error(404); return
        if any(p.startswith('.') for p in Path(path).parts) or path.startswith('/__private__'):
            self.send_error(404); return
        super().do_GET()

def main():
    parser = argparse.ArgumentParser(description=__doc__); parser.add_argument('--port', type=int, default=8765); args = parser.parse_args()
    print(f'Open http://127.0.0.1:{args.port}/op1-ui/; Ctrl-C to stop.', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), functools.partial(Handler, directory=str(ROOT))).serve_forever()

if __name__ == '__main__': main()
