import shell from './shell';
export const dynamic = 'force-dynamic';
export default function Home(){return <><div dangerouslySetInnerHTML={{__html:shell}}/><script src="/strategy.js" defer /><script src="/app.js" defer /></>}
