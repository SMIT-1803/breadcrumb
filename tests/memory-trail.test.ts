import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {act,createElement} from 'react';
import MemoryTrail from '../components/memory-trail';
import type {Memory} from '../components/memory-controls';

test('show more reveals remaining memories without discarding an open edit',async()=>{
 const dom=new JSDOM('<div id="root"></div>');Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);
 const noop=async()=>{};const memories:Memory[]=Array.from({length:7},(_,i)=>({id:'memory'+i,revision:1,status:'active',ai_status:'ready',ai_data:{title:'Note '+i,summary:'A useful summary.',facts:[],next_step:null},original_text:'Original '+i,source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'}));
 try{
  await act(async()=>root.render(createElement(MemoryTrail,{memories,signedIn:true,status:'active',onStatusChange:()=>{},onRefresh:noop,loading:false,error:'',aiEnabled:true,organizingIds:new Set<string>(),onSaved:noop,onDelete:noop,onOrganize:noop})));
  assert.equal(document.querySelectorAll('.memory').length,5);
  const edit=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Edit note'))!;await act(async()=>edit.click());const editor=document.querySelector('textarea');assert.ok(editor);
  const more=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Show more'))!;assert.ok(more);await act(async()=>{more.focus();more.click();});
  assert.equal(document.querySelectorAll('.memory').length,7);assert.equal(document.querySelector('textarea'),editor);assert.equal(document.activeElement?.id,'memory-memory5','Focus should move into the newly revealed memories');assert.equal(Array.from(document.querySelectorAll('button')).some(b=>b.textContent?.includes('Show more')),false);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});

test('loading and failed lists offer recovery without claiming the notebook is empty',async()=>{
 const dom=new JSDOM('<div id="root"></div>');Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);let refreshed=0;const noop=async()=>{};
 const props={memories:[],signedIn:true,status:'active' as const,onStatusChange:()=>{},onRefresh:async()=>{refreshed++;},loading:true,error:'',aiEnabled:true,organizingIds:new Set<string>(),onSaved:noop,onDelete:noop,onOrganize:noop};
 try{
  await act(async()=>root.render(createElement(MemoryTrail,props)));assert.match(document.body.textContent!,/Loading/);assert.doesNotMatch(document.body.textContent!,/Your trail starts here/);
  await act(async()=>root.render(createElement(MemoryTrail,{...props,loading:false,error:'Could not load your memories.'})));assert.match(document.querySelector('[role="alert"]')!.textContent!,/Could not load/);assert.doesNotMatch(document.body.textContent!,/Your trail starts here/);
  const retry=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Try again'))!;await act(async()=>retry.click());assert.equal(refreshed,1);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
