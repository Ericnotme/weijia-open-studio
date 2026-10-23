import {createMnemonic,addressForMnemonic,sealWallet,openWallet,normalizeMnemonic} from './wallet.mjs';
import {Capacitor} from '@capacitor/core';import {App} from '@capacitor/app';
const $=id=>document.getElementById(id),VAULT='clock.testnet.v1';
let vault=null,address='',pendingMnemonic='',restoreMode=false,walletEpoch=0,lockTimer,toastTimer;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5500);}
try{vault=JSON.parse(localStorage.getItem(VAULT)||'null');}catch{toast('本机测试钱包暂时无法读取。');}
function render(){ $('wallet-locked').hidden=!!address;$('wallet-open').hidden=!address;$('wallet-address').textContent=address;$('create-wallet').hidden=!!vault;$('unlock-wallet').hidden=!vault;$('restore-wallet').hidden=!!vault;$('wallet-password').autocomplete=vault?'current-password':'new-password'; }
function clearSecrets(){pendingMnemonic='';$('mnemonic-grid').replaceChildren();$('restore-input').value='';$('wallet-password').value='';$('backup-checked').checked=false;}
function lockWallet(){walletEpoch++;address='';clearSecrets();clearTimeout(lockTimer);if($('wallet-dialog').open)$('wallet-dialog').close();$('wallet-status').textContent=vault?'测试钱包已锁定。':'助记词仅在你的设备生成；加密后保存在本机。';render();}
function touchLock(){if(address||pendingMnemonic){clearTimeout(lockTimer);lockTimer=setTimeout(lockWallet,5*60000);}}
function openWalletDialog(restoring){
 const password=$('wallet-password').value;if(password.length<12){toast('请先设置至少 12 位的本机解锁密码。');return;}
 if(vault){toast('当前已有测试钱包，请先解锁。');return;}
 restoreMode=restoring;pendingMnemonic=restoring?'':createMnemonic();$('wallet-dialog-title').textContent=restoring?'恢复测试钱包':'备份测试钱包';$('restore-input-label').hidden=!restoring;$('mnemonic-grid').hidden=restoring;$('backup-confirm').hidden=restoring;$('wallet-dialog-error').textContent='';$('backup-checked').checked=false;
 $('mnemonic-grid').replaceChildren(...pendingMnemonic.split(' ').filter(Boolean).map((word,i)=>{const el=document.createElement('span');const num=document.createElement('small');num.textContent=String(i+1);el.append(num,document.createTextNode(word));return el;}));$('wallet-dialog').showModal();touchLock();
}
$('create-wallet').onclick=()=>{try{openWalletDialog(false);}catch(e){toast(e.message);}};$('restore-wallet').onclick=()=>{try{openWalletDialog(true);}catch(e){toast(e.message);}};
$('wallet-confirm').onclick=async()=>{
 const button=$('wallet-confirm');button.disabled=true;const epoch=walletEpoch;
 try{if(!restoreMode&&!$('backup-checked').checked)throw new Error('请先记录测试助记词并勾选确认。');const mnemonic=restoreMode?normalizeMnemonic($('restore-input').value):pendingMnemonic;if(!mnemonic)throw new Error('备份已过期，请重新创建。');const sealed=await sealWallet(mnemonic,$('wallet-password').value),derived=await addressForMnemonic(mnemonic);if(epoch!==walletEpoch||document.hidden)throw new Error('钱包已锁定，请重新操作。');localStorage.setItem(VAULT,JSON.stringify(sealed));vault=sealed;address=derived;clearSecrets();$('wallet-dialog').close();$('wallet-status').textContent='已在本机加密保存 · 仅测试网地址';render();touchLock();}
 catch(e){$('wallet-dialog-error').textContent=e.message;}finally{button.disabled=false;}
};
$('unlock-wallet').onclick=async()=>{const button=$('unlock-wallet');button.disabled=true;const epoch=walletEpoch;try{let mnemonic=await openWallet(vault,$('wallet-password').value);const derived=await addressForMnemonic(mnemonic);mnemonic='';if(epoch!==walletEpoch||document.hidden)throw new Error('钱包已锁定，请重新解锁。');address=derived;clearSecrets();$('wallet-status').textContent='测试钱包已解锁 · 仅测试网地址';render();touchLock();}catch(e){toast(e.message);}finally{button.disabled=false;}};
$('lock-wallet').onclick=lockWallet;$('wallet-dialog').addEventListener('close',()=>{walletEpoch++;clearSecrets();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)lockWallet();});
if(Capacitor.isNativePlatform())App.addListener('appStateChange',({isActive})=>{if(!isActive)lockWallet();});
for(const event of ['pointerdown','keydown'])document.addEventListener(event,touchLock,{passive:true});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
window.addEventListener('storage',e=>{if(e.key===VAULT){try{vault=JSON.parse(e.newValue);}catch{vault=null;}lockWallet();}});render();
