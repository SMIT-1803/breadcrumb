import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createElement,act} from 'react';
import MemoryCard from '../components/memory-card';
import type {Memory} from '../components/memory-controls';
test('one card keeps one organization panel and one set of controls through retries and edits',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);const warnings:unknown[][]=[];const previous=console.error;console.error=(...args:unknown[])=>{warnings.push(args);};
 const noop=async()=>{};const base:Memory={id:'one',revision:1,status:'active',ai_status:'pending',ai_data:null,original_text:'Apply to EA',source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'};
 try{for(let revision=1;revision<=4;revision++){for(const status of ['pending','processing','ready']){const m={...base,revision,ai_status:status,ai_data:status==='ready'?{title:'EA note',summary:'Apply to EA.',facts:[],next_step:null}:null};await act(async()=>root.render(createElement(MemoryCard,{m,i:0,aiEnabled:true,onSaved:noop,onDelete:noop,onOrganize:noop})));assert.equal(document.querySelectorAll('.organization').length,1);assert.equal(document.querySelectorAll('.memory-controls').length,1);assert.equal(document.querySelectorAll('.organization h3').length,status==='ready'?1:0);}}
 assert.equal(warnings.filter(args=>String(args[0]).includes('same key')).length,0,'Sibling components must have distinct identities');
 }finally{await act(async()=>root.unmount());console.error=previous;dom.window.close();}
});

test('an active organization request shows progress instead of retry',async()=>{const dom=new JSDOM('<div id="root"></div>');Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);const noop=async()=>{};const m:Memory={id:'one',revision:1,status:'active',ai_status:'processing',ai_data:null,original_text:'Test',source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'};try{await act(async()=>root.render(createElement(MemoryCard,{m,i:0,aiEnabled:true,onSaved:noop,onDelete:noop,onOrganize:noop,organizing:true})));assert.match(document.querySelector('.organization')!.textContent!,/Organizing/);assert.doesNotMatch(document.querySelector('.organization')!.textContent!,/interrupted|Retry/);}finally{await act(async()=>root.unmount());dom.window.close();}});

test('long memories keep actions before content and edit/delete cancellation preserves the original',async()=>{
 const dom=new JSDOM('<div id="root"></div>');Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);let deleted=false;const noop=async()=>{};
 const m:Memory={id:'long',revision:1,status:'active',ai_status:'ready',ai_data:{title:'Applications',summary:'Return to the two saved postings.',facts:[],next_step:'Finish the EA application.'},original_text:'Original thought. '.repeat(200),source_urls:['https://jobs.example.com/roles/engineer','https://jobs.example.com/roles/designer'],image_path:null,updated_at:'2026-11-07T20:00:00Z'};
 const click=async(label:string)=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.trim()===label);assert.ok(button,`Missing ${label}`);await act(async()=>button.click());};
 try{
  await act(async()=>root.render(createElement(MemoryCard,{m,i:0,aiEnabled:true,onSaved:noop,onDelete:async()=>{deleted=true;},onOrganize:noop})));
  const controls=document.querySelector('.memory-controls')!;const original=document.querySelector('.original-note')!;
  assert.ok(controls.compareDocumentPosition(original)&dom.window.Node.DOCUMENT_POSITION_FOLLOWING,'Actions must precede long content');
  assert.equal(original.hasAttribute('open'),false);
  assert.match(document.querySelector('.source-links')!.textContent!,/roles\/engineer/);assert.match(document.querySelector('.source-links')!.textContent!,/roles\/designer/);
  await click('Edit note');assert.equal(document.querySelector('textarea')!.value,m.original_text);await click('Cancel');
  assert.match(document.querySelector('.organization')!.textContent!,/Return to the two saved postings/);
  await click('Delete');assert.ok(document.querySelector('[role="alertdialog"]'));await click('Cancel deletion');assert.equal(deleted,false);assert.equal(document.querySelector('[role="alertdialog"]'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
