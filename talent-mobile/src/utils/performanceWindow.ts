export type SavedMoment={id:string;start:number;end:number;label:string};
export function boundedTime(value:number,duration:number){return Number.isFinite(value)&&Number.isFinite(duration)&&duration>0?Math.max(0,Math.min(value,duration)):0;}
export function momentRange(current:number,duration:number){const start=Math.floor(boundedTime(current,duration));const end=Math.min(duration,start+6);if(end-start<1)throw new Error('Choose a moment before the end of the performance.');return {start,end};}
export function validMoments(value:unknown,duration:number):SavedMoment[]{if(!Array.isArray(value))return [];return value.filter((m:any)=>typeof m?.id==='string'&&typeof m.label==='string'&&m.label.length<=80&&Number.isFinite(m.start)&&Number.isFinite(m.end)&&m.start>=0&&m.end>m.start&&m.end<=duration).slice(0,12);}
export function readPlayback(id:string){try{const v=JSON.parse(sessionStorage.getItem('talent-playback-'+id)||'null');return v&&Number.isFinite(v.time)&&v.time>=0?{time:v.time,muted:v.muted!==false}:null;}catch{return null;}}
export function savePlayback(id:string,time:number,muted:boolean){try{if(Number.isFinite(time)&&time>=0)sessionStorage.setItem('talent-playback-'+id,JSON.stringify({time,muted}));}catch{}}

export function takePlayback(id:string){const value=readPlayback(id);try{sessionStorage.removeItem('talent-playback-'+id);}catch{}return value;}

export const craftQualities=['Skill','Expression','Originality'] as const;
export type CraftQuality=typeof craftQualities[number];
export type CraftNote={second:number;quality:CraftQuality};
export function validCraftNotes(value:unknown,duration:number):CraftNote[]{if(!Array.isArray(value)||!Number.isFinite(duration)||duration<=0)return [];const seen=new Set<string>();return value.filter((n:any)=>{if(!Number.isInteger(n?.second)||n.second<0||n.second>=duration||!craftQualities.includes(n.quality))return false;const key=n.second+':'+n.quality;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,30);}
export function toggleCraftNote(notes:CraftNote[],second:number,quality:CraftQuality,duration:number){if(!Number.isFinite(second)||!craftQualities.includes(quality)||duration<=0||!Number.isFinite(duration))throw new Error('Choose a moment while the performance is available.');const note={second:Math.floor(boundedTime(second,Math.max(0,duration-.01))),quality};const valid=validCraftNotes(notes,duration);const existing=valid.some(n=>n.second===note.second&&n.quality===quality);if(existing)return valid.filter(n=>n.second!==note.second||n.quality!==quality);if(valid.length>=30)throw new Error('You can keep up to 30 craft notes per performance.');return [...valid,note];}
