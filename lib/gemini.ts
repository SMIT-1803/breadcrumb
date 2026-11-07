import {organizationPrompt,organizationSchema,type InlineImage} from './organization';
// This module is imported only by server routes. Never expose this key to client code.
export async function generateJson(prompt:string,schema:unknown,image:InlineImage|null=null){
 const key=process.env.GEMINI_API_KEY;if(!key)throw Error('AI is not configured. Your saved originals are safe.');
 const model=process.env.GEMINI_MODEL||'gemini-3.5-flash';
 if(!/^[\w.-]+$/.test(model))throw Error('Invalid AI configuration.');
 const parts:unknown[]=[{text:prompt}];if(image)parts.push({inlineData:image});
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseMimeType:'application/json',responseSchema:schema,maxOutputTokens:2048,thinkingConfig:{thinkingLevel:'MINIMAL'}}}),signal:AbortSignal.timeout(22000)});
 if(!response.ok)throw Error('Gemini is unavailable or its limit was reached. Try again shortly.');
 const body=await response.json();const candidate=body.candidates?.[0];
 if(candidate?.finishReason!=='STOP')throw Error('Gemini could not finish this result. Try again.');
 const text=candidate.content?.parts?.filter((p:{text?:string;thought?:boolean})=>p.text&&!p.thought).map((p:{text:string})=>p.text).join('');
 if(!text||text.length>20000)throw Error('Gemini returned an unreadable result. Try again.');
 return JSON.parse(text);
}
export const generateOrganization=(text:string,image:InlineImage|null)=>generateJson(organizationPrompt(text),organizationSchema,image);
