'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
export default function SavedImage({id}:{id:string}){
 const [source,setSource]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>()=>{if(source)URL.revokeObjectURL(source);},[source]);
 async function open(){setBusy(true);setError('');try{const response=await fetch(`/api/memories/${id}/image`);if(!response.ok){const result=await response.json();throw new Error(result.error);}setSource(URL.createObjectURL(await response.blob()));}catch(error){setError(error instanceof Error?error.message:'Screenshot could not load. Try again.');}finally{setBusy(false);}}
 return <div className="saved-image">{source?<><Image unoptimized src={source} alt="Your saved original screenshot" width={600} height={400}/><a href={`/api/memories/${id}/image`} target="_blank" rel="noopener noreferrer">Open original</a><button type="button" className="small-button" onClick={()=>setSource(null)}>Close screenshot</button></>:<button type="button" className="small-button" onClick={open} disabled={busy}>{busy?'Loading screenshot…':error?'Retry screenshot':'View screenshot'}</button>}{error?<p role="alert">{error}</p>:null}</div>;
}
