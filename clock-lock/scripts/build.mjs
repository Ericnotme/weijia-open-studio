import {build} from 'esbuild';import fs from 'node:fs';import path from 'node:path';
fs.rmSync('dist/clock-source.zip',{force:true});
const result=await build({entryPoints:['src/app.mjs','src/testnet.mjs','src/exit-app.mjs'],bundle:true,format:'esm',target:['safari16','chrome110'],outdir:'dist',minify:true,legalComments:'linked',metafile:true});
const packages=new Set();for(const input of Object.keys(result.metafile.inputs)){if(!input.startsWith('node_modules/'))continue;const parts=input.split('/');packages.add(parts[1].startsWith('@')?parts.slice(0,3).join('/'):parts.slice(0,2).join('/'));}
const notices=[];for(const dir of [...packages].sort()){for(const name of fs.readdirSync(dir)){if(/^licen[sc]e/i.test(name)&&fs.statSync(path.join(dir,name)).isFile())notices.push(dir+'\n'+fs.readFileSync(path.join(dir,name),'utf8'));}}
fs.writeFileSync('dist/THIRD_PARTY_NOTICES.txt',notices.join('\n\n'));
console.log('Clock browser bundle and dependency notices built.');
