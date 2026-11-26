// Independent coordinate implementation. C++17. No engine or tablebase.
// K + optional dark bishop + one a-file pawn vs K, both turns.
#include <array>
#include <cassert>
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <cstdint>
using namespace std;
constexpr int N=64*33*6*64*2, A8=56;
struct Pos {int w,b,p,k,t;}; // t=0 white, 1 black; b=-1 absent
int darks[33], bi[64];
int id(Pos s){return ((((s.w*33+(s.b<0?0:bi[s.b]))*6+(s.p/8-1))*64+s.k)*2+s.t);}
Pos dec(int x){int t=x%2;x/=2;int k=x%64;x/=64;int p=(x%6+1)*8;x/=6;int b=darks[x%33];return {x/33,b,p,k,t};}
bool adj(int a,int b){return max(abs(a%8-b%8),abs(a/8-b/8))==1;}
bool zone(int k){return k==48||k==49||k==56||k==57;}
bool bishop(int b,int u,int w,int p){if(b<0||b==u)return false;int x=u%8-b%8,y=u/8-b/8;if(abs(x)!=abs(y))return false;int d=(x>0?1:-1)+(y>0?8:-8);for(int i=b+d;i!=u;i+=d)if(i==w||i==p)return false;return true;}
bool attack(Pos s,int u){return adj(s.w,u)||(s.p>=0&&s.p+9==u)||bishop(s.b,u,s.w,s.p);}
bool valid(Pos s){return s.w!=s.k&&s.w!=s.p&&s.k!=s.p&&(s.b<0||(s.b!=s.w&&s.b!=s.k&&s.b!=s.p))&&!adj(s.w,s.k)&&(s.t||!attack(s,s.k));}
// -1 known draw (pawn captured or promoted piece immediately capturable), -2 unknown promotion.
vector<int> edges(Pos s){vector<int> out;auto add=[&](Pos z){assert(valid(z));out.push_back(id(z));};
if(s.t==0){for(int u=0;u<64;u++){if(u!=s.p&&u!=s.b&&u!=s.k&&adj(s.w,u)&&!adj(u,s.k))add({u,s.b,s.p,s.k,1});if(s.b>=0&&u!=s.w&&u!=s.p&&u!=s.k&&bishop(s.b,u,s.w,s.p)&&bishop(s.b,u,s.k,s.p))add({s.w,u,s.p,s.k,1});}
int u=s.p+8;auto empty=[&](int q){return q!=s.w&&q!=s.b&&q!=s.k;};if(empty(u)){if(u==A8){bool cap=adj(s.k,u)&&!adj(s.w,u)&&!bishop(s.b,u,s.w,-1);for(int i=0;i<4;i++)out.push_back(cap?-1:-2);}else{add({s.w,s.b,u,s.k,1});if(s.p==8&&empty(u+8))add({s.w,s.b,u+8,s.k,1});}}
}else for(int u=0;u<64;u++)if(adj(s.k,u)&&u!=s.w){Pos z={s.w,u==s.b?-1:s.b,u==s.p?-1:s.p,u,0};if(!attack(z,u)){if(z.p<0)out.push_back(-1);else add(z);}}return out;}
int main(){darks[0]=-1;int j=1;for(int i=0;i<64;i++)if((i%8+i/8)%2==0){darks[j]=i;bi[i]=j++;}assert(j==33);vector<vector<int>> rev(N);vector<int> rank(N,-1), rem(N,0);queue<int> q;long long validn=0,zroots=0,zwhite=0,zprom=0,terminal=0,seedn=0,edgen=0;auto mark=[&](int x,int r){if(rank[x]<0){rank[x]=r;q.push(x);}};
for(int x=0;x<N;x++){Pos s=dec(x);if(!valid(s))continue;validn++;auto e=edges(s);edgen+=e.size();bool corner=zone(s.k);if(corner){zroots++;if(!s.t){zwhite+=e.size();for(int y:e){if(y<0){assert(y==-1);zprom++;}else assert(zone(dec(y).k));}}else if(s.k!=A8){bool found=false;for(int y:e)if(y>=0&&dec(y).k==A8)found=true;assert(found);}else{for(int y:e)assert(y==-1||(y>=0&&zone(dec(y).k)));assert(!attack(s,s.k));}mark(x,0);}
if(e.empty()&&!attack(s,s.k)){terminal++;mark(x,0);}bool has_draw=false;for(int y:e){if(y>=0)rev[y].push_back(x);if(y==-1)has_draw=true;else if(!s.t)rem[x]++;}if(s.t&&has_draw)mark(x,1);if(!s.t&&!e.empty()&&rem[x]==0)mark(x,1);}
seedn=q.size();vector<int> seeds;while(!q.empty()){seeds.push_back(q.front());q.pop();}stable_sort(seeds.begin(),seeds.end(),[&](int a,int b){return rank[a]<rank[b];});for(int x:seeds)q.push(x);int maxrank=1;while(!q.empty()){int y=q.front();q.pop();for(int x:rev[y]){if(rank[x]>=0)continue;Pos s=dec(x);if(s.t||--rem[x]==0){mark(x,rank[y]+1);maxrank=max(maxrank,rank[x]);}}}
// Recheck final closure directly; no unknown promotion on marked White states.
long long proven=0,unknown=0,white=0,black=0;vector<long long> hist(maxrank+2);for(int x=0;x<N;x++){Pos s=dec(x);if(!valid(s))continue;if(rank[x]<0){unknown++;continue;}proven++;hist.at(rank[x])++;if(s.t)black++;else white++;auto e=edges(s);auto safe=[&](int y){return y==-1||(y>=0&&rank[y]>=0);};if(!s.t){assert(all_of(e.begin(),e.end(),safe));}else{assert(e.empty()?!attack(s,s.k):any_of(e.begin(),e.end(),safe));}if(rank[x]>0){auto decreases=[&](int y){return y==-1||(y>=0&&rank[y]>=0&&rank[y]<rank[x]);};if(!s.t)assert(all_of(e.begin(),e.end(),decreases));else assert(any_of(e.begin(),e.end(),decreases));}}
cout<<"valid="<<validn<<" edges="<<edgen<<"\ncorner_roots="<<zroots<<" corner_white_moves="<<zwhite<<" corner_promotions="<<zprom<<"\ninitial_marked="<<seedn<<" terminal_stalemates="<<terminal<<"\nproven_draw="<<proven<<" unknown="<<unknown<<" white="<<white<<" black="<<black<<" max_rank="<<maxrank<<"\nrank_counts=";for(int i=0;i<(int)hist.size();i++)if(hist[i])cout<<i<<":"<<hist[i]<<" ";cout<<"\nPASS closure\n";
}
