#!/usr/bin/env python3
import argparse, json, math, shutil, subprocess, wave
from pathlib import Path

VOICE_BYTES = 659887
VOICE_SHA256 = "f2ff9f0556b3b6cf2daadd67c061ba75f41a0451f4245cab6f9f570d6a51224f"

BG=[0.035,0.042,0.065,1]; OFF=[0.96,0.97,1,1]; MUTED=[0.47,0.52,0.63,1]
PANEL=[0.065,0.078,0.115,1]; PANEL2=[0.09,0.105,0.15,1]
GRID=[0.10,0.13,0.19,1]; INDIGO=[0.34,0.30,1,1]; BLUE=[0.05,0.72,1,1]
VIOLET=[0.72,0.38,1,1]; CYAN=[0.12,0.95,0.82,1]
WHITE_A=[0.96,0.97,1,0.10]; BLUE_A=[0.05,0.72,1,0.10]; VIOLET_A=[0.72,0.38,1,0.09]

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
    out=sh(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(p)]).stdout.strip()
    return int(round(float(out)*1000))

def sfx(path,kind,ms):
    sr=44100; n=max(1,int(sr*ms/1000)); buf=bytearray()
    for i in range(n):
        t=i/sr; p=i/max(1,n-1)
        if kind=="click": f=1850-650*p; e=math.exp(-11*t); v=math.sin(2*math.pi*f*t)*e
        elif kind=="ping": f=760+900*p; e=math.exp(-6*t); v=math.sin(2*math.pi*f*t)*e
        elif kind=="whoosh": f=130+1650*(p**1.8); e=math.sin(math.pi*p)**1.25; v=(math.sin(2*math.pi*f*t)+.28*math.sin(2*math.pi*1.6*f*t))*e
        elif kind=="pulse": f=190+100*p; e=math.sin(math.pi*p)**.85; v=math.sin(2*math.pi*f*t)*e
        else: f=115-40*p; e=math.exp(-8*t); v=math.sin(2*math.pi*f*t)*e
        buf += int(max(-1,min(1,v*.20))*32767).to_bytes(2,"little",signed=True)
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(buf)

def rect(i,n,s,e,x,y,w,h,c,r=0):
    return {"type":"createFxRectLayer","compositionId":"main","layerId":i,"name":n,"insertIndex":0,
            "activeRange":{"start":int(s),"duration":int(max(1,e-s))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":r,"opacity":100},
            "rect":{"size":[w,h],"fillColor":c}}

def txt(i,n,s,e,x,y,w,h,t,size,c,fam,sty):
    return {"type":"createFxTextLayer","compositionId":"main","layerId":i,"name":n,"insertIndex":0,
            "activeRange":{"start":int(s),"duration":int(max(1,e-s))},
            "transform":{"anchorPoint":[0,0],"position":[x,y],"scale":[100,100],"rotation":0,"opacity":100},
            "sourceText":{"text":t,"fontFamily":fam,"fontStyle":sty,"fontSize":size,"fillColor":c,
                          "justification":"center","boxText":True,"boxPosition":[0,0],"boxSize":[w,h]}}

def keyframe(A,i,prefix,p,keys):
    frames=[]
    for n,(t,v,mode) in enumerate(keys):
        easing={"type":"linear"} if mode=="linear" else {"type":"cubicBezier","x1":0.18,"y1":0,"x2":0.18,"y2":1}
        frames.append({"id":prefix+str(n),"layerTime":int(t),"value":{"type":"float","value":float(v)},"easing":easing})
    A.append({"type":"setFxPropertyKeyframes","compositionId":"main","property":{"layerId":i,"propertyType":p},"keyframes":frames})

def scalar_motion(A,i,prefix,xkeys,ykeys):
    # Tesseract 0.3.1 validates position as a paired spatial path. In the
    # headless renderer that action is currently rejected even for the
    # minimal valid shape, so preserve the intended energy with scalar
    # transform motion instead of unsupported positional tracks.
    times=[int(t) for t,_,_ in xkeys]
    assert times==[int(t) for t,_,_ in ykeys], (prefix,xkeys,ykeys)
    dur=times[-1] if times else 0
    if dur<=0:
        return
    xspan=max(v for _,v,_ in xkeys)-min(v for _,v,_ in xkeys) if xkeys else 0
    yspan=max(v for _,v,_ in ykeys)-min(v for _,v,_ in ykeys) if ykeys else 0
    amp=0.6 if (xspan==0 or yspan==0) else 4.0
    keyframe(A,i,prefix+"rot","rotation",[(0,-amp,"ease"),(dur//2,amp,"ease"),(dur,0,"ease")])
    if xspan>0 and yspan==0:
        keyframe(A,i,prefix+"pulse","scaleY",[(0,94,"ease"),(dur//2,104,"ease"),(dur,100,"ease")])
    elif yspan>0 and xspan==0:
        keyframe(A,i,prefix+"pulse","scaleX",[(0,94,"ease"),(dur//2,104,"ease"),(dur,100,"ease")])
    else:
        keyframe(A,i,prefix+"pulseX","scaleX",[(0,94,"ease"),(dur//3,102,"ease"),(int(dur*.66),98,"ease"),(dur,100,"ease")])
        keyframe(A,i,prefix+"pulseY","scaleY",[(0,94,"ease"),(dur//3,102,"ease"),(int(dur*.66),98,"ease"),(dur,100,"ease")])

def fade_in_out(A,i,dur,prefix,enter=320,exit=320):
    e=min(enter,max(1,dur//3)); x=max(e+1,dur-exit)
    keyframe(A,i,prefix+"o","opacity",[(0,0,"ease"),(e,100,"ease"),(x,100,"linear"),(dur,0,"ease")])

def reveal_text(A,i,s,e,x,y,w,h,t,size,c,fam,sty,n,enter=360):
    A.append(txt(i,n,s,e,x,y,w,h,t,size,c,fam,sty))
    dur=e-s
    fade_in_out(A,i,dur,n,enter,320)
    keyframe(A,i,n+"x","scaleX",[(0,96,"ease"),(min(400,dur//3),100,"ease"),(dur,100,"linear")])
    return i+1

def reveal_rect(A,i,s,e,x,y,w,h,c,n,enter=320):
    A.append(rect(i,n,s,e,x,y,w,h,c))
    dur=e-s; fade_in_out(A,i,dur,n,enter,300)
    keyframe(A,i,n+"x","scaleX",[(0,92,"ease"),(min(enter,dur//3),100,"ease"),(dur,100,"linear")])
    keyframe(A,i,n+"y","scaleY",[(0,92,"ease"),(min(enter,dur//3),100,"ease"),(dur,100,"linear")])
    return i+1

def line(A,i,s,e,x1,y1,x2,y2,c,n,th=5):
    L=math.hypot(x2-x1,y2-y1); ang=math.degrees(math.atan2(y2-y1,x2-x1))
    A.append(rect(i,n,s,e,x1,y1-th/2,L,th,c,ang))
    dur=e-s; fade_in_out(A,i,dur,n,280,260)
    keyframe(A,i,n+"x","scaleX",[(0,0,"ease"),(min(360,dur//3),100,"ease"),(dur,100,"linear")])
    return i+1

def dot(A,i,s,e,x,y,z,c,n,drift=70):
    A.append(rect(i,n,s,e,x,y,z,z,c))
    dur=e-s; fade_in_out(A,i,dur,n,300,260)
    scalar_motion(A,i,n+"pos",[(0,x-drift,"linear"),(dur//2,x+drift,"linear"),(dur,x-drift,"linear")],[(0,y+drift,"linear"),(dur//2,y-drift,"linear"),(dur,y+drift,"linear")])
    return i+1

def scene_tag(A,i,s,e,num,label,F,FR):
    i=reveal_text(A,i,s,e,70,78,80,36,f"{num:02d}",18,BLUE,F[0],F[1],f"TAGN{num}")
    i=reveal_text(A,i,s,e,170,78,840,36,label,17,MUTED,FR[0],FR[1],f"TAGL{num}")
    A.append(rect(i,f"TAGRULE{num}",s,e,70,126,940,2,GRID)); i+=1
    return i

def moving_particle(A,i,x,y,z,c,idx,d):
    A.append(rect(i,f"AMBIENT_{idx}",0,d,x,y,z,z,c))
    scalar_motion(A,i,f"ambpos{idx}",[(0,x,"linear"),(int(d*.33),x+95*((idx%3)-1),"linear"),(int(d*.66),x-70*((idx%2)+1),"linear"),(d,x+55*(1 if idx%2==0 else -1),"linear")],[(0,y,"linear"),(int(d*.33),y+80*((idx%2)-.5),"linear"),(int(d*.66),y-60*((idx%3)-1),"linear"),(d,y,"linear")])
    keyframe(A,i,f"ambo{idx}","opacity",[(0,c[3]*100,"linear"),(int(d*.5),min(20,c[3]*140+5),"linear"),(d,c[3]*100,"linear")])
    return i+1

def main(tsrct,voice,root):
    root=Path(root); audio=root/"Audio"; assets=root/"Assets"; sdir=root/"SFX"; prev=root/"Previews"; work=root/".tesseract-work"; vers=root/"Versions"
    for folder in (audio,assets,sdir,prev,work,vers): folder.mkdir(parents=True,exist_ok=True)

    voice=Path(voice)
    assert voice.stat().st_size==VOICE_BYTES
    sha=subprocess.check_output(["sha256sum",str(voice)],text=True).split()[0]; assert sha==VOICE_SHA256, sha
    duration=dur_ms(voice)
    d=duration
    shutil.copy2(voice,audio/"Original_Voiceover.mp3")
    (work/"source_sha256.txt").write_text(sha+"\n"+str(duration)+"\n")
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(voice),"-filter_complex","showwavespic=s=1080x360:colors=white","-frames:v","1",str(prev/"Voiceover_Waveform.png")],check=True)

    project=root/"Clipback_CLIP_Motion_Design.tsrct"
    if project.exists(): project.unlink()
    sh([tsrct,"project","create","--project",str(project)])
    sh([tsrct,"project","import-asset","--project",str(project),"--file",str(voice),"--asset-id","master-voiceover","--kind","audio"])

    reg_path=subprocess.check_output(["bash","-lc","fc-match -f '%{file}\n' 'Inter:style=Regular' | head -n1"],text=True).strip()
    bold_path=subprocess.check_output(["bash","-lc","fc-match -f '%{file}\n' 'Inter:style=Bold' | head -n1"],text=True).strip()
    reg=Path(reg_path); bold=Path(bold_path); assert reg.exists() and bold.exists(), (reg,bold)
    regular=j(sh([tsrct,"project","import-font","--project",str(project),"--file",str(reg)]).stdout)
    boldf=j(sh([tsrct,"project","import-font","--project",str(project),"--file",str(bold)]).stdout)
    F=(boldf["fontFamily"],boldf["fontStyle"]); FR=(regular["fontFamily"],regular["fontStyle"])

    for fn,kind,ms in [("whoosh.wav","whoosh",520),("click.wav","click",95),("ping.wav","ping",210),("pulse.wav","pulse",260),("impact.wav","impact",320)]:
        p=sdir/fn; sfx(p,kind,ms)
        sh([tsrct,"project","import-asset","--project",str(project),"--file",str(p),"--asset-id",kind,"--kind","audio"])

    A=[]; i=1
    # Always-on animated background.
    A.append(rect(i,"Background",0,d,0,0,1080,1920,BG)); i+=1
    for q,x in enumerate([70,245,420,595,770,945]):
        A.append(rect(i,f"GRIDV{q}",0,d,x,0,2,1920,GRID))
        scalar_motion(A,i,f"gv{q}",[(0,x,"linear"),(int(d*.5),x+(8 if q%2==0 else -8),"linear"),(d,x-(5 if q%3 else -5),"linear")],[(0,0,"linear"),(int(d*.5),0,"linear"),(d,0,"linear")]); i+=1
    for q,y in enumerate([150,430,710,990,1270,1550,1830]):
        A.append(rect(i,f"GRIDH{q}",0,d,0,y,1080,2,GRID))
        scalar_motion(A,i,f"gh{q}",[(0,0,"linear"),(int(d*.5),0,"linear"),(d,0,"linear")],[(0,y,"linear"),(int(d*.5),y+(6 if q%2==0 else -6),"linear"),(d,y-(4 if q%3 else -4),"linear")]); i+=1
    for q,(x,y,z,c) in enumerate([(100,290,18,BLUE_A),(890,250,28,VIOLET_A),(180,980,14,WHITE_A),(830,1120,24,BLUE_A),(320,1510,24,VIOLET_A),(950,1600,15,WHITE_A),(520,240,12,[0.12,0.95,0.82,0.08])]):
        i=moving_particle(A,i,x,y,z,c,q,d)
    for q,(x,y,h,c) in enumerate([(24,340,230,BLUE_A),(1046,570,270,VIOLET_A),(36,1160,170,CYAN),(1038,1400,240,BLUE_A)]):
        A.append(rect(i,f"EDGEBAR{q}",0,d,x,y,4,h,c))
        scalar_motion(A,i,f"eb{q}",[(0,x,"linear"),(int(d*.5),x+(20 if q%2==0 else -20),"linear"),(d,x,"linear")],[(0,y,"linear"),(int(d*.5),y,"linear"),(d,y,"linear")])
        keyframe(A,i,f"eb{q}o","opacity",[(0,18,"linear"),(int(d*.5),55,"linear"),(d,18,"linear")]); i+=1

    # SCENE 1
    s,e=0,5600; i=scene_tag(A,i,s,e,1,"HOOK / THE CREATOR REWARD LOOP",F,FR)
    for q,(x,y,c) in enumerate([(140,520,BLUE),(940,520,VIOLET),(170,1250,CYAN),(910,1240,BLUE),(540,400,OFF),(540,1390,VIOLET)]):
        i=line(A,i,s+120,e,x,y,540,900,c,f"S1LINE{q}",4)
        i=dot(A,i,s+220,e,x-10,y-10,20,c,f"S1DOT{q}",100)
    i=reveal_text(A,i,s+500,e,70,760,940,150,"CLIPBACK",122,OFF,F[0],F[1],"S1TITLE")
    i=reveal_text(A,i,s+980,e,130,940,820,70,"CREATOR CONTENT / REWARD SYSTEM",28,BLUE,FR[0],FR[1],"S1SUB")
    A.append(rect(i,"S1SCAN",s+1500,e,90,1140,900,5,BLUE_A))
    scalar_motion(A,i,"s1scan",[(0,90,"ease"),(1200,90,"ease"),(2400,90,"ease"),(3600,90,"ease"),(e-s,90,"ease")],[(0,1140,"ease"),(1200,1380,"ease"),(2400,1140,"ease"),(3600,1380,"ease"),(e-s,1140,"ease")])
    i+=1
    i=reveal_text(A,i,s+1750,e,220,1320,640,45,"CREATOR  →  CONTENT  →  REWARD",21,MUTED,FR[0],FR[1],"S1FLOW")

    # SCENE 2
    s,e=4800,10800; i=scene_tag(A,i,s,e,2,"CONTENT-FOCUSED PLATFORM",F,FR)
    i=reveal_text(A,i,s+120,e,70,230,940,110,"A PLATFORM BUILT AROUND CONTENT",56,OFF,F[0],F[1],"S2HEAD")
    cards=[("CREATOR",80,520,INDIGO,380,210),("CONTENT",600,440,BLUE,400,210),("CAMPAIGN",105,980,VIOLET,380,210),("REWARD",575,950,CYAN,420,210)]
    for q,(lab,x,y,c,w,h) in enumerate(cards):
        st=s+230+q*150
        i=reveal_rect(A,i,st,e,x,y,w,h,PANEL,f"S2CARD{q}")
        i=reveal_rect(A,i,st+120,e,x+20,y+20,6,h-40,c,f"S2ACC{q}",240)
        i=reveal_text(A,i,st+200,e,x+48,y+50,w-70,60,lab,38,OFF,F[0],F[1],f"S2TXT{q}")
        A.append(rect(i,f"S2MICRO{q}",st+340,e,x+48,y+145,w-100,3,c)); keyframe(A,i,f"s2m{q}","scaleX",[(0,0,"ease"),(350,100,"ease"),(e-st,100,"linear")]); i+=1
    # Scan line sweeps through the cards twice.
    A.append(rect(i,"S2SCAN",s+900,e,70,400,940,5,BLUE_A)); scalar_motion(A,i,"s2scan",[(0,70,"ease"),(1100,70,"ease"),(2200,70,"ease"),(3300,70,"ease"),(e-s,70,"ease")],[(0,400,"ease"),(1100,1290,"ease"),(2200,400,"ease"),(3300,1290,"ease"),(e-s,400,"ease")]); i+=1
    # Moving focus cursor.
    A.append(rect(i,"S2CURSOR",s+1150,e,515,655,14,14,OFF)); scalar_motion(A,i,"s2cursor",[(0,515,"ease"),(800,760,"ease"),(1600,300,"ease"),(2400,760,"ease"),(e-s,515,"ease")],[(0,655,"ease"),(800,570,"ease"),(1600,1060,"ease"),(2400,1010,"ease"),(e-s,655,"ease")]); i+=1

    # SCENE 3
    s,e=10000,15000; i=scene_tag(A,i,s,e,3,"CONTENT ACTIVITY → CREATOR FEES",F,FR)
    i=reveal_text(A,i,s+100,e,80,230,920,105,"FROM ACTIVITY TO FEES",64,OFF,F[0],F[1],"S3HEAD")
    i=reveal_text(A,i,s+430,e,70,620,390,70,"CONTENT ACTIVITY",34,BLUE,F[0],F[1],"S3C")
    i=reveal_text(A,i,s+650,e,620,620,390,70,"CREATOR FEES",34,OFF,F[0],F[1],"S3F")
    i=line(A,i,s+520,e,455,660,625,660,BLUE,"S3FLOW",6)
    for q in range(4):
        A.append(rect(i,f"S3PACKET{q}",s+720,e,470,654,20,12,OFF))
        scalar_motion(A,i,f"s3pos{q}",[(0,470+q*18,"ease"),(750,625+q*18,"ease"),(1500,470+q*18,"ease"),(e-s,625+q*18,"linear")],[(0,654,"ease"),(750,654,"ease"),(1500,654,"ease"),(e-s,654,"linear")]); i+=1
    i=dot(A,i,s+1100,e,525,930,34,OFF,"S3SPLIT",70)
    i=line(A,i,s+1260,e,540,960,300,1180,INDIGO,"S380",6)
    i=line(A,i,s+1360,e,560,960,780,1180,VIOLET,"S320",6)
    i=reveal_text(A,i,s+1750,e,180,1210,300,70,"80%",46,BLUE,F[0],F[1],"S380T")
    i=reveal_text(A,i,s+1850,e,600,1210,300,70,"20%",46,VIOLET,F[0],F[1],"S320T")

    # SCENE 4
    s,e=14200,22500; i=scene_tag(A,i,s,e,4,"80 / 20 ALLOCATION",F,FR)
    i=reveal_text(A,i,s+100,e,70,230,940,105,"THE REWARD SPLIT",64,OFF,F[0],F[1],"S4HEAD")
    A.append(rect(i,"S4BARBG",s+560,e,70,620,940,115,PANEL2)); i+=1
    A.append(rect(i,"S480FILL",s+720,e,70,620,752,115,BLUE)); keyframe(A,i,"s480","scaleX",[(0,0,"ease"),(700,100,"ease"),(e-s,100,"linear")]); i+=1
    A.append(rect(i,"S420FILL",s+1080,e,822,620,188,115,VIOLET)); keyframe(A,i,"s420","scaleX",[(0,0,"ease"),(700,100,"ease"),(e-s,100,"linear")]); i+=1
    i=reveal_text(A,i,s+760,e,120,785,300,110,"80%",94,OFF,F[0],F[1],"S480TXT")
    i=reveal_text(A,i,s+1160,e,748,785,250,110,"20%",82,OFF,F[0],F[1],"S420TXT")
    i=reveal_text(A,i,s+1300,e,90,960,900,70,"CONTENT REWARD CAMPAIGN",30,BLUE,F[0],F[1],"S480LBL")
    i=reveal_text(A,i,s+1560,e,90,1060,900,82,"$CLIP",58,INDIGO,F[0],F[1],"S4CLIP")
    i=reveal_text(A,i,s+1820,e,90,1170,360,65,"BUY",34,BLUE,F[0],F[1],"S4BUY")
    i=reveal_text(A,i,s+1900,e,600,1170,360,65,"BURN",34,VIOLET,F[0],F[1],"S4BURN")
    for q in range(6):
        A.append(rect(i,f"S4TOKEN{q}",s+2050+q*65,e,135+q*48,1340,24,24,INDIGO))
        scalar_motion(A,i,f"s4pos{q}",[(0,135+q*48,"ease"),(800,650+q*35,"ease"),(1500,850+q*15,"ease"),(e-s,930,"linear")],[(0,1340,"linear"),(800,1280-q*20,"ease"),(1500,1370,"ease"),(e-s,1320,"linear")]); i+=1
    i=reveal_text(A,i,s+2250,e,190,1470,700,60,"BUY  →  BURN  →  VALUE LOOP",23,MUTED,FR[0],FR[1],"S4FOOT")

    # SCENE 5
    s,e=21700,28500; i=scene_tag(A,i,s,e,5,"CONNECTING THE SYSTEM",F,FR)
    i=reveal_text(A,i,s+100,e,70,230,940,105,"ONE LOOP. MULTIPLE TOUCHPOINTS.",52,OFF,F[0],F[1],"S5HEAD")
    nodes=[("CREATOR",110,700,INDIGO),("CONTENT",300,590,BLUE),("FEES",500,700,OFF),("80%",700,590,BLUE),("20%",700,850,VIOLET),("$CLIP",885,700,INDIGO)]
    for q,(lab,x,y,c) in enumerate(nodes):
        i=reveal_rect(A,i,s+220+q*110,e,x,y,155,88,PANEL,f"S5BOX{q}")
        i=reveal_text(A,i,s+300+q*110,e,x,y+19,155,45,lab,24,c,F[0],F[1],f"S5TXT{q}",260)
    links=[(265,744,300,634,INDIGO),(455,634,500,744,BLUE),(655,744,700,634,BLUE),(655,744,700,894,VIOLET),(855,634,885,744,INDIGO)]
    for q,(x1,y1,x2,y2,c) in enumerate(links):
        i=line(A,i,s+580+q*120,e,x1,y1,x2,y2,c,f"S5LINK{q}",4)
        A.append(rect(i,f"S5PKT{q}",s+900+q*120,e,x1,y1,16,16,OFF))
        scalar_motion(A,i,f"s5pos{q}",[(0,x1,"ease"),(900,x2,"ease"),(1800,x1,"ease"),(e-s,x2,"ease")],[(0,y1,"ease"),(900,y2,"ease"),(1800,y1,"ease"),(e-s,y2,"ease")]); i+=1
    i=reveal_text(A,i,s+3150,e,80,1190,430,65,"CONTENT REWARDS",31,BLUE,F[0],F[1],"S5R")
    i=reveal_text(A,i,s+3350,e,560,1190,430,65,"BUY  →  BURN",31,VIOLET,F[0],F[1],"S5B")

    # SCENE 6
    s,e=27700,34500; i=scene_tag(A,i,s,e,6,"THE PLATFORM SYSTEM",F,FR)
    i=reveal_text(A,i,s+100,e,70,230,940,100,"ALL ROADS LEAD BACK TO THE PLATFORM",48,OFF,F[0],F[1],"S6HEAD")
    i=reveal_rect(A,i,s+430,e,315,640,450,430,PANEL,"S6CORE")
    i=reveal_rect(A,i,s+720,e,340,660,400,5,BLUE,"S6TOP",230)
    i=reveal_rect(A,i,s+840,e,340,1048,400,4,VIOLET,"S6BOT",230)
    i=reveal_text(A,i,s+1030,e,360,770,360,75,"CLIPBACK",58,OFF,F[0],F[1],"S6CLIP")
    i=reveal_text(A,i,s+1240,e,350,872,380,120,"CREATOR CONTENT\n+ REWARD MECHANISM",27,MUTED,FR[0],FR[1],"S6SUB")
    for q,(x,y,z,c) in enumerate([(225,670,18,BLUE),(855,670,18,VIOLET),(240,1090,15,CYAN),(840,1090,15,BLUE),(540,500,14,OFF)]):
        i=dot(A,i,s+540+q*110,e,x,y,z,c,f"S6ORB{q}",80)
        i=line(A,i,s+850+q*100,e,x,y,540,855,c,f"S6LINE{q}",3)

    # SCENE 7
    s,e=33700,d; i=scene_tag(A,i,s,e,7,"$CLIP / CONVERGENCE",F,FR)
    i=reveal_text(A,i,s+80,e,70,230,940,95,"THE LOOP ENDS WHERE IT STARTS",48,MUTED,F[0],F[1],"S7HEAD")
    targets=[(130,600,BLUE),(950,600,INDIGO),(170,1320,VIOLET),(910,1320,CYAN),(540,470,OFF),(540,1460,BLUE)]
    for q,(x,y,c) in enumerate(targets):
        i=line(A,i,s+100+q*110,e,x,y,540,935,c,f"S7LINE{q}",5)
        A.append(rect(i,f"S7PACKET{q}",s+250+q*90,e,x,y,20,20,c))
        scalar_motion(A,i,f"s7pos{q}",[(0,x,"ease"),(850,540,"ease"),(1800,540,"ease"),(e-s,540,"linear")],[(0,y,"ease"),(850,935,"ease"),(1800,935,"ease"),(e-s,935,"linear")]); i+=1
    i=reveal_rect(A,i,s+500,e,395,770,290,300,PANEL,"S7CORE",380)
    i=reveal_text(A,i,s+820,e,180,835,720,150,"$CLIP",124,OFF,F[0],F[1],"S7FINAL",)
    final_id=i-1
    # Final text stays visible, with a subtle pulse instead of a fade-out.
    for k in list(A):
        if k.get("type")=="setFxPropertyKeyframes" and k.get("property",{}).get("layerId")==final_id and k.get("property",{}).get("propertyType")=="opacity":
            dur=e-(s+820); k["keyframes"]=[{"id":"finalop0","layerTime":0,"value":{"type":"float","value":0},"easing":{"type":"linear"}},
                                           {"id":"finalop1","layerTime":380,"value":{"type":"float","value":100},"easing":{"type":"cubicBezier","x1":.18,"y1":0,"x2":.18,"y2":1}},
                                           {"id":"finalop2","layerTime":dur,"value":{"type":"float","value":100},"easing":{"type":"linear"}}]
    keyframe(A,final_id,"s7sx","scaleX",[(0,92,"ease"),(420,103,"ease"),(900,98,"linear"),(1400,103,"ease"),(2200,100,"linear"),(e-(s+820),100,"linear")])
    keyframe(A,final_id,"s7sy","scaleY",[(0,92,"ease"),(420,103,"ease"),(900,98,"linear"),(1400,103,"ease"),(2200,100,"linear"),(e-(s+820),100,"linear")])
    i=reveal_text(A,i,s+1550,e,220,1040,640,55,"CREATOR CONTENT  •  REWARD MECHANISM",22,BLUE,FR[0],FR[1],"S7SUB")
    i=reveal_text(A,i,s+2050,e,300,1135,480,55,"BUY  →  BURN",26,VIOLET,F[0],F[1],"S7FOOT")

    actions=work/"visual-actions.json"; actions.write_text(json.dumps(A,indent=2))
    sh([tsrct,"project","apply","--project",str(project),"--actions",str(actions)])
    checked=work/"editable.json"; sh([tsrct,"project","checkout","--project",str(project),"--output",str(checked)])
    doc=json.loads(checked.read_text()); doc["duration"]=duration/1000.0; layers=doc["composition"].setdefault("layers",[])
    layers.append({"id":9000,"name":"MASTER VOICEOVER","type":"Audio","playback":{"type":"windowed","inputRange":{"start":0,"duration":duration},"mapping":{"type":"linear","input":{"start":0,"duration":duration},"output":{"start":0,"duration":duration}},"inputOffsetMs":0},"sourceRange":{"start":0,"duration":duration},"sourceIntrinsicDuration":duration,"source":{"assetId":"master-voiceover"},"volume":1.0,"captionsEnabled":False})
    defs=[("whoosh",450,.12),("click",5050,.09),("ping",10500,.10),("whoosh",14500,.11),("pulse",22400,.09),("whoosh",28200,.10),("impact",max(0,duration-900),.11)]
    for aid,(kind,start,vol) in enumerate(defs,9100):
        ms={"whoosh":520,"click":95,"ping":210,"pulse":260,"impact":320}[kind]
        start=min(max(0,int(start)),max(0,duration-ms))
        layers.append({"id":aid,"name":"SFX "+kind,"type":"Audio","playback":{"type":"windowed","inputRange":{"start":start,"duration":ms},"mapping":{"type":"linear","input":{"start":0,"duration":ms},"output":{"start":start,"duration":ms}},"inputOffsetMs":0},"sourceRange":{"start":0,"duration":ms},"sourceIntrinsicDuration":ms,"source":{"assetId":kind},"volume":vol,"captionsEnabled":False})
    checked.write_text(json.dumps(doc,indent=2))
    sh([tsrct,"project","commit","--project",str(project),"--file",str(checked)])

    (assets/"Palette.txt").write_text("Graphite base + off-white + electric blue + indigo + violet + cyan. All graphics remain native/editable Tesseract text and shapes.")
    (assets/"Story_Structure.txt").write_text("Kinetic hook | floating content dashboard | activity-to-fees transform | proportional 80/20 bar | connected system | platform reveal | $CLIP convergence")
    sh([tsrct,"preview","--project",str(project),"--time",f"{min(4,max(.25,duration/2500)):.3f}","--output",str(prev/"Clipback_Preview.png")])
    sh([tsrct,"filmstrip","--project",str(project),"--start-ms","0","--duration-ms",str(duration),"--interval-ms",str(max(450,duration//14)),"--tile-width","270","--tile-height","480","--items-per-row","4","--output",str(prev/"Clipback_Filmstrip.png")])
    final=root/"Clipback_CLIP_Motion_Design.mp4"
    sh([tsrct,"export","--project",str(project),"--resolution","1080p","--fps","30","--format","mp4","--encoder-backend","external-ffmpeg-command","--ffmpeg-path",shutil.which("ffmpeg"),"--output",str(final)])
    (vers/"v2.tsrct").write_bytes(project.read_bytes())
    (work/"render-notes.txt").write_text(f"GitHub source bytes: {VOICE_BYTES}\nGitHub source SHA-256: {sha}\nMeasured duration ms: {duration}\nV2 visual redesign: continuous ambient mesh, kinetic dashboard, proportional fee allocation, animated packets, platform reveal and final convergence. No music. SFX are separate editable Audio layers.")

if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--tsrct",required=True); p.add_argument("--voiceover",required=True); p.add_argument("--project-root",required=True)
    a=p.parse_args(); main(a.tsrct,a.voiceover,a.project_root)
