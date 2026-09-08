// Scena platform vista di lato: griglia di tasselli, personaggio con sprite, piastre, porte, chiavi, uscita.
import { Scena } from '../base.js';
import { DURATE } from '../../config.js';
import { azioni } from '../../motore/azioni.js';
import { analizzaLivello, variantePavimento } from './livello.js';

export class ScenaPlatform extends Scena {
  constructor(config, risorse) { super(config, risorse); this.reset(); }

  reset() {
    const L = analizzaLivello(this.config); this.L = L;
    this.colonne = L.colonne; this.righe = L.righe;
    this.player = { gx: L.spawn.x, gy: L.spawn.y, px: L.spawn.x, py: L.spawn.y, dir: 1, anim: 'attesa', animTick: 0, vivo: true };
    this.azione = null; this.esito = null; this.morteTick = 0; this.tickN = 0;
    this.piastre = L.piastre.map(p => ({ ...p, premuta: false, frame: 0 }));
    this.porte = L.porte.map(d => ({ ...d, aperta: false, frame: 0 }));
    this.chiavi = L.chiavi.map(k => ({ ...k, presa: false }));
  }

  api() { return azioni; }

  libera(x, y) {
    if (x < 0 || x >= this.colonne) return false;
    if (y < 0 || y >= this.righe) return true;          // cielo sopra, vuoto sotto (si cade)
    if (this.L.solido[y][x]) return false;
    for (const d of this.porte) if (!d.aperta && d.x === x && y <= d.y && y > d.y - d.alta) return false;
    return true;
  }

  avvia(az) {
    const p = this.player;
    if (!p.vivo || this.esito) return;
    if (az.tipo === 'move') {
      p.dir = az.dir; const tx = p.gx + az.dir;
      if (this.libera(tx, p.gy)) this.azione = { tipo: 'move', t: 0, durata: DURATE.move, x0: p.gx, y0: p.gy, x1: tx, y1: p.gy };
      else this.azione = { tipo: 'bump', t: 0, durata: DURATE.bump, x0: p.gx, y0: p.gy, x1: p.gx, y1: p.gy, dir: az.dir };
      p.anim = 'corsa'; p.animTick = 0;
    } else if (az.tipo === 'jump') {
      const d = p.dir, x1 = p.gx + d; let dest;
      if (!this.libera(x1, p.gy) && this.libera(x1, p.gy - 1) && this.libera(p.gx, p.gy - 1)) dest = [x1, p.gy - 1];      // sale un gradino
      else if (this.libera(x1, p.gy - 1) && this.libera(p.gx, p.gy - 1)) dest = this.libera(p.gx + 2 * d, p.gy - 1) ? [p.gx + 2 * d, p.gy - 1] : [x1, p.gy - 1];  // balzo
      else dest = [p.gx, p.gy];                                                                                              // saltello sul posto
      this.azione = { tipo: 'jump', t: 0, durata: DURATE.jump, x0: p.gx, y0: p.gy, x1: dest[0], y1: dest[1] };
      p.anim = 'salto'; p.animTick = 0;
    } else if (az.tipo === 'wait') {
      this.azione = { tipo: 'wait', t: 0, durata: az.ticks, x1: p.gx, y1: p.gy }; p.anim = 'attesa';
    }
  }

  cella() { return { x: Math.round(this.player.px), y: Math.round(this.player.py) }; }

  animaSolo() { this.tickN++; this.player.animTick++; this.aggiornaMondo(false); }

  tick() {
    this.tickN++;
    const p = this.player; p.animTick++;
    if (!p.vivo) { this.morteTick++; this.aggiornaMondo(false); return false; }
    if (this.esito) return true;
    let fine = false;
    const a = this.azione;
    if (a) {
      a.t++; const k = Math.min(1, a.t / a.durata);
      if (a.tipo === 'move') { p.px = a.x0 + (a.x1 - a.x0) * k; p.py = a.y0; }
      else if (a.tipo === 'bump') { p.px = a.x0 + a.dir * Math.sin(Math.PI * k) * 0.18; }
      else if (a.tipo === 'jump') { p.px = a.x0 + (a.x1 - a.x0) * k; p.py = a.y0 - (a.y0 - a.y1) * k - Math.sin(Math.PI * k) * 0.45; }
      else if (a.tipo === 'fall') { p.px = a.x0; p.py = a.y0 + (a.y1 - a.y0) * k; }
      if (a.t >= a.durata) {
        p.gx = a.x1; p.gy = a.y1; p.px = p.gx; p.py = p.gy; this.azione = null;
        if (p.gy >= this.righe) { this.muori(); return false; }
        if (this.libera(p.gx, p.gy + 1)) { this.azione = { tipo: 'fall', t: 0, durata: DURATE.fallCella, x0: p.gx, y0: p.gy, x1: p.gx, y1: p.gy + 1 }; p.anim = 'caduta'; }
        else { fine = true; p.anim = 'attesa'; p.animTick = 0; }
      }
    } else fine = true;
    this.aggiornaMondo(true);
    return fine;
  }

  aggiornaMondo(logica) {
    const p = this.player, c = this.cella();
    if (logica && p.vivo) {
      for (const k of this.chiavi) if (!k.presa && k.x === c.x && k.y === c.y) k.presa = true;
      for (const pl of this.piastre) if (!pl.premuta && pl.x === c.x && pl.y === c.y && !this.azione) pl.premuta = true;   // a scatto: resta premuta
      for (const pe of this.L.pericoli) if (pe.x === c.x && pe.y === c.y) { this.muori(); return; }
      if (!this.azione && this.L.uscita && p.gx === this.L.uscita.x && p.gy === this.L.uscita.y) this.esito = 'vinto';
    }
    for (const pl of this.piastre) pl.frame = Math.min(2, pl.frame + (pl.premuta ? (this.tickN % 3 === 0 ? 1 : 0) : 0));
    for (const d of this.porte) {
      const viaPiastra = d.apre_con.some(id => this.piastre.find(pl => pl.id === id)?.premuta);
      const viaChiave = d.chiave ? this.chiavi.find(k => k.id === d.chiave)?.presa : false;
      const target = viaPiastra || viaChiave;
      if (this.tickN % DURATE.porta === 0) d.frame = Math.max(0, Math.min(5, d.frame + (target ? 1 : -1)));
      d.aperta = target && d.frame >= 3;
    }
  }

  muori() { const p = this.player; p.vivo = false; p.anim = 'morte'; p.animTick = 0; this.morteTick = 0; this.azione = null; this.esito = 'morto'; }
  morteFinita() { return !this.player.vivo && this.morteTick >= DURATE.morte; }

  verifica() {
    return { ok: this.esito === 'vinto', chiavi: this.chiavi.filter(k => k.presa).length, messaggio: this.esito === 'vinto' ? 'Livello completato!' : '' };
  }

  // ---------------------------------------------------------------- disegno
  tassello(ctx, T, nome, cx, cy) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T, (cy + 1) * T - h, w, h);
  }
  disegna(ctx, T) {
    const L = this.L, R = this.risorse;
    for (let y = 0; y < L.righe; y++) for (let x = 0; x < L.colonne; x++) this.tassello(ctx, T, 'pannello_sfondo', x, y);
    for (const d of L.decor) this.tassello(ctx, T, d.tipo, d.x, d.y);
    for (let y = 0; y < L.righe; y++) for (let x = 0; x < L.colonne; x++) {
      const t = L.tasselli[y][x]; if (!t) continue;
      this.tassello(ctx, T, t === 'pavimento' ? variantePavimento(L.tasselli, x, y) : 'blocco', x, y);
    }
    for (const d of this.porte) this.tassello(ctx, T, `porta_apre_0${d.frame + 1}`, d.x, d.y);
    if (L.uscita) this.tassello(ctx, T, 'uscita', L.uscita.x, L.uscita.y);
    for (const pe of L.pericoli) this.tassello(ctx, T, pe.tipo, pe.x, pe.y);
    for (const pl of this.piastre) this.tassello(ctx, T, `pulsante_premi_0${pl.frame + 1}`, pl.x, pl.y);
    for (const k of this.chiavi) if (!k.presa) this.tassello(ctx, T, 'chiave', k.x, k.y);
    this.disegnaPlayer(ctx, T);
  }
  fotogramma() {
    const p = this.player, S = this.risorse.spritesMeta, a = this.azione;
    if (p.anim === 'morte') return ['morte', Math.min(S.morte.fotogrammi - 1, Math.floor(this.morteTick * S.morte.fps / 60))];
    if (p.anim === 'salto' && a) return ['salto', Math.min(S.salto.fotogrammi - 1, 4 + Math.floor((a.t / a.durata) * 20))];
    if (p.anim === 'caduta') return ['salto', 20];
    const az = p.anim === 'corsa' ? 'corsa' : 'attesa';
    return [az, Math.floor(p.animTick * S[az].fps / 60) % S[az].fotogrammi];
  }
  disegnaPlayer(ctx, T) {
    const p = this.player, R = this.risorse; const [az, f] = this.fotogramma();
    const m = R.spritesMeta[az], img = R.sprites[az]; if (!img) return;
    const s = T / m.tassello_px, dw = m.larghezza * s, dh = m.altezza * s;
    const sx = (f % m.colonne) * m.larghezza, sy = Math.floor(f / m.colonne) * m.altezza;
    const cx = (p.px + 0.5) * T, y = (p.py + 1) * T - dh + m.piedi_dal_basso * s;
    ctx.save(); ctx.translate(cx, 0); if (p.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, m.larghezza, m.altezza, -dw / 2, y, dw, dh);
    ctx.restore();
  }
}
