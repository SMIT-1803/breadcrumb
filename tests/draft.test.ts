import {test} from 'node:test';
import assert from 'node:assert/strict';
import {restoreDraft} from '../lib/draft.ts';
test('reload preserves request ID after an unconfirmed save',()=>{assert.deepEqual(restoreDraft(JSON.stringify({text:'Apply to EA',id:'test-request'})),{text:'Apply to EA',id:'test-request'});});
test('malformed browser storage falls back to an empty draft',()=>{assert.deepEqual(restoreDraft('{bad'),{text:'',id:null});});
