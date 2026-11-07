import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createElement,act} from 'react';
import {createRoot} from 'react-dom/client';
import MemoryCard from '../components/memory-card';
import type {Memory} from '../components/memory-controls';
test('one card keeps one organization panel and one set of controls through retries and edits',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const root=createRoot(document.getElementById('root')!);const warnings:unknown[][]=[];const previous=console.error;console.error=(...args:unknown[])=>{warnings.push(args);};
 const noop=async()=>{};const base:Memory={id:'one',revision:1,status:'active',ai_status:'pending',ai_data:null,original_text:'Apply to EA',source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'};
 try{for(let revision=1;revision<=4;revision++){for(const status of ['pending','processing','ready']){const m={...base,revision,ai_status:status,ai_data:status==='ready'?{title:'EA note',summary:'Apply to EA.',facts:[],next_step:null}:null};await act(async()=>root.render(createElement(MemoryCard,{m,i:0,aiEnabled:true,onSaved:noop,onDelete:noop,onOrganize:noop})));assert.equal(document.querySelectorAll('.organization').length,1);assert.equal(document.querySelectorAll('.memory-controls').length,1);assert.equal(document.querySelectorAll('.organization h3').length,status==='ready'?1:0);}}
 assert.equal(warnings.filter(args=>String(args[0]).includes('same key')).length,0,'Sibling components must have distinct identities');
 }finally{await act(async()=>root.unmount());console.error=previous;dom.window.close();}
});

test('an active organization request shows progress instead of retry',async()=>{const dom=new JSDOM('<div id="root"></div>');Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});const root=createRoot(document.getElementById('root')!);const noop=async()=>{};const m:Memory={id:'one',revision:1,status:'active',ai_status:'processing',ai_data:null,original_text:'Test',source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'};try{await act(async()=>root.render(createElement(MemoryCard,{m,i:0,aiEnabled:true,onSaved:noop,onDelete:noop,onOrganize:noop,organizing:true})));assert.match(document.querySelector('.organization')!.textContent!,/Organizing/);assert.doesNotMatch(document.querySelector('.organization')!.textContent!,/interrupted|Retry/);}finally{await act(async()=>root.unmount());dom.window.close();}});
