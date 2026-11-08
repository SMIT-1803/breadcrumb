'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronDown, RefreshCw} from 'lucide-react';
import MemoryCard from './memory-card';
import type {Memory} from './memory-controls';

type Props={memories:Memory[];signedIn:boolean;status:'active'|'done';onStatusChange:(status:'active'|'done')=>void;onRefresh:()=>Promise<void>;loading:boolean;error:string;aiEnabled:boolean;organizingIds:Set<string>;onSaved:(memory:Memory)=>Promise<void>;onDelete:(memory:Memory)=>Promise<void>;onOrganize:(memory:Memory)=>Promise<void>};
export default function MemoryTrail({memories,signedIn,status,onStatusChange,onRefresh,loading,error,aiEnabled,organizingIds,onSaved,onDelete,onOrganize}:Props){
 const [visibleCount,setVisibleCount]=useState(5);
 const list=useRef<HTMLOListElement>(null),firstNewMemory=useRef<number|null>(null);
 useEffect(()=>{if(firstNewMemory.current===null)return;list.current?.children[firstNewMemory.current]?.querySelector<HTMLElement>('article')?.focus();firstNewMemory.current=null;},[visibleCount]);
 const remaining=memories.length-visibleCount;
 return <section className="memory-trail" aria-labelledby="trail-title" aria-busy={loading}>
  <div className="trail-heading"><div><h2 id="trail-title">Your memory trail</h2><p>Small notes. A way back.</p></div>{signedIn?<button onClick={()=>void onRefresh()} disabled={loading} className="refresh-button"><RefreshCw size={14} aria-hidden="true"/>{loading?'Refreshing…':'Refresh'}</button>:null}</div>
  {signedIn?<div className="notebook-filter"><label htmlFor="notebook-view">Browse</label><select id="notebook-view" value={status} onChange={e=>{setVisibleCount(5);onStatusChange(e.target.value as 'active'|'done');}}><option value="active">Active memories</option><option value="done">Completed memories</option></select>{memories.length?<span className="memory-count">{memories.length} {memories.length===1?'memory':'memories'}</span>:null}</div>:null}
  {error?<div role="alert" className="error trail-error"><p>{error}</p><button className="small-button" disabled={loading} onClick={()=>void onRefresh()}>Try again</button></div>:null}
  {!signedIn?<div className="empty"><span className="empty-mark" aria-hidden="true">✳</span><h3>A place to pick things back up.</h3><p>Save your first breadcrumb. It’ll be waiting here when you return.</p><span className="empty-foot">One notebook. Phone or laptop.</span></div>:loading&&memories.length===0?<div className="trail-loading" role="status"><span className="loading-dot" aria-hidden="true"/>Loading your memories…</div>:!error&&memories.length===0?<div className="empty"><h3>{status==='done'?'Nothing completed yet.':'Your trail starts here.'}</h3><p>{status==='done'?'Completed memories stay here until you reopen or delete them.':'Write a quick note, then save it for later.'}</p></div>:memories.length?<>
   <ol ref={list} className="memory-list">{memories.slice(0,visibleCount).map((m,i)=><li key={m.id}><span className="trail-node" aria-hidden="true"/><MemoryCard m={m} i={i} aiEnabled={aiEnabled} onSaved={onSaved} onDelete={onDelete} organizing={organizingIds.has(m.id)} onOrganize={()=>onOrganize(m)}/></li>)}</ol>
   {remaining>0?<button className="show-more" onClick={()=>{firstNewMemory.current=visibleCount;setVisibleCount(count=>count+5);}}>Show more <span>({Math.min(remaining,5)} more)</span><ChevronDown size={16} aria-hidden="true"/></button>:null}
  </>:null}
 </section>;
}
