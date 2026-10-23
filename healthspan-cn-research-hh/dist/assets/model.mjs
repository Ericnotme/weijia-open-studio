export function servingEffect(food, count) {
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0 || count > 2 || !Number.isInteger(count * 2)) throw new RangeError('份数须为 0–2，步长 0.5');
  if (food.verification !== 'verified_source' || !Number.isFinite(food.heni)) return {count, value:null, low:null, high:null};
  return {count, value:food.heni*count, low:Number.isFinite(food.heniLo)?food.heniLo*count:null, high:Number.isFinite(food.heniHi)?food.heniHi*count:null};
}
export const categories = [
 {min:0,max:0,label:'0（参照）',hr:1,ci:null},
 {min:6,max:225,label:'0.1–<3.75 MET-h / 周',hr:.81,ci:[.79,.83]},
 {min:225,max:450,label:'3.75–<7.5 MET-h / 周',hr:.76,ci:[.74,.78]},
 {min:450,max:900,label:'7.5–<15 MET-h / 周',hr:.68,ci:[.66,.69]},
 {min:900,max:1350,label:'15–<22.5 MET-h / 周',hr:.61,ci:[.59,.63]},
 {min:1350,max:Infinity,label:'≥22.5 MET-h / 周',hr:.59,ci:[.57,.61]}
];
export function exerciseCategory(value) {
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>3000) throw new RangeError('活动量须在 0–3000 之间');
 if(value===0)return categories[0];
 if(value<6)return null;
 return categories.slice(1).find(c=>value>=c.min&&value<c.max)||null;
}
export function metMinutes(met,target=500) {
 if(!Number.isFinite(met)||met<=0||!Number.isFinite(target)||target<0)throw new RangeError('无效 MET 或目标量');
 return target/met;
}
