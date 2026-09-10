// Anteprima del percorso: prima di premere ESEGUI, il programma viene "provato a secco" su una copia della scena (senza laser, il tempo
// non conta) e i punti toccati da Bit diventano una freccia continua sulla scena. Si aggiorna a ogni modifica del codice.
import { compila } from '../interprete/index.js';

export function tracciaPercorso({ codice, api, sintassi, Classe, config, risorse, maxAzioni = 400 }) {
  let s; try { s = new Classe(config, risorse); } catch { return null; }
  const r = compila(codice, api, { sintassi, sensori: Object.keys(s.sensori()) });
  if (!r.ok) return null;
  if (s.L && s.L.laser) s.L.laser = [];
  const tutte = s.api(), fn = {}; for (const n of api) if (tutte[n]) fn[n] = tutte[n];
  const punti = [{ x: s.player.gx, y: s.player.gy, tipo: 'inizio' }]; let n = 0, esito = null;
  try {
    for (const ev of r.programma.esegui({ api: fn, sensori: s.sensori() })) {
      if (ev.tipo !== 'azione') continue;
      if (++n > maxAzioni) break;
      const x0 = s.player.gx, y0 = s.player.gy; s.avvia(ev.azione);
      let salto = ev.azione.tipo === 'jump', guardia = 0;
      while (s.azione && guardia++ < 800) {
        const tipoPrima = s.azione.tipo; s.tick();
        if (!s.azione || s.azione.tipo !== tipoPrima) {   // un'azione è finita (passo, salto, caduta): segno dove sta Bit
          const x = s.player.gx, y = s.player.gy, ultimo = punti[punti.length - 1];
          if (x !== ultimo.x || y !== ultimo.y) punti.push({ x, y, tipo: tipoPrima === 'jump' ? 'salto' : tipoPrima === 'fall' ? 'caduta' : 'passo' });
        }
        if (s.esito) break;
      }
      if (s.esito === 'morto') { esito = 'morto'; break; }
      if (s.uscita || s.esito === 'vinto') { esito = 'arrivato'; break; }
    }
  } catch (e) { esito = esito || 'errore'; }
  return { punti, esito };
}

export function disegnaPercorso(ctx, T0, scena, percorso) {
  if (!percorso || percorso.punti.length < 2) return;
  const T = T0 * (scena.zoom || 1);
  const P = percorso.punti, c = (p) => [(p.x + 0.5) * T, (p.y + 0.5) * T];
  ctx.save(); ctx.translate(-Math.round((scena.cam?.x || 0) * T), 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const traccia = () => {
    ctx.beginPath(); let [x, y] = c(P[0]); ctx.moveTo(x, y);
    for (let i = 1; i < P.length; i++) {
      const [nx, ny] = c(P[i]);
      if (P[i].tipo === 'salto') ctx.quadraticCurveTo((x + nx) / 2, Math.min(y, ny) - T * 0.9, nx, ny); else ctx.lineTo(nx, ny);
      x = nx; y = ny;
    }
    ctx.stroke();
  };
  ctx.strokeStyle = 'rgba(11,15,18,0.85)'; ctx.lineWidth = T * 0.2; traccia();
  ctx.strokeStyle = percorso.esito === 'morto' ? '#ff6b6b' : '#3ddc84'; ctx.lineWidth = T * 0.1; traccia();
  // punta della freccia lungo l'ultimo tratto (o una X rossa se il percorso finisce male)
  const [ax, ay] = c(P[P.length - 1]), [bx, by] = c(P[P.length - 2]);
  let ang = Math.atan2(ay - by, ax - bx); if (P[P.length - 1].tipo === 'salto') ang = Math.atan2(ay - (Math.min(ay, by) - T * 0.9), ax - (ax + bx) / 2);
  if (percorso.esito === 'morto') {
    ctx.strokeStyle = 'rgba(11,15,18,0.85)'; ctx.lineWidth = T * 0.22; ctx.beginPath(); ctx.moveTo(ax - T * 0.22, ay - T * 0.22); ctx.lineTo(ax + T * 0.22, ay + T * 0.22); ctx.moveTo(ax + T * 0.22, ay - T * 0.22); ctx.lineTo(ax - T * 0.22, ay + T * 0.22); ctx.stroke();
    ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = T * 0.1; ctx.stroke();
  } else {
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(T * 0.18, 0); ctx.lineTo(-T * 0.16, -T * 0.22); ctx.lineTo(-T * 0.16, T * 0.22); ctx.closePath();
    ctx.fillStyle = 'rgba(11,15,18,0.85)'; ctx.lineWidth = T * 0.12; ctx.strokeStyle = 'rgba(11,15,18,0.85)'; ctx.stroke(); ctx.fillStyle = percorso.esito === 'arrivato' ? '#ffd23f' : '#3ddc84'; ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
