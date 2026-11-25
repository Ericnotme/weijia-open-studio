#!/usr/bin/env python3
"""First CHECKMATE static publication only. Existing nginx ECS; explicit operator execution required."""
import argparse, fcntl, hashlib, json, os, re, shutil, subprocess, tempfile, time
from pathlib import Path
SITE="weijia-lab.com"
CONF=Path("/etc/nginx/nginx.conf")
ROOT=Path("/opt/weijia-checkmate/releases")
STATE=Path("/var/lib/weijia-checkmate")
LOCK=Path("/root/weijia-lab-publish.lock")
SOURCE=Path(__file__).resolve().parent.parent
BASE="/research/solving-chess"
FILES={"index.html":"text/html","checker.mjs":"application/javascript","leaderboard.mjs":"application/javascript"}
LEX=re.compile(r"""\s+|\#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[;{}]|(?:\\.|[^\s;{}\#"'\\])+""")
def require(ok,msg):
    if not ok: raise RuntimeError(msg)
def run(args):
    return subprocess.check_output([str(x) for x in args],stderr=subprocess.STDOUT,timeout=30)
def origin(uri,headers=False):
    return run(["curl","-fSs","--noproxy","*","--max-time","8","--resolve",SITE+":443:127.0.0.1"]+(["-I"] if headers else [])+["https://"+SITE+uri])
def digest(data):return hashlib.sha256(data).hexdigest()
def splice(text,fragment):
    stack=[([],[])]; pending=[]; matches=[]; pos=0
    for match in LEX.finditer(text):
        require(match.start()==pos,"unsupported nginx syntax");pos=match.end();word=match.group()
        if word.isspace() or word.startswith("#"):continue
        if word=="{":stack.append((pending,[]));pending=[]
        elif word=="}":
            require(not pending and len(stack)>1,"unbalanced nginx config")
            head,directives=stack.pop()
            if head==["server"] and stack[-1][0]==["http"]:
                names=[s for d,_ in directives if d[0]=="server_name" for s in d[1:]]
                tls=any(d[0]=="listen" and len(d)>1 and (d[1]=="443" or d[1].endswith(":443")) and "ssl" in d for d,_ in directives)
                if SITE in names and tls:
                    roots=[(d[1],end) for d,end in directives if len(d)==2 and d[0]=="root"]
                    require(len(roots)==1 and re.fullmatch(r"/srv/weijia-lab/releases/[\w.-]+/?",roots[0][0]),"unexpected existing release root")
                    matches.append(roots[0][1])
        elif word==";":
            require(bool(pending),"empty directive");stack[-1][1].append((pending,match.end()));pending=[]
        else:pending.append(word.strip("\"'") if word[0] in "\"'" else word)
    require(pos==len(text) and not pending and len(stack)==1 and len(matches)==1,"expected one target TLS vhost in known config")
    at=matches[0];return text[:at]+"\n"+fragment+"\n"+text[at:]
def switch(raw):
    require(CONF.is_file() and not CONF.is_symlink(),"unexpected config file")
    fd,name=tempfile.mkstemp(prefix=".checkmate-",dir=str(CONF.parent));os.close(fd);tmp=Path(name)
    try:
        shutil.copy2(str(CONF),str(tmp));tmp.write_bytes(raw);os.chown(str(tmp),CONF.stat().st_uid,CONF.stat().st_gid)
        run(["nginx","-t","-c",tmp]);os.replace(str(tmp),str(CONF));run(["nginx","-t"]);run(["nginx","-s","reload"])
    finally:
        if tmp.exists():tmp.unlink()
def payload():
    out={}
    for f in FILES:
        p=SOURCE/f;require(p.is_file() and not p.is_symlink() and p.stat().st_size>0,"missing payload "+f)
        out[f]=p.read_bytes()
    require(b"PROJECT" in out["index.html"] and b"leaderboard.mjs" in out["index.html"],"wrong HTML")
    return out
def directory(p,mode):
    if not p.exists():p.mkdir(parents=True,mode=mode);p.chmod(mode)
    require(p.is_dir() and not p.is_symlink() and p.stat().st_uid==0 and p.stat().st_mode&0o777==mode,"unsafe directory "+str(p))
def routes(release):
    lines=["# BEGIN WEIJIA CHECKMATE "+release.name,"location = "+BASE+" { return 308 "+BASE+"/; }"]
    for filename,mime in FILES.items():
        uri=BASE+"/" if filename=="index.html" else BASE+"/"+filename
        ext=filename.rsplit(".",1)[1]
        lines+=["location = "+uri+" {","    alias "+str(release/filename)+";","    types { "+mime+" "+ext+"; } default_type "+mime+"; charset utf-8;","    expires -1;","    add_header X-Content-Type-Options nosniff always;",
          "    add_header Content-Security-Policy \"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src https://api.github.com; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\" always;","}"]
    return "\n".join(lines+["# END WEIJIA CHECKMATE"])
def baseline():return {uri:origin(uri) for uri in ["/","/rt5/board/","/rt5/api/status"]}
def unchanged(before):return all(origin(uri)==data for uri,data in before.items())
def publish(dry):
    original=CONF.read_bytes();text=original.decode();require(BASE not in text and "# BEGIN WEIJIA CHECKMATE" not in text,"existing CHECKMATE route; refuse overwrite")
    before=baseline();files=payload();revision=digest(b"".join(name.encode()+b"\0"+hashlib.sha256(body).digest() for name,body in sorted(files.items())))
    release=ROOT/revision;candidate=splice(text,routes(release)).encode()
    if dry:
        print("Read-only preflight passed. Would publish",revision,"to",BASE+"/");return
    directory(ROOT.parent,0o755);directory(ROOT,0o755);directory(STATE,0o700);directory(release,0o755)
    for name,body in files.items():
        p=release/name
        if p.exists():require(not p.is_symlink() and p.read_bytes()==body,"immutable release conflict")
        else:
            with p.open("xb") as f:f.write(body)
            p.chmod(0o644)
    journal=STATE/(revision+".json");backup=STATE/(revision+".conf")
    require(not journal.exists() and not backup.exists(),"existing journal; inspect before retry")
    backup.write_bytes(original);backup.chmod(0o600)
    journal.write_text(json.dumps({"original":digest(original),"candidate":digest(candidate),"revision":revision}));journal.chmod(0o600)
    require(CONF.read_bytes()==original,"configuration changed during preparation")
    try:
        switch(candidate)
        for attempt in range(10):
            try:
                require(unchanged(before),"existing pages changed")
                for name,body in files.items():
                    uri=BASE+"/" if name=="index.html" else BASE+"/"+name
                    require(origin(uri)==body,"content mismatch "+uri)
                    headers=origin(uri,True).decode()
                    require(re.search(r"(?im)^Content-Type:\s*"+re.escape(FILES[name])+r"(?:;|\s|$)",headers),"MIME mismatch "+uri)
                print("Published and verified local HTTPS origin",revision);return
            except (RuntimeError,subprocess.SubprocessError):
                if attempt==9:raise
                time.sleep(.5)
    except BaseException:
        if CONF.read_bytes()==candidate:switch(original)
        else:require(CONF.read_bytes()==original,"concurrent config change; do not overwrite")
        raise
def rollback(revision):
    require(re.fullmatch(r"[a-f0-9]{64}",revision),"invalid revision")
    j=json.loads((STATE/(revision+".json")).read_text());old=(STATE/(revision+".conf")).read_bytes()
    require(digest(old)==j["original"] and digest(CONF.read_bytes())==j["candidate"],"configuration changed; stop rather than clobber later deployments")
    before=baseline();current=CONF.read_bytes()
    try:
        switch(old);require(unchanged(before),"existing pages changed after rollback")
    except BaseException:
        if CONF.read_bytes()==old:switch(current)
        else:require(CONF.read_bytes()==current,"concurrent configuration change")
        raise
    print("Rolled back",revision)
if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("action",choices=["preflight","publish","rollback"]);parser.add_argument("--revision")
    args=parser.parse_args();require(os.geteuid()==0,"run on existing ECS as root");os.umask(0o077)
    with LOCK.open("a") as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        if args.action=="rollback":rollback(args.revision or "")
        else:publish(args.action=="preflight")
