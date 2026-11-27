import {mkdir, copyFile, cp, rm, stat} from 'node:fs/promises';
import {join} from 'node:path';

// Deploy only the public static files. No PHP, SQL, credentials or project sources.
await rm('dist',{recursive:true,force:true});
await mkdir('dist/v2',{recursive:true});
for (const file of ['index.html','theme-original.css','accessibility.js','demo-api.js']) {
  await copyFile(join('v2',file),join('dist/v2',file));
}
await cp('assets/brand','dist/assets/brand',{recursive:true});
await copyFile('index.html','dist/index.html');
for (const file of ['dist/index.html','dist/v2/index.html','dist/v2/demo-api.js']) await stat(file);
console.log('Se Conecte: publicação estática pronta em dist/');
