export function validateDraft(input){
 if(!input||typeof input.text!=='string'||!input.text.trim()||input.text.length>1000||Object.keys(input).some(k=>k!=='text'))throw new Error('需要1到1000字符的text');
 return input.text;
}
export function registerDraftTool(context,stage){
 if(!context?.registerTool)return ()=>{};
 const lifecycle=new AbortController();
 try{Promise.resolve(context.registerTool({name:'stage_chat_message',title:'填入聊天草稿',description:'仅填入可见草稿，不发送、不调用模型。发送需使用界面按钮。',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1,maxLength:1000}},required:['text'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){stage(validateDraft(input));return {staged:true,sent:false};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
 return ()=>lifecycle.abort();
}
