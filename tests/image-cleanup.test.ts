import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanFailedUpload} from '../lib/image-cleanup.ts';
test('cleanup failure is reported so the draft can be retried',async()=>{await assert.rejects(()=>cleanFailedUpload('owner/id.png',async()=>{throw new Error('storage offline');},'23514'));});
test('a text-only failed save has no image to delete',async()=>{let removed=false;await cleanFailedUpload(null,async()=>{removed=true;},'23514');assert.equal(removed,false);});
test('confirmed failed save cleans the exact uploaded path',async()=>{const removed:string[]=[];await cleanFailedUpload('owner/id.png',async path=>{removed.push(path);},'23514');assert.deepEqual(removed,['owner/id.png']);});
import {shouldCleanFailedUpload} from '../lib/image-cleanup.ts';
test('does not delete after ambiguous transport failures or a duplicate response',()=>{assert.equal(shouldCleanFailedUpload(undefined),false);assert.equal(shouldCleanFailedUpload(''),false);assert.equal(shouldCleanFailedUpload('23505'),false);});
test('only confirmed database rejections allow cleanup',()=>{assert.equal(shouldCleanFailedUpload('23514'),true);assert.equal(shouldCleanFailedUpload('42501'),true);assert.equal(shouldCleanFailedUpload('PGRST000'),false);});

test('ambiguous success and unresolved duplicate keep the uploaded file',async()=>{for(const code of [undefined,'23505']){let removed=false;await cleanFailedUpload('owner/id.png',async()=>{removed=true;},code);assert.equal(removed,false);}});
