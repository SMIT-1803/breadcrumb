import {deleteTicket,readDeleteTickets,type DeleteTicket} from './delete-memory';
type TicketStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'|'key'|'length'>;
const prefix=(owner:string)=>'breadcrumb-deletion:'+owner+':';
const key=(owner:string,ticket:DeleteTicket)=>prefix(owner)+ticket.id+':'+ticket.revision;
export function stageDeletion(storage:TicketStorage,owner:string,ticket:DeleteTicket){const valid=deleteTicket(ticket,owner);storage.setItem(key(owner,valid),JSON.stringify(valid));}
export function forgetDeletion(storage:TicketStorage,owner:string,ticket:DeleteTicket){storage.removeItem(key(owner,ticket));}
export function loadDeletionTickets(storage:TicketStorage,owner:string):DeleteTicket[]{
 // Individual keys prevent unrelated tabs or different revisions from clobbering each other.
 const legacy='breadcrumb-deletions:'+owner;const old=storage.getItem(legacy);if(old!==null){for(const ticket of readDeleteTickets(old,owner))stageDeletion(storage,owner,ticket);storage.removeItem(legacy);}
 const keys=Array.from({length:storage.length},(_,i)=>storage.key(i)).filter((value):value is string=>!!value&&value.startsWith(prefix(owner)));
 return keys.flatMap(value=>{try{const ticket=deleteTicket(JSON.parse(storage.getItem(value)||'null'),owner);return key(owner,ticket)===value?[ticket]:[];}catch{return [];}});
}
