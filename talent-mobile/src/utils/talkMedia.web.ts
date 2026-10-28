export type TalkAttachment={id:string;type:string;name:string;size:number;credit?:{source:string;author:string;license:string;licenseUrl:string}};
const open=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('talent-talk-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('media');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export async function saveTalkMedia(file:File):Promise<TalkAttachment>{
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Choose a JPG, PNG, WebP or GIF.');
 if(file.size>5*1024*1024)throw new Error('Choose a photo or GIF under 5 MB.');
 const hex=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 const id='talk-media-'+[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-'),db=await open();
 try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('media','readwrite');tx.objectStore('media').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
 return {id,type:file.type,name:file.name.slice(0,120),size:file.size};
}
export async function loadTalkMedia(id:string):Promise<Blob|undefined>{const db=await open();try{return await new Promise((resolve,reject)=>{const r=db.transaction('media').objectStore('media').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
export async function deleteTalkMedia(id:string){const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('media','readwrite');tx.objectStore('media').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
