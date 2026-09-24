// Scene timeline for "Daily Executive Operations Brief" (Northwind Services). Times = seconds in the voiceover.
import { sHook, sSwitching, sSpread, sReconstruct, sSlip, sRepetitive, sPivot } from './scenes_a.mjs';
import { sStepperLayer, sGenerate, sSummarize, sBrief, camBrief, sGroups, sSafe, sReview, sControls, sLogged, sFailure, sOutcome, sTrust, sFinal, camFinal } from './scenes_b.mjs';

export const SCENES = [
  { id: 'hook', t0: 0, t1: 3.75, inT: ['fade', 0.01], outT: ['zoom', 0.35], draw: sHook },
  { id: 'switching', t0: 3.6, t1: 15.15, inT: ['zoom', 0.45], outT: ['fade', 0.3], draw: sSwitching },
  { id: 'spread', t0: 15.0, t1: 27.8, inT: ['fade', 0.3], outT: ['slide', 0.45], draw: sSpread },
  { id: 'reconstruct', t0: 27.65, t1: 34.05, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sReconstruct },
  { id: 'slip', t0: 33.9, t1: 41.8, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sSlip },
  { id: 'repetitive', t0: 41.65, t1: 46.7, inT: ['slide', 0.45], outT: ['blur', 0.4], draw: sRepetitive },
  { id: 'pivot', t0: 46.55, t1: 48.75, inT: ['blur', 0.5], outT: ['blur', 0.4], draw: sPivot },
  { id: 'stepper', layer: true, t0: 48.6, t1: 62.3, inT: ['fade', 0.45], outT: ['zoom', 0.35], draw: sStepperLayer },
  { id: 'generate', t0: 48.6, t1: 58.25, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sGenerate },
  { id: 'summarize', t0: 58.1, t1: 62.3, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sSummarize },
  { id: 'brief', t0: 62.15, t1: 73.25, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sBrief, cam: camBrief },
  { id: 'groups', t0: 73.1, t1: 81.95, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sGroups },
  { id: 'safe', t0: 81.8, t1: 85.55, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sSafe },
  { id: 'review', t0: 85.4, t1: 92.05, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sReview },
  { id: 'controls', t0: 91.9, t1: 100.05, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sControls },
  { id: 'logged', t0: 99.9, t1: 108.05, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sLogged },
  { id: 'failure', t0: 107.9, t1: 116.5, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sFailure },
  { id: 'outcome', t0: 116.35, t1: 141.55, inT: ['zoom', 0.45], outT: ['fade', 0.45], draw: sOutcome },
  { id: 'trust', t0: 141.4, t1: 146.35, inT: ['fade', 0.5], outT: ['fade', 0.45], draw: sTrust },
  { id: 'final', t0: 146.2, t1: 156.0, inT: ['fade', 0.5], outT: ['fade', 0.9], draw: sFinal, cam: camFinal },
];
export const END_T = 154.4;

// Section background keyframes (gradient sweep between palettes).
export const SECTIONS = [
  { t: 0, key: 'A' },
  { t: 46.75, d: 1.6, key: 'B' },
  { t: 81.85, d: 0.8, key: 'C' },
  { t: 116.3, d: 0.8, key: 'D' },
];
