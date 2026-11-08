'use client';
import {useState} from 'react';
import {CornerDownRight, Sparkles} from 'lucide-react';
import {organizationView} from '@/lib/memory-view';
export default function OrganizationPanel({status,data,enabled,active=false,onOrganize}:{status:string;data:unknown;enabled:boolean;active?:boolean;onOrganize:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const view=organizationView(status,data);const working=busy||active;
 async function organize(){if(working)return;setBusy(true);setError('');try{await onOrganize();}catch(e){setError(e instanceof Error?e.message:'Could not organize this memory. Try again.');}finally{setBusy(false);}}
 return <div className="organization" aria-busy={working}>
  {view.data?<>
   <h3>{view.data.title}</h3>
   <p className="memory-summary">{view.data.summary}</p>
   {view.data.next_step?<div className="next-step"><CornerDownRight size={18} aria-hidden="true"/><p><strong>Pick up here</strong>{view.data.next_step}</p></div>:null}
   <span className="ai-label organized-label"><Sparkles size={12} aria-hidden="true"/>Organized with Gemini</span>
   {view.data.facts.length?<details><summary>Details remembered <span className="detail-count">{view.data.facts.length}</span></summary><ul>{view.data.facts.map((f,i)=><li key={i}>{f}</li>)}</ul></details>:null}
  </>:<div className="organization-status" role="status"><p className="ai-label">{working?'Organizing your saved memory…':status==='failed'?'Organization didn’t finish. Your original is safe.':status==='processing'?'An earlier attempt may have been interrupted.':'Saved and ready to organize.'}</p>{enabled?<button className="small-button" disabled={working} onClick={organize}>{working?'Organizing…':view.action}</button>:null}</div>}
  {error?<p role="alert" className="error">{error}</p>:null}
 </div>;
}
