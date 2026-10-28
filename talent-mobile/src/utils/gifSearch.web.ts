export type GifChoice={url:string;preview:string;source:string;label:string;author:string;license:string;licenseUrl:string};
const plain=(value:any)=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").slice(0,250);
export function validCommonsUrl(value:string,host:string){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host;}catch{return false;}}
export function commonsResults(data:any):GifChoice[]{return Object.values(data?.query?.pages||{}).sort((a:any,b:any)=>(a.index||0)-(b.index||0)).flatMap((page:any)=>{
 const i=page.imageinfo?.[0],e=i?.extmetadata||{},license=plain(e.LicenseShortName?.value),author=plain(e.Artist?.value||e.Credit?.value),source=i?.descriptionurl,licenseUrl=String(e.LicenseUrl?.value||'').replace(/^http:/,'https:');
 if(i?.mime!=='image/gif'||!i.size||i.size>5*1024*1024||!validCommonsUrl(i.url,'upload.wikimedia.org')||!validCommonsUrl(source,'commons.wikimedia.org')||!author||!(/^(CC BY|CC0|Public domain)/i.test(license)))return [];
 return [{url:i.url,preview:i.thumburl||i.url,source,label:plain(page.title?.replace(/^File:/,'').replace(/\.gif$/i,'')),author,license,licenseUrl:validCommonsUrl(licenseUrl,'creativecommons.org')?licenseUrl:''}];
});}
export async function searchGifs(query:string,offset=0,signal?:AbortSignal){
 const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:`${query.trim().slice(0,100)||'applause'} filemime:image/gif`,gsrnamespace:'6',gsrlimit:'24',gsroffset:String(offset),prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiurlwidth:'240',iiextmetadatafilter:'Artist|Credit|LicenseShortName|LicenseUrl'});
 const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw new Error('GIF search is unavailable. You can still upload a GIF.');const data=await response.json();if(data.error)throw new Error('Try another GIF search.');return {items:commonsResults(data),next:data.continue?.gsroffset??null};
}
