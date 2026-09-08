import { avviaLezione } from './ui/lezione.js';
const MODULI = import.meta.glob('../content/it/c1/l*.json', { eager: true });
const LEZIONI = Object.fromEntries(Object.entries(MODULI).map(([k, m]) => [k.match(/l(\d+)\.json$/)[1], m.default]));
const q = new URLSearchParams(location.search);
const lezione = LEZIONI[q.get('l') || '1'] || LEZIONI['1'];
document.title = `Lezione · ${lezione.titolo}`;
const player = avviaLezione(document.getElementById('lezione'), lezione);
if (q.get('scheda') !== null) player.vai(Number(q.get('scheda')));
window.__lezione = player;
