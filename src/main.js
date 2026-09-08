// Pagina del solo livello (prototipo e test): monta la scheda codice dell'ultima scheda della lezione 1.
import l1 from '../content/it/c1/l1.json';
import l2 from '../content/it/c1/l2.json';
import l3 from '../content/it/c1/l3.json';
import l4 from '../content/it/c1/l4.json';
import l5 from '../content/it/c1/l5.json';
const lezione = { '1': l1, '2': l2, '3': l3, '4': l4, '5': l5 }[new URLSearchParams(location.search).get('l') || '1'] || l1;
import { montaCodice } from './ui/schede/codice.js';

const livello = lezione.schede.find(s => s.tipo === 'codice');
montaCodice(document.getElementById('app'), livello, { onMenu: () => { location.href = 'home.html'; } }).then(app => {
  window.__app = app;
  // ?demo=N: carica la soluzione, la esegue e avanza di N tick (per screenshot e test deterministici)
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo !== null) {
    app.editor.ta.value = livello.aiuti[livello.aiuti.length - 1] + '\n'; app.editor.aggiorna();
    app.sessione.esegui();
    for (let i = 0; i < Number(demo); i++) app.sessione.tick();
    app.loop.tick = () => {};                     // fotogramma fisso: la logica si ferma, il disegno continua
  }
}).catch(e => { console.error(e); document.getElementById('app').textContent = 'Errore di caricamento: ' + e.message; });
