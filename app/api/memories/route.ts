import {notebookStatus} from '@/lib/memory-status';
import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {validateCapture} from '@/lib/capture';
import {cleanFailedUpload} from '@/lib/image-cleanup';
import {validateImage,validateImagePath} from '@/lib/images';
export async function GET(request:Request){let status;try{status=notebookStatus(new URL(request.url).searchParams.get('status'));}catch{return NextResponse.json({error:'Choose a valid notebook view.'},{status:400});}const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in to see your notes.'},{status:401});const {data,error}=await db.from('memories').select('id,original_text,source_urls,image_path,created_at,updated_at,status,revision,ai_status,ai_data').eq('status',status).order('updated_at',{ascending:false}).limit(50);return NextResponse.json(error?{error:'Your notes could not load. Try again.'}:{memories:data},{status:error?503:200,headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Request origin rejected.'},{status:403});
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in before saving.'},{status:401});
 let input;try {const raw=await request.text();if(raw.length>20000)throw new Error();input=JSON.parse(raw);if(!input||typeof input!=='object')throw new Error();}catch{return NextResponse.json({error:'Invalid capture.'},{status:400});}
 let capture,path:null|string=null;try {
 if(typeof input.id!=='string'|| !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id))throw new Error('Invalid capture ID.');
 if(input.image_path!=null)path=validateImagePath(input.image_path,user.id,input.id);
 capture=validateCapture(input.original_text,!!path);
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid capture.'},{status:400});}
 const existing=await db.from('memories').select().eq('id',input.id).maybeSingle();if(existing.data)return NextResponse.json({memory:existing.data});
 if(path){const {data:file,error}=await db.storage.from('screenshots').download(path);if(error||!file)return NextResponse.json({error:'Screenshot is not confirmed uploaded. Your draft is still here; try again.'},{status:503});try{validateImage(file);}catch(error){return NextResponse.json({error:(error as Error).message},{status:400});}}
 const {data,error}=await db.from('memories').insert({id:input.id,user_id:user.id,...capture,image_path:path}).select().single();
 if(error?.code==='23505'){const retry=await db.from('memories').select().eq('id',input.id).single();if(retry.data)return NextResponse.json({memory:retry.data});}
 if(error){try{await cleanFailedUpload(path,async object=>{const result=await db.storage.from('screenshots').remove([object]);if(result.error)throw result.error;},error.code);}catch{return NextResponse.json({error:'Your capture was not saved and image cleanup could not finish. Keep this draft and retry saving to recover.'},{status:503});}}
 return NextResponse.json(error?{error:'Your capture was not confirmed saved. Your draft is still here; try again.'}:{memory:data},{status:error?503:201});
}
