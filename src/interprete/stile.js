// Analisi di stile sull'albero sintattico: serve alle stelle "usa un ciclo", "niente ripetizioni", "usa una funzione".
import { camminata } from './validate.js';

function firma(n) {   // forma di un'istruzione senza posizioni, per confrontare righe uguali
  return JSON.stringify(n, (k, v) => (k === 'loc' || k === 'start' || k === 'end') ? undefined : v);
}
export function analizzaStile(ast) {
  const r = { cicli: 0, whiles: 0, fors: 0, funzioni: 0, chiamateFunzioni: 0, ifs: 0, variabili: 0, log: 0, sensori: 0, ripetizioni: 0 };
  const nomiFunzioni = new Set();
  camminata(ast, n => {
    if (n.type === 'ForStatement' || n.type === 'WhileStatement' || n.type === 'DoWhileStatement' || n.type === 'ForOfStatement') r.cicli++;
    if (n.type === 'WhileStatement' || n.type === 'DoWhileStatement') r.whiles++;
    if (n.type === 'ForStatement' || n.type === 'ForOfStatement') r.fors++;
    if (n.type === 'FunctionDeclaration') { r.funzioni++; nomiFunzioni.add(n.id.name); }
    if (n.type === 'IfStatement' || n.type === 'ConditionalExpression') r.ifs++;
    if (n.type === 'VariableDeclaration') r.variabili += n.declarations.length;
    if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.object.name === 'console') r.log++;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && /^(frontIsWall|frontIsGap|hasBox|coinsLeft|hasKey)$/.test(n.callee.name)) r.sensori++;
    if (n.type === 'MemberExpression' && n.object.type === 'Identifier' && /^(laser|door)$/.test(n.object.name)) r.sensori++;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && nomiFunzioni.has(n.callee.name)) r.chiamateFunzioni++;
    const corpo = n.type === 'Program' || n.type === 'BlockStatement' ? n.body : null;
    if (corpo) {   // tre istruzioni uguali di fila = ripetizione che un ciclo eviterebbe
      let serie = 1;
      for (let i = 1; i < corpo.length; i++) {
        if (corpo[i].type !== 'FunctionDeclaration' && firma(corpo[i]) === firma(corpo[i - 1])) { serie++; if (serie === 3) r.ripetizioni++; } else serie = 1;
      }
    }
  });
  r.chiamateFunzioni = Math.max(0, r.chiamateFunzioni - 0);
  return r;
}
