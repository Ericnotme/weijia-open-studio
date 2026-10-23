import {spawnSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const destination=path.resolve('dist/clock-source.zip');if(fs.existsSync(destination))fs.unlinkSync(destination);
const include=['src','scripts','tests','docs','ios','dist','package.json','package-lock.json','capacitor.config.json','README.md','SECURITY.md','LICENSE','Dockerfile','.dockerignore','.gitignore','.env.example','.github'];
const files=include.filter(f=>fs.existsSync(f));
const result=spawnSync('zip',['-qr',destination,...files,'-x','*/node_modules/*','*/Pods/*','*/DerivedData/*','*/build/*','*/.DS_Store','dist/clock-source.zip','*/clock-source.zip','*/xcuserdata/*'],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);console.log(destination);
