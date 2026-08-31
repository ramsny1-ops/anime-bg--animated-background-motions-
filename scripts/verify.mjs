
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));const effectsDir=join(root,"effects");
const requiredRoot=["README.md","README.html","LICENSE","CODE_OF_CONDUCT.md","SECURITY.md","CONTRIBUTING.md","CUSTOMIZATION.md","PERFORMANCE.md","CHANGELOG.md","ROADMAP.md","SUPPORT.md","index.html","main.css","main.js","package.json"];
const requiredDocs=["index.html","customization.html","performance.html","contributing.html","architecture.html","accessibility.html","security.html","support.html","roadmap.html","code-of-conduct.html","assets/docs.css","assets/docs.js"];
const requiredEffectFiles=["README.md","index.html","style.css","script.js"];
const requiredUiIds=["scene","stage","controlPanel","panelToggleButton","pauseButton","resetButton","randomButton","savePresetButton","loadPresetButton","exportButton","importButton","copyConfigButton","snapshotButton","qualityScale","fpsStat","frameStat","particleStat","pointerStat","canvasStat","dprStat"];
const problems=[];const report=[];
async function exists(path){try{await stat(path);return true}catch{return false}}
const countLines=text=>text.split("\n").length;
function ids(source){const set=new Set();const pattern=/querySelector\(["']#([A-Za-z][\w-]*)["']\)/g;for(const m of source.matchAll(pattern))set.add(m[1]);return[...set]}
for(const f of requiredRoot)if(!(await exists(join(root,f))))problems.push(`Missing root file: ${f}`);
for(const f of requiredDocs)if(!(await exists(join(root,"docs",f))))problems.push(`Missing designed documentation file: docs/${f}`);
const folders=(await readdir(effectsDir,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort();
if(folders.length!==15)problems.push(`Expected 15 effect folders, found ${folders.length}`);
for(const folder of folders){const dir=join(effectsDir,folder);for(const f of requiredEffectFiles)if(!(await exists(join(dir,f))))problems.push(`Missing ${folder}/${f}`);const [js,html,css,readme]=await Promise.all([readFile(join(dir,"script.js"),"utf8"),readFile(join(dir,"index.html"),"utf8"),readFile(join(dir,"style.css"),"utf8"),readFile(join(dir,"README.md"),"utf8")]);try{new Function(js)}catch(error){problems.push(`JavaScript syntax failed: ${folder}: ${error.message}`)}for(const id of requiredUiIds)if(!html.includes(`id="${id}"`))problems.push(`${folder}/index.html missing UI id: ${id}`);for(const id of ids(js))if(!html.includes(`id="${id}"`))problems.push(`${folder}/script.js queries #${id}, but HTML has no matching id`);if(!html.includes('href="./style.css"'))problems.push(`${folder} does not load style.css`);if(!html.includes('src="./script.js"'))problems.push(`${folder} does not load script.js`);if(!css.includes('#scene'))problems.push(`${folder}/style.css has no #scene`);if(countLines(readme)<300)problems.push(`${folder}/README.md below 300 lines`);if(countLines(js)<600)problems.push(`${folder}/script.js below 600 lines`);report.push({folder,js:countLines(js),html:countLines(html),css:countLines(css),readme:countLines(readme)});}
try{new Function(await readFile(join(root,"main.js"),"utf8"))}catch(error){problems.push(`main.js syntax failed: ${error.message}`)}
try{new Function(await readFile(join(root,"docs/assets/docs.js"),"utf8"))}catch(error){problems.push(`docs.js syntax failed: ${error.message}`)}
if(problems.length){console.error("anime-bg verification failed.\n");for(const p of problems)console.error(`- ${p}`);process.exit(1)}
console.log(`anime-bg verification passed for ${folders.length} effects.\n`);for(const i of report)console.log(`${i.folder}: JS ${i.js}, HTML ${i.html}, CSS ${i.css}, README ${i.readme}`);console.log("\nRoot files, enterprise HTML docs, DOM contracts, documentation thresholds, and JavaScript syntax are valid.");
