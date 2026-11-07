import {NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {generateJson} from '@/lib/gemini';
import {recallSaved,recallPrompt,reminderSchema,searchTerms,validateRecallInput} from '@/lib/recall';
import {isCurrentRecall} from '@/lib/account-scope';
import {takeAiTurn} from '@/lib/ai-limit';
export const maxDuration=30;
const columns='id,revision,original_text,source_urls,image_path,updated_at,ai_status,ai_data';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Request origin rejected.'},{status:403});
 const db=await serverClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Sign in to recall your memories.'},{status:401});
 let input;try{const raw=await request.text();if(raw.length>4000)throw Error();input=validateRecallInput(JSON.parse(raw));}catch{return NextResponse.json({error:'Use a question under 500 characters and a valid status.'},{status:400});}
 const {query,status}=input;
 const base=()=>db.from('memories').select(columns).eq('user_id',user.id).eq('status',status).order('updated_at',{ascending:false});
 const terms=searchTerms(query);let search=base();if(query&&terms.length)search=search.textSearch('search_document',terms.join(' | '),{config:'english'});
 const {data:matches,error}=query&&!terms.length?{data:[],error:null}:await search.limit(query?10:3);
 if(error)return NextResponse.json({error:'Your memories could not load. Try again.'},{status:503});
 let recent=matches||[];if(query||!recent.length){const result=await base().limit(3);if(result.error)return NextResponse.json({error:'Your memories could not load. Try again.'},{status:503});recent=result.data||[];}
 const result=await recallSaved(query,matches||[],recent,async candidates=>{const release=takeAiTurn(user.id);try{return await generateJson(recallPrompt(query,candidates),reminderSchema);}finally{release();}});
 if(result.memories.length){
 const {data:current,error:checkError}=await db.from('memories').select('id,revision,status,user_id').eq('user_id',user.id).eq('status',status).in('id',result.memories.map(m=>m.id));
 if(checkError)return NextResponse.json({error:'Could not confirm the latest memories. Try again.'},{status:503});
 result.memories=result.memories.filter(memory=>isCurrentRecall(memory,current?.find(row=>row.id===memory.id),user.id,status));
 result.reminders=result.reminders.filter(reminder=>result.memories.some(memory=>memory.id===reminder.id));
 if(!result.memories.length)return NextResponse.json({error:'Your memories changed while preparing this reminder. Try again.'},{status:409});
 }
 return NextResponse.json(result,{headers:{'Cache-Control':'private, no-store'}});
}
