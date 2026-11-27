import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/v2',{recursive:true});
for(const f of ['index.html','theme-original.css','accessibility.js']) await copyFile('v2/'+f,'dist/v2/'+f);
await cp('assets/brand','dist/assets/brand',{recursive:true});
await copyFile('index.html','dist/index.html');
