# SC-007 — Corner shelter V2 (known endgame calibration)
2026-11-26 · User direction, GPT-6.2 assisted proof and implementation. Not an original theorem or a solution of standard chess.

## Fixed proposition and rules
Use FIDE chess, ignoring clocks, resignation and agreed draws. Consider locally legal positions with White K + an a-file pawn on a2–a7, optionally one dark-squared bishop, against Black K in Z={a7,b7,a8,b8}. Include either turn, distinct occupied squares, nonadjacent kings, and no check of Black when White is to move. These are local constraints, not a claim of historical reachability. Castling and en passant are unavailable. Any allowable history and automatic or optional draw rule may end a play earlier. The minimax value of every such valid state is draw. Reflect files and exchange colors/ranks to obtain the other three disjoint families.

## Geometric proof
1. Corner a8 is a light square. Neither a dark-square bishop nor an a-file pawn attacks it. If the defending king is in Z outside a8, all other neighbors of a8 are adjacent to the defender, so the attacking king cannot occupy or attack a8. Thus moving the defender to a8 is always legal. If the pawn just promoted on a8, the defender can take the promoted piece there, since it remains undefended. The resulting K vs K or K+B vs K is a dead position.
2. On a8, the defender is not in check. Every legal king move remains in Z; capturing the bishop preserves the optional-bishop condition, and capturing the pawn gives a dead position. If no legal move exists, it is stalemate.
3. Every legal attacking move preserves the family until promotion, whose four possible choices are handled by step 1. An earlier automatic draw is also safe.
4. This defines a memoryless non-losing defensive policy. The attacker cannot lose to a lone king. Finitely many pawn moves/captures followed by the automatic 75-move rule (with checkmate precedence) ensure finite play; there is no checkmate against the policy. Hence the minimax value is draw.

The proof is constant-size and does not require enumerating these positions. Enumeration below is a check of the local closure conditions, not the mathematical proof's foundation.

## Reproduction
Run from this directory: `python verify_corner.py`. Standard library only; Python 3.13.5 used locally.
Local verification passed (2026-11-26):
```
PASS corner shelter closure, all pawn ranks, optional bishop, all promotions
black_legal_moves: 174013
black_policy_edges: 54516
black_policy_roots: 41098
black_roots: 41315
promotions: 6928
roots: 75227
stalemates: 217
white_moves: 524145
white_roots: 33912
roots_by_rank: {2: 13754, 3: 13308, 4: 13754, 5: 13308, 6: 12090, 7: 9013}
right-colour counterexample: (0, 7, 8, 48)
four symmetries, disjoint families: 300908
```
Counts are locally legal board/turn states and transitions, not unique historically reachable FIDE states; transformed families are counted by bijection, not separately enumerated. The verifier does not simulate every historical draw rule or a full chess game. The bishop-color mutation gives WK a1, WB h1, WP a2, BK a7, Black to move: a8 is attacked by the bishop. This defeats the proposed return-to-corner policy when the color assumption is dropped, not a proof of a win in that position.

## Scope and acceptance
Accept as a known-endgame structural calibration only if an independent reviewer verifies the geometric proof, counts, and mutation witness. Do not run arbitrary PR scripts in CI; review source before local execution. No engine scores, no leaderboard claim, no new chess theorem, no Lean verification or independent Syzygy cross-check yet. Standard initial position: unknown. Existing cm-kxk-v1 certificate checker does not certify this family.

## Source and next task
FIDE Laws of Chess: https://handbook.fide.com/chapter/E012023 (articles 5.2, 9.6).
The wrong-colored bishop / rook pawn draw is classical endgame theory. Next: find certified predecessors of this family with additional pieces or king outside Z, preserving the actual game value bounds rather than merely grouping visually similar positions.
