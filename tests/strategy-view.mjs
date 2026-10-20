import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const sandbox={structuredClone,document:{addEventListener(){}},state:{posts:[{id:'post-a',title:'<script>unsafe</script>',snapshots:[{at:'2026-10-20T10:00',ageHours:4,views:1000,profile:1,follows:0},{at:'2026-10-20T13:52',ageHours:15,views:186530,profile:49,follows:0}]}]},esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),latest:p=>p.snapshots.at(-1),fmt:x=>String(x),ageLabel:x=>x+' 小時'};
vm.createContext(sandbox);vm.runInContext(await readFile('public/research-math.js','utf8'),sandbox);vm.runInContext(await readFile('public/strategy.js','utf8'),sandbox);
const html=vm.runInContext("strategyEvidence({postIds:['post-a']})",sandbox);
assert(html.includes('2.63'),'Uses latest real snapshot with profiles per 10k views');
assert(html.includes('2026-10-20 13:52'));
assert(!html.includes('<script>unsafe</script>'));assert(html.includes('&lt;script&gt;unsafe'));
assert(vm.runInContext("strategyEvidence({postIds:['missing']})",sandbox).includes('尚未關聯可用貼文'));
console.log('Strategy evidence: latest snapshot, normalized metric, safe rendering and missing links passed.');

sandbox.state.posts[0].snapshots.at(-1).profile=null;assert(!vm.runInContext("strategyEvidence({postIds:['post-a']})",sandbox).includes('0.00'),'Unknown profile count is not zero conversion');
