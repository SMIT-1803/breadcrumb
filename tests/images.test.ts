import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateImage} from '../lib/images.ts';
test('accepts a supported image at the size limit',()=>{assert.equal(validateImage({type:'image/png',size:5242880}), 'png');});
test('rejects unsupported or empty image files',()=>{assert.throws(()=>validateImage({type:'image/svg+xml',size:100}));assert.throws(()=>validateImage({type:'image/png',size:0}));});
test('rejects images over five megabytes',()=>{assert.throws(()=>validateImage({type:'image/jpeg',size:5242881}));});
test('accepts JPEG and WebP screenshots',()=>{assert.equal(validateImage({type:'image/jpeg',size:20}),'jpg');assert.equal(validateImage({type:'image/webp',size:20}),'webp');});
import {imagePath,validateImagePath} from '../lib/images.ts';
test('image path binds both owner and capture',()=>{const path=imagePath('owner','capture','png');assert.equal(path,'owner/capture.png');assert.equal(validateImagePath(path,'owner','capture'),path);assert.throws(()=>validateImagePath('other/capture.png','owner','capture'));assert.throws(()=>validateImagePath('owner/../other.png','owner','capture'));});
