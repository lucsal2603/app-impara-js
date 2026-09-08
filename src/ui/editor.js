// Editor provvisorio: textarea con numeri di riga ed evidenziazione della riga in esecuzione. CodeMirror arriva con M3.
export class Editor {
  constructor({ textarea, righe, evidenzia, palette, api, contatore, starter = '' }) {
    this.ta = textarea; this.righe = righe; this.ev = evidenzia; this.contatore = contatore; this.rigaAttiva = null;
    this.ta.value = starter;
    this.ta.addEventListener('input', () => this.aggiorna());
    this.ta.addEventListener('scroll', () => { this.righe.scrollTop = this.ev.scrollTop = this.ta.scrollTop; this.righe.scrollLeft = this.ev.scrollLeft = this.ta.scrollLeft; });
    for (const nome of api) {
      const b = document.createElement('button'); b.type = 'button';
      b.textContent = nome === 'wait' ? 'wait(1)' : `${nome}()`;
      b.addEventListener('click', () => this.inserisci(b.textContent + '\n'));
      palette.appendChild(b);
    }
    this.aggiorna();
  }
  codice() { return this.ta.value; }
  righeCodice() { return this.ta.value.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length; }
  solaLettura(v) { this.ta.readOnly = v; }
  inserisci(testo) {
    if (this.ta.readOnly) return;
    const a = this.ta.selectionStart, b = this.ta.selectionEnd, v = this.ta.value;
    const prima = v.slice(0, a), dopo = v.slice(b);
    const prefisso = prima.length && !prima.endsWith('\n') ? '\n' : '';
    this.ta.value = prima + prefisso + testo + dopo;
    this.ta.selectionStart = this.ta.selectionEnd = (prima + prefisso + testo).length;
    this.aggiorna();
  }
  evidenzia(riga) { this.rigaAttiva = riga; this.aggiorna(); }
  aggiorna() {
    const linee = this.ta.value.split('\n');
    this.righe.textContent = linee.map((_, i) => i + 1).join('\n');
    this.ev.replaceChildren(...linee.map((l, i) => { const d = document.createElement('div'); d.textContent = l || ' '; if (i + 1 === this.rigaAttiva) d.className = 'attiva'; return d; }));
    if (this.contatore) this.contatore.textContent = String(linee.filter(l => l.trim() && !l.trim().startsWith('//')).length);
  }
}
