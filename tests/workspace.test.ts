import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {act,createElement} from 'react';
import type {User} from '@supabase/supabase-js';
import {Notebook} from '../components/workspace';

test('saved memories load even if browser draft storage is blocked',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test'});Object.assign(globalThis,{window:dom.window,self:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const root=createRoot(document.getElementById('root')!);const previousFetch=globalThis.fetch;const storageDescriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get:()=>{throw new dom.window.DOMException('Storage disabled','SecurityError');}});
 let requested=false;globalThis.fetch=async(input)=>{assert.match(String(input),/^\/api\/memories\?status=active$/);requested=true;return Response.json({memories:[{id:'saved',revision:1,status:'active',ai_status:'ready',ai_data:{title:'Saved before',summary:'This memory is still available.',facts:[],next_step:null},original_text:'Existing note',source_urls:[],image_path:null,updated_at:'2026-11-07T20:00:00Z'}]});};
 const user:User={id:'test-user',user_metadata:{full_name:'Test user'},app_metadata:{},aud:'authenticated',created_at:'2026-11-07T20:00:00Z'};
 try{
  await act(async()=>root.render(createElement(Notebook,{user,ready:true})));
  assert.equal(requested,true,'Draft storage failures must not prevent the independent memory request');assert.match(document.querySelector('.memory-trail')!.textContent!,/This memory is still available/);assert.doesNotMatch(document.querySelector('.memory-trail')!.textContent!,/Loading your memories/);
 }finally{await act(async()=>root.unmount());globalThis.fetch=previousFetch;if(storageDescriptor)Object.defineProperty(globalThis,'localStorage',storageDescriptor);else Reflect.deleteProperty(globalThis,'localStorage');dom.window.close();}
});
