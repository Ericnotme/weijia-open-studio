'use client';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Info,FileHeart} from 'lucide-react';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription} from '@/components/ui/empty';
export function Choice({id,label,value,onChange,options}:{id:string;label:string;value:string;onChange:(v:string)=>void;options:readonly (readonly string[])[]}){return <div className="field"><label htmlFor={id}>{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="choice"><SelectValue/></SelectTrigger><SelectContent>{options.map(([v,t])=><SelectItem key={v} value={v}>{t}</SelectItem>)}</SelectContent></Select></div>}
export function Field({label,id,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:string;id:string}){return <div className="field"><label htmlFor={id}>{label}</label><input id={id} {...props}/></div>}
export function TextField({label,id,...props}:React.TextareaHTMLAttributes<HTMLTextAreaElement>&{label:string;id:string}){return <div className="field"><label htmlFor={id}>{label}</label><textarea id={id} {...props}/></div>}
export function Check({checked,onChange,children,id}:{checked:boolean;onChange:(v:boolean)=>void;children:React.ReactNode;id:string}){return <div className="check-row"><Checkbox id={id} checked={checked} onCheckedChange={v=>onChange(v===true)}/><label htmlFor={id}>{children}</label></div>}
export function Notice({children,tone='info'}:{children:React.ReactNode;tone?:string}){return <div className={`notice ${tone}`}><Info size={18}/><div>{children}</div></div>}
export function Blank({title,description,children}:{title:string;description:string;children?:React.ReactNode}){return <Empty className="blank"><EmptyHeader><FileHeart size={28}/><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{children}</Empty>}
export const valueText=(s:string)=>s||'未填写';
