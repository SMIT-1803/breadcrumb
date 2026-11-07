'use client';
import {useState} from 'react';
import {organizationView} from '@/lib/memory-view';
export default function OrganizationPanel({status,data,enabled,active=false,onOrganize}:{status:string;data:unknown;enabled:boolean;active?:boolean;onOrganize:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const view=organizationView(status,data);const working=busy||active;
 async function organize(){if(working)return;setBusy(true);setError('');try{await onOrganize();}catch(e){setError(e instanceof Error?e.message:'Could not organize this memory. Try again.');}finally{setBusy(false);}}
 return <div className="organization">{view.data?<><span className="ai-label">Organized with Gemini</span><h3>{view.data.title}</h3><p>{view.data.summary}</p>{view.data.next_step?<p className="next-step"><strong>Pick up here:</strong> {view.data.next_step}</p>:null}{view.data.facts.length?<details><summary>Details remembered</summary><ul>{view.data.facts.map((f,i)=><li key={i}>{f}</li>)}</ul></details>:null}</>:<><p className="ai-label">{working?'Organizing your saved memory…':status==='failed'?'Organization didn’t finish. Your original is safe.':status==='processing'?'An earlier attempt may have been interrupted.':'Saved and ready to organize.'}</p>{enabled?<button className="small-button" disabled={working} onClick={organize}>{working?'Organizing…':view.action}</button>:null}</>}{error?<p role="alert" className="error">{error}</p>:null}</div>;
}
