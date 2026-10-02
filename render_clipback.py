from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, subprocess, os, sys
W,H=540,960; fps=30; dur=40.2
ff='/home/user/Hangman/.venv/bin/python'
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def F(size,b=False): return ImageFont.truetype(bold if b else font,size)
def ease(x): return x*x*(3-2*x)
def text_center(d,txt,y,size,fill=(235,241,247),b=False,spacing=0):
 f=F(size,b); box=d.textbbox((0,0),txt,font=f); d.text(((W-(box[2]-box[0]))/2,y),txt,font=f,fill=fill)
def line(d,pts,fill,width=2): d.line(pts,fill=fill,width=width,joint='curve')
def frame(t):
 im=Image.new('RGB',(W,H),(5,10,18)); px=im.load()
 # deep gradient and subtle grid
 for y in range(H):
  for x in range(W):
   r=math.hypot(x-W*.55,y-H*.42)/H
   px[x,y]=(5+int(7*(1-r)),10+int(11*(1-r)),18+int(19*(1-r)))
 d=ImageDraw.Draw(im,'RGBA')
 for x in range(0,W,45): d.line((x,0,x,H),fill=(80,130,180,10),width=1)
 for y in range(0,H,45): d.line((0,y,W,y),fill=(80,130,180,8),width=1)
 # ambient glow
 glow=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow)
 gd.ellipse((W*.12,H*.18,W*.88,H*.72),fill=(30,120,180,18)); glow=glow.filter(ImageFilter.GaussianBlur(90)); im=Image.alpha_composite(im.convert('RGBA'),glow); d=ImageDraw.Draw(im,'RGBA')
 cyan=(92,225,255,230); mint=(102,255,201,230); white=(239,245,250,245); muted=(149,174,194,190)
 # persistent signal rail
 y=H*.5
 d.line((48,y,W-48,y),fill=(75,164,205,65),width=2)
 # scene 1
 if t<4:
  p=ease(min(1,t/1.5)); x=42+(W-84)*p
  d.line((42,y,x,y),fill=cyan,width=3)
  d.ellipse((x-7,y-7,x+7,y+7),fill=cyan)
  a=ease(min(1,max(0,(t-1.0)/1.6)))
  text_center(d,'CLIPBACK',H*.36,40,(235,245,250,int(255*a)),True)
  text_center(d,'$CLIP',H*.45,58,(102,255,201,int(255*max(0,(t-2)/1.4))),True)
  text_center(d,'A CONTENT-FOCUSED SYSTEM',H*.61,13,(149,174,194,int(200*a)),False)
 # scene 2
 elif t<10:
  text_center(d,'CLIPBACK',105,28,white,True); text_center(d,'CREATORS  /  CONTENT  /  REWARDS',155,14,muted)
  nodes=[(105,360,'CREATORS'),(270,285,'CONTENT'),(435,360,'REWARDS')]
  for i,(x,yy,label) in enumerate(nodes):
   q=ease(min(1,max(0,(t-4-i*.25)/1.1))); yy2=yy+(1-q)*30
   d.rounded_rectangle((x-70,yy2-36,x+70,yy2+36),14,fill=(18,35,50,230),outline=(86,195,220,180),width=2)
   text_center(d,label,yy2-8,12,white,True)
  line(d,[(175,360),(235,310)],(90,210,230,150),2); line(d,[(305,310),(365,360)],(90,210,230,150),2)
  d.ellipse((245,500,295,550),outline=mint,width=2); text_center(d,'CONTENT ECOSYSTEM',590,15,mint,True)
 # scene 3
 elif t<16:
  text_center(d,'CREATOR FEES',160,34,white,True); text_center(d,'DIVIDED INTO TWO PARTS',210,14,muted)
  yy=460; d.line((60,yy,W-60,yy),fill=(59,120,150,100),width=3)
  p=ease(min(1,max(0,(t-10)/3.5))); xx=60+(W-120)*p
  for k in range(12):
   q=max(0,xx-k*12); d.ellipse((q-4,yy-4,q+4,yy+4),fill=(92,225,255,max(0,220-k*16)))
  d.ellipse((230,430,310,510),outline=cyan,width=3); d.ellipse((248,448,292,492),outline=(102,255,201,180),width=2)
  d.arc((210,410,330,530),-70,100,fill=mint,width=2)
  text_center(d,'SYSTEM NODE',570,13,muted)
 # scene 4
 elif t<25:
  text_center(d,'THE ALLOCATION',105,14,muted); cy=420; cx=270
  d.ellipse((cx-32,cy-32,cx+32,cy+32),fill=(20,45,60,255),outline=cyan,width=3)
  # paths, larger 80
  line(d,[(cx,cy),(110,620),(90,730)],(102,255,201,210),13); line(d,[(cx,cy),(430,590),(445,690)],(92,225,255,220),5)
  for n,(x,yv,lab,col,sz) in enumerate([(90,760,'CONTENT REWARDS',mint,14),(445,720,'$CLIP',cyan,30)]):
   q=ease(min(1,max(0,(t-16-n*.2)/1.7))); d.ellipse((x-7,yv-7,x+7,yv+7),fill=col)
   f=F(sz,True); d.text((x-(d.textbbox((0,0),lab,font=f)[2])/2,yv+30),lab,font=f,fill=white)
  text_center(d,'80%',545,64,mint,True); text_center(d,'20%',505,30,cyan,True)
  if t>21: text_center(d,'BUY + BURN',835,16,white,True)
 # scene 5
 elif t<31:
  text_center(d,'THE BASIC IDEA',115,14,muted); text_center(d,'CREATOR FEES',235,30,white,True)
  text_center(d,'↓',310,34,mint,True); text_center(d,'CONTENT REWARDS',370,25,mint,True)
  d.line((145,470,395,470),fill=(90,210,230,160),width=2); text_center(d,'+  $CLIP  MECHANISM',500,20,cyan,True)
  d.rounded_rectangle((95,610,445,680),18,outline=(90,210,230,130),width=2); text_center(d,'ONE CONNECTED SYSTEM',632,14,muted,True)
 # scene 6/7
 elif t<35:
  text_center(d,'CLIPBACK',105,34,white,True); text_center(d,'THE SYSTEM AROUND ITS PLATFORM',155,13,muted)
  cx,cy=270,490; d.ellipse((cx-75,cy-75,cx+75,cy+75),outline=mint,width=3)
  labels=[('CREATORS',270,300),('CONTENT',105,490),('REWARDS',270,680),('CREATOR FEES',425,490),('$CLIP',270,490)]
  for lab,x,yy in labels:
   if lab!='$CLIP':
    d.ellipse((x-62,yy-25,x+62,yy+25),fill=(16,34,48,230),outline=(92,225,255,140),width=2); f=F(11,True); d.text((x-d.textbbox((0,0),lab,font=f)[2]/2,yy-7),lab,font=f,fill=white)
   else: text_center(d,lab,cy-18,24,mint,True)
  for x,yv in [(270,325),(167,490),(270,655),(373,490)]: line(d,[(cx,cy),(x,yv)],(92,225,255,110),2)
 else:
  a=ease(min(1,max(0,(t-35)/1.2))); text_center(d,'$CLIP',H*.43,78,(102,255,201,int(255*a)),True); text_center(d,'CLIPBACK',H*.56,15,(174,205,220,int(220*a)),True)
 return im.convert('RGB')
# pipe frames to ffmpeg
ffbin='/home/user/Hangman/.venv/lib/python3.11/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
os.makedirs('media',exist_ok=True)
cmd=[ffbin,'-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(fps),'-i','-','-i','google_drive/Clipback_Justin.mp3','-t',str(dur),'-vf','scale=1080:1920:flags=lanczos','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-map','0:v:0','-map','1:a:0','-c:a','aac','-b:a','192k','-shortest','media/Clipback_CLIP_Motion_Design.mp4']
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for i in range(int(dur*fps)):
 p.stdin.write(frame(i/fps).tobytes())
p.stdin.close(); p.wait()
print('rendered',p.returncode)
