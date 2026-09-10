import { avviaLezione } from './ui/lezione.js';
const MODULI = import.meta.glob('../content/it/*/l*.json', { eager: true });
const LEZIONI = Object.fromEntries(Object.entries(MODULI).map(([k, m]) => { const [, c, l] = k.match(/\/([a-z0-9]+)\/l(\d+)\.json$/); return [`${c}-l${l}`, m.default]; }));
const q = new URLSearchParams(location.search);
const id = (q.get('l') || '1').includes('-') ? q.get('l') : `c1-l${q.get('l') || '1'}`;   // ?l=2 vale ancora per il primo capitolo
const lezione = LEZIONI[id] || LEZIONI['c1-l1'];
document.title = `Lezione · ${lezione.titolo}`;
const player = avviaLezione(document.getElementById('lezione'), lezione);
if (q.get('scheda') !== null) player.vai(Number(q.get('scheda')));
if (q.get('fine') !== null) {   // anteprima della schermata finale: ?fine=110 (1 = stella presa)
  const c = lezione.schede.find(s => s.tipo === 'codice'); const m = q.get('fine') || '111';
  player.fine((c.stelle || []).map((st, i) => ({ ...st, ok: m[i] === '1' })));
}
window.__lezione = player;
