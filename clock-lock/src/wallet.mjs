import {generateMnemonic,validateMnemonic,mnemonicToSeed} from '@scure/bip39';
import {wordlist} from '@scure/bip39/wordlists/english.js';
import {HDKey} from '@scure/bip32';
import {p2wpkh,TEST_NETWORK} from '@scure/btc-signer';
const encoder=new TextEncoder(),decoder=new TextDecoder();
const ITERATIONS=600000;
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
function unhex(value,bytes){if(typeof value!=='string'||value.length!==bytes*2||!/^[\da-f]+$/.test(value))throw new Error('钱包加密数据损坏。');return Uint8Array.from(value.match(/../g),s=>parseInt(s,16));}
export function createMnemonic(){return generateMnemonic(wordlist,128);}
export function normalizeMnemonic(value){const phrase=String(value).normalize('NFKD').trim().toLowerCase().split(/\s+/).join(' ');if(phrase.split(' ').length!==12||!validateMnemonic(phrase,wordlist))throw new Error('请输入校验有效的 12 个英文测试助记词。');return phrase;}
export async function addressForMnemonic(value){
 const mnemonic=normalizeMnemonic(value),seed=await mnemonicToSeed(mnemonic);let root,child;
 try{root=HDKey.fromMasterSeed(seed);child=root.derive("m/84'/1'/0'/0/0");return p2wpkh(child.publicKey,TEST_NETWORK).address;}
 finally{seed.fill(0);root?.wipePrivateData();child?.wipePrivateData();}
}
function checkPassword(password){if(typeof password!=='string'||password.length<12||password.length>1024)throw new Error('解锁密码需要 12～1024 个字符。');}
async function encryptionKey(password,salt,usage){checkPassword(password);const raw=encoder.encode(password);try{const base=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveKey']);return await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,usage);}finally{raw.fill(0);}}
export async function sealWallet(mnemonic,password){
 const phrase=normalizeMnemonic(mnemonic),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await encryptionKey(password,salt,['encrypt']),plain=encoder.encode(phrase);
 try{const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('Clock:testnet:v1')},key,plain);return {schema:1,network:'bitcoin-testnet',iterations:ITERATIONS,salt:hex(salt),iv:hex(iv),ciphertext:hex(new Uint8Array(encrypted))};}finally{plain.fill(0);}
}
export async function openWallet(vault,password){
 if(!vault||vault.schema!==1||vault.network!=='bitcoin-testnet'||vault.iterations!==ITERATIONS||typeof vault.ciphertext!=='string'||vault.ciphertext.length>4096)throw new Error('不支持的钱包文件。');
 const salt=unhex(vault.salt,16),iv=unhex(vault.iv,12),bytes=unhex(vault.ciphertext,vault.ciphertext.length/2);
 const key=await encryptionKey(password,salt,['decrypt']);let plain;
 try{plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:encoder.encode('Clock:testnet:v1')},key,bytes));return normalizeMnemonic(decoder.decode(plain));}
 catch{throw new Error('密码不正确，或钱包加密数据已损坏。');}finally{plain?.fill(0);}
}
