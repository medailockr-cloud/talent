import React, { useEffect, useRef, useState } from 'react';
import { Gauge } from 'lucide-react-native';

export function JudgeControl({title,value,onSave,onPreview,appearance='pill'}:{appearance?:'pill'|'folio';title:string;value:number|null;onSave:(score:number)=>Promise<boolean>;onPreview:(score:number|null)=>void}){
 const [dragging,setDragging]=useState(false),[draft,setDraft]=useState(value??5),[pending,setPending]=useState(false);
 const button=useRef<HTMLButtonElement|null>(null),gesture=useRef<{y:number;initial:number;score:number}|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const latest=useRef({value,onSave,onPreview});useEffect(()=>{latest.current={value,onSave,onPreview};},[value,onSave,onPreview]);
 const clamp=(score:number)=>Math.round(Math.min(10,Math.max(1,score))*10)/10;
 const commit=async(score:number)=>{setPending(true);try{await latest.current.onSave(score);}finally{setPending(false);}};
 useEffect(()=>{const node=button.current;if(!node)return;const wheel=(event:WheelEvent)=>{if(document.activeElement!==node||!event.deltaY)return;event.preventDefault();event.stopPropagation();const score=clamp((gesture.current?.score??latest.current.value??5)+(event.deltaY<0?.1:-.1));gesture.current={y:0,initial:score,score};setDraft(score);setDragging(true);latest.current.onPreview(score);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{gesture.current=null;setDragging(false);latest.current.onPreview(null);void commit(score);},500);};node.addEventListener('wheel',wheel,{passive:false});return()=>{node.removeEventListener('wheel',wheel);if(timer.current)clearTimeout(timer.current);};},[]);
 return <button ref={button} className={`talent-judge ${appearance==='folio'?'talent-judge-folio':''}`} role="slider" aria-label={`Judge ${title}`} aria-valuemin={1} aria-valuemax={10} aria-valuenow={dragging?draft:value??5} aria-valuetext={`${(dragging?draft:value??5).toFixed(1)} out of 10`} aria-orientation="vertical" aria-description="Press and slide up or down. Release to save. Arrow keys or focused mouse wheel adjust by 0.1." disabled={pending} data-scored={value!==null} data-dragging={dragging}
 onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.focus();if(timer.current)clearTimeout(timer.current);const initial=value??5;gesture.current={y:e.clientY,initial,score:initial};setDraft(initial);setDragging(true);onPreview(initial);e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{const g=gesture.current;if(!g)return;g.score=clamp(g.initial-(e.clientY-g.y)/15);setDraft(g.score);onPreview(g.score);}}
 onPointerUp={e=>{const g=gesture.current;if(!g)return;gesture.current=null;setDragging(false);onPreview(null);e.currentTarget.releasePointerCapture(e.pointerId);void commit(g.score);}}
 onPointerCancel={()=>{gesture.current=null;setDragging(false);onPreview(null);}}
 onLostPointerCapture={()=>{gesture.current=null;setDragging(false);onPreview(null);}}
 onKeyDown={e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?1:e.key==='End'?10:clamp((value??5)+(['ArrowUp','ArrowRight'].includes(e.key)?.1:-.1));setDraft(next);onPreview(next);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>onPreview(null),1800);void commit(next);}}
 ><Gauge size={appearance==='folio'?23:14}/><span>{pending?'Saving…':dragging?`${draft.toFixed(1)}${appearance==='folio'?' / 10':' ★'}`:value!==null?`${value.toFixed(1)}${appearance==='folio'?' / 10':' ★'}`:appearance==='folio'?'Judge':'JUDGE ↕'}</span></button>;
}
