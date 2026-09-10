// Scena "cucina": Bit sta dietro un bancone con delle postazioni in fila (cassetta degli ingredienti, fornello, tagliere, piatto).
// Prende un ingrediente, lo mette dove serve, aspetta che cuocia, lo taglia, lo serve: vince quando il piatto contiene l'ordine.
import { Scena } from '../base.js';
import { DURATE } from '../../config.js';

export const azioniCucina = {
  moveLeft: () => ({ tipo: 'move', dir: -1 }), moveRight: () => ({ tipo: 'move', dir: 1 }),
  take: (nome) => ({ tipo: 'take', nome: nome === undefined ? null : String(nome) }),
  put: () => ({ tipo: 'put' }), cut: () => ({ tipo: 'cut' }),
  wait: (secondi = 1) => ({ tipo: 'wait', ticks: Math.max(1, Math.round(Number(secondi) * DURATE.secondo)) }),
};
const RIGA_BIT = 2, RIGA_BANCONE = 3, TAGLIO = 28, ZOOM = 8 / 6;   // la cucina si disegna a 6 colonne: tutto più grande
const stato = (i) => i.cotto && i.tagliato ? 'cotto_tagliato' : i.cotto ? 'cotto' : i.tagliato ? 'tagliato' : 'crudo';
export const nomeStato = (i) => `${i.ing}${i.cotto ? ' cotto' : ''}${i.tagliato ? ' tagliato' : ''}`;
function leggiOrdine(o) { const [ing, ...st] = o.split(/[\s:+]+/); return { ing, cotto: st.includes('cotto'), tagliato: st.includes('tagliato') }; }

export class ScenaCucina extends Scena {
  constructor(config, risorse) { super(config, risorse); this.reset(); }
  impostaConfig(config) { this.config = config; this.reset(); }
  reset() {
    const c = this.config; this.colonne = 6; this.righe = 5; this.zoom = ZOOM;
    this.offset = Math.max(0, Math.floor((this.colonne - c.stazioni.length) / 2));
    this.stazioni = c.stazioni.map((s, i) => ({ ...(typeof s === 'string' ? { tipo: s } : s), col: this.offset + i, contenuto: null, t: 0, pronto: false, piatto: [] }));
    this.ordine = (c.ordine || []).map(leggiOrdine); this.tempoCottura = c.tempoCottura ?? 180;
    const sp = this.offset + (c.spawn ?? 0);
    this.player = { gx: sp, gy: RIGA_BIT, px: sp, py: RIGA_BIT, dir: 1, anim: 'attesa', animTick: 0, vivo: true, mano: null };
    this.azione = null; this.esito = null; this.tickN = 0; this.tempo = 0; this.effetti = []; this.uscita = null; this.morteTick = 0;
    this.cam = { x: 0, manuale: false }; this.chiavi = []; this.monete = []; this.anim = this.risorse.tilesMeta.animazioni || {};
  }
  api() { return azioniCucina; }
  davanti() { return this.stazioni.find(s => s.col === this.player.gx) || null; }
  fornello() { return this.stazioni.find(s => s.tipo === 'fornello'); }
  piatto() { return this.stazioni.find(s => s.tipo === 'piatto'); }
  sensori() {
    const s = this;
    return {
      pot: { get isReady() { const f = s.fornello(); return !!(f && f.pronto); } },
      holding: () => s.player.mano ? s.player.mano.ing : '',
      plateCount: () => (s.piatto()?.piatto.length) || 0,
      frontIsWall: () => s.player.gx + s.player.dir < s.offset || s.player.gx + s.player.dir >= s.offset + s.stazioni.length,
      stationIs: (tipo) => (s.davanti()?.tipo || '') === String(tipo),
    };
  }
  boh(testo) { this.effetti.push({ nome: 'boh', testo, x: this.player.gx, y: RIGA_BIT, t: 0, durata: 50 }); }
  avvia(az) {
    const p = this.player; if (this.esito || this.uscita) return;
    const fermo = (tipo) => { this.azione = { tipo, t: 0, durata: DURATE.pickUp, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; };
    if (az.tipo === 'move') {
      p.dir = az.dir; const tx = p.gx + az.dir;
      if (tx >= this.offset && tx < this.offset + this.stazioni.length) this.azione = { tipo: 'move', t: 0, durata: DURATE.move, x0: p.gx, y0: p.gy, x1: tx, y1: p.gy };
      else this.azione = { tipo: 'bump', t: 0, durata: DURATE.bump, x0: p.gx, y0: p.gy, x1: p.gx, y1: p.gy, dir: az.dir };
      p.anim = 'corsa'; p.animTick = 0; return;
    }
    const st = this.davanti();
    if (az.tipo === 'take') {
      if (!st) this.boh('?');
      else if (p.mano) this.boh('ho già le mani piene');
      else if (st.tipo === 'cassetta') {
        const ing = az.nome && (st.ingredienti || []).includes(az.nome) ? az.nome : null;
        if (ing) p.mano = { ing, cotto: false, tagliato: false }; else this.boh(az.nome ? `qui non c'è ${az.nome}` : 'quale ingrediente?');
      } else if (st.tipo === 'piatto') { if (st.piatto.length) p.mano = st.piatto.pop(); else this.boh('il piatto è vuoto'); }
      else if (st.contenuto) { p.mano = st.contenuto; st.contenuto = null; st.pronto = false; st.t = 0; }
      else this.boh('qui non c\'è niente');
      fermo('pickUp'); return;
    }
    if (az.tipo === 'put') {
      if (!st) this.boh('?');
      else if (!p.mano) this.boh('non ho niente in mano');
      else if (st.tipo === 'cassetta') this.boh('nella cassetta no');
      else if (st.tipo === 'piatto') { st.piatto.push(p.mano); p.mano = null; this.controllaOrdine(st); }
      else if (st.contenuto) this.boh('è già occupato');
      else { st.contenuto = p.mano; p.mano = null; st.t = 0; st.pronto = false; }
      fermo('putDown'); return;
    }
    if (az.tipo === 'cut') {
      if (st && st.tipo === 'tagliere' && st.contenuto && !st.contenuto.tagliato) { this.azione = { tipo: 'taglia', t: 0, durata: TAGLIO, x1: p.gx, y1: p.gy, stazione: st }; p.anim = 'attesa'; }
      else { this.boh(st && st.tipo === 'tagliere' ? (st.contenuto ? 'è già tagliato' : 'niente da tagliare') : 'serve il tagliere'); fermo('bump'); }
      return;
    }
    if (az.tipo === 'wait') { this.azione = { tipo: 'wait', t: 0, durata: az.ticks, x1: p.gx, y1: p.gy }; p.anim = 'attesa'; }
  }
  controllaOrdine(pi) {
    const chiave = (i) => `${i.ing}|${i.cotto ? 1 : 0}|${i.tagliato ? 1 : 0}`;
    const a = pi.piatto.map(chiave).sort().join(','), b = this.ordine.map(chiave).sort().join(',');
    if (a === b && this.ordine.length) { this.uscita = { t: 0, durata: 70, servito: true }; this.player.anim = 'attesa'; }
  }
  animaSolo() { this.tickN++; this.player.animTick++; }
  tick() {
    this.tickN++; this.tempo++; const p = this.player; p.animTick++;
    if (this.esito) return true;
    for (const e of this.effetti) e.t++; this.effetti = this.effetti.filter(e => e.t < e.durata);
    for (const st of this.stazioni) if (st.tipo === 'fornello' && st.contenuto && !st.contenuto.cotto) { st.t++; if (st.t >= this.tempoCottura) { st.contenuto.cotto = true; st.pronto = true; this.effetti.push({ nome: 'pronto', x: st.col, y: RIGA_BIT, t: 0, durata: 40 }); } }
    if (this.uscita) { this.uscita.t++; if (this.uscita.t >= this.uscita.durata) this.esito = 'vinto'; return false; }
    let fine = false; const a = this.azione;
    if (a) {
      a.t++; const k = Math.min(1, a.t / a.durata);
      if (a.tipo === 'move') p.px = a.x0 + (a.x1 - a.x0) * k;
      else if (a.tipo === 'bump') p.px = a.x0 + a.dir * Math.sin(Math.PI * k) * 0.18;
      if (a.t >= a.durata) {
        if (a.tipo === 'taglia' && a.stazione.contenuto) a.stazione.contenuto.tagliato = true;
        p.gx = a.x1; p.px = p.gx; this.azione = null; fine = true; p.anim = 'attesa'; p.animTick = 0;
      }
    } else fine = true;
    return fine;
  }
  morteFinita() { return false; }
  verifica() { return { ok: this.esito === 'vinto', chiavi: 0, monete: 0, messaggio: this.esito === 'vinto' ? 'Ordine servito!' : '' }; }

  // ---------------------------------------------------------------- disegno
  tassello(ctx, T, nome, cx, cy) {
    const img = this.risorse.tiles[nome]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T, (cy + 1) * T - h, w, h);
  }
  icona(ctx, T, item, cx, cy, k = 1) {
    const img = this.risorse.tiles[`ing_${item.ing}_${stato(item)}`]; if (!img) return;
    const s = T / this.risorse.tilesMeta.tassello_px * k, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, cx * T - w / 2, cy * T - h, w, h);
  }
  disegna(ctx, T0) {
    const T = T0 * ZOOM, p = this.player, W = ctx.canvas.width;
    ctx.fillStyle = '#20262d'; ctx.fillRect(0, 0, W, ctx.canvas.height);
    for (let y = 0; y <= RIGA_BIT; y++) for (let x = 0; x < this.colonne; x++) this.tassello(ctx, T, 'cucina_sfondo', x, y);
    ctx.fillStyle = '#2b3038'; ctx.fillRect(0, (RIGA_BANCONE + 1) * T, W, 3 * T);
    this.tassello(ctx, T, 'cucina_finestra', 4.3, 0.95); this.tassello(ctx, T, 'cucina_mensola', 2.6, 0.75);
    // cartellino dell'ordine con gli ingredienti richiesti (spuntati quando sono nel piatto)
    this.tassello(ctx, T, 'cucina_ordine', 0.12, 0.85);
    const nelPiatto = (this.piatto()?.piatto || []).map(i => `${i.ing}|${i.cotto}|${i.tagliato}`);
    this.ordine.forEach((o, i) => {
      const fatto = nelPiatto.includes(`${o.ing}|${o.cotto}|${o.tagliato}`);
      ctx.save(); ctx.globalAlpha = fatto ? 0.45 : 1; this.icona(ctx, T, o, 0.58 + i * 0.5, 1.62, 0.7); ctx.restore();
      if (fatto) { ctx.fillStyle = '#3ddc84'; ctx.font = `bold ${T * 0.26}px -apple-system, Helvetica, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('✓', (0.58 + i * 0.5) * T, 1.26 * T); }
    });
    this.disegnaPlayer(ctx, T);
    for (let x = 0; x < this.colonne; x++) this.tassello(ctx, T, 'cucina_bancone', x, RIGA_BANCONE);
    for (const st of this.stazioni) {
      const c = st.col;
      if (st.tipo === 'cassetta') this.tassello(ctx, T, 'cucina_cassetta', c, RIGA_BIT);
      else if (st.tipo === 'fornello') {
        let nome = 'cucina_fornello_vuoto';
        if (st.contenuto) nome = st.pronto ? 'cucina_fornello_pronto' : `cucina_fornello_cuoce_0${1 + Math.floor(this.tickN / 8) % 3}`;
        this.tassello(ctx, T, nome, c, RIGA_BIT);
      } else if (st.tipo === 'tagliere') {
        const a = this.azione; let nome = 'cucina_tagliere';
        if (a && a.tipo === 'taglia' && a.stazione === st) nome = `cucina_tagliere_taglia_0${1 + Math.floor(a.t / 7) % 4}`;
        this.tassello(ctx, T, nome, c, RIGA_BIT);
        if (st.contenuto) this.icona(ctx, T, st.contenuto, c + 0.45, RIGA_BIT + 0.9, 0.55);
      } else if (st.tipo === 'piatto') {
        this.tassello(ctx, T, 'cucina_piatto', c, RIGA_BIT);
        st.piatto.forEach((it, i) => this.icona(ctx, T, it, c + 0.35 + i * 0.18, RIGA_BIT + 0.92 - i * 0.04, 0.42));
      }
    }
    for (const e of this.effetti) {
      if (e.nome === 'boh') { const k = e.t / e.durata; ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffd9d9'; ctx.font = `bold ${T * 0.22}px -apple-system, Helvetica, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(e.testo, (e.x + 0.5) * T, (e.y - 0.35 - 0.3 * k) * T); ctx.restore(); }
      if (e.nome === 'pronto') { const k = e.t / e.durata; ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#3ddc84'; ctx.font = `bold ${T * 0.24}px -apple-system, Helvetica, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('pronto!', (e.x + 0.5) * T, (e.y - 0.5 - 0.3 * k) * T); ctx.restore(); }
    }
    if (this.uscita && this.uscita.servito) {
      const k = Math.min(1, this.uscita.t / 15); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#3ddc84'; ctx.font = `bold ${T * 0.42}px -apple-system, Helvetica, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('Servito!', (this.piatto().col + 0.5) * T, (RIGA_BIT - 0.6 - 0.2 * k) * T); ctx.restore();
    }
  }
  disegnaPlayer(ctx, T) {
    const p = this.player, R = this.risorse, S = R.spritesMeta; const az = p.anim === 'corsa' ? 'corsa' : 'attesa'; const m = S[az], img = R.sprites[az]; if (!m || !img) return;
    const f = Math.floor(p.animTick * m.fps / 60) % m.fotogrammi, s = T / m.tassello_px, dw = m.larghezza * s, dh = m.altezza * s;
    const sx = (f % m.colonne) * m.larghezza, sy = Math.floor(f / m.colonne) * m.altezza;
    const cx = (p.px + 0.5) * T, y = (p.py + 1.42) * T - dh + m.piedi_dal_basso * s;      // i piedi stanno dietro il bancone
    ctx.save(); ctx.translate(cx, 0); if (p.dir < 0) ctx.scale(-1, 1); ctx.drawImage(img, sx, sy, m.larghezza, m.altezza, -dw / 2, y, dw, dh); ctx.restore();
    if (p.mano) this.icona(ctx, T, p.mano, p.px + 0.5 + 0.42 * p.dir, p.py + 0.62, 0.5);
  }
}
