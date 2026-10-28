export type DiscoveryMode='Same craft'|'Another angle'|'This artist';
export type RelatedPerformance={video:any;reason:string};
const music=['music','guitar','singing','piano','violin','percussion','flute','tabla','cello & vocals','melodica','glass instrument','harp','beatbox','ensemble','recorder','clarinet family'];
function family(category:string){const c=category.toLowerCase();return music.includes(c)?'music':c.includes('dance')?'dance':['magic','juggling','street performance'].includes(c)?'stage':['ceramics','digital art','calligraphy','art'].includes(c)?'visual':c;}
const category=(v:any)=>String(v.category||'Performance');
const author=(v:any)=>String(v.authorId??v.author?.id??'');
const source=(v:any)=>String(v.sourceKey||v.url||v.videoUrl||v.id);
export function relatedPerformances(current:any,videos:any[],mode:DiscoveryMode,hidden:string[]=[],limit=6):RelatedPerformance[]{
 const seenIds=new Set<string>();const candidates=videos.filter(v=>{const id=String(v.id);if(id===String(current.id)||hidden.includes(id)||seenIds.has(id)||v.enabled===false||!(v.url||v.videoUrl))return false;seenIds.add(id);if(mode==='This artist')return !!author(current)&&author(v)===author(current);if(source(v)===source(current))return false;return mode==='Same craft'?(category(v).toLowerCase()===category(current).toLowerCase()||family(category(v))===family(category(current))):category(v).toLowerCase()!==category(current).toLowerCase();});
 const ranked=candidates.map((v,i)=>({v,i,rank:mode==='Same craft'?(category(v).toLowerCase()===category(current).toLowerCase()?0:1):mode==='Another angle'&&family(category(v))===family(category(current))?0:1})).sort((a,b)=>a.rank-b.rank||a.i-b.i);
 const result:RelatedPerformance[]=[],seenSources=new Set<string>(),seenArtists=new Set<string>();
 for(const {v}of ranked){const artist=author(v),key=source(v);if(seenSources.has(key)||mode!=='This artist'&&artist&&seenArtists.has(artist))continue;seenSources.add(key);if(artist)seenArtists.add(artist);result.push({video:v,reason:mode==='This artist'?(source(v)===source(current)?'Another excerpt from this performance':'Another work from this sample portfolio'):mode==='Same craft'?(category(v).toLowerCase()===category(current).toLowerCase()?`${category(v)} · a different performance`:`${category(v)} · a connected craft`):family(category(v))===family(category(current))?`${category(v)} · a connected craft`:`${category(v)} · try a different craft`});if(result.length>=Math.max(1,Math.min(1000,limit)))break;}
 return result;
}

/** Ordered, unique catalogue for scroll discovery. Falls back to other crafts explicitly. */
export function discoveryStream(current:any,videos:any[],mode:DiscoveryMode,hidden:string[]=[]):RelatedPerformance[]{
 const directions:DiscoveryMode[]=mode==='This artist'?['This artist','Same craft','Another angle']:mode==='Same craft'?['Same craft','Another angle']:['Another angle','Same craft'];
 const seen=new Set<string>(),seenIds=new Set<string>(),out:RelatedPerformance[]=[];
 for(const direction of directions){for(const item of relatedPerformances(current,videos,direction,hidden,videos.length)){
  const key=source(item.video),id=String(item.video.id);
  if(seen.has(key)||seenIds.has(id))continue;
  seen.add(key);seenIds.add(id);out.push(item);
 }}
 // Include further distinct works after the initial artist-diverse selections.
 for(const direction of directions)for(const v of videos){const item=relatedPerformances(current,[v],direction,hidden,1)[0];if(!item)continue;const key=source(v),id=String(v.id);if(seen.has(key)||seenIds.has(id))continue;seen.add(key);seenIds.add(id);out.push(item);}
 return out;
}
