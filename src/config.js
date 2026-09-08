// Costanti del motore e della scena platform.
export const TICK_AL_SECONDO = 60;
export const COLONNE = 8;          // tasselli visibili in larghezza sull'iPhone
export const RIGHE = 7;
export const DURATE = {            // in tick
  move: 24,                        // un passo di un tassello
  jump: 36,
  bump: 16,                        // urto contro un ostacolo
  fallCella: 8,                    // caduta di un tassello
  secondo: 60,                     // wait(1)
  morte: 120,                      // durata dell'animazione di morte
  porta: 4,                        // tick per fotogramma della porta che si apre
};
export const LIMITI = { righeMax: 60 };
