# Geometric safe corridor (V4): compressing the V3 certificate

**Status:** sufficient criterion for the same restricted, classical endgame family; not a claim of a new chess theorem or a solution to the initial position. No human peer review or formal proof assistant verification yet.

Model and corner invariant: White has K, an a-file pawn a2–a7, and zero or one dark-square bishop. Black has K. Use the locally legal states and terminal assumptions of V3. The region Z={a7,b7,a8,b8} is the established safe corner. With the king in Z, Black may always stay in Z or capture the last pawn (including an immediate capture of any promotion on a8), or the game ends in a draw. No white piece combination left after that capture can mate; the lone black king cannot mate either.

## Fixed-path lemma

Let w be White's initial king square, r the initial pawn rank (1-indexed), k Black's initial king square, and epsilon=1 if White is to move, otherwise 0. Let v_1,...,v_m be successive king-adjacent squares from k to Z. Before Black's ith move there have been n_i=i-1+epsilon white moves, unless the game has already ended. Require for each v_i:

1. v_i is light-colored; the optional dark-square bishop can neither occupy nor attack it.
2. Chebyshev distance d(w,v_i) >= n_i+2. A king moves at most one square per move, so White's actual king cannot occupy or attack v_i at that time.
3. n_i < 8-r-[r=2]. Even the fastest pawn, including the initial double-step, cannot have promoted yet.
4. If v_i is on file b, its rank minus one is outside [r, min(7,r+n_i+[r=2 and n_i>0])]. This excludes every possible pawn attack after n_i white moves, allowing the fastest initial double-step.

The brackets indicate a Boolean 0/1. Each target is therefore a legal king move regardless of White's choices, even if the current black king is in check. A pawn on a target a-square can be captured; its disappearance is a dead position. If White is stalemated or a draw rule terminates earlier, the result is already safe. Otherwise Black follows the fixed path until Z, then the established corner strategy. There is no opposing move tree in this proof; the strategy is allowed to depend on the initial geometry and the passage of turns. The lone black king has no winning strategy, so these locally legal positions are draws under the model.

## Reproduction

```sh
python3 corridor.py
```

For an optional differential check against the independently implemented V3 C++ enumerator, copy attractor.cpp to a temporary file, add `#include <fstream>`, and insert the following after its final rank/closure assertions but before the first `cout<<"valid="`:

```cpp
{ofstream f("ranks.bin",ios::binary);for(int x:rank){unsigned char y=x<0?255:static_cast<unsigned char>(x);f.write(reinterpret_cast<char*>(&y),1);}}
```

Compile the temporary C++ file with `g++ -std=c++17 -O3`, run it, then run `python3 corridor.py --v3-ranks ranks.bin`. Do not disable assertions. Review all source first. Python uses a geometry-only layered path search (at most five layers of 64 king squares), not minimax. Enumeration of initial tuples is used only to audit the size of the certified family. Optional rank-file comparison was performed locally.

```
legal certified states 198799 {'black_turn': 130865, 'white_turn': 67934}
certificate path lengths {0: 75227, 1: 60284, 2: 43355, 3: 19933}
geometry-only templates 6584 {0: 2507, 1: 1987, 2: 1458, 3: 632}
V2 outside corner 123572
example 1 white king a1 pawn a2 black king a6 turn B path ['b7']
example 2 white king a1 pawn a2 black king a5 turn B path ['a6', 'b7']
example 3 white king a1 pawn a2 black king a4 turn B path ['b5', 'a6', 'b7']
PASS: every corridor state is inside independently calculated V3 attractor
```

The 198,799 are a subset of V3's 351,349 certified states, not additional states to add to V3. The new contribution is a shorter, bishop-location-independent sufficient proof for 123,572 states outside the V2 corner, rather than an expanded total attractor. Uncertified positions are unknown under this criterion. Counts are canonical board/turn states, not full-chess solution percentages. The tested source Git blob SHA is 17f7c7bb6310a70761dc443c407a78b9102fffe9.
