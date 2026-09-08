import lezione from '../content/it/c1/l1.json';
import { avviaLezione } from './ui/lezione.js';
const player = avviaLezione(document.getElementById('lezione'), lezione);
const salta = new URLSearchParams(location.search).get('scheda');
if (salta !== null) player.vai(Number(salta));
window.__lezione = player;
