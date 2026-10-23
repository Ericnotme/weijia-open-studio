import { CITY_BY_ID } from "./cities.ts";
import type { District, Gender, Modeled, OutcomeId } from "./types.ts";

/**
 * Neighborhood quality weights follow Chetty et al. (Opportunity Atlas):
 * schools, poverty, income mixing and social/job access dominate.
 * `inclusion` is the China-specific hukou / school-access term.
 */
const WEIGHTS = {
  school: 0.28,
  collegeHc: 0.16,
  povertyInv: 0.16,
  incomeMix: 0.12,
  highSkill: 0.12,
  inclusion: 0.08,
  transit: 0.08,
} as const;

/** Clean-export replacement: numerical quadrature and bisection of normal CDF.
 * Educational approximation, not the original production rational approximation. */
function invNorm(pRaw: number): number {
 const p=Math.min(.999,Math.max(.001,pRaw));
 function cdf(x:number):number { const n=400,h=Math.abs(x)/n; let sum=0;
  for(let i=0;i<=n;i++){const t=i*h;sum+=(i===0||i===n?1:i%2?4:2)*Math.exp(-t*t/2)/Math.sqrt(2*Math.PI);}
  return .5+Math.sign(x)*sum*h/3;
 }
 let low=-8,high=8;for(let i=0;i<50;i++){const mid=(low+high)/2;if(cdf(mid)<p)low=mid;else high=mid;}return (low+high)/2;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function neighborhoodQuality(d: District): number {
  const raw =
    WEIGHTS.school * d.school +
    WEIGHTS.collegeHc * d.collegeHc +
    WEIGHTS.povertyInv * d.povertyInv +
    WEIGHTS.incomeMix * d.incomeMix +
    WEIGHTS.highSkill * d.highSkill +
    WEIGHTS.inclusion * d.inclusion +
    WEIGHTS.transit * d.transit;
  return raw / 100;
}

/**
 * Rank-rank mapping in the spirit of Chetty, Hendren & Katz:
 *   R_c = 50 + ρ (p − 50) + θ(p) (Q − Q̄) · 100 + γ_g
 * Neighborhoods get a larger coefficient for children from poorer families.
 */
export function modelDistrict(
  d: District,
  parentPct: number,
  gender: Gender,
): Modeled {
  const city = CITY_BY_ID[d.cityId];
  const Q = neighborhoodQuality(d);
  const p = clamp(parentPct, 1, 99);
  const theta = 0.22 + 0.28 * (1 - p / 100);
  const persist = city.rho * (p - 50);
  const neigh = theta * (Q - 0.5) * 100;
  const g =
    gender === "female" ? -6 : gender === "male" ? 2.5 : 0;
  const childRank = clamp(50 + persist + neigh + g, 3, 97);

  const z = invNorm(childRank / 100);
  const female = gender === "female" ? city.femaleLogGap : 0;
  const logY = city.mu35 + city.sigma35 * z + female * 0.5;
  const hhIncome = Math.exp(logY);

  const college = clamp(
    0.18 + 0.55 * Q + 0.0045 * (p - 25) + (gender === "female" ? 0.04 : 0),
    0.05,
    0.95,
  );
  const topQuintile = clamp(
    1 / (1 + Math.exp(-( -2.35 + 3.4 * Q + 0.018 * (p - 25)))),
    0.02,
    0.72,
  );
  // Homeownership: opportunity raises income, but expensive districts price
  // low-income children out of local ownership — a Chetty-like tension.
  const priceBarrier = clamp((d.income - 50000) / 80000, 0, 1);
  const homeown = clamp(
    0.22 + 0.4 * Q - 0.28 * priceBarrier * (1 - p / 100) + 0.003 * (p - 50),
    0.06,
    0.82,
  );

  return { quality: Q, childRank, hhIncome, college, topQuintile, homeown };
}

export function outcomeValue(m: Modeled, outcome: OutcomeId): number {
  switch (outcome) {
    case "hhIncome":
      return m.hhIncome;
    case "college":
      return m.college;
    case "topQuintile":
      return m.topQuintile;
    case "homeown":
      return m.homeown;
  }
}

export function choroplethValue(m: Modeled, outcome: OutcomeId): number {
  // Household income mixes CNY and HKD and is dominated by city wage
  // levels. Color by child rank so the parent-percentile slider is visible.
  if (outcome === "hhIncome") return m.childRank;
  return outcomeValue(m, outcome);
}

/**
 * Childhood exposure: Chetty & Hendren movers design.
 * Share of the place gap captured ≈ remaining childhood years / 18.
 */
export function exposureShare(moveAge: number): number {
  return clamp((18 - moveAge) / 18, 0, 1);
}

export function exposedIncome(
  origin: Modeled,
  dest: Modeled,
  moveAge: number,
): number {
  const s = exposureShare(moveAge);
  return origin.hhIncome + s * (dest.hhIncome - origin.hhIncome);
}

export const COVARIATE_KEYS = [
  "school",
  "collegeHc",
  "povertyInv",
  "incomeMix",
  "highSkill",
  "inclusion",
  "transit",
] as const;

export type CovariateKey = (typeof COVARIATE_KEYS)[number];
