# SC-007: corner attractor V3 — a certified expansion experiment

2026-11-26. GPT-6.2 assisted. Known-endgame calibration; not a new chess theorem or a claim that the initial position is solved. The C++17 implementation uses coordinate geometry rather than the previous Python code and reproduces V2's three core counts.

## Fixed model

White has K, a single pawn on a2–a7, and optionally one dark-square bishop. Black has K. Both turns, all 64 squares for either king; locally legal states (no overlapping pieces, adjacent kings, or black in check on White's turn). Counts are board+turn states, not historical FIDE positions or reachable starting positions. No castling/en passant. No clock, resignation or agreed draw. Earlier history-dependent draws are safe; checkmate takes priority. All pawn promotion choices included.

A locally legal state with black king in Z={a7,b7,a8,b8} has a geometric non-losing policy: from any other square of Z return to a8, and from a8 choose any legal adjacent move. The dark bishop and a-file pawn cannot attack a8. If the black king is in Z but not on a8, the white king cannot occupy or attack a8 without illegally adjoining the black king. Any promotion on a8 can therefore be captured by Black. Capturing the pawn reduces to K or K+B vs K, a dead position. Stalemate is draw. Black cannot mate with a lone king. Thus the seed states are draws, not merely positions with favorable engine scores.

## Expansion

Let D0 be those seeds and verified stalemates; treat capture of the last pawn and immediate legal recapture of a promotion as certified draw exits. All other promotions leave the model and are **unknown**, never assumed drawn.

For each layer add a Black-turn state when at least one legal move reaches a prior layer or draw exit; add a nonterminal White-turn state only if every legal move reaches a prior layer or draw exit. Count outgoing edges, reverse edges, and propagate from the seed queue. The program rechecks closure and strictly decreasing rank for every nonseed state's required transitions. Promotion+recapture is a certified macro transition, so rank is a proof layer, not necessarily an exact ply-to-draw metric. FIDE finite play follows from finite pawn moves/captures and the 75-move automatic draw, with checkmate taking precedence.

## Reproduction

```sh
g++ -O3 -std=c++17 attractor.cpp -o /tmp/corner-attractor
/tmp/corner-attractor
```

Do not compile with NDEBUG: assertions are part of the verification. Actual local compilation and run passed; uploaded source Git blob SHA 35d29d2944c86c10d007f9249cfaa5e275b5ac28, SHA-256 aac7049942c047aac1c205b39fec0716ccaa7a6dfb04c1e6c13fa86cfb551fba.

```
valid=1224059 edges=12216672
corner_roots=75227 corner_white_moves=524145 corner_promotions=6928
initial_marked=114449 terminal_stalemates=485
proven_draw=351349 unknown=872710 white=120423 black=230926 max_rank=15
rank_counts=0:75495 1:77735 2:31011 3:40694 4:23252 5:31165 6:15882 7:19270 8:9765 9:12432 10:6149 11:7560 12:424 13:456 14:26 15:33
PASS closure
```

The canonical state family expands by 276,122 positions (about 4.67× the 75,227 corner seed family). The 872,710 unmarked states are **unknown under this certificate method**, not losses. No extrapolation to the full chess state space, and no originality claim for classical endgame results. Distinct Python and C++ implementations were written with AI assistance, not reviewed by an independent human or formally proved correct. No tablebase cross-check. This is research evidence, not a SC-005 scored certificate; do not auto-execute unreviewed PR code.

Reference: FIDE Laws of Chess https://handbook.fide.com/chapter/E012023 ; predecessor SC-007 V2 draft https://github.com/Ericnotme/weijia-open-studio/pull/3 . Next: extract symbolic predicates for the newly certified states and prove them, then compare independent tablebases for this restricted material class.
