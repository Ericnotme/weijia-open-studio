"""CHECKMATE: corner shelter, a known endgame calibration; Python 3 stdlib.
White K + rook pawn (a2..a7), optionally dark bishop, vs black K.
Coordinates: a1=0, h8=63. Locally legal positions, not reachability/history.
"""
from itertools import product
from collections import Counter
from functools import lru_cache
S=range(64); C=56; Z=(48,49,56,57); NONE=-1
N={s:tuple(t for t in S if max(abs(s%8-t%8),abs(s//8-t//8))==1) for s in S}
DARK=tuple(s for s in S if (s%8+s//8)%2==0)
# Diagonal rays, including every square between each source/destination.
B={}
for s,t in product(S,repeat=2):
    dx,dy=t%8-s%8,t//8-s//8
    if dx and abs(dx)==abs(dy):
        d=(1 if dx>0 else -1)+(8 if dy>0 else -8)
        B[s,t]=tuple(s+d*k for k in range(1,abs(dx)))
def batk(b,t,k,p): return b!=NONE and (b,t) in B and k not in B[b,t] and p not in B[b,t]
def patk(p,t): return p!=NONE and p%8==0 and t==p+9 and t<64
def check(k,b,p,t): return t in N[k] or patk(p,t) or batk(b,t,k,p)
def valid(k,b,p,t,w):
    a=[s for s in (k,b,p,t) if s!=NONE]
    return len(a)==len(set(a)) and t not in N[k] and not(w and check(k,b,p,t))
def bmoves(k,b,p,t):
    for u in N[t]:
        if u==k or u in N[k]: continue
        bb=NONE if u==b else b; pp=NONE if u==p else p
        if not check(k,bb,pp,u): yield k,bb,pp,u
@lru_cache(None)
def bdest(b): return tuple(t for t in S if (b,t) in B)
def wmoves(k,b,p,t):
    occ={k,b,p,t}
    for u in N[k]:
        if u not in occ and u not in N[t]: yield (k,b,p,t),(u,b,p,t),''
    if b!=NONE:
        for u in bdest(b):
            if u not in occ and not any(x in occ for x in B[b,u]): yield (k,b,p,t),(k,u,p,t),''
    if p+8 not in occ:
        if p==48:
            for promo in 'QRBN': yield (k,b,p,t),(k,b,C,t),promo
        else:
            yield (k,b,p,t),(k,b,p+8,t),''
            if p==8 and p+16 not in occ: yield (k,b,p,t),(k,b,p+16,t),''
def safe(k,b,p,t):
    # no pawn: K or K+B against K, a dead position
    return p==NONE or (p in range(8,49,8) and t in Z and b in (NONE,*DARK) and valid(k,b,p,t,True))
def verify():
    c=Counter(); per_rank=Counter()
    for k,b,p,t,w in product(S,(NONE,*DARK),range(8,49,8),Z,(False,True)):
        if not valid(k,b,p,t,w): continue
        c['roots']+=1; per_rank[p//8+1]+=1; c['white_roots' if w else 'black_roots']+=1
        if w:
            for _,(kk,bb,pp,tt),promo in wmoves(k,b,p,t):
                c['white_moves']+=1
                if promo:
                    # Any promoted piece on a8 is captured by the black king.
                    # Check actual move geometry, and attacks after capture.
                    assert C in N[tt] and C!=kk and not check(kk,bb,NONE,C)
                    assert safe(kk,bb,NONE,C); c['promotions']+=1
                else:
                    assert valid(kk,bb,pp,tt,False) and tt in Z and pp in range(8,49,8)
        else:
            m=list(bmoves(k,b,p,t)); c['black_legal_moves']+=len(m)
            if t!=C:
                choices=[s for s in m if s[-1]==C]; assert len(choices)==1
            else:
                choices=m
            if not choices:
                assert not m and not check(k,b,p,t); c['stalemates']+=1
            else:
                # At corner every legal reply is safe; elsewhere choose corner.
                assert all(safe(*s) for s in choices)
                c['black_policy_roots']+=1
                c['black_policy_edges']+=len(choices)
    # Mutate bishop colour: corner may be attacked; neighbour return unavailable.
    witness=next((k,b,p,t) for k,b,p,t in product(S,[s for s in S if s not in DARK],range(8,49,8),[48,49,57]) if valid(k,b,p,t,False) and list(bmoves(k,b,p,t)) and not any(x[-1]==C for x in bmoves(k,b,p,t)))
    print('PASS corner shelter closure, all pawn ranks, optional bishop, all promotions')
    for k,v in sorted(c.items()): print(f'{k}: {v}')
    print('roots_by_rank:',dict(sorted(per_rank.items())))
    print('right-colour counterexample:',witness)
    print('four symmetries, disjoint families:',4*c['roots'])
    return c
if __name__=='__main__': verify()
