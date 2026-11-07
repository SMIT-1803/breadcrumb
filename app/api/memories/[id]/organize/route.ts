import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {organizeMemory} from '@/lib/organize-memory';
import {generateOrganization} from '@/lib/gemini';
import {takeAiTurn} from '@/lib/ai-limit';
import {validateImage,validateImagePath} from '@/lib/images';
export const maxDuration=30;
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Request origin rejected.'},{status:403});
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in to organize your memories.'},{status:401});
 const {id}=await context.params;if(!/^[\da-f-]{36}$/i.test(id))return NextResponse.json({error:'Memory not found.'},{status:404});
 let release;try{release=takeAiTurn(user.id);}catch(error){return NextResponse.json({error:(error as Error).message},{status:429});}
 try{
 const organization=await organizeMemory(id,{
 read:async key=>{const {data,error}=await db.from('memories').select('id,revision,original_text,image_path').eq('id',key).eq('user_id',user.id).maybeSingle();if(error)throw Error('Your memory could not load. Try again.');return data;},
 image:async path=>{validateImagePath(path,user.id,id);const {data,error}=await db.storage.from('screenshots').download(path);if(error||!data)throw Error('Screenshot could not load.');validateImage(data);return {mimeType:data.type,data:Buffer.from(await data.arrayBuffer()).toString('base64')};},
 write:async(key,revision,patch)=>{const {data,error}=await db.from('memories').update(patch).eq('id',key).eq('user_id',user.id).eq('revision',revision).select('id');if(error)throw Error('Could not update this memory. Try again.');return !!data?.length;}
 },generateOrganization);
 return NextResponse.json({organization},{headers:{'Cache-Control':'no-store'}});
 }catch(error){const missing=error instanceof Error&&error.message.includes('not found');return NextResponse.json({error:missing?'Memory not found in your notebook.':'Could not organize this memory. Your original is safe. Try again.'},{status:missing?404:503});}finally{release();}
}
