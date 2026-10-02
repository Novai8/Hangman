#!/usr/bin/env python3
import argparse, json, math, shutil, subprocess, wave
from pathlib import Path

VOICE_BYTES = 659887
VOICE_SHA256 = "f2ff9f0556b3b6cf2daadd67c061ba75f41a0451f4245cab6f9f570d6a51224f"
WORDS = [5,12,20,19,22,9,1]
TOTAL_WORDS = sum(WORDS)
BG=[0.055,0.062,0.090,1]; OFF=[0.94,0.95,0.98,1]; MUTED=[0.49,0.52,0.60,1]
GRID=[0.12,0.13,0.18,1]; INDIGO=[0.30,0.33,0.96,1]; BLUE=[0.12,0.60,1,1]; VIOLET=[0.60,0.38,0.96,1]

def sh(cmd):
    print("$"," ".join(map(str,cmd)))
    p=subprocess.run(cmd,check=False,text=True,capture_output=True)
    if p.stdout.strip(): print(p.stdout)
    if p.returncode != 0:
        if p.stderr.strip(): print(p.stderr)
        raise subprocess.CalledProcessError(p.returncode,cmd,p.stdout,p.stderr)
    return p

def j(raw):
    for line in reversed([x for x in raw.strip().splitlines() if x.strip()]):
        try: return json.loads(line)
        except: pass
    return json.loads(raw)

def dur_ms(p):
    return int(round(float(sh(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(p)]).stdout.strip())*1000))

def sfx(path,kind,ms):
    sr=44100; n=max(1,int(sr*ms/1000)); buf=bytearray()
    for i in range(n):
        t=i/sr; p=i/max(1,n-1)
        if kind=="click": f=1800-500*p; e=math.exp(-9*t); v=math.sin(2*math.pi*f*t)*e
        elif kind=="ping": f=920 if p<.5 else 1380; e=math.exp(-6*t); v=math.sin(2*math.pi*f*t)*e
        elif kind=="whoosh": f=180+1250*(p**1.7); e=math.sin(math.pi*p)**1.2; v=(math.sin(2*math.pi*f*t)+.3*math.sin(2*math.pi*1.8*f*t))*e
        elif kind=="pulse": f=230+55*math.sin(2*math.pi*p); e=math.sin(math.pi*p)**.9; v=math.sin(2*math.pi*f*t)*e
        else: f=125-50*p; e=math.exp(-7*t); v=math.sin(2*math.pi*f*t)*e
        buf += int(max(-1,min(1,v*.22))*32767).to_bytes(2,"little",signed=True)
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(buf)

def rect(i,n,s,e,x,y,w,h,c,r=0):
    return {"type":"createFxRectLayer","compositionId":"main","layerId":i,"name":n,"insertIndex":0,
            "activeRange":{"start":int(s),"duration":int(max(1,e-s))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":r,"opacity":100},
            "rect":{"size":[w,h],"fillColor":c}}

def txt(i,n,s,e,x,y,w,h,t,size,c,fam,sty,just="left"):
    return {"type":"createFxTextLayer","compositionId":"main","layerId":i,"name":n,"insertIndex":0,
            "activeRange":{"start":int(s),"duration":int(max(1,e-s))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":0,"opacity":100},
            "sourceText":{"text":t,"fontFamily":fam,"fontStyle":sty,"fontSize":size,"fillColor":c,
                          "justification":just,"boxText":True,"boxPosition":[0,0],"boxSize":[w,h]}}

def kf(i,p,prefix,d,a,b):
    f=min(420,max(120,d//4)); m=max(f+1,d-420); z=max(m+1,d-20)
    return {"type":"setFxPropertyKeyframes","compositionId":"main","property":{"layerId":i,"propertyType":p},
            "keyframes":[
              {"id":prefix+"0","layerTime":0,"value":{"type":"float","value":a},"easing":{"type":"linear"}},
              {"id":prefix+"1","layerTime":f,"value":{"type":"float","value":b},"easing":{"type":"cubicBezier","x1":.18,"y1":0,"x2":.18,"y2":1}},
              {"id":prefix+"2","layerTime":m,"value":{"type":"float","value":b},"easing":{"type":"linear"}},
              {"id":prefix+"3","layerTime":z,"value":{"type":"float","value":0 if p=="opacity" else b},"easing":{"type":"cubicBezier","x1":.25,"y1":0,"x2":.2,"y2":1}}
            ]}

def add_text(A,i,s,e,x,y,w,h,t,size,c,fam,sty,n):
    A += [txt(i,n,s,e,x,y,w,h,t,size,c,fam,sty,"center" if w>=600 else "left"),
          kf(i,"opacity",n+"op",int(e-s),0,100),kf(i,"positionY",n+"py",int(e-s),y+48,y),kf(i,"scaleX",n+"sx",int(e-s),96,100)]
    return i+1

def add_line(A,i,s,e,x1,y1,x2,y2,c,n):
    L=math.hypot(x2-x1,y2-y1); ang=math.degrees(math.atan2(y2-y1,x2-x1))
    A += [rect(i,n,s,e,x1,y1-2,L,4,c,ang),kf(i,"opacity",n+"op",int(e-s),0,100),kf(i,"scaleX",n+"sx",int(e-s),0,100)]
    return i+1

def add_node(A,i,s,e,x,y,z,c,n):
    A += [rect(i,n,s,e,x,y,z,z,c),kf(i,"opacity",n+"op",int(e-s),0,100),kf(i,"scaleX",n+"sx",int(e-s),35,100),kf(i,"scaleY",n+"sy",int(e-s),35,100)]
    return i+1

def bounds(d):
    out=[0]; a=0
    for w in WORDS[:-1]:
        a+=w; out.append(round(d*a/TOTAL_WORDS))
    out.append(d); out[1]=max(out[1],2500); out[-2]=min(out[-2],max(0,d-2400))
    r=[(max(0,a),max(a+900,b)) for a,b in zip(out[:-1],out[1:])]; r[-1]=(r[-1][0],d); return r

def main(tsrct,voice,root):
    root=Path(root); audio=root/"Audio"; assets=root/"Assets"; sdir=root/"SFX"; prev=root/"Previews"; work=root/".tesseract-work"; vers=root/"Versions"
    for d in (audio,assets,sdir,prev,work,vers): d.mkdir(parents=True,exist_ok=True)
    voice=Path(voice)
    assert voice.stat().st_size==VOICE_BYTES
    sha=subprocess.check_output(["sha256sum",str(voice)],text=True).split()[0]; assert sha==VOICE_SHA256, sha
    d=dur_ms(voice); shutil.copy2(voice,audio/"Original_Voiceover.mp3")
    (work/"source_sha256.txt").write_text(sha+"\n"+str(d)+"\n")
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(voice),"-filter_complex","showwavespic=s=1080x360:colors=white","-frames:v","1",str(prev/"Voiceover_Waveform.png")],check=True)
    project=root/"Clipback_CLIP_Motion_Design.tsrct"; sh([tsrct,"project","create","--project",str(project)])
    sh([tsrct,"project","import-asset","--project",str(project),"--file",str(voice),"--asset-id","master-voiceover","--kind","audio"])
    font_root=Path("/usr/share/fonts/truetype"); reg=font_root/"dejavu"/"DejaVuSans.ttf"; bold=font_root/"dejavu"/"DejaVuSans-Bold.ttf"; assert reg.exists() and bold.exists(), "DejaVu Sans fonts missing"
    rg=j(sh([tsrct,"project","import-font","--project",str(project),"--file",str(reg)]).stdout); bd=j(sh([tsrct,"project","import-font","--project",str(project),"--file",str(bold)]).stdout)
    F=(bd["fontFamily"],bd["fontStyle"]); FR=(rg["fontFamily"],rg["fontStyle"])
    for fn,kind,ms in [("whoosh.wav","whoosh",520),("click.wav","click",95),("ping.wav","ping",210),("pulse.wav","pulse",260),("impact.wav","impact",320)]:
        p=sdir/fn; sfx(p,kind,ms); sh([tsrct,"project","import-asset","--project",str(project),"--file",str(p),"--asset-id",kind,"--kind","audio"])
    A=[]; i=1; B=bounds(d)
    A.append(rect(i,"Background",0,d,0,0,1080,1920,BG)); i+=1
    for x in [90,270,450,630,810,990]: A.append(rect(i,"GridV",0,d,x,0,2,1920,GRID)); i+=1
    for y in [120,360,600,840,1080,1320,1560,1800]: A.append(rect(i,"GridH",0,d,0,y,1080,2,GRID)); i+=1

    s,e=B[0]; pts=[(210,560),(420,390),(700,420),(880,620),(540,760)]
    for q,(a,b) in enumerate([(0,1),(1,2),(2,3),(1,4),(4,3),(0,4)]): i=add_line(A,i,s+160,e,pts[a][0],pts[a][1],pts[b][0],pts[b][1],BLUE if q%2==0 else INDIGO,f"S1L{q}")
    for q,(x,y) in enumerate(pts): i=add_node(A,i,s+260+q*80,e,x-10,y-10,20,OFF if q%2==0 else BLUE,f"S1N{q}")
    i=add_text(A,i,s+650,e,90,780,900,150,"CLIPBACK",116,OFF,F[0],F[1],"S1Title")
    i=add_text(A,i,s+900,e,170,955,740,50,"CREATOR CONTENT / REWARD SYSTEM",24,MUTED,FR[0],FR[1],"S1Sub")

    s,e=B[1]; i=add_text(A,i,s,e,90,140,900,90,"CONTENT-FOCUSED PLATFORM",54,OFF,F[0],F[1],"S2Head")
    for q,(lab,x,y,col) in enumerate([("CREATOR",110,430,INDIGO),("CONTENT",570,430,BLUE),("CAMPAIGN",110,860,VIOLET),("REWARD",570,860,INDIGO)]):
        A += [rect(i,f"S2C{q}",s+180,e,x,y,400,250,[.10,.115,.155,1]),kf(i,"opacity",f"S2C{q}o",int(e-(s+180)),0,100),kf(i,"positionY",f"S2C{q}y",int(e-(s+180)),y+60,y)]; i+=1
        A += [rect(i,f"S2A{q}",s+280,e,x+28,y+30,7,190,col),kf(i,"opacity",f"S2A{q}o",int(e-(s+280)),0,100)]; i+=1
        i=add_text(A,i,s+360+q*80,e,x+60,y+75,310,90,lab,44,OFF,F[0],F[1],f"S2T{q}")
    for q,(x1,y1,x2,y2,c) in enumerate([(510,555,570,555,BLUE),(760,680,760,860,VIOLET),(310,680,310,860,INDIGO),(510,985,570,985,BLUE)]): i=add_line(A,i,s+500+q*150,e,x1,y1,x2,y2,c,f"S2L{q}")

    s,e=B[2]; i=add_text(A,i,s,e,90,140,900,100,"FROM CONTENT ACTIVITY TO CREATOR FEES",50,OFF,F[0],F[1],"S3Head")
    i=add_text(A,i,s+350,e,100,640,370,80,"CONTENT ACTIVITY",34,OFF,F[0],F[1],"S3C")
    i=add_text(A,i,s+600,e,610,640,380,80,"CREATOR FEES",34,OFF,F[0],F[1],"S3F")
    i=add_line(A,i,s+450,e,470,680,610,680,BLUE,"S3Flow"); i=add_node(A,i,s+850,e,515,930,30,OFF,"S3Split")
    i=add_line(A,i,s+980,e,530,960,310,1140,INDIGO,"S3_80"); i=add_line(A,i,s+1080,e,560,960,770,1140,BLUE,"S3_20")
    i=add_text(A,i,s+900,e,170,1165,740,60,"DIVIDED INTO TWO PARTS",30,MUTED,FR[0],FR[1],"S3Div")

    s,e=B[3]; i=add_text(A,i,s,e,90,120,900,90,"80 / 20 ALLOCATION",64,OFF,F[0],F[1],"S4Head")
    for q,(x,col,start) in enumerate([(90,BLUE,s+180),(570,VIOLET,s+260)]):
        A += [rect(i,f"S4P{q}",start,e,x,395,420,860,[.10,.12,.17,1]),kf(i,"opacity",f"S4P{q}o",int(e-start),0,100),kf(i,"positionY",f"S4P{q}y",int(e-start),455,395)]; i+=1
    i=add_text(A,i,s+330,e,125,450,350,150,"80%",108,OFF,F[0],F[1],"S480")
    i=add_text(A,i,s+500,e,125,610,350,190,"CONTENT REWARD CAMPAIGN",42,BLUE,F[0],F[1],"S480L")
    i=add_line(A,i,s+700,e,205,860,380,1050,BLUE,"S480a"); i=add_line(A,i,s+850,e,380,1050,380,1170,BLUE,"S480b"); i=add_node(A,i,s+970,e,366,1180,28,BLUE,"S480End")
    i=add_text(A,i,s+420,e,605,450,350,150,"20%",108,OFF,F[0],F[1],"S420")
    i=add_text(A,i,s+590,e,605,620,350,80,"$CLIP",56,INDIGO,F[0],F[1],"S4CLIP")
    i=add_text(A,i,s+750,e,605,735,160,70,"BUY",38,BLUE,F[0],F[1],"S4BUY")
    i=add_text(A,i,s+900,e,815,735,160,70,"BURN",38,VIOLET,F[0],F[1],"S4BURN")
    i=add_line(A,i,s+800,e,765,770,815,770,BLUE,"S420L"); A.append(rect(i,"S4Token",s+1020,e,610,920,110,110,INDIGO)); A.append(kf(i,"scaleX","S4TokenX",int(e-(s+1020)),0,100)); A.append(kf(i,"scaleY","S4TokenY",int(e-(s+1020)),0,100)); i+=1
    A.append(rect(i,"S4BurnBar",s+1200,e,610,1070,110,6,VIOLET)); A.append(kf(i,"scaleX","S4Burn",int(e-(s+1200)),100,15)); i+=1

    s,e=B[4]; i=add_text(A,i,s,e,90,120,900,80,"CONNECTING THE SYSTEM",58,OFF,F[0],F[1],"S5Head")
    for q,(lab,x,col) in enumerate([("CREATOR",110,INDIGO),("CONTENT",300,BLUE),("FEES",500,OFF),("80%",700,BLUE),("20%",700,VIOLET),("$CLIP",900,INDIGO)]):
        y=700 if lab not in ("80%","20%") else (575 if lab=="80%" else 825); i=add_text(A,i,s+160+q*85,e,x,y,150,60,lab,32,col,F[0],F[1],f"S5{q}")
        if lab not in ("80%","20%"): i=add_line(A,i,s+280+q*70,e,x+150,y+5,x+200,y+5,col,f"S5L{q}")
    i=add_line(A,i,s+650,e,650,720,700,600,BLUE,"S5B1"); i=add_line(A,i,s+760,e,650,720,700,840,VIOLET,"S5B2")
    i=add_text(A,i,s+1050,e,120,1120,360,70,"CONTENT REWARDS",34,BLUE,F[0],F[1],"S5Rewards")
    i=add_text(A,i,s+1150,e,590,1120,370,70,"BUY -> BURN",34,VIOLET,F[0],F[1],"S5Burn")

    s,e=B[5]; i=add_text(A,i,s,e,90,150,900,80,"THE PLATFORM SYSTEM",58,OFF,F[0],F[1],"S6Head")
    for q,(x,y,col) in enumerate([(260,610,INDIGO),(820,610,BLUE),(900,1060,VIOLET),(180,1060,OFF)]):
        i=add_node(A,i,s+200+q*100,e,x-12,y-12,24,col,f"S6N{q}"); i=add_line(A,i,s+350+q*70,e,x,y,540,850,MUTED,f"S6L{q}")
    A += [rect(i,"S6Frame",s+500,e,330,650,420,380,[.10,.115,.16,1]),kf(i,"opacity","S6Frame",int(e-(s+500)),0,100)]; i+=1
    i=add_text(A,i,s+620,e,360,760,360,80,"CLIPBACK",58,OFF,F[0],F[1],"S6Clip")
    i=add_text(A,i,s+760,e,355,855,370,110,"CREATOR CONTENT + REWARD MECHANISM",28,MUTED,FR[0],FR[1],"S6Sub")

    s,e=B[6]; s=max(0,min(s,max(0,d-2400)))
    for q,(x,y,col) in enumerate([(140,500,BLUE),(940,500,INDIGO),(180,1320,VIOLET),(900,1320,BLUE),(540,330,MUTED),(540,1500,OFF)]):
        i=add_line(A,i,s+100,e,x,y,540,885,col,f"S7C{q}"); i=add_node(A,i,s+180+q*60,e,x-11,y-11,22,col,f"S7N{q}")
    A += [rect(i,"S7Core",s+420,e,400,745,280,280,[.10,.12,.17,1]),kf(i,"opacity","S7Core",int(e-(s+420)),0,100)]; i+=1
    i=add_text(A,i,s+580,e,195,800,690,150,"$CLIP",112,OFF,F[0],F[1],"S7Final")
    # Hold the final $CLIP on screen through the exact end frame.
    final_layer_id=i-1
    for item in reversed(A):
        if item.get("type")=="setFxPropertyKeyframes" and item.get("property",{}).get("layerId")==final_layer_id and item.get("property",{}).get("propertyType")=="opacity":
            item["keyframes"][-1]["value"]["value"]=100
            break

    ap=root/".tesseract-work/visual-actions.json"; ap.write_text(json.dumps(A,indent=2))
    sh([tsrct,"project","apply","--project",str(project),"--actions",str(ap)])
    ck=work/"editable.json"; sh([tsrct,"project","checkout","--project",str(project),"--output",str(ck)])
    doc=json.loads(ck.read_text()); doc["duration"]=d/1000.0; comp=doc["composition"]; layers=comp.setdefault("layers",[])
    layers.append({"id":9000,"name":"MASTER VOICEOVER","type":"Audio","playback":{"type":"windowed","inputRange":{"start":0,"duration":d},"mapping":{"type":"linear","input":{"start":0,"duration":d},"output":{"start":0,"duration":d}},"inputOffsetMs":0},"sourceRange":{"start":0,"duration":d},"sourceIntrinsicDuration":d,"source":{"assetId":"master-voiceover"},"volume":1.0,"captionsEnabled":False})
    defs=[("whoosh",B[0][0]+650,.13),("click",B[1][0]+500,.10),("ping",B[2][0]+900,.10),("whoosh",B[3][0]+650,.11),("pulse",B[4][0]+650,.09),("impact",max(0,d-850),.10)]
    for aid,(kind,start,vol) in enumerate(defs,9100):
        ms={"whoosh":520,"click":95,"ping":210,"pulse":260,"impact":320}[kind]; start=min(max(0,int(start)),max(0,d-ms))
        layers.append({"id":aid,"name":"SFX "+kind,"type":"Audio","playback":{"type":"windowed","inputRange":{"start":start,"duration":ms},"mapping":{"type":"linear","input":{"start":0,"duration":ms},"output":{"start":start,"duration":ms}},"inputOffsetMs":0},"sourceRange":{"start":0,"duration":ms},"sourceIntrinsicDuration":ms,"source":{"assetId":kind},"volume":vol,"captionsEnabled":False})
    ck.write_text(json.dumps(doc,indent=2)); sh([tsrct,"project","commit","--project",str(project),"--file",str(ck)])
    (assets/"Palette.txt").write_text("Charcoal / Off-white / Indigo / Electric Blue / Violet. Native Tesseract shapes and text. No stock imagery.")
    (assets/"Story_Structure.txt").write_text("Hook | Platform | Creator fees split | 80/20 allocation | System connection | Platform system | $CLIP convergence")
    sh([tsrct,"preview","--project",str(project),"--time",f"{min(4,max(.25,d/2000)):.3f}","--output",str(prev/"Clipback_Preview.png")])
    sh([tsrct,"filmstrip","--project",str(project),"--start-ms","0","--duration-ms",str(d),"--interval-ms",str(max(500,d//12)),"--tile-width","270","--tile-height","480","--items-per-row","4","--output",str(prev/"Clipback_Filmstrip.png")])
    final=root/"Clipback_CLIP_Motion_Design.mp4"
    sh([tsrct,"export","--project",str(project),"--resolution","1080p","--fps","30","--format","mp4","--encoder-backend","external-ffmpeg-command","--ffmpeg-path",shutil.which("ffmpeg"),"--output",str(final)])
    (vers/"v1.tsrct").write_bytes(project.read_bytes())
    (work/"render-notes.txt").write_text(f"GitHub source bytes: {VOICE_BYTES}\nGitHub source SHA-256: {sha}\nMeasured duration ms: {d}\nOriginal narration preserved at volume 1.0. No music. SFX are separate editable Audio layers.")
if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--tsrct",required=True); p.add_argument("--voiceover",required=True); p.add_argument("--project-root",required=True)
    a=p.parse_args(); main(a.tsrct,a.voiceover,a.project_root)
