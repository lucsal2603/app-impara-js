// Collega editor, interprete, scena e verifica. Stati: pronto, esecuzione, passo, pausa, cambio, finito, morto.
import { compila, ErroreCodice } from '../interprete/index.js';
import { azioni } from '../motore/azioni.js';

export class Sessione {
  constructor({ scena, editor, api, ui, sintassi = ['call'], varianti = null, onVittoria = null }) {
    this.scena = scena; this.editor = editor; this.api = api; this.ui = ui; this.onVittoria = onVittoria;
    this.sintassi = sintassi; this.varianti = varianti || [scena.config]; this.variante = 0;
    this.stato = 'pronto'; this.gen = null; this.ast = null; this.azioneInCorso = false; this.attesaCambio = 0;
  }
  imposta(stato) { this.stato = stato; this.ui.stato(stato); this.editor.solaLettura(stato !== 'pronto'); }

  prepara() {
    const ris = compila(this.editor.codice(), this.api, { sintassi: this.sintassi, sensori: Object.keys(this.scena.sensori()) });
    if (!ris.ok) { this.ui.errore(ris.errore); this.editor.evidenzia(ris.errore.riga); return false; }
    this.ui.errore(null); this.ast = ris.ast; this.programma = ris.programma; this.avviaProgramma(); return true;
  }
  avviaProgramma() {
    const fn = {}; for (const n of this.api) if (azioni[n]) fn[n] = azioni[n];
    this.gen = this.programma.esegui({ api: fn, sensori: this.scena.sensori() }); this.azioneInCorso = false;
    this.ui.console?.(null); this.ui.variabili?.(null);
  }
  esegui() {
    this.scena.cam.manuale = false;                       // la camera torna a seguire il personaggio
    if (this.stato === 'pausa') return this.imposta('esecuzione');
    if (this.stato === 'pronto' && this.prepara()) this.imposta('esecuzione');
  }
  passo() {
    this.scena.cam.manuale = false;
    if (this.stato === 'pronto' && !this.prepara()) return;
    if (['pronto', 'pausa'].includes(this.stato)) { this.attesaPasso = true; this.imposta('passo'); }
  }
  pausa() {
    if (['esecuzione', 'passo'].includes(this.stato)) this.imposta('pausa');
    else if (this.stato === 'pausa') this.imposta('esecuzione');
  }
  ricomincia() {
    if (this.variante !== 0) { this.variante = 0; this.scena.impostaConfig(this.varianti[0]); } else this.scena.reset();
    this.gen = null; this.azioneInCorso = false; this.attesaCambio = 0;
    this.editor.evidenzia(null); this.ui.messaggio(null); this.ui.errore(null); this.ui.console?.(null); this.ui.variabili?.(null); this.imposta('pronto');
  }

  tick() {
    const s = this.scena;
    if (s.esito === 'morto') {
      s.tick();
      if (s.morteFinita()) { this.ui.messaggio('Ahi! Bit riparte dall\'inizio.'); this.ricomincia(); }
      return;
    }
    if (this.stato === 'cambio') {          // stessa programma, stanza diversa: piccola pausa e si riparte
      s.animaSolo();
      if (--this.attesaCambio <= 0) { this.variante++; s.impostaConfig(this.varianti[this.variante]); this.ui.messaggio(null); this.avviaProgramma(); this.imposta('esecuzione'); }
      return;
    }
    if (this.stato === 'esecuzione' || this.stato === 'passo') {
      const fine = s.tick();
      if (s.esito === 'vinto') {
        if (this.variante < this.varianti.length - 1) { this.ui.messaggio(`Stanza ${this.variante + 1} di ${this.varianti.length} superata!`); this.attesaCambio = 70; this.editor.evidenzia(null); this.imposta('cambio'); return; }
        const v = s.verifica(); this.ui.messaggio(v.messaggio); this.editor.evidenzia(null); this.imposta('finito'); this.onVittoria?.(); return;
      }
      if (s.esito === 'morto') { this.ui.messaggio('Ahi, Bit!'); return; }
      if (!fine) return;
      if (this.stato === 'passo' && this.azioneInCorso) { this.azioneInCorso = false; this.imposta('pausa'); return; }
      this.prossimaAzione();
    } else s.animaSolo();
  }

  prossimaAzione() {
    while (true) {
      let r;
      try { r = this.gen.next(); }
      catch (e) {
        if (!(e instanceof ErroreCodice)) { console.error(e); e = new ErroreCodice('Errore inatteso: ' + e.message, 1); }
        this.ui.errore({ riga: e.riga, messaggio: e.message }); this.editor.evidenzia(e.riga); this.imposta('finito'); return;
      }
      if (r.done) { this.editor.evidenzia(null); if (this.scena.uscita) return; this.imposta('finito'); this.ui.messaggio(this.varianti.length > 1 ? 'Il programma è finito prima dell\'uscita.' : null); return; }   // se sta entrando nella porta, la scena continua fino alla fine
      const v = r.value;
      if (v.tipo === 'riga') { this.editor.evidenzia(v.riga); this.ui.variabili?.(v.variabili); continue; }
      if (v.tipo === 'variabili') { this.ui.variabili?.(v.variabili); continue; }
      if (v.tipo === 'log') { this.ui.console?.(v.testo); continue; }
      if (v.tipo === 'azione') { this.scena.avvia(v.azione); this.azioneInCorso = true; return; }
    }
  }
}
