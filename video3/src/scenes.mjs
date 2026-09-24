// Scene timeline for "AI Document Intake" (Northwind Repairs). Times = seconds in the voiceover.
import { sHook, sManualSteps, sEmail, sSheet, sInconsistent, sFormats, sMissing, sCosts, sBacklog, camBacklog, sPivot } from './scenes_a.mjs';
import { sStepperLayer, sArrive, sExtract, sWrite, sRoute, sReview, sDuplicate, sAudit, sFailure, sLinked, sOutcome, sTrust, sFinal, camFinal } from './scenes_b.mjs';

export const SCENES = [
  { id: 'hook', t0: 0, t1: 4.4, inT: ['fade', 0.01], outT: ['zoom', 0.35], draw: sHook },
  { id: 'manualSteps', layer: true, t0: 4.2, t1: 18.6, inT: ['fade', 0.45], outT: ['slide', 0.45], draw: sManualSteps },
  { id: 'email', t0: 4.2, t1: 9.45, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sEmail },
  { id: 'sheet', t0: 9.3, t1: 18.6, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sSheet },
  { id: 'inconsistent', t0: 18.45, t1: 25.9, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sInconsistent },
  { id: 'formats', t0: 25.75, t1: 29.6, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sFormats },
  { id: 'missing', t0: 29.45, t1: 38.3, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sMissing },
  { id: 'costs', t0: 38.15, t1: 47.85, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sCosts },
  { id: 'backlog', t0: 47.7, t1: 51.85, inT: ['slide', 0.45], outT: ['blur', 0.4], draw: sBacklog, cam: camBacklog },
  { id: 'pivot', t0: 51.7, t1: 53.6, inT: ['blur', 0.5], outT: ['blur', 0.4], draw: sPivot },
  { id: 'stepper', layer: true, t0: 53.4, t1: 65.95, inT: ['fade', 0.45], outT: ['zoom', 0.35], draw: sStepperLayer },
  { id: 'arrive', t0: 53.4, t1: 58.15, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sArrive },
  { id: 'extract', t0: 58.0, t1: 62.85, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sExtract },
  { id: 'write', t0: 62.7, t1: 65.95, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sWrite },
  { id: 'route', t0: 65.8, t1: 69.55, inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sRoute },
  { id: 'review', t0: 69.4, t1: 73.6, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sReview },
  { id: 'duplicate', t0: 73.45, t1: 77.7, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sDuplicate },
  { id: 'audit', t0: 77.55, t1: 80.5, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sAudit },
  { id: 'failure', t0: 80.35, t1: 83.7, inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sFailure },
  { id: 'linked', t0: 83.55, t1: 90.4, inT: ['slide', 0.45], outT: ['zoom', 0.35], draw: sLinked },
  { id: 'outcome', t0: 90.25, t1: 113.35, inT: ['zoom', 0.45], outT: ['fade', 0.45], draw: sOutcome },
  { id: 'trust', t0: 113.2, t1: 118.4, inT: ['fade', 0.5], outT: ['fade', 0.45], draw: sTrust },
  { id: 'final', t0: 118.25, t1: 128.5, inT: ['fade', 0.5], outT: ['fade', 0.9], draw: sFinal, cam: camFinal },
];
export const END_T = 127.0;

// Section background keyframes (gradient sweep between palettes).
export const SECTIONS = [
  { t: 0, key: 'A' },
  { t: 51.8, d: 1.6, key: 'B' },
  { t: 65.75, d: 0.8, key: 'C' },
  { t: 90.1, d: 0.8, key: 'D' },
];
