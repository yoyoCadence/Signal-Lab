import type { Metadata } from 'next';
export const metadata:Metadata={title:'Signal Lab | Threads 流量實驗室',description:'私人 Threads 流量實驗、快照與原始截圖工作區',robots:{index:false,follow:false}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><head><link rel="stylesheet" href="/styles.css"/><meta name="theme-color" content="#101219"/></head><body>{children}</body></html>}
