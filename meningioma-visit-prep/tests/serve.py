from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(Path(__file__).parents[1]/'dist'),**kw)
    def log_message(self,*a): pass
ThreadingHTTPServer(('127.0.0.1',8769),Quiet).serve_forever()
