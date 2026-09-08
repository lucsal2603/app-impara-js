// Legge la mappa a caratteri e la legenda e produce griglia ed entità.
export function analizzaLivello(config) {
  const mappa = config.mappa, legenda = config.legenda;
  const righe = mappa.length, colonne = Math.max(...mappa.map(r => r.length));
  const solido = Array.from({ length: righe }, () => Array(colonne).fill(false));
  const tasselli = Array.from({ length: righe }, () => Array(colonne).fill(null));
  const decor = [], piastre = [], porte = [], chiavi = [], pericoli = [], laser = [], monete = [], casse = [];
  let spawn = { x: 0, y: righe - 2 }, uscita = null;
  const vistePorte = new Set();
  for (let y = 0; y < righe; y++) for (let x = 0; x < colonne; x++) {
    const ch = mappa[y][x] ?? '.';
    if (ch === '.') continue;
    const voce = legenda[ch];
    if (voce === undefined) throw new Error(`Carattere sconosciuto nella mappa: "${ch}"`);
    const tipo = typeof voce === 'string' ? voce : voce.tipo;
    switch (tipo) {
      case 'pavimento': case 'blocco': solido[y][x] = true; tasselli[y][x] = tipo; break;
      case 'spawn': spawn = { x, y }; break;
      case 'uscita': uscita = { x, y }; break;
      case 'chiave': chiavi.push({ x, y, id: voce.id || `k${chiavi.length + 1}` }); break;
      case 'piastra': piastre.push({ x, y, id: voce.id || `p${piastre.length + 1}`, durata: voce.durata || 0, tenuta: !!voce.tenuta }); break;
      case 'cassa': casse.push({ x, y, id: voce.id || `c${casse.length + 1}` }); break;
      case 'spuntoni': pericoli.push({ x, y, tipo }); break;
      case 'moneta': monete.push({ x, y, id: voce.id || `m${monete.length + 1}` }); break;
      case 'laser': laser.push({ x, y, id: voce.id || `l${laser.length + 1}`, lunghezza: voce.lunghezza || 1, acceso: voce.acceso ?? 180, spento: voce.spento ?? 180, fase: voce.fase || 0 }); break;
      case 'porta': {
        const chiave = `${ch}:${x}`;
        if (vistePorte.has(`${x},${y}`)) break;
        let yy = y; while (mappa[yy + 1]?.[x] === ch) yy++;
        for (let k = y; k <= yy; k++) vistePorte.add(`${x},${k}`);
        porte.push({ x, y: yy, alta: yy - y + 1, id: voce.id || `d${porte.length + 1}`, apre_con: voce.apre_con || [], chiave: voce.chiave || null });
        break;
      }
      default: decor.push({ x, y, tipo }); break;   // lampada, tubo, cartello ...
    }
  }
  return { righe, colonne, solido, tasselli, decor, piastre, porte, chiavi, pericoli, laser, monete, casse, spawn, uscita };
}

// Variante del pavimento in base ai vicini (bordo sinistro, destro, singolo, centro).
export function variantePavimento(tasselli, x, y) {
  const r = tasselli[y], s = !(r[x - 1]), d = !(r[x + 1]);
  return s && d ? 'pavimento_singolo' : s ? 'pavimento_sx' : d ? 'pavimento_dx' : 'pavimento_centro';
}
