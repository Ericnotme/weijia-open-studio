import test from 'node:test';import assert from 'node:assert/strict';
import {createMnemonic,normalizeMnemonic,addressForMnemonic,sealWallet,openWallet} from '../src/wallet.mjs';
// Public BIP39 test vector. Never used as a generated user wallet.
const vector='abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
test('12-word generation validates and restoring recovers the same testnet address',async()=>{
 const phrase=createMnemonic();assert.equal(phrase.split(' ').length,12);assert.equal(normalizeMnemonic(phrase),phrase);
 const address=await addressForMnemonic(vector);assert.match(address,/^tb1q/);assert.equal(await addressForMnemonic(vector),address);
 assert.throws(()=>normalizeMnemonic('abandon '.repeat(12)));assert.throws(()=>normalizeMnemonic('not a mnemonic'));
});
test('vault round trip, random salt, wrong password and tamper rejection',async()=>{
 const password='test-only-password-29';const sealed=await sealWallet(vector,password),again=await sealWallet(vector,password);
 assert.equal(await openWallet(sealed,password),vector);assert.notEqual(sealed.ciphertext,again.ciphertext);
 assert.equal(JSON.stringify(sealed).includes('abandon'),false);
 await assert.rejects(openWallet(sealed,'wrong-test-password'));
 await assert.rejects(openWallet({...sealed,ciphertext:'00'+sealed.ciphertext.slice(2)},password));
 await assert.rejects(openWallet({...sealed,network:'bitcoin'},password));
 await assert.rejects(sealWallet(vector,'short'));
});
