import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {editMemory,MemoryActionError} from '@/lib/edit-memory';
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Request origin rejected.'},{status:403});
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in to change a memory.'},{status:401});
 const {id}=await context.params;if(!/^[\da-f-]{36}$/i.test(id))return NextResponse.json({error:'Memory not found.'},{status:404});
 let input;try{const raw=await request.text();if(raw.length>20000)throw Error();input=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid edit.'},{status:400});}
 try{
 const memory=await editMemory(input,{
 read:async()=>{const {data,error}=await db.from('memories').select().eq('id',id).eq('user_id',user.id).maybeSingle();if(error)throw error;return data;},
 update:async(revision,patch)=>{const {data,error}=await db.from('memories').update(patch).eq('id',id).eq('user_id',user.id).eq('revision',revision).select().maybeSingle();if(error)throw error;return data;}
 });return NextResponse.json({memory},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof MemoryActionError?error.message:'Your edit was not confirmed. Keep your changes and try again.'},{status:error instanceof MemoryActionError?error.status:503});}
}
