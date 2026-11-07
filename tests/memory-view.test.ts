import test from 'node:test';
import assert from 'node:assert/strict';
import {organizationView} from '../lib/memory-view';
test('failed and interrupted organization offer retry without hiding original',()=>{for(const state of ['failed','processing'])assert.equal(organizationView(state,null).action,'Retry organization');});
test('malformed ready output falls back to a retryable original',()=>{assert.equal(organizationView('ready',{title:'broken'}).data,null);assert.equal(organizationView('ready',{title:'broken'}).action,'Retry organization');});
test('ready organization displays validated output without another automatic attempt',()=>{const data={title:'Apply to EA',summary:'You saved a role.',facts:['EA'],next_step:'Apply'};assert.deepEqual(organizationView('ready',data).data,data);assert.equal(organizationView('ready',data).action,null);});
