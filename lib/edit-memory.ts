import {validateCapture} from './capture';
export class MemoryActionError extends Error{constructor(message:string,public status:number){super(message);}}
export function expectedRevision(value:unknown){if(!Number.isSafeInteger(value)||(value as number)<1)throw new MemoryActionError('Refresh this memory before changing it.',400);return value as number;}
export type EditableMemory={id:string;revision:number;original_text:string;image_path:string|null};
export async function editMemory<T extends EditableMemory>(input:unknown,repo:{read:()=>Promise<T|null>;update:(revision:number,patch:{original_text:string;source_urls:string[]})=>Promise<T|null>}):Promise<T>{
 if(!input||typeof input!=='object')throw new MemoryActionError('Invalid edit.',400);const body=input as Record<string,unknown>;const revision=expectedRevision(body.revision);
 const memory=await repo.read();if(!memory)throw new MemoryActionError('Memory not found in your notebook.',404);if(memory.revision!==revision)throw new MemoryActionError('This memory changed. Refresh before editing again.',409);
 let patch;try{patch=validateCapture(body.original_text,!!memory.image_path);}catch(error){throw new MemoryActionError((error as Error).message,400);}
 const updated=await repo.update(revision,patch);if(!updated)throw new MemoryActionError('This memory changed. Refresh before editing again.',409);return updated;
}
