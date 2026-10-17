#!/usr/bin/env node
// Temporary CI-only materialization of lockfile and generated migrations for review.
// No secrets: only package-lock and schema/migration files are emitted.
const fs=require('node:fs');
const path=require('node:path');
const rootFiles=['package-lock.json'];
function collect(dir) {
  if(!fs.existsSync(dir))return;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,entry.name);
    if(entry.isDirectory())collect(p);
    else if(entry.isFile())rootFiles.push(p);
  }
}
collect('drizzle');
for(const file of rootFiles){
  if(!fs.existsSync(file))continue;
  const chunks=fs.readFileSync(file).toString('base64').match(/.{1,1600}/g)??[];
  chunks.forEach((c,i)=>console.log('MAL_REPRO|'+file+'|'+i+'|'+chunks.length+'|'+c));
}
