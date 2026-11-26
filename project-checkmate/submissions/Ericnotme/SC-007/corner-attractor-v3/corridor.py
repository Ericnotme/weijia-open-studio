"""Fixed-path certificate for the canonical wrong-color bishop rook-pawn family.
Squares 0=a1. Only elementary king geometry; no minimax or chess engine.
Optional independent comparison to the V3 full enumerated ranks.
"""
from itertools import product
from collections import Counter
from functools import lru_cache
import argparse
from pathlib import Path
S=range(64); Z={48,49,56,57}; DARK=[s for s in S if (s%8+s//8)%2==0]; BISHOPS=[-1]+DARK

def distance(a,b): return max(abs(a%8-b%8),abs(a//8-b//8))
N=tuple(tuple(t for t in S if distance(s,t)==1) for s in S)
LIGHT=set(S)-set(DARK)

def safe_target(w,p,target,white_moves):
    r=p//8+1
    min_promotion=8-r-int(r==2)
    if white_moves>=min_promotion or target not in LIGHT or distance(w,target)<white_moves+2:
        return False
    # b-file pawn attacks: maximal rank allows a2-a4 on first pawn move.
    max_rank=min(7,r+white_moves+int(r==2 and white_moves>0))
    if target%8==1 and r<=target//8<=max_rank:
        return False
    return True

@lru_cache(None)
def corridor(w,p,k,white_turn):
    if k in Z: return ()
    # Each layer is a set of king squares, not a tree of possible games.
    paths={k:()}
    for i in range(1,6):
        n=i-1+int(white_turn)
        new={}
        for s,path in sorted(paths.items()):
            for t in N[s]:
                if safe_target(w,p,t,n):
                    cert=path+(t,)
                    if t in Z: return cert
                    new.setdefault(t,cert)
        paths=new
        if not paths: break
    return None

def bishop_attacks(b,k,w,p):
    if b<0 or b==k: return False
    dx=k%8-b%8; dy=k//8-b//8
    if abs(dx)!=abs(dy):return False
    d=(1 if dx>0 else -1)+(8 if dy>0 else -8)
    return all(b+i*d not in (w,p) for i in range(1,abs(dx)))

def valid(w,b,p,k,white_turn):
    if w in (p,k) or k==p or (b>=0 and b in (w,p,k)) or distance(w,k)<=1:return False
    return not(white_turn and (k==p+9 or bishop_attacks(b,k,w,p)))

def enumerate_counts(ranks=None):
    counts=Counter(); layers=Counter(); templates=Counter(); examples={}
    for w,p,k,white in product(S,range(8,49,8),S,(False,True)):
        cert=corridor(w,p,k,white)
        if cert is None: continue
        states=0
        for bi,b in enumerate(BISHOPS):
            if not valid(w,b,p,k,white):continue
            states+=1
            if ranks is not None:
                idx=((((w*33+bi)*6+(p//8-1))*64+k)*2+int(not white))
                assert ranks[idx]!=255,(w,b,p,k,white,cert)
        if states:
            layers[len(cert)]+=states;templates[len(cert)]+=1
            counts['white_turn' if white else 'black_turn']+=states
            if cert: examples.setdefault(len(cert),(w,p,k,white,cert))
    return counts,layers,templates,examples

def sq(s):return chr(97+s%8)+str(s//8+1)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--v3-ranks',type=Path);a=ap.parse_args()
    ranks=a.v3_ranks.read_bytes() if a.v3_ranks else None
    if ranks is not None: assert len(ranks)==64*33*6*64*2
    counts,layers,templates,examples=enumerate_counts(ranks)
    print('legal certified states',sum(counts.values()),dict(counts))
    print('certificate path lengths',dict(sorted(layers.items())))
    print('geometry-only templates',sum(templates.values()),dict(sorted(templates.items())))
    print('V2 outside corner',sum(n for length,n in layers.items() if length))
    for length,(w,p,k,white,cert) in sorted(examples.items()): print('example',length,'white king',sq(w),'pawn',sq(p),'black king',sq(k),'turn','W' if white else 'B','path',[sq(s) for s in cert])
    if ranks is not None: print('PASS: every corridor state is inside independently calculated V3 attractor')
