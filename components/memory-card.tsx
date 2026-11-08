'use client';
import SavedImage from './saved-image';
import OrganizationPanel from './organization-panel';
import MemoryControls,{type Memory} from './memory-controls';
import SourceLinks from './source-links';
export default function MemoryCard({m,i,aiEnabled,onSaved,onDelete,onOrganize,organizing=false}:{m:Memory;i:number;aiEnabled:boolean;onSaved:(memory:Memory)=>Promise<void>;onDelete:(memory:Memory)=>Promise<void>;onOrganize:()=>Promise<void>;organizing?:boolean}){
 return <article tabIndex={-1} id={'memory-'+m.id} className={'memory tone-'+i%3}>
  <MemoryControls key={'controls:'+m.id+':'+m.revision} memory={m} aiEnabled={aiEnabled} onOrganize={onOrganize} onSaved={onSaved} onDelete={onDelete}/>
  <OrganizationPanel key={'organization:'+m.id+':'+m.revision} status={m.ai_status} data={m.ai_data} enabled={aiEnabled} active={organizing} onOrganize={onOrganize}/>
  <SourceLinks urls={m.source_urls}/>
  <div className="memory-support"><details className="original-note" open={m.ai_status!=='ready'}><summary>Original note</summary><p>{m.original_text||'Saved screenshot'}</p></details>{m.image_path?<SavedImage id={m.id}/>:null}</div>
 </article>;
}
