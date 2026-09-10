// Valutatore a generatori: ogni istruzione produce {tipo:'riga'}, ogni comando della scena {tipo:'azione'}, console.log {tipo:'log'}.
// Nessun eval: si cammina l'albero sintattico. Limite di istruzioni tra un'azione e l'altra contro i cicli infiniti.
import { ErroreCodice, suggerisci } from './errori.js';

class Ritorno { constructor(v) { this.valore = v; } }
class Break {} class Continue {}
const LIMITE_VUOTO = 3000, LIMITE_TOTALE = 200000, LIMITE_PROFONDITA = 60;

class Scope {
  constructor(padre, sistema = false) { this.padre = padre; this.vars = new Map(); this.sistema = sistema; }
  dichiara(nome, valore, kind, riga) { if (this.vars.has(nome)) throw new ErroreCodice(`${nome} è già stata dichiarata: scegli un altro nome o togli il secondo let.`, riga); this.vars.set(nome, { valore, kind }); }
  trova(nome) { let s = this; while (s) { if (s.vars.has(nome)) return s; s = s.padre; } return null; }
  leggi(nome, riga) {
    const s = this.trova(nome);
    if (!s) { const tutti = []; let c = this; while (c) { tutti.push(...c.vars.keys()); c = c.padre; } const sug = suggerisci(nome, tutti); throw new ErroreCodice(`${nome} non esiste.${sug ? ` Forse volevi ${sug}?` : ` Se è una variabile, dichiarala prima con let ${nome} = ...`}`, riga); }
    return s.vars.get(nome).valore;
  }
  assegna(nome, valore, riga) {
    const s = this.trova(nome);
    if (!s) throw new ErroreCodice(`${nome} non esiste. Dichiarala prima con let ${nome} = ...`, riga);
    const v = s.vars.get(nome);
    if (v.kind === 'const') throw new ErroreCodice(`${nome} è una const e non si può cambiare. Usa let se deve cambiare valore.`, riga);
    if (s.sistema) throw new ErroreCodice(`${nome} è un comando del gioco, non si può sovrascrivere.`, riga);
    v.valore = valore;
  }
  visibili() {
    const out = {}; const catena = []; let s = this;
    while (s) { if (!s.sistema) catena.unshift(s); s = s.padre; }
    for (const sc of catena) for (const [k, v] of sc.vars) if (!(v.valore && v.valore.__funzione)) out[k] = v.valore;
    return out;
  }
}

// Un "riferimento" a cui assegnare: una variabile, oppure una proprietà/indice di un oggetto o array.
function* riferimento(n, scope, stato, riga) {
  if (n.type === 'Identifier') return { get: () => scope.leggi(n.name, riga), set: (v) => scope.assegna(n.name, v, riga) };
  if (n.type === 'MemberExpression') {
    const o = yield* espr(n.object, scope, stato); const k = n.computed ? yield* espr(n.property, scope, stato) : n.property.name;
    if (o === null || o === undefined || (typeof o !== 'object')) throw new ErroreCodice(`Non posso scrivere ${k} su qualcosa che non è un oggetto o un array.`, riga);
    if (['__proto__', 'constructor', 'prototype'].includes(k)) throw new ErroreCodice('Questa proprietà non è disponibile.', riga);
    return { get: () => o[k], set: (v) => { o[k] = v; } };
  }
  throw new ErroreCodice('Si può assegnare un valore solo a una variabile o a una proprietà.', riga);
}
function* chiama(fn, args, stato, riga, nome = 'funzione') {
  if (stato.profondita > LIMITE_PROFONDITA) throw new ErroreCodice(`${nome} si chiama da sola troppe volte.`, riga);
  const s = new Scope(fn.chiusura);
  fn.node.params.forEach((p, i) => { if (p.type === 'Identifier') s.dichiara(p.name, args[i], 'let', riga); else throw new ErroreCodice('I parametri devono essere nomi semplici.', riga); });
  stato.profondita++;
  try {
    if (fn.node.body.type !== 'BlockStatement') return yield* espr(fn.node.body, s, stato);   // freccia con corpo a espressione
    yield* blocco(fn.node.body.body, s, stato); return undefined;
  }
  catch (e) { if (e instanceof Ritorno) return e.valore; throw e; }
  finally { stato.profondita--; }
}
// una funzione dell'utente passata a un metodo nativo (map, forEach, filter, sort...) va eseguita subito, senza azioni della scena
function avvolgi(fn, stato, riga) {
  return (...args) => {
    const g = chiama(fn, args, stato, riga); let r;
    while (!(r = g.next()).done) {
      if (r.value && r.value.tipo === 'azione') throw new ErroreCodice('Dentro una funzione passata a un metodo (map, forEach...) non si possono usare i comandi del gioco.', riga);
      if (r.value && r.value.tipo === 'log') (stato.logs = stato.logs || []).push(r.value);
    }
    return r.value;
  };
}
function testo(v) { if (typeof v === 'string') return v; if (Array.isArray(v)) return '[' + v.map(testo).join(', ') + ']'; if (v && typeof v === 'object') return JSON.stringify(v); return String(v); }

export function* esegui(ast, ctx) {
  const sistema = new Scope(null, true);
  for (const [n, fn] of Object.entries(ctx.api || {})) sistema.vars.set(n, { valore: { __native: fn, nome: n }, kind: 'const' });
  for (const [n, v] of Object.entries(ctx.sensori || {})) sistema.vars.set(n, { valore: v, kind: 'const' });
  sistema.vars.set('console', { valore: { log: { __native: (...a) => ({ __log: a.map(testo).join(' ') }), nome: 'console.log' } }, kind: 'const' });
  sistema.vars.set('Math', { valore: Math, kind: 'const' });
  for (const [n, f] of Object.entries({ String: (v) => String(v), Number: (v) => Number(v), parseInt: (v, b) => parseInt(v, b), parseFloat: (v) => parseFloat(v), isNaN: (v) => isNaN(v), Boolean: (v) => Boolean(v) }))
    sistema.vars.set(n, { valore: { __native: f, nome: n }, kind: 'const' });
  const stato = { passi: 0, vuoto: 0, profondita: 0 };
  const utente = new Scope(sistema);
  yield* blocco(ast.body, utente, stato);
}

function* blocco(stmts, scope, stato) {
  for (const s of stmts) if (s.type === 'FunctionDeclaration') scope.dichiara(s.id.name, { __funzione: true, node: s, chiusura: scope }, 'const', s.loc.start.line);
  for (const s of stmts) yield* istruzione(s, scope, stato);
}

function controllo(stato, riga) {
  stato.passi++; stato.vuoto++;
  if (stato.vuoto > LIMITE_VUOTO) throw new ErroreCodice("Il programma gira a vuoto: probabilmente un ciclo che non finisce mai. Dentro il ciclo ci vuole un'azione, oppure la condizione deve cambiare.", riga);
  if (stato.passi > LIMITE_TOTALE) throw new ErroreCodice('Il programma è troppo lungo da eseguire: controlla i cicli.', riga);
}

function* istruzione(n, scope, stato) {
  const riga = n.loc?.start.line || 1;
  if (n.type !== 'BlockStatement' && n.type !== 'EmptyStatement' && n.type !== 'FunctionDeclaration') {
    controllo(stato, riga);
    yield { tipo: 'riga', riga, variabili: scope.visibili() };
  }
  yield* istruzioneInterna(n, scope, stato, riga);
  if (n.type !== 'BlockStatement' && n.type !== 'EmptyStatement' && n.type !== 'FunctionDeclaration') yield { tipo: 'variabili', variabili: scope.visibili() };
}

function* istruzioneInterna(n, scope, stato, riga) {
  switch (n.type) {
    case 'ExpressionStatement': yield* espr(n.expression, scope, stato); return;
    case 'VariableDeclaration':
      for (const d of n.declarations) {
        if (d.id.type !== 'Identifier') throw new ErroreCodice('Qui si può dichiarare una variabile alla volta, con un nome semplice.', riga);
        const v = d.init ? yield* espr(d.init, scope, stato) : undefined;
        if (n.kind === 'const' && !d.init) throw new ErroreCodice(`Una const va inizializzata subito: const ${d.id.name} = ...`, riga);
        scope.dichiara(d.id.name, v, n.kind, riga);
      }
      return;
    case 'IfStatement': {
      const t = yield* espr(n.test, scope, stato);
      if (t) yield* istruzione(n.consequent, scope, stato); else if (n.alternate) yield* istruzione(n.alternate, scope, stato);
      return;
    }
    case 'BlockStatement': yield* blocco(n.body, new Scope(scope), stato); return;
    case 'ForStatement': {
      const s = new Scope(scope);
      if (n.init) { if (n.init.type === 'VariableDeclaration') yield* istruzione(n.init, s, stato); else yield* espr(n.init, s, stato); }
      while (true) {
        if (n.test && !(yield* espr(n.test, s, stato))) break;
        try { yield* istruzione(n.body, s, stato); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
        if (n.update) yield* espr(n.update, s, stato);
        controllo(stato, riga);
      }
      return;
    }
    case 'WhileStatement':
      while (yield* espr(n.test, scope, stato)) {
        try { yield* istruzione(n.body, scope, stato); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
        controllo(stato, riga);
      }
      return;
    case 'DoWhileStatement':
      do {
        try { yield* istruzione(n.body, scope, stato); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
        controllo(stato, riga);
      } while (yield* espr(n.test, scope, stato));
      return;
    case 'ForOfStatement': {
      let lista = yield* espr(n.right, scope, stato);
      if (typeof lista === 'string') lista = [...lista];                 // for of su una stringa: lettera per lettera
      if (!Array.isArray(lista)) throw new ErroreCodice('for of vuole un array (o una stringa) dopo of.', riga);
      const nome = n.left.type === 'VariableDeclaration' ? n.left.declarations[0].id.name : n.left.name;
      for (const el of lista) {
        const s = new Scope(scope); s.dichiara(nome, el, 'let', riga);
        try { yield* istruzione(n.body, s, stato); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
        controllo(stato, riga);
      }
      return;
    }
    case 'FunctionDeclaration': return;
    case 'ReturnStatement': throw new Ritorno(n.argument ? yield* espr(n.argument, scope, stato) : undefined);
    case 'BreakStatement': throw new Break();
    case 'ContinueStatement': throw new Continue();
    case 'EmptyStatement': return;
    default: throw new ErroreCodice(`Istruzione non supportata: ${n.type}.`, riga);
  }
}

function* espr(n, scope, stato) {
  const riga = n.loc?.start.line || 1;
  switch (n.type) {
    case 'Literal': return n.value;
    case 'TemplateLiteral': { let s = ''; for (let i = 0; i < n.quasis.length; i++) { s += n.quasis[i].value.cooked; if (i < n.expressions.length) s += testo(yield* espr(n.expressions[i], scope, stato)); } return s; }
    case 'Identifier': return scope.leggi(n.name, riga);
    case 'ArrayExpression': { const out = []; for (const el of n.elements) out.push(el ? yield* espr(el, scope, stato) : undefined); return out; }
    case 'ObjectExpression': { const o = {}; for (const p of n.properties) { const k = p.computed ? yield* espr(p.key, scope, stato) : (p.key.name ?? p.key.value); o[k] = yield* espr(p.value, scope, stato); } return o; }
    case 'BinaryExpression': {
      const a = yield* espr(n.left, scope, stato), b = yield* espr(n.right, scope, stato);
      switch (n.operator) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return a / b; case '%': return a % b; case '**': return a ** b;
        case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
        case '===': case '==': return a === b; case '!==': case '!=': return a !== b;
        default: throw new ErroreCodice(`Operatore non supportato: ${n.operator}`, riga);
      }
    }
    case 'LogicalExpression': {
      const a = yield* espr(n.left, scope, stato);
      if (n.operator === '&&') return a ? yield* espr(n.right, scope, stato) : a;
      if (n.operator === '||') return a ? a : yield* espr(n.right, scope, stato);
      if (n.operator === '??') return a ?? (yield* espr(n.right, scope, stato));
      throw new ErroreCodice(`Operatore non supportato: ${n.operator}`, riga);
    }
    case 'UnaryExpression': { const v = yield* espr(n.argument, scope, stato); switch (n.operator) { case '!': return !v; case '-': return -v; case '+': return +v; case 'typeof': return typeof v; default: throw new ErroreCodice(`Operatore non supportato: ${n.operator}`, riga); } }
    case 'UpdateExpression': {
      const leggi = yield* riferimento(n.argument, scope, stato, riga);
      const vecchio = leggi.get(); const nuovo = n.operator === '++' ? vecchio + 1 : vecchio - 1;
      leggi.set(nuovo); return n.prefix ? nuovo : vecchio;
    }
    case 'AssignmentExpression': {
      const rif = yield* riferimento(n.left, scope, stato, riga);
      let v = yield* espr(n.right, scope, stato);
      if (n.operator !== '=') { const a = rif.get(); switch (n.operator) { case '+=': v = a + v; break; case '-=': v = a - v; break; case '*=': v = a * v; break; case '/=': v = a / v; break; case '%=': v = a % v; break; default: throw new ErroreCodice(`Operatore non supportato: ${n.operator}`, riga); } }
      rif.set(v); return v;
    }
    case 'ConditionalExpression': return (yield* espr(n.test, scope, stato)) ? yield* espr(n.consequent, scope, stato) : yield* espr(n.alternate, scope, stato);
    case 'FunctionExpression': case 'ArrowFunctionExpression': return { __funzione: true, node: n, chiusura: scope };
    case 'MemberExpression': {
      const o = yield* espr(n.object, scope, stato);
      const k = n.computed ? yield* espr(n.property, scope, stato) : n.property.name;
      if (o === null || o === undefined) throw new ErroreCodice(`Non posso leggere ${k} di qualcosa che non esiste.`, riga);
      if (['__proto__', 'constructor', 'prototype'].includes(k)) throw new ErroreCodice('Questa proprietà non è disponibile.', riga);
      const v = o[k];
      return (typeof v === 'function' && !v.__native) ? v.bind(o) : v;
    }
    case 'CallExpression': {
      let fn, nome;
      if (n.callee.type === 'Identifier') { nome = n.callee.name; fn = scope.leggi(nome, riga); }
      else { fn = yield* espr(n.callee, scope, stato); nome = n.callee.property?.name || 'funzione'; }
      const args = []; for (const a of n.arguments) args.push(yield* espr(a, scope, stato));
      if (fn && fn.__native) {
        const r = fn.__native(...args);
        if (r && r.__log !== undefined) { yield { tipo: 'log', testo: r.__log, riga }; return undefined; }
        if (r && typeof r === 'object' && r.tipo) { stato.vuoto = 0; yield { tipo: 'azione', azione: r, riga }; return undefined; }
        return r;
      }
      if (fn && fn.__funzione) return yield* chiama(fn, args, stato, riga, nome);
      if (typeof fn === 'function') {
        const ris = fn(...args.map(a => (a && a.__funzione) ? avvolgi(a, stato, riga) : a));
        if (stato.logs && stato.logs.length) for (const l of stato.logs.splice(0)) yield l;
        return ris;
      }
      throw new ErroreCodice(`${nome} non è un comando: non si può chiamare con le parentesi.`, riga);
    }
    default: throw new ErroreCodice(`Espressione non supportata: ${n.type}.`, riga);
  }
}
