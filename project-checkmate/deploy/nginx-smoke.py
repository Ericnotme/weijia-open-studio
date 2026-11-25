#!/usr/bin/env python3
"""Run the reviewed routes on loopback with a separate nginx master only."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import urllib.request

source = Path(sys.argv[1]).resolve()
release = Path(sys.argv[2]).resolve()
spec = importlib.util.spec_from_file_location('checkmate_publish', str(source))
publish = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publish)
assert release.is_dir() and not release.is_symlink()
assert all((release / name).is_file() for name in publish.FILES)
scratch = Path(tempfile.mkdtemp(prefix='checkmate-nginx-smoke-', dir=str(source.parent)))
config = scratch / 'nginx.conf'
config.write_text('user nginx; worker_processes 1; pid ' + str(scratch / 'nginx.pid') + ';\n'
                  'error_log stderr; events { worker_connections 32; }\n'
                  'http { access_log off; server { listen 127.0.0.1:18789; server_name weijia-lab.com;\n'
                  + publish.routes(release) + '\n} }\n')
subprocess.check_call(['nginx', '-t', '-c', str(config), '-p', str(scratch) + '/'])
log = (scratch / 'nginx.log').open('wb')
process = subprocess.Popen(['nginx', '-c', str(config), '-p', str(scratch) + '/', '-g', 'daemon off;'],
                           stdout=log, stderr=log)
rows = []
try:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for attempt in range(20):
        assert process.poll() is None, 'isolated nginx failed to start; inspect private smoke log'
        try:
            for name, mime in publish.FILES.items():
                uri = publish.BASE + '/' + ('' if name == 'index.html' else name)
                req = urllib.request.Request('http://127.0.0.1:18789' + uri, headers={'Host': publish.SITE})
                with opener.open(req, timeout=2) as response:
                    body = response.read()
                    assert response.status == 200
                    assert response.headers.get_content_type() == mime
                    assert body == (release / name).read_bytes()
                    rows.append({'uri': uri, 'status': response.status, 'mime': mime,
                                 'sha256': hashlib.sha256(body).hexdigest()})
            break
        except OSError:
            rows = []
            if attempt == 19:
                raise
            time.sleep(.1)
    (scratch / 'result.json').write_text(json.dumps(rows, indent=2))
    print('ISOLATED_NGINX_SMOKE_PASS ' + json.dumps(rows), flush=True)
finally:
    if process.poll() is None:
        process.terminate()
        process.wait(timeout=5)
    log.close()
    print('ISOLATED_NGINX_STOPPED ' + str(process.pid), flush=True)
