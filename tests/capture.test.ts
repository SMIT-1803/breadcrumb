import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCapture} from '../lib/capture.ts';
test('rejects blank and oversized notes',()=>{assert.throws(()=>validateCapture(' \n\t'));assert.throws(()=>validateCapture('x'.repeat(4001)));});
test('preserves original text and exact HTTP sources',()=>{const text='Apply to EA https://ea.com/jobs?a=1&b=2';assert.deepEqual(validateCapture(text),{original_text:text,source_urls:['https://ea.com/jobs?a=1&b=2']});});
test('rejects unsafe protocols and too many links',()=>{assert.throws(()=>validateCapture('javascript:alert(1)'));assert.throws(()=>validateCapture(Array.from({length:6},(_,i)=>`https://example.com/${i}`).join(' ')));});

test('preserves balanced parentheses and source query punctuation',()=>{const url='https://en.wikipedia.org/wiki/Function_(mathematics)';assert.equal(validateCapture(url).source_urls[0],url);const query='https://example.com/search?q=hello!';assert.equal(validateCapture(query).source_urls[0],query);});
test('allows screenshot-only capture but rejects fully empty input',()=>{assert.deepEqual(validateCapture('',true),{original_text:'',source_urls:[]});assert.throws(()=>validateCapture('',false));});
