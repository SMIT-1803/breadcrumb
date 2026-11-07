// Reuse an existing request for the same memory until it settles.
export function singleFlight(){const pending=new Map<string,Promise<void>>();return (id:string,run:()=>Promise<void>)=>{const existing=pending.get(id);if(existing)return existing;const request=Promise.resolve().then(run).finally(()=>pending.delete(id));pending.set(id,request);return request;};}
