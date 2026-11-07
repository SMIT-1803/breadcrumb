import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Breadcrumb — pick up where you left off',description:'Leave a little context for your future self.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
