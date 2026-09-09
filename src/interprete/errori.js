// Errori dell'interprete, sempre con la riga e un messaggio in italiano semplice.
export class ErroreCodice extends Error {
  constructor(messaggio, riga = 1) { super(messaggio); this.riga = riga; }
}
export function distanza(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
export function suggerisci(nome, nomi) {
  let best = null, bd = 3;
  for (const n of nomi) { const d = distanza(nome.toLowerCase(), n.toLowerCase()); if (d < bd) { bd = d; best = n; } }
  return best;
}
