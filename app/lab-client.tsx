'use client';
import {useEffect} from 'react';
import shell from './shell';

export default function LabClient(){
 useEffect(()=>{
  const runtime=window as unknown as {signalLabBoot?:Promise<void>};
  runtime.signalLabBoot??=(async()=>{
   // The imperative workspace owns its contents after React hydrates the shell.
   // Load in order once, including React Strict Mode's repeated effect setup.
   for(const src of ['/research-math.js','/research.js','/strategy.js','/app.js'])await new Promise<void>((resolve,reject)=>{
    const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>reject(new Error('工作區資源載入失敗'));document.body.appendChild(script);
   });
  })();
  runtime.signalLabBoot.catch(()=>{const view=document.getElementById('view');if(view)view.textContent='工作區載入失敗，請重新整理頁面。';});
 },[]);
 return <div dangerouslySetInnerHTML={{__html:shell}}/>;
}
