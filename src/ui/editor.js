// Editor CodeMirror 6 per il telefono: numeri di riga, riga in esecuzione evidenziata, barra dei simboli e modelli (for, if, let...).
import { EditorState, Compartment, StateField, StateEffect } from '@codemirror/state';
import { EditorView, lineNumbers, Decoration, keymap, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { syntaxHighlighting, HighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { tags as t } from '@lezer/highlight';

const setRiga = StateEffect.define();
const rigaAttiva = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) if (e.is(setRiga)) {
      if (!e.value || e.value > tr.state.doc.lines) return Decoration.none;
      const l = tr.state.doc.line(e.value); return Decoration.set([Decoration.line({ class: 'cm-riga-attiva' }).range(l.from)]);
    }
    return tr.docChanged ? deco.map(tr.changes) : deco;
  },
  provide: f => EditorView.decorations.from(f),
});
const colori = HighlightStyle.define([
  { tag: t.keyword, color: '#c792ea' }, { tag: t.controlKeyword, color: '#c792ea' }, { tag: t.definitionKeyword, color: '#c792ea' },
  { tag: t.number, color: '#f78c6c' }, { tag: t.string, color: '#c3e88d' }, { tag: t.comment, color: '#6e7680', fontStyle: 'italic' },
  { tag: t.function(t.variableName), color: '#82aaff' }, { tag: t.variableName, color: '#f5f2eb' }, { tag: t.propertyName, color: '#ffcb6b' },
  { tag: t.operator, color: '#89ddff' }, { tag: t.bool, color: '#f78c6c' }, { tag: t.paren, color: '#aab0b8' }, { tag: t.brace, color: '#aab0b8' },
]);
const tema = EditorView.theme({
  '&': { height: '100%', fontSize: '15px', backgroundColor: 'transparent', color: '#f5f2eb' },
  '.cm-scroller': { fontFamily: 'Menlo, "SF Mono", monospace', lineHeight: '24px', overflow: 'auto' },
  '.cm-content': { padding: '10px 0', caretColor: '#3ddc84' },
  '.cm-line': { padding: '0 12px' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#6e7680', border: 0, paddingLeft: '8px' },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', padding: '0 6px 0 0' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-cursor': { borderLeftColor: '#3ddc84', borderLeftWidth: '2px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#2c4a3a !important' },
  '.cm-riga-attiva': { backgroundColor: '#2c3e37' },
  '.cm-matchingBracket': { backgroundColor: '#3a4a44', outline: 'none' },
}, { dark: true });

// modelli inseriti con un tocco: [testo, posizione del cursore relativa all'inizio, lunghezza della selezione]
const MODELLI = {
  let: ['let n = 0\n', 4, 1], const: ['const n = 0\n', 6, 1],
  if: ['if (cond) {\n  \n}\n', 4, 4], else: ['else {\n  \n}\n', 9, 0],
  for: ['for (let i = 0; i < 3; i++) {\n  \n}\n', 31, 0], while: ['while (cond) {\n  \n}\n', 7, 4],
  function: ['function nome() {\n  \n}\n', 9, 4], return: ['return \n', 7, 0], log: ['console.log()\n', 12, 0],
};
const ETICHETTE = { let: 'let', const: 'const', if: 'if', else: 'else', for: 'for', while: 'while', function: 'function', return: 'return', log: 'console.log' };
const SIMBOLI = ['(', ')', '{', '}', '=', '<', '>', '+', '-', ';', '"', '!', '&&', '||', '==='];

export class Editor {
  constructor({ contenitore, palette, simboli, api = [], sintassi = ['call'], sensori = [], contatore, starter = '', onModifica = null }) {
    this.contatore = contatore; this.rigaAttiva = null; this.onModifica = onModifica;
    this.soloLettura = new Compartment();
    this.view = new EditorView({
      parent: contenitore,
      state: EditorState.create({
        doc: starter,
        extensions: [
          lineNumbers(), history(), drawSelection(), bracketMatching(), closeBrackets(), indentOnInput(), javascript(),
          syntaxHighlighting(colori), tema, rigaAttiva,
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
          EditorState.tabSize.of(2),
          EditorView.contentAttributes.of({ autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Codice' }),
          this.soloLettura.of([EditorState.readOnly.of(false), EditorView.editable.of(true)]),
          EditorView.updateListener.of(u => { if (u.docChanged) this.aggiorna(); }),
        ],
      }),
    });
    // palette dei comandi del livello (azioni e sensori)
    for (const nome of api) this.bottone(palette, nome === 'wait' ? 'wait(1)' : `${nome}()`, () => this.inserisci((nome === 'wait' ? 'wait(1)' : `${nome}()`) + '\n'));
    for (const nome of sensori) this.bottone(palette, nome === 'laser' ? 'laser.isOn' : nome === 'door' ? 'door.isOpen' : `${nome}()`, () => this.inserisci(nome === 'laser' ? 'laser.isOn' : nome === 'door' ? 'door.isOpen' : `${nome}()`, true), 'sensore');
    // barra dei simboli + modelli sbloccati dalla sintassi del livello
    if (simboli) {
      const modelli = []; if (sintassi.includes('let')) modelli.push('let', 'const', 'log'); if (sintassi.includes('if')) modelli.push('if', 'else');
      if (sintassi.includes('for')) modelli.push('for'); if (sintassi.includes('while')) modelli.push('while'); if (sintassi.includes('function')) modelli.push('function', 'return');
      for (const m of modelli) this.bottone(simboli, ETICHETTE[m], () => this.modello(m), 'modello');
      for (const s of SIMBOLI) this.bottone(simboli, s, () => this.inserisci(s, true));
      this.bottone(simboli, '⇥', () => this.inserisci('  ', true), 'tab');
    }
    this.aggiorna();
  }
  bottone(dove, testo, azione, classe = '') {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = testo; if (classe) b.className = classe;
    b.addEventListener('pointerdown', e => e.preventDefault());   // non far perdere il fuoco all'editor (la tastiera resta aperta)
    b.addEventListener('click', azione); dove.appendChild(b); return b;
  }
  codice() { return this.view.state.doc.toString(); }
  imposta(testo) { this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: testo } }); }
  righeCodice() { return this.codice().split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length; }
  solaLettura(v) { this.view.dispatch({ effects: this.soloLettura.reconfigure([EditorState.readOnly.of(v), EditorView.editable.of(!v)]) }); }
  get bloccato() { return this.view.state.readOnly; }
  inserisci(testo, inLinea = false) {
    if (this.bloccato) return;
    const { from, to } = this.view.state.selection.main; const doc = this.view.state.doc;
    let ins = testo, pos = from;
    if (!inLinea) { const l = doc.lineAt(from); if (l.text.trim().length && from > l.from) { ins = '\n' + testo; } }
    this.view.dispatch({ changes: { from, to, insert: ins }, selection: { anchor: pos + ins.length } });
    this.view.focus();
  }
  modello(nome) {
    if (this.bloccato) return;
    const [testo, cur, sel] = MODELLI[nome]; const { from, to } = this.view.state.selection.main; const doc = this.view.state.doc;
    const l = doc.lineAt(from); const indent = (l.text.match(/^\s*/) || [''])[0];
    const corpo = testo.split('\n').map((r, i) => (i ? indent : '') + r).join('\n');
    const prefisso = l.text.trim().length && from > l.from ? '\n' + indent : '';
    const off = prefisso.length + cur + (indent.length * (testo.slice(0, cur).split('\n').length - 1));
    this.view.dispatch({ changes: { from, to, insert: prefisso + corpo }, selection: { anchor: from + off, head: from + off + sel } });
    this.view.focus();
  }
  evidenzia(riga) { this.rigaAttiva = riga; this.view.dispatch({ effects: setRiga.of(riga || 0) }); }
  aggiorna() { if (this.contatore) this.contatore.textContent = String(this.righeCodice()); this.onModifica?.(); }
  focus() { this.view.focus(); }
}
