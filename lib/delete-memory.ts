import {expectedRevision,MemoryActionError} from './edit-memory';
import {validateImagePath} from './images';
export type DeleteTicket={id:string;revision:number;image_path:string|null};
export function deleteTicket(input:unknown,owner:string):DeleteTicket{
 if(!input||typeof input!=='object')throw new MemoryActionError('Invalid deletion request.',400);const value=input as Record<string,unknown>;
 if(typeof value.id!=='string'||!value.id||value.id.length>36)throw new MemoryActionError('Invalid memory ID.',400);
 const revision=expectedRevision(value.revision);let path=null;try{if(value.image_path!=null)path=validateImagePath(value.image_path,owner,value.id);}catch{throw new MemoryActionError('Invalid screenshot cleanup path.',400);}return {id:value.id,revision,image_path:path};
}
export function readDeleteTickets(raw:string|null,owner:string):DeleteTicket[]{try{const values=JSON.parse(raw||'[]');if(!Array.isArray(values))return [];return values.slice(0,100).flatMap(value=>{try{return [deleteTicket(value,owner)];}catch{return [];}});}catch{return [];}}
export async function deleteMemory(input:unknown,owner:string,repo:{read:()=>Promise<{id:string;revision:number;image_path:string|null}|null>;removeRow:(revision:number)=>Promise<boolean>;removeImage:(path:string)=>Promise<void>}):Promise<{complete:boolean}>{
 const ticket=deleteTicket(input,owner);const memory=await repo.read();
 if(memory){if(memory.revision!==ticket.revision||memory.image_path!==ticket.image_path)throw new MemoryActionError('This memory changed. Refresh before deleting it.',409);if(!await repo.removeRow(ticket.revision))throw new MemoryActionError('This memory changed. Refresh before deleting it.',409);}
 // Row absence is confirmed before cleanup. Unknown DB outcomes leave the recovery ticket intact.
 if(ticket.image_path)try{await repo.removeImage(ticket.image_path);}catch{return {complete:false};}
 return {complete:true};
}
