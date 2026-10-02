// montage a set of rendered frames into one wide review image
import fs from 'node:fs'; import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
const files = process.argv.slice(3);
const out = process.argv[2];
const imgs = await Promise.all(files.map(f => loadImage(f)));
const tw = 330, th = Math.round(330*1920/1080);
const c = createCanvas(tw*imgs.length, th);
const x = c.getContext('2d');
x.fillStyle='#111'; x.fillRect(0,0,c.width,c.height);
imgs.forEach((im,i)=>{ x.drawImage(im, i*tw, 0, tw, th);
  x.fillStyle='rgba(0,0,0,.7)'; x.fillRect(i*tw,0,96,24);
  x.fillStyle='#fff'; x.font='15px sans-serif';
  x.fillText(path.basename(files[i]).replace('f_','').replace('.png','').replace('_','.')+'s', i*tw+6, 17); });
fs.writeFileSync(out, c.toBuffer('image/png'));
console.log(out);
