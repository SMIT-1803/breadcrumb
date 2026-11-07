import test from 'node:test';
import assert from 'node:assert/strict';
import {singleFlight} from '../lib/single-flight';
test('automatic organization and retry share one pending request',async()=>{const flight=singleFlight();let calls=0;let finish=()=>{};const run=()=>{calls++;return new Promise<void>(resolve=>{finish=resolve;});};const first=flight('one',run),second=flight('one',run);assert.equal(first,second);await Promise.resolve();assert.equal(calls,1);finish();await first;await flight('one',async()=>{calls++;});assert.equal(calls,2);});
