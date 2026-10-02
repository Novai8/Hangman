#!/usr/bin/env python3
import argparse, json, math, shutil, subprocess, wave
from pathlib import Path

VOICE_BYTES = 659887
VOICE_SHA256 = "6b9ccd7e5b320a7ccbded19d095133b28325f7b355612c3ea55b6da86601a8bb"
WORDS = [5,12,20,19,22,9,1]
TOTAL_WORDS = sum(WORDS)

BG=[0.055,0.062,0.090,1]; OFF=[0.94,0.95,0.98,1]; MUTED=[0.49,0.52,0.60,1]
GRID=[0.12,0.13,0.18,1]; INDIGO=[0.30,0.33,0.96,1]; BLUE=[0.12,0.60,1,1]; VIOLET=[0.60,0.38,0.96,1]

def run(cmd, cwd=None):
    print("$", " ".join(map(str, cmd)))
    return subprocess.run(cmd, cwd=cwd, check=True, text=True, capture_output=True)

def parse_json_output(raw):
    raw=raw.strip()
    try: return json.loads(raw)
    except Exception:
        for line in reversed([x for x in raw.splitlines() if x.strip()]):
            try: return json.loads(line)
            except Exception: pass
    raise RuntimeError("Could not parse Tesseract JSON output: "+raw[-1000:])

def duration_ms(path):
    x=run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)]).stdout.strip()
    return int(round(float(x)*1000))

def make_sfx(path, kind, ms):
    sr=44100; n=max(1,int(sr*ms/1000)); data=bytearray()
    for i in range(n):
        t=i/sr; p=i/max(1,n-1)
        if kind=="click":
            f=1800-500*p; env=math.exp(-9*t); v=math.sin(2*math.pi*f*t)*env
        elif kind=="ping":
            f=920 if p<0.5 else 1380; env=math.exp(-6*t); v=math.sin(2*math.pi*f*t)*env
        elif kind=="whoosh":
            f=180+1250*(p**1.7); env=math.sin(math.pi*p)**1.2
            v=(math.sin(2*math.pi*f*t)+0.3*math.sin(2*math.pi*1.8*f*t))*env
        elif kind=="pulse":
            f=230+55*math.sin(2*math.pi*p); env=math.sin(math.pi*p)**0.9; v=math.sin(2*math.pi*f*t)*env
        elif kind=="impact":
            f=125-50*p; env=math.exp(-7*t); v=math.sin(2*math.pi*f*t)*env
        else: raise ValueError(kind)
        data += int(max(-1,min(1,v*0.22))*32767).to_bytes(2,"little",signed=True)
    path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(data)

def rect(lid,name,start,end,x,y,w,h,fill,rot=0):
    return {"type":"createFxRectLayer","compositionId":"main","layerId":lid,"name":name,"insertIndex":0,
            "activeRange":{"start":int(start),"duration":int(max(1,end-start))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":rot,"opacity":100},
            "rect":{"size":[w,h],"fillColor":fill}}

def text(lid,name,start,end,x,y,w,h,txt,size,fill,fam,sty,just="left"):
    return {"type":"createFxTextLayer","compositionId":"main","layerId":lid,"name":name,"insertIndex":0,
            "activeRange":{"start":int(start),"duration":int(max(1,end-start))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":0,"opacity":100},
            "sourceText":{"text":txt,"fontFamily":fam,"fontStyle":sty,"fontSize":size,"fillColor":fill,
                          "justification":just,"boxText":True,"boxPosition":[0,0],"boxSize":[w,h]}}

def keyframe(lid,prop,prefix,dur,a,b):
    f=min(420,max(120,dur//4)); m2=max(f+1,dur-420); last=max(m2+1,dur-20)
    return {"type":"setFxPropertyKeyframes","compositionId":"main",
            "property":{"layerId":lid,"propertyType":prop},
            "keyframes":[
                {"id":prefix+"-0","layerTime":0,"value":{"type":"float","value":a},"easing":{"type":"linear"}},
                {"id":prefix+"-1","layerTime":f,"value":{"type":"float","value":b},"easing":{"type":"cubicBezier","x1":0.18,"y1":0,"x2":0.18,"y2":1}},
                {"id":prefix+"-2","layerTime":m2,"value":{"type":"float","value":b},"easing":{"type":"linear"}},
                {"id":prefix+"-3","layerTime":last,"value":{"type":"float","value":0 if prop=="opacity" else b},"easing":{"type":"cubicBezier","x1":0.25,"y1":0,"x2":0.2,"y2":1}}
            ]}

def add_text(A,lid,s,e,x,y,w,h,txt,size,fill,fam,sty,name):
    A.append(text(lid,name,s,e,x,y,w,h,txt,size,fill,fam,sty,"center" if x>=50 and w>=600 else "left"))
    d=int(max(1,e-s)); A.append(keyframe(lid,"opacity",name+"-op",d,0,100))
    A.append(keyframe(lid,"positionY",name+"-py",d,y+48,y)); A.append(keyframe(lid,"scaleX",name+"-sx",d,96,100))
    return lid+1

def add_line(A,lid,s,e,x1,y1,x2,y2,fill,name):
    L=math.hypot(x2-x1,y2-y1); ang=math.degrees(math.atan2(y2-y1,x2-x1))
    A.append(rect(lid,name,s,e,x1,y1-2,L,4,fill,ang)); d=int(max(1,e-s))
    A.append(keyframe(lid,"opacity",name+"-op",d,0,100)); A.append(keyframe(lid,"scaleX",name+"-sx",d,0,100))
    return lid+1

def add_node(A,lid,s,e,x,y,size,fill,name):
    A.append(rect(lid,name,s,e,x,y,size,size,fill)); d=int(max(1,e-s))
    A.append(keyframe(lid,"opacity",name+"-op",d,0,100)); A.append(keyframe(lid,"scaleX",name+"-sx",d,35,100)); A.append(keyframe(lid,"scaleY",name+"-sy",d,35,100))
    return lid+1

def bounds(d):
    out=[0]; acc=0
    for w in WORDS[:-1]:
        acc+=w; out.append(round(d*acc/TOTAL_WORDS))
    out.append(d)
    out[1]=max(out[1],2500); out[-2]=min(out[-2],max(0,d-2400))
    r=[]
    for a,b in zip(out[:-1],out[1:]): r.append((max(0,a),max(a+900,b)))
    r[-1]=(max(0,r[-1][0]),d)
    return r

def main(tsrct, voiceover, root):
    root=Path(root); root.mkdir(parents=True,exist_ok=True)
    audio=root/"Audio"; assets=root/"Assets"; sfx=root/"SFX"; prev=root/"Previews"; work=root/".tesseract-work"; vers=root/"Versions"
    for d in (audio,assets,sfx,prev,work,vers): d.mkdir(parents=True,exist_ok=True)
    voiceover=Path(voiceover)
    assert voiceover.stat().st_size==VOICE_BYTES
    sha=subprocess.check_output(["sha256sum",str(voiceover)],text=True).split()[0]
    assert sha==VOICE_SHA256, sha
    dur=duration_ms(voiceover)
    shutil.copy2(voiceover,audio/"Original_Voiceover.mp3")
    (work/"source_sha256.txt").write_text(f"{sha}\n{dur}\n")
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(voiceover),"-filter_complex","showwavespic=s=1080x360:colors=white","-frames:v","1",str(prev/"Voiceover_Waveform.png")],check=True)
    project=root/"Clipback_CLIP_Motion_Design.tsrct"
    run([tsrct,"project","create","--project",str(project)])
    run([tsrct,"project","import-asset","--project",str(project),"--file",str(voiceover),"--asset-id","master-voiceover","--kind","audio"])
    fonts=sorted(Path("/usr/share/fonts").rglob("Inter-*.ttf"))
    reg=next((p for p in fonts if "Regular" in p.name),None); bold=next((p for p in fonts if "Bold" in p.name),None)
    assert reg and bold, "Inter fonts missing"
    rg=parse_json_output(run([tsrct,"project","import-font","--project",str(project),"--file",str(reg)]).stdout)
    bd=parse_json_output(run([tsrct,"project","import-font","--project",str(project),"--file",str(bold)]).stdout)
    F={"family":bd["fontFamily"],"style":bd["fontStyle"]}; FR={"family":rg["fontFamily"],"style":rg["fontStyle"]}
    for fn,k,ms in [("whoosh.wav","whoosh",520),("click.wav","click",95),("ping.wav","ping",210),("pulse.wav","pulse",260),("impact.wav","impact",320)]:
        p=sfx/fn; make_sfx(p,k,ms)
        run([tsrct,"project","import-asset","--project",str(project),"--file",str(p),"--asset-id",k,"--kind","audio"])
    A=[]; lid=1; B=bounds(dur)
    A.append(rect(lid,"Background",0,dur,0,0,1080,1920,BG)); lid+=1
    for i,x in enumerate([90,270,450,630,810,990]): A.append(rect(lid,f"GridV-{i}",0,dur,x,0,2,1920,GRID)); lid+=1
    for i,y in enumerate([120,360,600,840,1080,1320,1560,1800]): A.append(rect(lid,f"GridH-{i}",0,dur,0,y,1080,2,GRID)); lid+=1

    s,e=B[0]
    pts=[(210,560),(420,390),(700,420),(880,620),(540,760)]
    for j,(a,b) in enumerate([(0,1),(1,2),(2,3),(1,4),(4,3),(0,4)]): lid=add_line(A,lid,s+160,e,pts[a][0],pts[a][1],pts[b][0],pts[b][1],BLUE if j%2==0 else INDIGO,f"S1-Line-{j}")
    for j,(x,y) in enumerate(pts): lid=add_node(A,lid,s+260+j*80,e,x-10,y-10,20,OFF if j%2==0 else BLUE,f"S1-Node-{j}")
    lid=add_text(A,lid,s+650,e,90,780,900,150,"CLIPBACK",116,OFF,F["family"],F["style"],"S1-Title")
    lid=add_text(A,lid,s+900,e,170,955,740,50,"CREATOR CONTENT  /  REWARD SYSTEM",24,MUTED,FR["family"],FR["style"],"S1-Sub")

    s,e=B[1]; lid=add_text(A,lid,s,e,90,140,900,90,"CONTENT-FOCUSED PLATFORM",54,OFF,F["family"],F["style"],"S2-Head")
    cards=[("CREATOR",110,430,INDIGO),("CONTENT",570,430,BLUE),("CAMPAIGN",110,860,VIOLET),("REWARD",570,860,INDIGO)]
    for i,(lab,x,y,acc) in enumerate(cards):
        A.append(rect(lid,f"S2-Card-{i}",s+180,e,x,y,400,250,[0.10,0.115,0.155,1])); A.append(keyframe(lid,"opacity",f"S2-Card-{i}-op",int(e-(s+180)),0,100)); A.append(keyframe(lid,"positionY",f"S2-Card-{i}-py",int(e-(s+180)),y+60,y)); lid+=1
        A.append(rect(lid,f"S2-Accent-{i}",s+280,e,x+28,y+30,7,190,acc)); A.append(keyframe(lid,"opacity",f"S2-Accent-{i}-op",int(e-(s+280)),0,100)); lid+=1
        lid=add_text(A,lid,s+360+i*80,e,x+60,y+75,310,90,lab,44,OFF,F["family"],F["style"],f"S2-Label-{i}")
    lid=add_line(A,lid,s+500,e,510,555,570,555,BLUE,"S2-L1"); lid=add_line(A,lid,s+650,e,760,680,760,860,VIOLET,"S2-L2"); lid=add_line(A,lid,s+800,e,310,680,310,860,INDIGO,"S2-L3"); lid=add_line(A,lid,s+950,e,510,985,570,985,BLUE,"S2-L4")

    s,e=B[2]; lid=add_text(A,lid,s,e,90,140,900,100,"FROM CONTENT ACTIVITY TO CREATOR FEES",50,OFF,F["family"],F["style"],"S3-Head")
    lid=add_text(A,lid,s+350,e,100,640,370,80,"CONTENT ACTIVITY",34,OFF,F["family"],F["style"],"S3-Content")
    lid=add_text(A,lid,s+600,e,610,640,380,80,"CREATOR FEES",34,OFF,F["family"],F["style"],"S3-Fees")
    lid=add_line(A,lid,s+450,e,470,680,610,680,BLUE,"S3-Flow"); lid=add_node(A,lid,s+850,e,515,930,30,OFF,"S3-Split")
    lid=add_line(A,lid,s+980,e,530,960,310,1140,INDIGO,"S3-80"); lid=add_line(A,lid,s+1080,e,560,960,770,1140,BLUE,"S3-20")
    lid=add_text(A,lid,s+900,e,170,1165,740,60,"DIVIDED INTO TWO PARTS",30,MUTED,FR["family"],FR["style"],"S3-Divided")

    s,e=B[3]; lid=add_text(A,lid,s,e,90,120,900,90,"80 / 20 ALLOCATION",64,OFF,F["family"],F["style"],"S4-Head")
    A.append(rect(lid,"S4-80-Panel",s+180,e,90,395,420,860,[0.10,0.12,0.17,1])); A.append(keyframe(lid,"opacity","S4-80-op",int(e-(s+180)),0,100)); A.append(keyframe(lid,"positionY","S4-80-py",int(e-(s+180)),455,395)); lid+=1
    lid=add_text(A,lid,s+330,e,125,450,350,150,"80%",108,OFF,F["family"],F["style"],"S4-80")
    lid=add_text(A,lid,s+500,e,125,610,350,190,"CONTENT REWARD CAMPAIGN",42,BLUE,F["family"],F["style"],"S4-80-Label")
    lid=add_line(A,lid,s+700,e,205,860,380,1050,BLUE,"S4-80-L1"); lid=add_line(A,lid,s+850,e,380,1050,380,1170,BLUE,"S4-80-L2"); lid=add_node(A,lid,s+970,e,366,1180,28,BLUE,"S4-80-End")
    A.append(rect(lid,"S4-20-Panel",s+260,e,570,395,420,860,[0.10,0.12,0.17,1])); A.append(keyframe(lid,"opacity","S4-20-op",int(e-(s+260)),0,100)); A.append(keyframe(lid,"positionY","S4-20-py",int(e-(s+260)),455,395)); lid+=1
    lid=add_text(A,lid,s+420,e,605,450,350,150,"20%",108,OFF,F["family"],F["style"],"S4-20")
    lid=add_text(A,lid,s+590,e,605,620,350,80,"$CLIP",56,INDIGO,F["family"],F["style"],"S4-CLIP")
    lid=add_text(A,lid,s+750,e,605,735,160,70,"BUY",38,BLUE,F["family"],F["style"],"S4-BUY")
    lid=add_text(A,lid,s+900,e,815,735,160,70,"BURN",38,VIOLET,F["family"],F["style"],"S4-BURN")
    lid=add_line(A,lid,s+800,e,765,770,815,770,BLUE,"S4-20-L")
    A.append(rect(lid,"S4-Token",s+1020,e,610,920,110,110,INDIGO)); A.append(keyframe(lid,"scaleX","S4-token-x",int(e-(s+1020)),0,100)); A.append(keyframe(lid,"scaleY","S4-token-y",int(e-(s+1020)),0,100)); lid+=1
    A.append(rect(lid,"S4-BurnBar",s+1200,e,610,1070,110,6,VIOLET)); A.append(keyframe(lid,"scaleX","S4-burnbar",int(e-(s+1200)),100,15)); lid+=1

    s,e=B[4]; lid=add_text(A,lid,s,e,90,120,900,80,"CONNECTING THE SYSTEM",58,OFF,F["family"],F["style"],"S5-Head")
    seq=[("CREATOR",110,INDIGO),("CONTENT",300,BLUE),("FEES",500,OFF),("80%",700,BLUE),("20%",700,VIOLET),("$CLIP",900,INDIGO)]
    for i,(lab,x,col) in enumerate(seq):
        y=700 if lab not in ("80%","20%") else (575 if lab=="80%" else 825)
        lid=add_text(A,lid,s+160+i*85,e,x,y,150,60,lab,32,col,F["family"],F["style"],"S5-"+lab.replace("%","P").replace("$","D"))
        if lab not in ("80%","20%"): lid=add_line(A,lid,s+280+i*70,e,x+150,y+5,x+200,y+5,col,f"S5-flow-{i}")
    lid=add_line(A,lid,s+650,e,650,720,700,600,BLUE,"S5-B1"); lid=add_line(A,lid,s+760,e,650,720,700,840,VIOLET,"S5-B2")
    lid=add_text(A,lid,s+1050,e,120,1120,360,70,"CONTENT REWARDS",34,BLUE,F["family"],F["style"],"S5-Rewards")
    lid=add_text(A,lid,s+1150,e,590,1120,370,70,"BUY  →  BURN",34,VIOLET,F["family"],F["style"],"S5-Burn")

    s,e=B[5]; lid=add_text(A,lid,s,e,90,150,900,80,"THE PLATFORM SYSTEM",58,OFF,F["family"],F["style"],"S6-Head")
    center=(540,850); ring=[(260,610),(820,610),(900,1060),(180,1060)]
    for i,(x,y) in enumerate(ring):
        col=[INDIGO,BLUE,VIOLET,OFF][i]; lid=add_node(A,lid,s+200+i*100,e,x-12,y-12,24,col,f"S6-N{i}"); lid=add_line(A,lid,s+350+i*70,e,x,y,center[0],center[1],MUTED,f"S6-L{i}")
    A.append(rect(lid,"S6-Frame",s+500,e,330,650,420,380,[0.10,0.115,0.16,1])); A.append(keyframe(lid,"opacity","S6-frame-op",int(e-(s+500)),0,100)); lid+=1
    lid=add_text(A,lid,s+620,e,360,760,360,80,"CLIPBACK",58,OFF,F["family"],F["style"],"S6-Clipback")
    lid=add_text(A,lid,s+760,e,355,855,370,110,"CREATOR CONTENT\n+ REWARD MECHANISM",28,MUTED,FR["family"],FR["style"],"S6-Sub")

    s,e=B[6]; s=max(0,min(s,max(0,dur-2400)))
    pts=[(140,500),(940,500),(180,1320),(900,1320),(540,330),(540,1500)]
    for i,(x,y) in enumerate(pts):
        col=[BLUE,INDIGO,VIOLET,BLUE,MUTED,OFF][i]; lid=add_line(A,lid,s+100,e,x,y,540,885,col,f"S7-C{i}"); lid=add_node(A,lid,s+180+i*60,e,x-11,y-11,22,col,f"S7-N{i}")
    A.append(rect(lid,"S7-Core",s+420,e,400,745,280,280,[0.10,0.12,0.17,1])); A.append(keyframe(lid,"opacity","S7-core-op",int(e-(s+420)),0,100)); lid+=1
    lid=add_text(A,lid,s+580,e,195,800,690,150,"$CLIP",112,OFF,F["family"],F["style"],"S7-Final")

    actions=work/"visual-actions.json"; actions.write_text(json.dumps(A,indent=2))
    run([tsrct,"project","apply","--project",str(project),"--actions",str(actions)])

    checkout=work/"editable.json"; run([tsrct,"project","checkout","--project",str(project),"--output",str(checkout)])
    doc=json.loads(checkout.read_text()); doc["duration"]=dur/1000.0
    comp=doc["compositions"][0]; layers=comp.setdefault("layers",[])
    layers.append({"id":9000,"name":"MASTER VOICEOVER","type":"Audio","activeRange":{"start":0,"duration":dur},
                   "sourceRange":{"start":0,"duration":dur},"sourceIntrinsicDuration":dur,"source":{"assetId":"master-voiceover"},
                   "volume":1.0,"captionsEnabled":False})
    cue_defs=[("whoosh",B[0][0]+650,0.13),("click",B[1][0]+500,0.10),("ping",B[2][0]+900,0.10),
              ("whoosh",B[3][0]+650,0.11),("pulse",B[4][0]+650,0.09),("impact",max(0,dur-850),0.10)]
    aid=9100
    for kind,start,vol in cue_defs:
        ms={"whoosh":520,"click":95,"ping":210,"pulse":260,"impact":320}[kind]
        start=min(max(0,int(start)),max(0,dur-ms))
        layers.append({"id":aid,"name":f"SFX {kind}","type":"Audio","activeRange":{"start":start,"duration":ms},
                       "sourceRange":{"start":0,"duration":ms},"sourceIntrinsicDuration":ms,
                       "source":{"assetId":kind},"volume":vol,"captionsEnabled":False}); aid+=1
    checkout.write_text(json.dumps(doc,indent=2))
    run([tsrct,"project","commit","--project",str(project),"--file",str(checkout)])

    (assets/"Palette.txt").write_text("Charcoal / Off-white / Indigo / Electric Blue / Violet\nNo stock imagery. Native Tesseract shapes + text only.\n")
    (assets/"Story_Structure.txt").write_text("1 Hook | 2 Platform | 3 Fees Split | 4 80/20 Allocation | 5 System Connection | 6 Platform System | 7 $CLIP Convergence\n")
    run([tsrct,"preview","--project",str(project),"--time",f"{min(4.0,max(0.25,dur/2000)):.3f}","--output",str(prev/"Clipback_Preview.png")])
    run([tsrct,"filmstrip","--project",str(project),"--start-ms","0","--duration-ms",str(dur),
         "--interval-ms",str(max(500,dur//12)),"--tile-width","270","--tile-height","480","--items-per-row","4",
         "--output",str(prev/"Clipback_Filmstrip.png")])
    final=root/"Clipback_CLIP_Motion_Design.mp4"
    run([tsrct,"export","--project",str(project),"--resolution","1080p","--fps","30","--format","mp4",
         "--encoder-backend","external-ffmpeg-command","--ffmpeg-path",shutil.which("ffmpeg"),"--output",str(final)])
    (vers/"v1.tsrct").write_bytes(project.read_bytes())
    (work/"render-notes.txt").write_text(f"Voiceover bytes: {VOICE_BYTES}\nVoiceover SHA-256: {sha}\nMeasured duration ms: {dur}\nOriginal narration preserved at volume 1.0.\nNo music. SFX separate editable Audio layers.\n")

if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--tsrct",required=True); p.add_argument("--voiceover",required=True); p.add_argument("--project-root",required=True)
    a=p.parse_args(); main(a.tsrct,a.voiceover,a.project_root)
