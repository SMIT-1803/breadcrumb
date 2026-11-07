import {parseOrganization,type InlineImage,type Organization} from './organization';
export type SavedForOrganization={id:string;revision:number;original_text:string;image_path:string|null};
export type OrganizationRepository={read:(id:string)=>Promise<SavedForOrganization|null>;image:(path:string)=>Promise<InlineImage|null>;write:(id:string,revision:number,patch:Record<string,unknown>)=>Promise<boolean>};
export async function organizeMemory(id:string,repo:OrganizationRepository,generate:(text:string,image:InlineImage|null)=>Promise<unknown>):Promise<Organization>{
 const memory=await repo.read(id);if(!memory)throw Error('Memory not found in your notebook.');
 if(!await repo.write(id,memory.revision,{ai_status:'processing',ai_error:null}))throw Error('This memory changed. Refresh and try again.');
 try{
 const image=memory.image_path?await repo.image(memory.image_path):null;
 if(memory.image_path&&!image)throw Error('Screenshot could not load.');
 const data=parseOrganization(await generate(memory.original_text,image));
 if(!await repo.write(id,memory.revision,{ai_status:'ready',ai_data:data,ai_error:null}))throw Error('This memory changed. Refresh and try again.');
 return data;
 }catch(error){await repo.write(id,memory.revision,{ai_status:'failed',ai_error:'Could not organize this memory. Your original is safe. Try again.'}).catch(()=>{});throw error;}
}
