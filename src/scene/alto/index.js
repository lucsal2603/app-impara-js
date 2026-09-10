// Scena "dall'alto": griglia vista a tre quarti dall'alto. Bit si muove nelle quattro direzioni, porta pacchi sui tappeti di destinazione,
// raccoglie chiavi e monete, apre porte con chiavi o piastre, evita i buchi (un pacco posato su un buco lo riempie).
import { Scena } from '../base.js';
import { DURATE } from '../../config.js';

const DIR = { su: [0, -1], giu: [0, 1], sx: [-1, 0], dx: [1, 0] };
export const azioniAlto = {
  moveUp: () => ({ tipo: 'move', dir: 'su' }), moveDown: () => ({ tipo: 'move', dir: 'giu' }),
  moveLeft: () => ({ tipo: 'move', dir: 'sx' }), moveRight: () => ({ tipo: 'move', dir: 'dx' }),
  pickUp: () => ({ tipo: 'pickUp' }), putDown: () => ({ tipo: 'putDown' }),
  wait: (secondi = 1) => ({ tipo: 'wait', ticks: Math.max(1, Math.round(Number(secondi) * DURATE.secondo)) }),
};

export function analizzaAlto(config) {
  const mappa = config.mappa, legenda = config.legenda || {};
  const righe = mappa.length, colonne = Math.max(...mappa.map(r => r.length));
  const muro = Array.from({ length: righe }, () => Array(colonne).fill(false));
  const buchi = [], pacchi = [], destinazioni = [], chiavi = [], porte = [], piastre = [], monete = [];
  let spawn = { x: 0, y: 0 }, uscita = null;
  for (let y = 0; y < righe; y++) for (let x = 0; x < colonne; x++) {
    const ch = mappa[y][x] ?? '.'; if (ch === '.') continue;
    const voce = legenda[ch] ?? { '#': 'muro', S: 'spawn', X: 'uscita', P: 'pacco', D: 'destinazione', O: 'buco', K: 'chiave', M: 'moneta' }[ch];
    if (voce === undefined) throw new Error(`Carattere sconosciuto nella mappa: "${ch}"`);
    const tipo = typeof voce === 'string' ? voce : voce.tipo;
    switch (tipo) {
      case 'muro': muro[y][x] = true; break;
      case 'spawn': spawn = { x, y }; break;
      case 'uscita': uscita = { x, y }; break;
      case 'pacco': pacchi.push({ x, y, id: voce.id || `b${pacchi.length + 1}` }); break;
      case 'destinazione': destinazioni.push({ x, y }); break;
      case 'buco': buchi.push({ x, y }); break;
      case 'chiave': chiavi.push({ x, y, id: voce.id || `k${chiavi.length + 1}` }); break;
      case 'moneta': monete.push({ x, y, id: voce.id || `m${monete.length + 1}` }); break;
      case 'piastra': piastre.push({ x, y, id: voce.id || `p${piastre.length + 1}`, tenuta: voce.tenuta !== false }); break;
      case 'porta': porte.push({ x, y, id: voce.id || `d${porte.length + 1}`, apre_con: voce.apre_con || [], chiave: voce.chiave || null }); break;
      default: throw new Error(`Tipo sconosciuto nella legenda: ${tipo}`);
    }
  }
  return { righe, colonne, muro, buchi, pacchi, destinazioni, chiavi, porte, piastre, monete, spawn, uscita, obiettivo: config.obiettivo || (destinazioni.length ? 'consegna' : 'uscita') };
}

export class ScenaAlto extends Scena {
  constructor(config, risorse) { super(config, risorse); this.reset(); }
  impostaConfig(config) { this.config = config; this.reset(); }
  reset() {
    const L = analizzaAlto(this.config); this.L = L; this.colonne = L.colonne; this.righe = L.righe;
    this.player = { gx: L.spawn.x, gy: L.spawn.y, px: L.spawn.x, py: L.spawn.y, dir: 'giu', anim: 'attesa', animTick: 0, vivo: true, pacco: null };
    this.azione = null; this.esito = null; this.morteTick = 0; this.tickN = 0; this.tempo = 0; this.effetti = []; this.uscita = null;
    this.anim = this.risorse.tilesMeta.animazioni || {};
    this.pacchi = L.pacchi.map(p => ({ ...p })); this.buchi = L.buchi.map(b => ({ ...b, pieno: false }));
    this.chiavi = L.chiavi.map(k => ({ ...k, presa: false })); this.monete = L.monete.map((m, i) => ({ ...m, presa: false, fase: i * 70 }));
    this.porte = L.porte.map(d => ({ ...d, aperta: false })); this.piastre = L.piastre.map(p => ({ ...p, premuta: false }));
    this.cam = { x: 0, manuale: false }; this.casse = this.pacchi;
  }
  api() { return azioniAlto; }
  davanti() { const [dx, dy] = DIR[this.player.dir]; return { x: this.player.gx + dx, y: this.player.gy + dy }; }
  dentro(x, y) { return x >= 0 && y >= 0 && x < this.colonne && y < this.righe; }
  buco(x, y) { return this.buchi.find(b => b.x === x && b.y === y && !b.pieno); }
  libera(x, y) {
    if (!this.dentro(x, y) || this.L.muro[y][x]) return false;
    if (this.pacchi.some(p => p.x === x && p.y === y)) return false;
    if (this.porte.some(d => !d.aperta && d.x === x && d.y === y)) return false;
    return true;
  }
  sensori() {
    const s = this;
    const vicino = (lista) => lista.length ? lista.reduce((a, b) => (Math.abs(a.x - s.player.gx) + Math.abs(a.y - s.player.gy)) <= (Math.abs(b.x - s.player.gx) + Math.abs(b.y - s.player.gy)) ? a : b) : null;
    return {
      frontIsWall: () => { const d = s.davanti(); return !s.libera(d.x, d.y); },
      frontIsHole: () => { const d = s.davanti(); return !!s.buco(d.x, d.y); },
      hasBox: () => !!s.player.pacco, hasKey: () => s.chiavi.some(k => k.presa), coinsLeft: () => s.monete.filter(m => !m.presa).length,
      boxesLeft: () => s.L.destinazioni.filter(d => !s.pacchi.some(p => p.x === d.x && p.y === d.y)).length,
      door: { get isOpen() { const d = vicino(s.porte); return d ? d.aperta : true; } },
    };
  }
  avvia(az) {
    const p = this.player; if (!p.vivo || this.esito || this.uscita) return;
    if (az.tipo === 'move') {
      p.dir = az.dir; const d = this.davanti();
      if (this.libera(d.x, d.y)) this.azione = { tipo: 'move', t: 0, durata: DURATE.move, x0: p.gx, y0: p.gy, x1: d.x, y1: d.y };
      else this.azione = { tipo: 'bump', t: 0, durata: DURATE.bump, x0: p.gx, y0: p.gy, x1: p.gx, y1: p.gy, dx: DIR[az.dir][0], dy: DIR[az.dir][1] };
      p.anim = 'corsa'; p.animTick = 0; return;
    }
    if (az.tipo === 'pickUp') {
      const d = this.davanti(), i = this.pacchi.findIndex(b => b.x === d.x && b.y === d.y);
      if (i >= 0 && !p.pacco) p.pacco = this.pacchi.splice(i, 1)[0];
      this.azione = { tipo: 'pickUp', t: 0, durata: DURATE.pickUp, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; return;
    }
    if (az.tipo === 'putDown') {
      const d = this.davanti();
      if (p.pacco && this.dentro(d.x, d.y) && this.libera(d.x, d.y)) {
        const b = p.pacco; p.pacco = null; const buco = this.buco(d.x, d.y);
        if (buco) { buco.pieno = true; this.effetti.push({ nome: 'buco_riempito', x: d.x, y: d.y, t: 0, durata: 30 }); }   // il pacco riempie il buco
        else { b.x = d.x; b.y = d.y; this.pacchi.push(b); }
      }
      this.azione = { tipo: 'putDown', t: 0, durata: DURATE.putDown, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; return;
    }
    if (az.tipo === 'wait') { this.azione = { tipo: 'wait', t: 0, durata: az.ticks, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; }
  }
  animaSolo() { this.tickN++; this.player.animTick++; this.aggiornaMondo(false); }
  tick() {
    this.tickN++; this.tempo++; const p = this.player; p.animTick++;
    if (!p.vivo) { this.morteTick++; return false; }
    if (this.esito) return true;
    for (const e of this.effetti) e.t++; this.effetti = this.effetti.filter(e => e.t < e.durata);
    if (this.uscita) { this.uscita.t++; if (this.uscita.t >= this.uscita.durata) this.esito = 'vinto'; return false; }
    let fine = false; const a = this.azione;
    if (a) {
      a.t++; const k = Math.min(1, a.t / a.durata);
      if (a.tipo === 'move') { p.px = a.x0 + (a.x1 - a.x0) * k; p.py = a.y0 + (a.y1 - a.y0) * k; }
      else if (a.tipo === 'bump') { const s = Math.sin(Math.PI * k) * 0.18; p.px = a.x0 + a.dx * s; p.py = a.y0 + a.dy * s; }
      if (a.t >= a.durata) {
        p.gx = a.x1; p.gy = a.y1; p.px = p.gx; p.py = p.gy; this.azione = null; fine = true; p.anim = 'attesa'; p.animTick = 0;
        if (this.buco(p.gx, p.gy)) { this.muori(); return false; }
      }
    } else fine = true;
    this.aggiornaMondo(true);
    return fine;
  }
  aggiornaMondo(logica) {
    const p = this.player, L = this.L;
    if (logica && p.vivo && !this.azione) {
      for (const k of this.chiavi) if (!k.presa && k.x === p.gx && k.y === p.gy) { k.presa = true; this.effetti.push({ nome: 'chiave_presa', x: k.x, y: k.y, t: 0, durata: 32 }); }
      for (const m of this.monete) if (!m.presa && m.x === p.gx && m.y === p.gy) { m.presa = true; this.effetti.push({ nome: 'moneta_presa', x: m.x, y: m.y, t: 0, durata: 28 }); }
      if (!this.uscita) {
        if (L.obiettivo === 'consegna' && L.destinazioni.length && L.destinazioni.every(d => this.pacchi.some(b => b.x === d.x && b.y === d.y))) this.uscita = { t: 0, durata: 60, festa: true };
        else if (L.obiettivo === 'uscita' && L.uscita && p.gx === L.uscita.x && p.gy === L.uscita.y) this.uscita = { t: 0, durata: 60 };
      }
    }
    for (const pl of this.piastre) pl.premuta = (p.vivo && !this.azione && p.gx === pl.x && p.gy === pl.y) || this.pacchi.some(b => b.x === pl.x && b.y === pl.y);
    for (const d of this.porte) d.aperta = d.apre_con.some(id => this.piastre.find(pl => pl.id === id)?.premuta) || (d.chiave ? !!this.chiavi.find(k => k.id === d.chiave)?.presa : false);
  }
  muori() { const p = this.player; p.vivo = false; p.anim = 'caduta'; this.morteTick = 0; this.azione = null; this.esito = 'morto'; }
  morteFinita() { return !this.player.vivo && this.morteTick >= 70; }
  verifica() { return { ok: this.esito === 'vinto', chiavi: this.chiavi.filter(k => k.presa).length, monete: this.monete.filter(m => m.presa).length, messaggio: this.esito === 'vinto' ? 'Livello completato!' : '' }; }

  // ---------------------------------------------------------------- disegno (per righe: prima le cose piatte, poi quelle alte, poi Bit nella sua riga)
  tassello(ctx, T, nome, cx, cy) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T, (cy + 1) * T - h, w, h);
  }
  tasselloScala(ctx, T, nome, cx, cy, k) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px * k, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T + (T - w) / 2, (cy + 1) * T - h, w, h);
  }
  disegna(ctx, T) {
    const L = this.L, p = this.player;
    ctx.fillStyle = '#1b2026'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let y = 0; y < L.righe; y++) for (let x = 0; x < L.colonne; x++) if (!L.muro[y][x]) this.tassello(ctx, T, 'alto_pavimento', x, y);
    for (let y = 0; y < L.righe; y++) {
      for (const d of L.destinazioni) if (d.y === y) this.tassello(ctx, T, 'alto_destinazione', d.x, d.y);
      if (L.uscita && L.uscita.y === y) this.tassello(ctx, T, 'alto_uscita', L.uscita.x, L.uscita.y);
      for (const b of this.buchi) if (b.y === y && !b.pieno) this.tassello(ctx, T, 'alto_buco', b.x, b.y);
      for (const pl of this.piastre) if (pl.y === y) this.tassello(ctx, T, pl.premuta ? 'alto_piastra_giu' : 'alto_piastra_su', pl.x, pl.y);
      for (const k of this.chiavi) if (k.y === y && !k.presa) this.tassello(ctx, T, 'alto_chiave', k.x, k.y);
      for (const m of this.monete) if (m.y === y && !m.presa) { const t = (this.tickN + m.fase) % 210; const salto = t < 36 ? 0.12 * Math.sin(Math.PI * t / 36) : 0; this.tassello(ctx, T, 'alto_moneta', m.x, m.y - salto); }
      for (let x = 0; x < L.colonne; x++) if (L.muro[y][x]) this.tassello(ctx, T, 'alto_muro', x, y);
      for (const d of this.porte) if (d.y === y) this.tassello(ctx, T, d.aperta ? 'alto_porta_aperta' : 'alto_porta_chiusa', d.x, d.y);
      for (const b of this.pacchi) if (b.y === y) this.tassello(ctx, T, 'alto_pacco', b.x, b.y);
      for (const e of this.effetti) if (Math.round(e.y) === y) {
        const seq = this.anim[e.nome] || [];
        if (seq.length) this.tassello(ctx, T, seq[Math.min(seq.length - 1, Math.floor((e.t / e.durata) * seq.length))], e.x, e.y);
        else if (e.nome === 'buco_riempito') { const k = e.t / e.durata; ctx.save(); ctx.globalAlpha = 1 - k; this.tasselloScala(ctx, T, 'alto_pacco', e.x, e.y + 0.25 * k, 1 - 0.5 * k); ctx.restore(); }
      }
      if (Math.round(p.py) === y) this.disegnaPlayer(ctx, T);
    }
    if (this.uscita && this.uscita.festa) {                // consegna riuscita: i tappeti si illuminano
      const k = Math.min(1, this.uscita.t / 20); ctx.save(); ctx.globalAlpha = 0.35 * k * (0.7 + 0.3 * Math.sin(this.tickN * 0.4)); ctx.fillStyle = '#3ddc84';
      for (const d of L.destinazioni) ctx.fillRect(d.x * T, d.y * T, T, T); ctx.restore();
    }
  }
  fotogramma() {
    const p = this.player, S = this.risorse.spritesMeta; const az = p.anim === 'corsa' ? 'corsa' : 'attesa';
    const nome = `alto_${az}_${p.dir}`; const m = S[nome]; if (!m) return [null, 0];
    return [nome, Math.floor(p.animTick * m.fps / 60) % m.fotogrammi];
  }
  disegnaPlayer(ctx, T) {
    const p = this.player, R = this.risorse; const [nome, f] = this.fotogramma(); if (!nome) return;
    const m = R.spritesMeta[nome], img = R.sprites[nome]; if (!img) return;
    let s = T / m.tassello_px, alpha = 1;
    if (!p.vivo) { const k = Math.min(1, this.morteTick / 50); s *= 1 - 0.75 * k; alpha = 1 - k; }   // cade nel buco: rimpicciolisce e sparisce
    const dw = m.larghezza * s, dh = m.altezza * s, sx = (f % m.colonne) * m.larghezza, sy = Math.floor(f / m.colonne) * m.altezza;
    const cx = (p.px + 0.5) * T, piedi = (p.py + 0.72) * T, y = piedi - dh + m.piedi_dal_basso * s;
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(img, sx, sy, m.larghezza, m.altezza, cx - dw / 2, y, dw, dh); ctx.restore();
    if (p.pacco) this.tasselloScala(ctx, T, 'alto_pacco', p.px, p.py - 1.05, 0.5);
  }
}
