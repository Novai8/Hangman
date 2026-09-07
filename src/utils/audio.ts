class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Load preference from localStorage if available
    const saved = localStorage.getItem('cyber_hangman_sfx');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('cyber_hangman_sfx', String(this.enabled));
    if (this.enabled) {
      this.playTone(800, 'sine', 0.08, 0.1);
    }
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.12) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio failure gracefully
    }
  }

  public keyTap() {
    this.playTone(550, 'sine', 0.04, 0.06);
  }

  public correct() {
    this.playTone(523.25, 'triangle', 0.12, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.18, 0.12), 70); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.22, 0.14), 140); // G5
  }

  public wrong() {
    this.playTone(180, 'sawtooth', 0.18, 0.16);
    setTimeout(() => this.playTone(130, 'sawtooth', 0.25, 0.18), 60);
  }

  public hint() {
    this.playTone(700, 'sine', 0.08, 0.08);
    setTimeout(() => this.playTone(950, 'triangle', 0.14, 0.12), 60);
    setTimeout(() => this.playTone(1200, 'sine', 0.18, 0.14), 120);
  }

  public win() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.28, 0.15), idx * 80);
    });
  }

  public lose() {
    const notes = [330, 293.66, 246.94, 185];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.24, 0.18), idx * 100);
    });
  }

  public gameOver() {
    this.lose();
  }

  public tick() {
    this.playTone(850, 'sine', 0.03, 0.04);
  }
}

export const sound = new SoundEngine();
