// Scene timeline for "Appointment Request Automation" (Northwind Studio). Times = seconds in the voiceover.
import { sHook, sBackForth, camBackForth, sCoord, sUnstructured, sManual, sBusy, sProblems, camProblems, sRevenue, sPivot } from './scenes_a.mjs';
import { sExtract, sAvail, camAvail, sMessages, sUnclear, sSafe, sApproval, sFailure, sOutcome, sClose, camClose } from './scenes_b.mjs';

export const SCENES = [
  { id: 'hook', t0: 0, t1: 7.45, inT: ['fade', 0.01], outT: ['zoom', 0.35], draw: sHook },
  { id: 'backforth', t0: 7.3, t1: 20.55, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sBackForth, cam: camBackForth },
  { id: 'coord', t0: 20.4, t1: 24.2, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sCoord },
  { id: 'unstructured', t0: 24.05, t1: 37.5, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sUnstructured },
  { id: 'manual', t0: 37.35, t1: 47.55, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sManual },
  { id: 'busy', t0: 47.4, t1: 51.25, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sBusy },
  { id: 'problems', t0: 51.1, t1: 62.6, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sProblems, cam: camProblems },
  { id: 'revenue', t0: 62.45, t1: 67.45, inT: ['slide', 0.45], outT: ['blur', 0.4], draw: sRevenue },
  { id: 'pivot', t0: 67.3, t1: 69.35, inT: ['blur', 0.5], outT: ['blur', 0.4], draw: sPivot },
  { id: 'extract', t0: 69.1, t1: 79.95, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sExtract },
  { id: 'avail', t0: 79.8, t1: 89.6, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sAvail, cam: camAvail },
  { id: 'messages', t0: 89.45, t1: 93.35, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sMessages },
  { id: 'unclear', t0: 93.2, t1: 101.75, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sUnclear },
  { id: 'safe', t0: 101.6, t1: 106.5, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sSafe },
  { id: 'approval', t0: 106.35, t1: 109.6, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sApproval },
  { id: 'failure', t0: 109.45, t1: 115.4, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sFailure },
  { id: 'outcome', t0: 115.25, t1: 136.05, inT: ['zoom', 0.45], outT: ['fade', 0.45], draw: sOutcome },
  { id: 'close', t0: 135.8, t1: 149.5, inT: ['fade', 0.5], outT: ['fade', 0.9], draw: sClose, cam: camClose },
];
export const END_T = 148.3;

// Section background keyframes (gradient sweep between palettes).
export const SECTIONS = [
  { t: 0, key: 'A' },
  { t: 67.4, d: 1.6, key: 'B' },
  { t: 101.55, d: 0.8, key: 'C' },
  { t: 115.1, d: 0.8, key: 'D' },
];
