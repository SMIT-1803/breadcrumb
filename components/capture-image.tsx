'use client';
import Image from 'next/image';
import {useEffect,useRef} from 'react';
import {validateImage} from '@/lib/images';
export type Attachment = {file: File; preview: string};
export default function CaptureImage({attachment,onChange,onError,disabled}: {
  attachment: Attachment|null; onChange:(value:Attachment|null)=>void;
  onError:(message:string)=>void; disabled:boolean;
}) {
  const input=useRef<HTMLInputElement>(null);
  function select(file:File) {
    try {validateImage(file); onError(''); onChange({file,preview:URL.createObjectURL(file)});}
    catch(error) {onError((error as Error).message);}
  }
  useEffect(()=>{if(disabled)return;function paste(event:ClipboardEvent){const image=[...(event.clipboardData?.files||[])].find(f=>f.type.startsWith('image/'));if(image){event.preventDefault();select(image);}}document.addEventListener('paste',paste);return()=>document.removeEventListener('paste',paste);
  });
  useEffect(()=>()=>{if(attachment)URL.revokeObjectURL(attachment.preview);},[attachment]);
  return <div className="image-attachment">
    <input ref={input} className="sr-only" type="file" aria-label="Choose screenshot" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={event=>{const file=event.target.files?.[0];if(file)select(file);event.target.value='';}}/>
    {attachment?<div className="image-preview"><Image unoptimized src={attachment.preview} width={420} height={180} alt="Screenshot attached to this draft"/><div><span>{attachment.file.name}</span><button type="button" className="small-button" disabled={disabled} onClick={()=>onChange(null)}>Remove image</button></div></div>:<button type="button" className="small-button" disabled={disabled} onClick={()=>input.current?.click()}>Add screenshot</button>}
    <p className="image-help">One image, up to 5 MB. You can also paste a screenshot.</p>
  </div>;
}
