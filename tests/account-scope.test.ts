import test from 'node:test';
import assert from 'node:assert/strict';
import {aiConsentKey,isCurrentRecall} from '../lib/account-scope';
test('AI opt-in is isolated by authenticated account',()=>{const settings=new Map([[aiConsentKey('A'),'yes']]);assert.equal(settings.get(aiConsentKey('B')),undefined);assert.equal(settings.get(aiConsentKey('A')),'yes');});
test('recall discards edited deleted completed or foreign snapshots',()=>{const captured={id:'one',revision:2,status:'active',user_id:'A'};assert.equal(isCurrentRecall(captured,{...captured},'A','active'),true);for(const changed of [null,{...captured,revision:3},{...captured,status:'done'},{...captured,user_id:'B'}])assert.equal(isCurrentRecall(captured,changed,'A','active'),false);});
