// Scheda codice: scena in alto, editor sotto, controlli. Si monta in un contenitore e restituisce sessione, scena, editor e loop.
import { COLONNE, RIGHE } from '../../config.js';
import { Loop } from '../../motore/loop.js';
import { Renderer } from '../../motore/renderer.js';
import { ScenaPlatform } from '../../scene/platform/index.js';
import { Sessione } from '../../sfida/sessione.js';
import { Editor } from '../editor.js';
import { valutaStelle } from '../../sfida/stelle.js';

const BASE = `${import.meta.env.BASE_URL}assets/scene/platform`;
let risorseCache = null;

function caricaImmagine(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('immagine mancante: ' + src)); i.src = src; }); }
export async function caricaRisorse() {
  if (risorseCache) return risorseCache;
  const [tilesMeta, spritesMeta] = await Promise.all([fetch(`${BASE}/tiles/tiles.json`).then(r => r.json()), fetch(`${BASE}/sprites/sprites.json`).then(r => r.json())]);
  const tiles = {}, sprites = {};
  await Promise.all([
    ...Object.keys(tilesMeta.pezzi).map(async n => { tiles[n] = await caricaImmagine(`${BASE}/tiles/${n}.png`); }),
    ...Object.keys(spritesMeta).map(async n => { sprites[n] = await caricaImmagine(`${BASE}/sprites/${spritesMeta[n].file}`); }),
  ]);
  return (risorseCache = { tiles, tilesMeta, sprites, spritesMeta });
}
function mostraValore(v) { if (typeof v === 'string') return `"${v}"`; if (Array.isArray(v)) return '[' + v.map(mostraValore).join(', ') + ']'; if (v && typeof v === 'object') return JSON.stringify(v); return String(v); }

const TEMPLATE = `
  <header class="barra">
    <button class="icona" data-r="btn-menu" aria-label="Menu">II</button>
    <div class="titolo"><strong data-r="titolo"></strong><span data-r="sottotitolo"></span></div>
    <div class="contatore" data-r="contatore" title="righe di codice">0</div>
  </header>
  <div class="scena-wrap"><canvas data-r="canvas"></canvas><div class="messaggio" data-r="messaggio" hidden></div></div>
  <div class="hud"><span data-r="obiettivo"></span><span><span data-r="stato">pronto</span> <button class="aiuto" data-r="btn-aiuto" aria-label="Aiuto">?</button></span></div>
  <div class="monitor" data-r="monitor" hidden><div class="variabili" data-r="variabili"></div><div class="console" data-r="console"></div></div>
  <section class="editor-wrap">
    <div class="editor" data-r="editor"></div>
    <div class="errore" data-r="errore" hidden></div>
    <div class="suggerimento" data-r="aiuto" hidden></div>
    <div class="simboli" data-r="simboli"></div>
    <div class="palette" data-r="palette"></div>
    <div class="controlli">
      <button data-r="btn-esegui" class="primario">ESEGUI</button>
      <button data-r="btn-pausa">PAUSA</button>
      <button data-r="btn-passo">PASSO</button>
      <button data-r="btn-ricomincia">RICOMINCIA</button>
    </div>
  </section>`;

export async function montaCodice(root, livello, opzioni = {}) {
  const risorse = await caricaRisorse();
  root.classList.add('scheda-codice'); root.innerHTML = TEMPLATE;
  const $ = (r) => root.querySelector(`[data-r="${r}"]`);
  $('titolo').textContent = livello.titolo || ''; $('sottotitolo').textContent = livello.sottotitolo || '';
  $('obiettivo').textContent = livello.obiettivo?.testo || '';

  const scena = new ScenaPlatform(livello.config, risorse);
  const renderer = new Renderer($('canvas'), COLONNE, RIGHE);
  const sintassi = livello.sintassi || ['call'], sensori = livello.sensori || [];
  const editor = new Editor({ contenitore: $('editor'), palette: $('palette'), simboli: $('simboli'), api: livello.api, sensori, sintassi, contatore: $('contatore'), starter: livello.starter || '' });
  const monitor = $('monitor'), mostraMonitor = sintassi.includes('let'); monitor.hidden = !mostraMonitor;
  const ui = {
    stato: (s) => { $('stato').textContent = { pronto: 'pronto', esecuzione: 'in esecuzione', passo: 'passo', pausa: 'in pausa', cambio: 'stanza dopo', finito: 'finito' }[s] || s; $('btn-pausa').textContent = s === 'pausa' ? 'RIPRENDI' : 'PAUSA'; },
    errore: (e) => { const el = $('errore'); if (!e) { el.hidden = true; return; } el.hidden = false; el.textContent = `Riga ${e.riga}: ${e.messaggio}`; },
    messaggio: (m) => { const el = $('messaggio'); if (!m) { el.hidden = true; return; } el.hidden = false; el.textContent = m; },
    variabili: (v) => {   // pannello "cosa c'è dentro": una chip per variabile, aggiornata a ogni riga
      const el = $('variabili'); if (!v) { el.replaceChildren(); return; }
      el.replaceChildren(...Object.entries(v).map(([k, val]) => { const c = document.createElement('span'); c.className = 'var'; c.innerHTML = `<b></b> = <i></i>`; c.querySelector('b').textContent = k; c.querySelector('i').textContent = mostraValore(val); return c; }));
      if (Object.keys(v).length) monitor.hidden = false;
    },
    console: (t) => {
      const el = $('console'); if (t === null) { el.replaceChildren(); return; }
      const r = document.createElement('div'); r.textContent = '› ' + t; el.appendChild(r); while (el.children.length > 4) el.firstChild.remove(); monitor.hidden = false; el.scrollTop = el.scrollHeight;
    },
  };
  const varianti = [livello.config, ...(livello.varianti || [])];
  const sessione = new Sessione({ scena, editor, api: livello.api, ui, sintassi, varianti, onVittoria: () => opzioni.onVittoria?.(valutaStelle(livello, scena, editor.righeCodice(), sessione.ast)) });
  $('btn-esegui').addEventListener('click', () => sessione.esegui());
  $('btn-pausa').addEventListener('click', () => sessione.pausa());
  $('btn-passo').addEventListener('click', () => sessione.passo());
  $('btn-ricomincia').addEventListener('click', () => sessione.ricomincia());
  $('btn-menu').addEventListener('click', () => opzioni.onMenu?.());
  // aiuti progressivi: ogni tocco mostra il suggerimento successivo
  let nAiuto = 0; const aiuti = livello.aiuti || [];
  $('btn-aiuto').addEventListener('click', () => {
    if (!aiuti.length) return;
    const el = $('aiuto'); el.hidden = false; nAiuto = Math.min(nAiuto + 1, aiuti.length);
    const testo = aiuti[nAiuto - 1]; el.textContent = ''; el.append(`Aiuto ${nAiuto} di ${aiuti.length}: `);
    if (testo.includes('\n')) { const pre = document.createElement('pre'); pre.textContent = testo; el.appendChild(pre); } else el.append(testo);
  });
  // livelli più larghi dello schermo: si trascina la scena col dito per guardarsi intorno; con ESEGUI la camera torna a seguire Bit.
  // Pointer events per mouse e penna, touch events espliciti per il telefono (su iOS sono i più affidabili), presa su tutta l'area della scena.
  const canvas = $('canvas'), area = canvas.parentElement; let trascino = null;
  const inizio = (x) => { trascino = { x, cam: scena.cam.x }; };
  const muovi = (x) => { if (!trascino) return; const dx = (x - trascino.x) / (canvas.clientWidth / COLONNE); if (Math.abs(dx) > 0.05) { scena.cam.manuale = true; scena.cam.x = trascino.cam - dx; } };
  const fine = () => { trascino = null; };
  area.addEventListener('touchstart', e => { if (e.touches.length === 1) { e.preventDefault(); inizio(e.touches[0].clientX); } }, { passive: false });
  area.addEventListener('touchmove', e => { if (trascino && e.touches.length === 1) { e.preventDefault(); muovi(e.touches[0].clientX); } }, { passive: false });
  area.addEventListener('touchend', fine); area.addEventListener('touchcancel', fine);
  area.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; inizio(e.clientX); area.setPointerCapture?.(e.pointerId); });
  area.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; muovi(e.clientX); });
  area.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') fine(); }); area.addEventListener('pointercancel', e => { if (e.pointerType !== 'touch') fine(); });
  const loop = new Loop({ tick: () => sessione.tick(), disegna: () => renderer.disegna(scena) });
  loop.avvia();
  return { scena, sessione, editor, loop, renderer, distruggi() { loop.ferma(); root.innerHTML = ''; root.classList.remove('scheda-codice'); } };
}
