// Evidenzia il codice dentro ai testi delle schede: comandi con le parentesi, parole chiave, sensori, confronti, stringhe.
// Restituisce un frammento DOM con <code> attorno ai pezzi di codice e <em> attorno alle parole tra **asterischi**.
const CODICE = new RegExp([
  String.raw`\*\*[^*]+\*\*`,                                                            // **parola** in giallo
  String.raw`"[^"\n]*"`,                                                                 // stringhe
  String.raw`!?[a-zA-Z_][\w.]*(?:\([^()\n]*\))?(?:\s*(?:===|!==|<=|>=|<|>|%)\s*-?\w+(?:\(\))?)+`, // i < 5, n % 2, coinsLeft() > 0, n % 2 === 0
  String.raw`!?[a-zA-Z_][\w.]*\([^()\n]*\)(?:\.\w+)?`,                                   // moveRight(), wait(1), console.log(i), Math.floor(n / 10)
  String.raw`!?\b(?:laser\.isOn|door\.isOpen|console\.log|Math\.floor)\b`,                // sensori e membri
  String.raw`\b(?:let|const)\s+\w+(?:\s*=\s*[^\s,.;:]+)?`,                               // let attesa = 3
  String.raw`\b[a-z]\w*\s*=\s*-?\d+\b`,                                                 // x = 0, tempo = 1
  String.raw`\b\w+(?:\+\+|--)`,                                                         // i++, k--
  String.raw`\b(?:moveRight|moveLeft|jump|wait|pickUp|putDown|frontIsWall|frontIsGap|hasBox|hasKey|coinsLeft|moveright|MoveRight|JavaScript)\b`, // comandi nominati senza parentesi
  String.raw`\b(?:if|else|for|while|function|return|true|false)\b`,                     // parole chiave
  String.raw`&&|\|\||===`,
].join('|'), 'g');

export function conCodice(testo) {
  const frag = document.createDocumentFragment(); let ultimo = 0;
  for (const m of String(testo).matchAll(CODICE)) {
    if (m.index > ultimo) frag.append(testo.slice(ultimo, m.index));
    const t = m[0];
    if (t.startsWith('**')) { const em = document.createElement('em'); em.className = 'evid'; em.textContent = t.slice(2, -2); frag.appendChild(em); }
    else { const c = document.createElement('code'); c.className = 'inl'; c.textContent = t; frag.appendChild(c); }
    ultimo = m.index + t.length;
  }
  if (ultimo < testo.length) frag.append(testo.slice(ultimo));
  return frag;
}
export function riempi(el, testo) { el.replaceChildren(conCodice(testo)); return el; }
