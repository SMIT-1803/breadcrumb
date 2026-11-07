import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {validateCapture} from '@/lib/capture';
export async function GET(){const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in to see your notes.'},{status:401});const {data,error}=await db.from('memories').select('id,original_text,source_urls,created_at,updated_at,status,revision,ai_status').order('updated_at',{ascending:false}).limit(50);return NextResponse.json(error?{error:'Your notes could not load. Try again.'}:{memories:data},{status:error?503:200,headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Request origin rejected.'},{status:403});
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in before saving.'},{status:401});
 let input;try {input=await request.json();}catch{return NextResponse.json({error:'Invalid capture.'},{status:400});}
 let capture;try {capture=validateCapture(input.original_text);if(typeof input.id!=='string'|| !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id))throw new Error('Invalid capture ID.');}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid capture.'},{status:400});}
 const {data,error}=await db.from('memories').insert({id:input.id,user_id:user.id,...capture}).select().single();
 if(error?.code==='23505'){const existing=await db.from('memories').select().eq('id',input.id).single();if(existing.data)return NextResponse.json({memory:existing.data});}
 return NextResponse.json(error?{error:'Your note was not confirmed saved. Your draft is still here; try again.'}:{memory:data},{status:error?503:201});
}
