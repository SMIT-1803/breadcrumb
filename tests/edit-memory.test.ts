import test from 'node:test';
import assert from 'node:assert/strict';
import {editMemory,type EditableMemory} from '../lib/edit-memory';
const original={id:'one',revision:2,original_text:'Old note',image_path:'owner/one.png'};
test('editing derives new links and retains screenshot',async()=>{const result=await editMemory({original_text:'Apply here www.example.com',revision:2},{read:async()=>original,update:async(revision,patch)=>{assert.equal(revision,2);assert.deepEqual(patch,{original_text:'Apply here www.example.com',source_urls:['https://www.example.com']});return {...original,...patch,revision:3};}});assert.equal(result.image_path,original.image_path);});
test('editing rejects stale revision without overwriting content',async()=>{let updated=false;await assert.rejects(()=>editMemory({original_text:'New',revision:1},{read:async()=>original,update:async()=>{updated=true;return original;}}),/changed/i);assert.equal(updated,false);});
test('editing handles a race between read and update',async()=>{await assert.rejects(()=>editMemory({original_text:'New',revision:2},{read:async()=>original,update:async()=>null}),/changed/i);});
test('text-only memory cannot become empty but screenshot-only can',async()=>{const repo={read:async():Promise<EditableMemory>=>({...original,image_path:null}),update:async()=>original};await assert.rejects(()=>editMemory({original_text:' ',revision:2},repo),/note/i);await editMemory({original_text:'',revision:2},{...repo,read:async()=>original});});
test('editing unknown or foreign memory never updates',async()=>{let updated=false;await assert.rejects(()=>editMemory({original_text:'New',revision:2},{read:async()=>null,update:async()=>{updated=true;return original;}}),/not found/i);assert.equal(updated,false);});
