export function shouldCleanFailedUpload(code:string|undefined){return !!code&&['23514','23502','23503','42501','22001'].includes(code);}
// Unknown transport outcomes and unresolved duplicates may already be saved.
export async function cleanFailedUpload(path:string|null,remove:(path:string)=>Promise<void>,code:string|undefined){if(path&&shouldCleanFailedUpload(code))await remove(path);}
