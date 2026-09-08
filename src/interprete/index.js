// Interprete minimo per i primi livelli: accetta solo chiamate a comandi, una per riga.
// Verrà sostituito dal parser acorn + valutatore a generatori (milestone M1). Stessa interfaccia.
export function compila(codice, api) {
  const righe = codice.split('\n'), istruzioni = [];
  const errore = (riga, messaggio) => ({ ok: false, errore: { riga, messaggio } });
  for (let i = 0; i < righe.length; i++) {
    let r = righe[i].trim(); if (!r || r.startsWith('//')) continue;
    if (r.endsWith(';')) r = r.slice(0, -1).trim();
    const m = r.match(/^([A-Za-z_]\w*)\s*\((.*)\)$/);
    if (!m) {
      const id = r.match(/^([A-Za-z_]\w*)$/);
      if (id) { const s = suggerisci(id[1], api) || id[1]; return errore(i + 1, `Per usare un comando servono le parentesi: ${s}()`); }
      if (/^[A-Za-z_]\w*\s*\(/.test(r)) return errore(i + 1, `Manca una parentesi chiusa alla riga ${i + 1}.`);
      return errore(i + 1, `Non capisco la riga ${i + 1}. Per ora si scrive un comando per riga, per esempio ${api[0]}().`);
    }
    const nome = m[1], testoArg = m[2].trim();
    if (!api.includes(nome)) { const s = suggerisci(nome, api); return errore(i + 1, `${nome} non esiste.${s ? ` Forse volevi ${s}()?` : ''}`); }
    const args = [];
    for (const a of testoArg ? testoArg.split(',').map(t => t.trim()) : []) {
      if (!/^-?\d+(\.\d+)?$/.test(a)) return errore(i + 1, `${nome} accetta solo numeri, per esempio ${nome}(1).`);
      args.push(Number(a));
    }
    istruzioni.push({ riga: i + 1, nome, args });
  }
  if (!istruzioni.length) return errore(1, 'Il programma è vuoto: scrivi almeno un comando.');
  return {
    ok: true,
    programma: {
      istruzioni,
      *esegui() { for (const ist of istruzioni) { yield { tipo: 'riga', riga: ist.riga }; yield { tipo: 'azione', riga: ist.riga, nome: ist.nome, args: ist.args }; } },
    },
  };
}

function suggerisci(nome, api) {
  let best = null, bd = 3;
  for (const n of api) { const d = distanza(nome.toLowerCase(), n.toLowerCase()); if (d < bd) { bd = d; best = n; } }
  return best;
}
function distanza(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
