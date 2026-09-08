// Passo fisso: la logica avanza a 60 tick al secondo, il disegno segue il refresh dello schermo.
import { TICK_AL_SECONDO } from '../config.js';

export class Loop {
  constructor({ tick, disegna }) {
    this.tick = tick; this.disegna = disegna;
    this.dt = 1000 / TICK_AL_SECONDO; this.accumulo = 0; this.ultimo = 0; this.attivo = false; this.raf = 0;
  }
  avvia() {
    if (this.attivo) return;
    this.attivo = true; this.ultimo = performance.now();
    const passo = (ora) => {
      if (!this.attivo) return;
      this.accumulo += Math.min(250, ora - this.ultimo); this.ultimo = ora;
      let n = 0;
      while (this.accumulo >= this.dt && n < 8) { this.tick(); this.accumulo -= this.dt; n++; }
      this.disegna();
      this.raf = requestAnimationFrame(passo);
    };
    this.raf = requestAnimationFrame(passo);
  }
  ferma() { this.attivo = false; cancelAnimationFrame(this.raf); }
}
