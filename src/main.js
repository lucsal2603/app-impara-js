// Pagina del solo livello (prototipo e test): monta la scheda codice dell'ultima scheda della lezione 1.
const MODULI = import.meta.glob('../content/it/*/l*.json', { eager: true });
const LEZIONI = Object.fromEntries(Object.entries(MODULI).map(([k, m]) => { const [, c, l] = k.match(/\/([a-z0-9]+)\/l(\d+)\.json$/); return [`${c}-l${l}`, m.default]; }));
const q = new URLSearchParams(location.search);
const id = (q.get('l') || '1').includes('-') ? q.get('l') : `c1-l${q.get('l') || '1'}`;
const lezione = LEZIONI[id] || LEZIONI['c1-l1'];
import { montaCodice } from './ui/schede/codice.js';

const livello = lezione.schede.filter(s => s.tipo === 'codice').at(-1);
montaCodice(document.getElementById('app'), livello, { onMenu: () => { location.href = 'home.html'; } }).then(app => {
  window.__app = app;
  // ?demo=N: carica la soluzione, la esegue e avanza di N tick (per screenshot e test deterministici)
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo !== null) {
    app.editor.imposta(livello.aiuti[livello.aiuti.length - 1] + '\n');
    app.sessione.esegui();
    for (let i = 0; i < Number(demo); i++) app.sessione.tick();
    app.loop.tick = () => {};                     // fotogramma fisso: la logica si ferma, il disegno continua
  }
}).catch(e => { console.error(e); document.getElementById('app').textContent = 'Errore di caricamento: ' + e.message; });
