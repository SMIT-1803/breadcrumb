export function validateCapture(text: unknown) {
 if(typeof text !== 'string' || !text.trim()) throw new Error('Write a note before saving.');
 if(text.length>4000) throw new Error('Keep your note under 4,000 characters.');
 if(/\b(?:javascript|data|file|vbscript):/i.test(text)) throw new Error('Use only http:// or https:// links.');
 const source_urls=[...new Set((text.match(/https?:\/\/[^\s<>]+/gi)||[]).map(url=>{while(url.endsWith(')')&&(url.match(/\)/g)||[]).length>(url.match(/\(/g)||[]).length)url=url.slice(0,-1);return url;}))];
 if(source_urls.length>5) throw new Error('Save up to five links at a time.');
 for(const url of source_urls) {try {const u=new URL(url);if(!['http:','https:'].includes(u.protocol)) throw 0;}catch{throw new Error('Check the links in your note.');}}
 return {original_text:text,source_urls};
}
