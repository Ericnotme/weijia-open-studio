import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'安然 · 妈妈的健康手记',description:'脑膜瘤随访、核磁报告档案、长期情景探索与体位性低血压记录。',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
