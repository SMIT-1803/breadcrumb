import {expectedRevision,MemoryActionError} from './edit-memory';
export function notebookStatus(value:unknown):'active'|'done'{if(value==null)return 'active';if(value!=='active'&&value!=='done')throw new MemoryActionError('Choose a valid memory status.',400);return value;}
export async function changeMemoryStatus<T extends {revision:number;status:string}>(input:unknown,repo:{read:()=>Promise<T|null>;update:(revision:number,previous:string,patch:{status:'active'|'done'})=>Promise<T|null>}):Promise<T>{
 if(!input||typeof input!=='object')throw new MemoryActionError('Invalid status change.',400);const body=input as Record<string,unknown>;const revision=expectedRevision(body.revision);if(body.status==null)throw new MemoryActionError('Choose a valid memory status.',400);const status=notebookStatus(body.status);
 const memory=await repo.read();if(!memory)throw new MemoryActionError('Memory not found in your notebook.',404);if(memory.revision!==revision)throw new MemoryActionError('This memory changed. Refresh and try again.',409);if(memory.status===status)return memory;
 const updated=await repo.update(revision,memory.status,{status});if(!updated)throw new MemoryActionError('This memory changed. Refresh and try again.',409);return updated;
}
