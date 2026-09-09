// Scena platform vista di lato: griglia di tasselli, personaggio con sprite, piastre, porte, chiavi, uscita.
import { Scena } from '../base.js';
import { DURATE, COLONNE } from '../../config.js';
import { azioni } from '../../motore/azioni.js';
import { analizzaLivello, variantePavimento } from './livello.js';

export class ScenaPlatform extends Scena {
  constructor(config, risorse) { super(config, risorse); this.reset(); }

  reset() {
    const L = analizzaLivello(this.config); this.L = L;
    this.colonne = L.colonne; this.righe = L.righe;
    this.player = { gx: L.spawn.x, gy: L.spawn.y, px: L.spawn.x, py: L.spawn.y, dir: 1, anim: 'attesa', animTick: 0, vivo: true };
    this.azione = null; this.esito = null; this.morteTick = 0; this.tickN = 0;
    this.effetti = []; this.uscita = null;
    this.anim = this.risorse.tilesMeta.animazioni || {};
    this.piastre = L.piastre.map(p => ({ ...p, premuta: false, frame: 0 }));
    this.porte = L.porte.map(d => ({ ...d, aperta: false, frame: 0 }));
    this.chiavi = L.chiavi.map(k => ({ ...k, presa: false }));
    this.monete = L.monete.map(m => ({ ...m, presa: false }));
    this.casse = L.casse.map(c => ({ ...c }));
    this.player.cassa = null;
    this.cam = { x: 0, manuale: false };
    this.tempo = 0;                                      // tick di logica dall'avvio del programma (i laser vanno a tempo)
  }

  api() { return azioni; }
  impostaConfig(config) { this.config = config; this.reset(); }

  // Sensori: valori letti dal programma nel momento in cui la riga viene eseguita (mai copie).
  sensori() {
    const s = this, p = this.player;
    const vicino = (lista) => lista.length ? lista.reduce((a, b) => Math.abs(a.x - p.gx) <= Math.abs(b.x - p.gx) ? a : b) : null;
    return {
      frontIsWall: () => { const tx = p.gx + p.dir; return tx < 0 || tx >= s.colonne || !s.libera(tx, p.gy); },
      frontIsGap: () => { const tx = p.gx + p.dir; return tx >= 0 && tx < s.colonne && s.libera(tx, p.gy) && s.libera(tx, p.gy + 1); },
      hasBox: () => !!p.cassa,
      coinsLeft: () => s.monete.filter(m => !m.presa).length,
      hasKey: () => s.chiavi.some(k => k.presa),
      laser: { get isOn() { const l = vicino(s.L.laser); return l ? s.laserAcceso(l) : false; } },
      door: { get isOpen() { const d = vicino(s.porte); return d ? d.aperta : true; } },
    };
  }

  libera(x, y) {
    if (x < 0 || x >= this.colonne) return false;
    if (y < 0 || y >= this.righe) return true;          // cielo sopra, vuoto sotto (si cade)
    if (this.L.solido[y][x]) return false;
    if (this.casse.some(c => c.x === x && c.y === y)) return false;
    for (const d of this.porte) if (!d.aperta && d.x === x && y <= d.y && y > d.y - d.alta) return false;
    return true;
  }

  avvia(az) {
    const p = this.player;
    if (!p.vivo || this.esito) return;
    if (az.tipo === 'pickUp') {
      const tx = p.gx + p.dir, i = this.casse.findIndex(c => c.x === tx && c.y === p.gy);
      if (i >= 0 && !p.cassa) p.cassa = this.casse.splice(i, 1)[0];
      this.azione = { tipo: 'pickUp', t: 0, durata: DURATE.pickUp, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; return;
    }
    if (az.tipo === 'putDown') {
      const tx = p.gx + p.dir;
      if (p.cassa && tx >= 0 && tx < this.colonne && this.libera(tx, p.gy)) {
        const c = p.cassa; p.cassa = null; c.x = tx; c.y = p.gy;
        while (c.y + 1 < this.righe && this.libera(c.x, c.y + 1)) c.y++;     // la scatola cade fino a terra
        this.casse.push(c);                                                 // torna un ostacolo sul campo
      }
      this.azione = { tipo: 'putDown', t: 0, durata: DURATE.putDown, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; return;
    }
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

  animaSolo() { this.tickN++; this.player.animTick++; this.aggiornaMondo(false); this.aggiornaCamera(); }

  aggiornaCamera() {
    const max = Math.max(0, this.colonne - COLONNE);
    if (!this.cam.manuale) { const target = Math.round(Math.max(0, Math.min(max, this.player.px + 0.5 - COLONNE / 2))); this.cam.x += (target - this.cam.x) * 0.12; if (Math.abs(target - this.cam.x) < 0.01) this.cam.x = target; }   // a riposo su colonne intere: i tasselli ai bordi non restano mai tagliati
    this.cam.x = Math.max(0, Math.min(max, this.cam.x));
  }

  laserAcceso(l) { const per = l.acceso + l.spento; return ((this.tempo + l.fase) % per) < l.acceso; }
  celleLaser(l) { const c = []; for (let k = 1; k <= l.lunghezza; k++) c.push({ x: l.x, y: l.y + k }); return c; }

  tick() {
    this.tickN++; this.tempo++;
    const p = this.player; p.animTick++;
    if (!p.vivo) { this.morteTick++; this.aggiornaMondo(false); return false; }
    if (this.esito) return true;
    for (const e of this.effetti) e.t++;
    this.effetti = this.effetti.filter(e => e.t < e.durata);
    if (this.uscita) {                                  // sta entrando nella porta: il livello finisce alla fine dell'animazione
      this.uscita.t++;
      if (this.uscita.t >= this.uscita.durata) this.esito = 'vinto';
      return false;
    }
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
    this.aggiornaMondo(true); this.aggiornaCamera();
    return fine;
  }

  aggiornaMondo(logica) {
    const p = this.player, c = this.cella();
    if (logica && p.vivo) {
      for (const k of this.chiavi) if (!k.presa && k.x === c.x && k.y === c.y) { k.presa = true; this.effetti.push({ nome: 'chiave_presa', x: k.x, y: k.y, t: 0, durata: 32 }); }
      for (const m of this.monete) if (!m.presa && m.x === c.x && m.y === c.y) { m.presa = true; this.effetti.push({ nome: 'moneta_presa', x: m.x, y: m.y, t: 0, durata: 20 }); }
      for (const pe of this.L.pericoli) if (pe.x === c.x && pe.y === c.y) { this.muori(); return; }
      for (const l of this.L.laser) if (this.laserAcceso(l) && this.celleLaser(l).some(cl => cl.x === c.x && cl.y === c.y)) { this.muori(); return; }
      if (!this.azione && !this.uscita && this.L.uscita && p.gx === this.L.uscita.x && p.gy === this.L.uscita.y) { this.uscita = { t: 0, durata: 120 }; p.anim = 'uscita'; p.animTick = 0; }
    }
    const nPremi = (this.anim.pulsante_premi || []).length || 3;
    for (const pl of this.piastre) {
      const occupata = (p.vivo && !this.azione && p.gx === pl.x && p.gy === pl.y) || this.casse.some(cs => cs.x === pl.x && cs.y === pl.y);
      if (pl.tenuta) pl.premuta = occupata;                                   // tenuto: premuto solo finché c'è qualcosa sopra
      else if (occupata && logica) { pl.premuta = true; pl.ultimo = this.tempo; }   // a scatto, o a tempo se ha `durata`
      if (pl.durata && pl.premuta && this.tempo - pl.ultimo > pl.durata) pl.premuta = false;
      if (this.tickN % 2 === 0) pl.frame = Math.max(0, Math.min(nPremi - 1, pl.frame + (pl.premuta ? 1 : -1)));
    }
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
    return { ok: this.esito === 'vinto', chiavi: this.chiavi.filter(k => k.presa).length, monete: this.monete.filter(m => m.presa).length, messaggio: this.esito === 'vinto' ? 'Livello completato!' : '' };
  }

  // ---------------------------------------------------------------- disegno
  tassello(ctx, T, nome, cx, cy) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T, (cy + 1) * T - h, w, h);
  }
  tasselloScala(ctx, T, nome, cx, cy, k) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px * k, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T, (cy + 1) * T - h, w, h);
  }
  disegna(ctx, T) {
    const L = this.L, R = this.risorse;
    ctx.save(); ctx.translate(-Math.round(this.cam.x * T), 0);
    for (let y = 0; y < L.righe; y++) for (let x = 0; x < L.colonne; x++) this.tassello(ctx, T, 'pannello_sfondo', x, y);
    for (const d of L.decor) this.tassello(ctx, T, d.tipo, d.x, d.y);
    for (let y = 0; y < L.righe; y++) for (let x = 0; x < L.colonne; x++) {
      const t = L.tasselli[y][x]; if (!t) continue;
      this.tassello(ctx, T, t === 'pavimento' ? variantePavimento(L.tasselli, x, y) : 'blocco', x, y);
    }
    for (const d of this.porte) this.tassello(ctx, T, `porta_apre_0${d.frame + 1}`, d.x, d.y);
    if (L.uscita) this.tassello(ctx, T, 'uscita', L.uscita.x, L.uscita.y);
    for (const pe of L.pericoli) this.tassello(ctx, T, pe.tipo, pe.x, pe.y);
    for (const l of L.laser) {
      this.tassello(ctx, T, 'laser_emettitore_giu', l.x, l.y);
      if (this.laserAcceso(l)) { ctx.save(); ctx.globalAlpha = 0.82 + 0.18 * Math.sin(this.tickN * 0.6); for (const cl of this.celleLaser(l)) this.tassello(ctx, T, 'laser_verticale', cl.x, cl.y); ctx.restore(); }
    }
    for (const m of this.monete) if (!m.presa) this.tassello(ctx, T, 'moneta', m.x, m.y);
    for (const cs of this.casse) this.tassello(ctx, T, 'cassa', cs.x, cs.y);
    for (const pl of this.piastre) this.tassello(ctx, T, `pulsante_premi_0${pl.frame + 1}`, pl.x, pl.y);
    for (const k of this.chiavi) if (!k.presa) this.tassello(ctx, T, 'chiave', k.x, k.y);
    for (const e of this.effetti) {
      const seq = this.anim[e.nome] || [];
      if (seq.length) { this.tassello(ctx, T, seq[Math.min(seq.length - 1, Math.floor((e.t / e.durata) * seq.length))], e.x, e.y); continue; }
      if (e.nome === 'moneta_presa') { const k = e.t / e.durata; ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(0, -k * T * 0.6); this.tassello(ctx, T, 'moneta', e.x, e.y); ctx.restore(); }
    }
    this.disegnaPlayer(ctx, T);
    if (this.uscita && L.uscita) {                       // entra nel bianco della porta
      const k = this.uscita.t / this.uscita.durata, a = Math.max(0, Math.min(1, (k - 0.4) / 0.6));
      const cx = (L.uscita.x + 0.5) * T, cy = (L.uscita.y + 0.2) * T;
      const g = ctx.createRadialGradient(cx, cy, T * 0.1, cx, cy, T * 1.3);
      g.addColorStop(0, `rgba(253,242,219,${a})`); g.addColorStop(1, 'rgba(253,242,219,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - T * 1.4, cy - T * 1.4, T * 2.8, T * 2.8);
    }
    if (this.player.cassa) this.tasselloScala(ctx, T, 'cassa', this.player.px + 0.24, this.player.py - 1.72, 0.55);   // scatola sopra la testa
    ctx.restore();
    if (L.colonne > COLONNE) {                             // indicatore: quale parte del livello si sta guardando
      const W = ctx.canvas.width, larg = W * COLONNE / L.colonne, x0 = W * this.cam.x / L.colonne, y0 = ctx.canvas.height - 6;
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, y0, W, 4);
      ctx.fillStyle = 'rgba(61,220,132,0.8)'; ctx.fillRect(x0, y0, larg, 4);
    }
  }
  fotogramma() {
    const p = this.player, S = this.risorse.spritesMeta, a = this.azione;
    if (p.anim === 'morte') return ['morte', Math.min(S.morte.fotogrammi - 1, Math.floor(this.morteTick * S.morte.fps / 60))];
    if (p.anim === 'uscita' && S.uscita && this.uscita) return ['uscita', Math.min(S.uscita.fotogrammi - 1, Math.floor(this.uscita.t * S.uscita.fps / 60))];
    if (p.anim === 'salto' && a) return ['salto', Math.min(S.salto.fotogrammi - 1, 4 + Math.floor((a.t / a.durata) * 20))];
    if (p.anim === 'caduta') return ['salto', 20];
    const az = p.anim === 'corsa' ? 'corsa' : 'attesa';
    return [az, Math.floor(p.animTick * S[az].fps / 60) % S[az].fotogrammi];
  }
  disegnaPlayer(ctx, T) {
    const p = this.player, R = this.risorse; const [az, f] = this.fotogramma();
    const m = R.spritesMeta[az], img = R.sprites[az]; if (!img) return;
    let s = T / m.tassello_px, salita = 0, dissolvenza = 1;
    if (this.uscita) {                                    // dopo essersi girato, si allontana: più piccolo, un po' più in alto, poi svanisce nel bianco
      const k = Math.max(0, (this.uscita.t / this.uscita.durata - 0.25) / 0.75);
      s *= 1 - 0.32 * k; salita = 0.16 * T * k; dissolvenza = 1 - Math.max(0, (k - 0.55) / 0.45);
    }
    const dw = m.larghezza * s, dh = m.altezza * s;
    const sx = (f % m.colonne) * m.larghezza, sy = Math.floor(f / m.colonne) * m.altezza;
    const cx = (p.px + 0.5) * T, y = (p.py + 1) * T - dh + m.piedi_dal_basso * s - salita;
    ctx.save(); ctx.globalAlpha = dissolvenza; ctx.translate(cx, 0); if (p.dir < 0 && az !== 'uscita') ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, m.larghezza, m.altezza, -dw / 2, y, dw, dh);
    ctx.restore();
  }
}
