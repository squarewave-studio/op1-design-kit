import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,copyFile,chmod,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const optionalGit=(...args)=>{try{return git(...args);}catch(error){if(error.status===1)return '';throw error;}};
const exists=async path=>{try{await access(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};
const root=git('rev-parse','--show-toplevel');
const common=resolve(git('rev-parse','--git-common-dir'));
const hooks=join(common,'hooks');
const localPath=optionalGit('config','--local','--get','core.hooksPath');
// Remove only the superseded local setting; preserve other hook configurations.
if(localPath==='.husky/_')git('config','--local','--unset','core.hooksPath');
const configured=optionalGit('config','--get','core.hooksPath');
if(configured && resolve(root,configured)!==hooks)throw new Error('Another hooks path is configured; preserve it and resolve the installer conflict before continuing.');
await mkdir(hooks,{recursive:true});
const target=join(hooks,'pre-commit');
const source=await readFile(join(root,'.githooks/pre-commit'),'utf8');
if(await exists(target)){
  const old=await readFile(target,'utf8');
  if(old!==source && !old.includes('# op1-design-kit shared hook dispatcher')){
    if(await exists(target+'.local'))throw new Error('Existing pre-commit.local backup must be resolved before replacing another hook.');
    await copyFile(target,target+'.local');
  }
}
await writeFile(target,source);
await chmod(target,0o755);
console.log('Installed the shared maintainer pre-commit hook.');
