// Le azioni sono oggetti semplici: l'interprete le produce, la scena le esegue con un'animazione.
import { DURATE } from '../config.js';
export const azioni = {
  moveRight: () => ({ tipo: 'move', dir: 1 }),
  moveLeft:  () => ({ tipo: 'move', dir: -1 }),
  jump:      () => ({ tipo: 'jump' }),
  wait:      (secondi = 1) => ({ tipo: 'wait', ticks: Math.max(1, Math.round(Number(secondi) * DURATE.secondo)) }),
};
