import {ArrowUpRight} from 'lucide-react';
export default function SourceLinks({urls}:{urls:string[]}){
 if(!urls.length)return null;
 return <div className="source-links" aria-label="Saved links">{urls.map(url=>{const parsed=new URL(url);const label=parsed.host+(parsed.pathname==='/'?'':parsed.pathname)+parsed.search+parsed.hash;return <a key={url} href={url} title={url} target="_blank" rel="noopener noreferrer"><span>{label}</span><ArrowUpRight size={14} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>;})}</div>;
}
