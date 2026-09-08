// Interfaccia comune delle scene: ogni famiglia (platform, luci, serra, ...) la rispetta.
export class Scena {
  constructor(config, risorse) { this.config = config; this.risorse = risorse; }
  api() { return {}; }              // nome -> funzione che costruisce un'azione
  avvia(azione) {}                  // mette in esecuzione un'azione
  tick() { return true; }           // avanza di un tick; true quando l'azione corrente è finita
  animaSolo() {}                    // avanza solo le animazioni (pausa)
  verifica(obiettivo) { return { ok: false, messaggio: '' }; }
  reset() {}
  disegna(ctx, T) {}
}
