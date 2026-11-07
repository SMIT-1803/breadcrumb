export function restoreDraft(raw:string|null):{text:string;id:string|null}{
 try {const value=JSON.parse(raw||'null');if(value&&typeof value.text==='string')return {text:value.text,id:typeof value.id==='string'?value.id:null};}catch{}
 return {text:'',id:null};
}
