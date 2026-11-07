// Per server instance safeguard; not a distributed billing quota.
const windows=new Map<string,{start:number;count:number;busy:boolean}>();
export function takeAiTurn(user:string,now=Date.now()){
 for(const [key,value] of windows)if(now-value.start>60000&&!value.busy)windows.delete(key);
 let window=windows.get(user);if(!window){window={start:now,count:0,busy:false};windows.set(user,window);}
 if(window.busy||window.count>=12)throw Error('Please wait a moment before another AI request.');
 window.count++;window.busy=true;return ()=>{window.busy=false;};
}
