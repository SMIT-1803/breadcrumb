import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDeletionTickets,stageDeletion,forgetDeletion} from '../lib/delete-ticket-store';
function storage(){const values=new Map<string,string>();return {get length(){return values.size;},key:(index:number)=>[...values.keys()][index]??null,getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};}
const a={id:'a',revision:1,image_path:'owner/a.png'},b={id:'b',revision:1,image_path:null};
test('one tab finishing deletion cannot erase another tab cleanup ticket',()=>{const shared=storage();assert.deepEqual(loadDeletionTickets(shared,'owner'),[]);stageDeletion(shared,'owner',a);stageDeletion(shared,'owner',b);forgetDeletion(shared,'owner',b);assert.deepEqual(loadDeletionTickets(shared,'owner'),[a]);});
test('older conflicting deletion cannot remove a newer-revision ticket',()=>{const shared=storage();stageDeletion(shared,'owner',a);stageDeletion(shared,'owner',{...a,revision:2});forgetDeletion(shared,'owner',a);assert.deepEqual(loadDeletionTickets(shared,'owner'),[{...a,revision:2}]);});
test('legacy cleanup tickets migrate without mixing accounts',()=>{const shared=storage();shared.setItem('breadcrumb-deletions:owner',JSON.stringify([a]));assert.deepEqual(loadDeletionTickets(shared,'owner'),[a]);assert.deepEqual(loadDeletionTickets(shared,'other'),[]);assert.equal(shared.getItem('breadcrumb-deletions:owner'),null);});
