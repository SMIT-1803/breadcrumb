import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCapture} from '../lib/capture.ts';
test('rejects blank and oversized notes',()=>{assert.throws(()=>validateCapture(' \n\t'));assert.throws(()=>validateCapture('x'.repeat(4001)));});
test('preserves original text and exact HTTP sources',()=>{const text='Apply to EA https://ea.com/jobs?a=1&b=2';assert.deepEqual(validateCapture(text),{original_text:text,source_urls:['https://ea.com/jobs?a=1&b=2']});});
test('rejects unsafe protocols and too many links',()=>{assert.throws(()=>validateCapture('javascript:alert(1)'));assert.throws(()=>validateCapture(Array.from({length:6},(_,i)=>`https://example.com/${i}`).join(' ')));});

test('preserves balanced parentheses and source query punctuation',()=>{const url='https://en.wikipedia.org/wiki/Function_(mathematics)';assert.equal(validateCapture(url).source_urls[0],url);const query='https://example.com/search?q=hello!';assert.equal(validateCapture(query).source_urls[0],query);});
test('allows screenshot-only capture but rejects fully empty input',()=>{assert.deepEqual(validateCapture('',true),{original_text:'',source_urls:[]});assert.throws(()=>validateCapture('',false));});
test('recognizes www links followed by a note on the next line',()=>{const text='www.youtube.com \nwatch this video';assert.deepEqual(validateCapture(text),{original_text:text,source_urls:['https://www.youtube.com']});});
test('recognizes www links within sentences and deduplicates explicit HTTPS',()=>{assert.deepEqual(validateCapture('Watch www.youtube.com then https://www.youtube.com').source_urls,['https://www.youtube.com']);});
test('does not extract www from an email address',()=>{assert.deepEqual(validateCapture('Email person@www.example.com').source_urls,[]);});
test('recognizes a www link followed by a note on another line',()=>{const note='www.youtube.com\nwatch this video';assert.deepEqual(validateCapture(note),{original_text:note,source_urls:['https://www.youtube.com']});});
test('recognizes www links within sentences without matching an email address',()=>{assert.deepEqual(validateCapture('Watch www.youtube.com/watch?v=abc after lunch').source_urls,['https://www.youtube.com/watch?v=abc']);assert.deepEqual(validateCapture('Email me@www.example.com').source_urls,[]);});
