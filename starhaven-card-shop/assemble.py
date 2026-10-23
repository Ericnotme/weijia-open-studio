from pathlib import Path
import base64
root=Path(__file__).parent
src=root/'src'
art='data:image/svg+xml;base64,'+base64.b64encode((src/'placeholder.svg').read_bytes()).decode()
html=(src/'template.html').read_text()
js=(src/'fallback.js').read_text()+'\n'+(src/'scene.js').read_text().replace('__ART_DATA__',art)+'\n'+(src/'ui.js').read_text()
for tag,value in [('STYLE',(src/'style.css').read_text()),('THREE',(src/'three.min.js').read_text()),('CORE',(src/'core.js').read_text()),('GAME',js)]:
 html=html.replace('/*'+tag+'*/',value)
(root/'dist/index.html').write_text(html)
print('Built self-contained game:',len(html.encode()),'bytes')
