'use client';
import {useEffect,useRef,useState} from 'react';
import {Check, Pencil, RotateCcw, Trash2} from 'lucide-react';
export type Memory={revision:number;ai_status:string;ai_data:unknown;image_path:string|null;id:string;original_text:string;source_urls:string[];updated_at:string;status:'active'|'done'};
export default function MemoryControls({memory,aiEnabled,onSaved,onDelete,onOrganize}:{memory:Memory;aiEnabled:boolean;onOrganize:()=>Promise<void>;onDelete:(memory:Memory)=>Promise<void>;onSaved:(memory:Memory)=>Promise<void>}){
 const [confirming,setConfirming]=useState(false);
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(memory.original_text),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const editor=useRef<HTMLTextAreaElement>(null),cancelDeletion=useRef<HTMLButtonElement>(null),editButton=useRef<HTMLButtonElement>(null),deleteButton=useRef<HTMLButtonElement>(null);
 const restoreFocus=useRef<'edit'|'delete'|null>(null);
 useEffect(()=>{if(editing){editor.current?.focus();restoreFocus.current='edit';}else if(confirming){cancelDeletion.current?.focus();restoreFocus.current='delete';}else if(restoreFocus.current){(restoreFocus.current==='edit'?editButton:deleteButton).current?.focus();restoreFocus.current=null;}},[editing,confirming]);
 async function toggleStatus(){setBusy(true);setError('');try{const response=await fetch(`/api/memories/${memory.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:memory.status==='done'?'active':'done',revision:memory.revision})});const data=await response.json();if(!response.ok)throw Error(data.error);await onSaved(data.memory);}catch(e){setError(e instanceof Error?e.message:'Could not change this memory. Try again.');}finally{setBusy(false);}}
 async function save(){setBusy(true);setError('');try{const response=await fetch(`/api/memories/${memory.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({original_text:draft,revision:memory.revision})});const data=await response.json();if(!response.ok)throw Error(data.error);setEditing(false);await onSaved(data.memory);if(aiEnabled&&data.memory.ai_status!=='ready')void onOrganize().catch(()=>{});}catch(e){setError(e instanceof Error?e.message:'Could not save this edit. Your changes are still here.');}finally{setBusy(false);}}
 async function remove(){setBusy(true);setError('');try{await onDelete(memory);setConfirming(false);}catch(e){setError(e instanceof Error?e.message:'Deletion was not confirmed. Retry below.');}finally{setBusy(false);}}
 const actionDisabled=busy||editing||confirming;
 return <div className="memory-controls">
  <div className="memory-toolbar">
   <div className="memory-meta"><time dateTime={memory.updated_at} title={new Date(memory.updated_at).toLocaleString()}>{new Date(memory.updated_at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>{memory.status==='done'?<span className="done-label"><Check size={12} aria-hidden="true"/>Completed</span>:null}</div>
   <div className="memory-actions card-actions" aria-label="Memory actions">
    <button ref={editButton} className="card-action" disabled={actionDisabled} onClick={()=>{setError('');setDraft(memory.original_text);setEditing(true);}}><Pencil size={14} aria-hidden="true"/>Edit note</button>
    <button className="card-action" disabled={actionDisabled} onClick={toggleStatus}>{memory.status==='done'?<RotateCcw size={14} aria-hidden="true"/>:<Check size={14} aria-hidden="true"/>}{busy&&!editing&&!confirming?'Updating…':memory.status==='done'?'Reopen':'Mark done'}</button>
    <button ref={deleteButton} className="card-action delete-action" disabled={actionDisabled} onClick={()=>{setError('');setConfirming(true);}}><Trash2 size={14} aria-hidden="true"/>Delete</button>
   </div>
  </div>
  {confirming?<div className="delete-confirmation" role="alertdialog" aria-labelledby={'delete-title-'+memory.id} aria-describedby={'delete-description-'+memory.id}><h3 id={'delete-title-'+memory.id}>Delete this memory?</h3><p id={'delete-description-'+memory.id}>This permanently removes the note and its screenshot.</p><div className="memory-actions"><button className="danger-button" disabled={busy} onClick={remove}>{busy?'Deleting…':'Delete permanently'}</button><button ref={cancelDeletion} className="small-button" disabled={busy} onClick={()=>setConfirming(false)}>Cancel deletion</button></div></div>:null}
  {editing?<form className="memory-editor" onSubmit={e=>{e.preventDefault();void save();}}><label htmlFor={'edit-'+memory.id}>Edit original note</label><textarea ref={editor} id={'edit-'+memory.id} name="original-note" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={4000} disabled={busy}/><p className="ai-label">Your screenshot stays attached. Saving also refreshes the summary.</p><div className="memory-actions"><button className="primary" disabled={busy}>{busy?'Saving…':'Save changes'}</button><button type="button" className="small-button" disabled={busy} onClick={()=>{setDraft(memory.original_text);setError('');setEditing(false);}}>Cancel</button></div></form>:null}
  {error?<p className="error" role="alert">{error}</p>:null}
 </div>;
}
