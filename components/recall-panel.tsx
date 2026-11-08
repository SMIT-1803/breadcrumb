'use client';
import {useState} from 'react';
import {ArrowRight, Sparkles} from 'lucide-react';
import type {RecallResult} from '@/lib/recall';
import SavedImage from './saved-image';
import SourceLinks from './source-links';
export default function RecallPanel({enabled}:{enabled:boolean}){
 const [query,setQuery]=useState(''),[status,setStatus]=useState('active'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<RecallResult|null>(null);
 async function remind(){setBusy(true);setError('');setResult(null);try{const response=await fetch('/api/recall',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,status})});const data=await response.json();if(!response.ok)throw Error(data.error);setResult(data);}catch(e){setError(e instanceof Error?e.message:'Could not load your reminder. Try again.');}finally{setBusy(false);}}
 return <><section className="recall" aria-labelledby="recall-title" aria-busy={busy}>
  <div className="recall-heading"><div><h2 id="recall-title">Where was I?</h2><p>Your thoughts, back in reach.</p></div><span className="recall-mark" aria-hidden="true">✳</span></div>
  <form onSubmit={e=>{e.preventDefault();void remind();}}>
   <label htmlFor="recall-query">Looking for something? <span>(optional)</span></label>
   <div className="recall-query-row"><input id="recall-query" name="reminder-question" autoComplete="off" value={query} onChange={e=>{setQuery(e.target.value);setResult(null);setError('');}} maxLength={500} placeholder="Which jobs was I applying for?" disabled={busy}/><button className="primary" disabled={busy||!enabled}>{busy?'Remembering…':'Remind me'}<ArrowRight size={16} aria-hidden="true"/></button></div>
   <div className="recall-options"><label htmlFor="recall-status">Search in</label><select id="recall-status" value={status} onChange={e=>{setStatus(e.target.value);setResult(null);setError('');}} disabled={busy}><option value="active">Active memories</option><option value="done">Completed memories</option></select></div>
   <p className="recall-help">Leave the question blank to pick up your recent thoughts.</p>
  </form>
  {error?<div role="alert" className="error">{error}<button className="small-button" onClick={remind}>Retry reminder</button></div>:null}
  <div aria-live="polite">{busy?<p className="recall-progress"><Sparkles size={15} aria-hidden="true"/>Finding your way back…</p>:null}</div>
 </section>
 <div className="recall-output" aria-live="polite" hidden={!result}>{result?<div className={'recall-result recall-'+result.kind}>
   <h3 className="result-label">{result.kind==='ready'?'Here’s where you left off.':result.kind==='fallback'?'Your original notes are here.':result.kind==='empty'?'Your trail is empty.':'No matching reminder found.'}</h3>
   {result.kind==='fallback'?<div className="recall-fallback"><p>{result.error||'Gemini couldn’t finish. Here are the matching originals.'}</p><button className="small-button" onClick={remind} disabled={busy}>Retry reminder</button></div>:result.kind==='empty'?<p>Save a thought to come back to.</p>:result.kind==='no_matches'?<p>Try different words, or revisit these saved notes.</p>:null}
   {result.memories.map(memory=>{const reminder=result.reminders.find(r=>r.id===memory.id);return <article className="recall-memory" key={memory.id}><time dateTime={memory.updated_at}>{new Date(memory.updated_at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>{reminder?<p className="recall-summary">{reminder.text}</p>:null}<SourceLinks urls={memory.source_urls}/><details open={!reminder}><summary>View original memory</summary><p className="recall-original">{memory.original_text||'Saved screenshot'}</p>{memory.image_path?<SavedImage id={memory.id}/>:null}</details></article>;})}
  </div>:null}</div>
 </>;
}
