import {validateCapture} from './capture';
import {imagePath,validateImage} from './images';
export type CaptureRequest={id:string;original_text:string;image_path:string|null};
export async function saveCapture<T>(input:{id:string;text:string;file:File|null;userId:string},services:{upload:(path:string,file:File)=>Promise<void>;finalize:(request:CaptureRequest)=>Promise<T>}):Promise<T>{
 const capture=validateCapture(input.text,!!input.file);
 let path:null|string=null;
 if(input.file){path=imagePath(input.userId,input.id,validateImage(input.file));await services.upload(path,input.file);}
 return services.finalize({id:input.id,original_text:capture.original_text,image_path:path});
}
