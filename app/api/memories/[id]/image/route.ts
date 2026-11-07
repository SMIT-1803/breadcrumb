import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in to view this screenshot.'},{status:401});
 const {id}=await context.params;const {data:memory,error}=await db.from('memories').select('image_path').eq('id',id).maybeSingle();
 if(error||!memory?.image_path)return NextResponse.json({error:'Screenshot not found in your notebook.'},{status:404});
 const {data:file,error:downloadError}=await db.storage.from('screenshots').download(memory.image_path);
 if(downloadError||!file)return NextResponse.json({error:'Screenshot could not load. Please try again.'},{status:503});
 return new Response(file,{headers:{'Content-Type':file.type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
}
