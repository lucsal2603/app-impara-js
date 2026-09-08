// Collega editor, interprete, scena e verifica. Stati: pronto, esecuzione, passo, pausa, finito, morto.
import { compila } from '../interprete/index.js';

export class Sessione {
  constructor({ scena, editor, api, ui, onVittoria = null }) {
    this.scena = scena; this.editor = editor; this.api = api; this.ui = ui; this.onVittoria = onVittoria;
    this.stato = 'pronto'; this.gen = null; this.azioneInCorso = false;
  }
  imposta(stato) { this.stato = stato; this.ui.stato(stato); this.editor.solaLettura(stato !== 'pronto'); }

  prepara() {
    const ris = compila(this.editor.codice(), this.api);
    if (!ris.ok) { this.ui.errore(ris.errore); this.editor.evidenzia(ris.errore.riga); return false; }
    this.ui.errore(null); this.gen = ris.programma.esegui(); this.azioneInCorso = false; return true;
  }
  esegui() {
    if (this.stato === 'pausa') return this.imposta('esecuzione');
    if (this.stato === 'pronto' && this.prepara()) this.imposta('esecuzione');
  }
  passo() {
    if (this.stato === 'pronto' && !this.prepara()) return;
    if (['pronto', 'pausa'].includes(this.stato)) { this.attesaPasso = true; this.imposta('passo'); }
  }
  pausa() {
    if (['esecuzione', 'passo'].includes(this.stato)) this.imposta('pausa');
    else if (this.stato === 'pausa') this.imposta('esecuzione');
  }
  ricomincia() {
    this.scena.reset(); this.gen = null; this.azioneInCorso = false;
    this.editor.evidenzia(null); this.ui.messaggio(null); this.ui.errore(null); this.imposta('pronto');
  }

  tick() {
    const s = this.scena;
    if (s.esito === 'morto') {
      s.tick();
      if (s.morteFinita()) { this.ui.messaggio('Ahi! Riprova.'); this.ricomincia(); }
      return;
    }
    if (this.stato === 'esecuzione' || this.stato === 'passo') {
      const fine = s.tick();
      if (s.esito === 'vinto') { const v = s.verifica(); this.ui.messaggio(v.messaggio); this.editor.evidenzia(null); this.imposta('finito'); this.onVittoria?.(); return; }
      if (s.esito === 'morto') { this.ui.messaggio('Ahi!'); return; }
      if (!fine) return;
      if (this.stato === 'passo' && this.azioneInCorso) { this.azioneInCorso = false; this.imposta('pausa'); return; }
      this.prossimaAzione();
    } else s.animaSolo();
  }

  prossimaAzione() {
    while (true) {
      const r = this.gen.next();
      if (r.done) { this.editor.evidenzia(null); if (this.scena.uscita) return; this.imposta('finito'); this.ui.messaggio(null); return; }   // se sta entrando nella porta, la scena continua fino alla fine
      const v = r.value;
      if (v.tipo === 'riga') { this.editor.evidenzia(v.riga); continue; }
      if (v.tipo === 'azione') { this.scena.avvia(this.api_fn(v.nome)(...v.args)); this.azioneInCorso = true; return; }
    }
  }
  api_fn(nome) { return this.scena.api()[nome]; }
}
