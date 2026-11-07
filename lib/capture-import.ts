export type CaptureImport={id:string;title:string;url:string;note:string};
export function parseCaptureImport(hash:string):CaptureImport|null{
 const raw=new URLSearchParams(hash.replace(/^#/,'' )).get('breadcrumb');if(raw===null)return null;if(raw.length>6000)throw Error('This page could not be imported. Copy its link into a note instead.');
 let value;try{value=JSON.parse(raw);}catch{throw Error('This page could not be imported. Copy its link into a note instead.');}
 if(!value||value.version!==1||typeof value.id!=='string'||!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value.id)||typeof value.title!=='string'||value.title.length>300||typeof value.url!=='string'||value.url.length>3000)throw Error('This page could not be imported. Copy its link into a note instead.');
 let url;try{url=new URL(value.url);}catch{throw Error('Invalid page link.');}if(!['http:','https:'].includes(url.protocol))throw Error('Only HTTP or HTTPS pages can be imported.');
 const title=value.title.replace(/[\r\n\t]/g,' ');return {id:value.id,title,url:value.url,note:[title,value.url].filter(Boolean).join('\n')};
}
export function importDecision(imported:CaptureImport,draft:string,hasImage:boolean,seen:string[]):'apply'|'pending'|'duplicate'{if(seen.includes(imported.id))return 'duplicate';return draft.trim()||hasImage?'pending':'apply';}
export function readImportedIds(raw:string|null):string[]{try{const value=JSON.parse(raw||'[]');return Array.isArray(value)?value.filter(v=>typeof v==='string').slice(-20):[];}catch{return [];}}
export function restorePendingImport(raw:string|null):CaptureImport|null{if(!raw)return null;try{const value=JSON.parse(raw);return parseCaptureImport('#breadcrumb='+encodeURIComponent(JSON.stringify({...value,version:1})));}catch{return null;}}
