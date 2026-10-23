from pathlib import Path
import base64
root=Path(__file__).parent
html=(root/'src/template.html').read_text()
for key,name in [('STYLE','style.css'),('ENGINE','engine.js'),('AI','ai.js'),('UI','ui.js'),('TRAINER','trainer.js'),('TRAINER_UI','trainer-ui.js'),('CHALLENGE','challenge.js'),('LEARNING','learning.js'),('LEARNING_UI','learning-ui.js')]:
    html=html.replace('/*'+key+'*/',(root/'src'/name).read_text())
html=html.replace('/*TABLE_IMAGE*/',base64.b64encode((root/'src/placeholder.svg').read_bytes()).decode())
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print('Built self-contained SIBIR: '+str(len(html.encode()))+' bytes')
