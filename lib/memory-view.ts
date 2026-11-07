import {parseOrganization,type Organization} from './organization';
export function organizationView(status:string,value:unknown):{data:Organization|null;action:string|null}{
 if(status==='ready'){try{return {data:parseOrganization(value),action:null};}catch{return {data:null,action:'Retry organization'};}}
 return {data:null,action:status==='pending'?'Organize memory':'Retry organization'};
}
