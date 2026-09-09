// Controlla che il programma usi solo i costrutti sbloccati fino a quel punto del corso e nomi che esistono.
import { ErroreCodice, suggerisci } from './errori.js';

const CHIAVE = {
  ForStatement: 'for', ForOfStatement: 'for', WhileStatement: 'while', DoWhileStatement: 'while', BreakStatement: 'while', ContinueStatement: 'while',
  IfStatement: 'if', ConditionalExpression: 'if',
  VariableDeclaration: 'let', VariableDeclarator: 'let', AssignmentExpression: 'let', UpdateExpression: 'let',
  FunctionDeclaration: 'function', ReturnStatement: 'function',
  ArrayExpression: 'array', ObjectExpression: 'object', Property: 'object',
};
const NOMI = { for: 'il ciclo for', while: 'il ciclo while', if: "l'istruzione if", let: 'le variabili', function: 'le funzioni', array: 'gli array', object: 'gli oggetti' };
const SEMPRE = new Set(['Program', 'ExpressionStatement', 'CallExpression', 'Identifier', 'Literal', 'BlockStatement', 'BinaryExpression', 'LogicalExpression',
  'UnaryExpression', 'MemberExpression', 'EmptyStatement', 'TemplateLiteral', 'TemplateElement']);

export function valida(ast, sintassi, api, sensori = []) {
  const funzioni = new Set(); const dichiarate = new Set();
  camminata(ast, n => { if (n.type === 'FunctionDeclaration') funzioni.add(n.id.name); if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id.type === 'Identifier') dichiarate.add(d.id.name); if (n.type === 'FunctionDeclaration') for (const p of n.params) if (p.type === 'Identifier') dichiarate.add(p.name); });
  const noti = [...api, ...funzioni, ...sensori, 'console', 'Math'];
  try {
    camminata(ast, n => {
      const riga = n.loc?.start.line || 1;
      const k = CHIAVE[n.type];
      if (k && !sintassi.includes(k)) throw new ErroreCodice(`${NOMI[k][0].toUpperCase() + NOMI[k].slice(1)} arriva più avanti nel corso: qui usa solo i comandi che hai già imparato.`, riga);
      if (!k && !SEMPRE.has(n.type)) throw new ErroreCodice(`Questo costrutto non è disponibile nel gioco (${n.type}).`, riga);
      if (n.type === 'ExpressionStatement' && n.expression.type === 'Identifier') {
        const s = suggerisci(n.expression.name, api) || n.expression.name;
        throw new ErroreCodice(`Per usare un comando servono le parentesi: ${s}()`, riga);
      }
      if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
        const nome = n.callee.name;
        if (!noti.includes(nome) && !dichiarate.has(nome)) {
          const s = suggerisci(nome, [...api, ...funzioni]);
          throw new ErroreCodice(`${nome} non esiste.${s ? ` Forse volevi ${s}()?` : ''}`, riga);
        }
      }
      if (n.type === 'MemberExpression' && !n.computed && ['__proto__', 'constructor', 'prototype'].includes(n.property.name)) throw new ErroreCodice('Questa proprietà non è disponibile.', riga);
    });
  } catch (e) {
    if (e instanceof ErroreCodice) return { ok: false, errore: { riga: e.riga, messaggio: e.message } };
    throw e;
  }
  return { ok: true };
}

export function camminata(node, f) {
  if (!node || typeof node.type !== 'string') return;
  f(node);
  for (const k of Object.keys(node)) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => camminata(c, f)); else if (v && typeof v.type === 'string') camminata(v, f);
  }
}
