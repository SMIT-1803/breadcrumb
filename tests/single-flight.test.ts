import test from 'node:test';
import assert from 'node:assert/strict';
import {singleFlight} from '../lib/single-flight';
test('automatic organization and retry share one pending request',async()=>{const flight=singleFlight();let calls=0;let finish=()=>{};const run=()=>{calls++;return new Promise<void>(resolve=>{finish=resolve;});};const first=flight('one',run),second=flight('one',run);assert.equal(first,second);await Promise.resolve();assert.equal(calls,1);finish();await first;await flight('one',async()=>{calls++;});assert.equal(calls,2);});
test('an edited revision waits for the older attempt then starts its own request',async()=>{const flight=singleFlight();let finish=()=>{},calls=0;const old=flight('one',()=>new Promise<void>(resolve=>{calls++;finish=resolve;}),1);await Promise.resolve();const edited=flight('one',async()=>{calls++;},2);assert.notEqual(old,edited);assert.equal(calls,1);finish();await Promise.all([old,edited]);assert.equal(calls,2);});
