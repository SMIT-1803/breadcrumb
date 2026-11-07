import {test} from 'node:test';
import assert from 'node:assert/strict';
import {saveCapture} from '../lib/save-capture.ts';
const file=new File(['png'],'test.png',{type:'image/png'});
test('failed upload never reports a finalized memory',async()=>{let finalized=false;await assert.rejects(()=>saveCapture({id:'capture',text:'idea',file,userId:'owner'},{upload:async()=>{throw new Error('offline');},finalize:async()=>{finalized=true;}}));assert.equal(finalized,false);});
test('retry uses the same object path and request ID',async()=>{const paths:string[]=[];const records=new Set<string>();let first=true;const services={upload:async(path:string)=>{paths.push(path);},finalize:async(input:{id:string})=>{records.add(input.id);if(first){first=false;throw new Error('response interrupted');}}};const input={id:'capture',text:'idea',file,userId:'owner'};await assert.rejects(()=>saveCapture(input,services));await saveCapture(input,services);assert.deepEqual(paths,['owner/capture.png','owner/capture.png']);assert.equal(records.size,1);});
