# Sezione "Il linguaggio": dieci lezioni di JavaScript puro con la console al posto della scena. Uso: python3 scripts/contenuto_js.py
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'content', 'it', 'js'); os.makedirs(OUT, exist_ok=True)
MASCOTTE = "/assets/mascotte/riposo.png"
def sp(titolo, testo, codice=None, immagine=None):
    d = {"tipo": "spiegazione", "titolo": titolo, "testo": testo if isinstance(testo, list) else [testo]}
    if codice: d["codice"] = codice
    if immagine: d["immagine"] = immagine
    return d
def scelta(domanda, opzioni, risposta, spiegazione, codice=None):
    d = {"tipo": "scelta", "domanda": domanda, "opzioni": opzioni, "risposta": risposta, "spiegazione": spiegazione}
    if codice: d["codice"] = codice
    return d
def completa(domanda, codice, scelte, risposta, spiegazione): return {"tipo": "completa", "domanda": domanda, "codice": codice, "scelte": scelte, "risposta": risposta, "spiegazione": spiegazione}
def riordina(domanda, righe, spiegazione, mescolate): return {"tipo": "riordina", "domanda": domanda, "righe": righe, "mescolate": mescolate, "spiegazione": spiegazione}
def errore(domanda, codice, riga, spiegazione, indizio=None): return {"tipo": "trova_errore", "domanda": domanda, "codice": codice, "riga": riga, "spiegazione": spiegazione, "indizio": indizio}
def prova(titolo, testo, codice, atteso=None, soluzione=None, spiegazione=None, variabili=None):
    d = {"tipo": "prova", "titolo": titolo, "testo": testo if isinstance(testo, list) else [testo], "codice": codice}
    if atteso is not None: d["atteso"] = [str(a) for a in atteso]
    if soluzione: d["soluzione"] = soluzione
    if spiegazione: d["spiegazione"] = spiegazione
    if variabili: d["variabili"] = variabili
    return d
def esercizio(titolo, consegna, starter, casi, soluzione, aiuti=None, esempio=None, spiegazione=None):
    d = {"tipo": "esercizio", "titolo": titolo, "consegna": consegna if isinstance(consegna, list) else [consegna], "starter": starter,
         "casi": [{k: v for k, v in c.items()} for c in casi], "soluzione": soluzione, "aiuti": aiuti or []}
    if esempio: d["esempio"] = esempio
    if spiegazione: d["spiegazione"] = spiegazione
    return d
def caso(atteso, variabili=None, chiama=None):
    c = {"atteso": [str(a) for a in atteso]}
    if variabili: c["variabili"] = variabili
    if chiama: c["chiama"] = chiama
    return c
def lez(n, titolo, durata, schede, epilogo=None):
    d = {"id": f"js-l{n}", "capitolo": "Il linguaggio", "titolo": titolo, "durata": durata, "prossima": f"js-l{n + 1}" if n < 10 else None, "schede": schede}
    if epilogo: d["epilogo"] = epilogo
    return d

L = {}
L[1] = lez(1, "Valori e tipi", "6 min", [
    sp("Non solo comandi", ["Finora hai usato JavaScript per dire a Bit cosa fare. Ma JavaScript è un linguaggio completo: con lo stesso codice si fanno siti, app e giochi.", "In questa sezione lo usiamo da solo. Al posto della scena c'è la console: console.log(...) scrive lì quello che gli passi."], "console.log(\"ciao\")\nconsole.log(3 + 4)", MASCOTTE),
    sp("I tipi di valore", ["I numeri si scrivono così: 3, 2.5, -1. Le stringhe, cioè i testi, vanno tra virgolette: \"ciao\". I booleani sono solo due: true e false.", "typeof dice di che tipo è un valore: typeof 3 è \"number\", typeof \"3\" è \"string\", anche se dentro c'è una cifra."], "console.log(typeof 3)\nconsole.log(typeof \"3\")\nconsole.log(typeof true)"),
    prova("Prova la console", ["Premi Esegui, guarda cosa stampa, poi cambia i numeri e le parole e riesegui. Rompere qualcosa non costa niente."], "console.log(3 + 4)\nconsole.log(\"3\" + \"4\")\nconsole.log(typeof 3, typeof \"3\")\nconsole.log(10 > 4)"),
    scelta("Quanto vale **typeof \"3\"**?", ["string", "number", "boolean"], 0, "Tra virgolette è una stringa, anche se sembra un numero."),
    scelta("Cosa stampa questo codice?", ["10", "8", "232"], 1, "Prima la moltiplicazione, poi la somma: 2 + 6 = 8. Le stesse regole della matematica.", "console.log(2 + 3 * 2)"),
    prova("Fai stampare 12", ["Cambia il codice perché stampi esattamente 12. Vale qualsiasi modo: una somma, un prodotto, un numero e basta."], "console.log(5 + 5)", atteso=[12], soluzione="console.log(5 + 7)", spiegazione="Bravo: la console mostra il risultato del calcolo, non il calcolo."),
    esercizio("Presentati", ["Stampa due righe: nella prima la stringa Bit, nella seconda il numero 12.", "Ogni console.log stampa una riga."], "console.log(\"\")\n", [caso(["Bit", 12])], "console.log(\"Bit\")\nconsole.log(12)", ["Due console.log, uno per riga.", "Il nome va tra virgolette, il numero no."]),
])
L[2] = lez(2, "Variabili e costanti", "7 min", [
    sp("Una scatola con un nome", ["let crea una variabile: una scatola con un nome dentro cui metti un valore. Poi usi il nome al posto del valore, e puoi cambiarlo quando vuoi.", "Dopo la prima volta non serve più let: basta nome = nuovoValore."], "let punti = 10\npunti = punti + 5\nconsole.log(punti)", MASCOTTE),
    sp("const: non cambia più", ["const crea una costante: un valore che non può essere riassegnato. Se ci provi, JavaScript si ferma con un errore.", "Regola pratica: usa const, e passa a let solo quando il valore deve davvero cambiare."], "const nome = \"Bit\"\nconsole.log(nome)"),
    sp("I nomi", ["Un nome inizia con una lettera, non ha spazi e distingue maiuscole e minuscole: punti e Punti sono due variabili diverse.", "Per i nomi lunghi si usa il camelCase: punteggioMassimo, nomeGiocatore."], "let punteggioMassimo = 100\nlet nomeGiocatore = \"Bit\""),
    prova("Prova le variabili", ["Esegui, poi prova a cambiare i valori. Prova anche a riassegnare la const: leggi l'errore."], "let punti = 10\npunti = punti + 5\nconsole.log(punti)\nconst nome = \"Bit\"\nconsole.log(nome + \" ha \" + punti + \" punti\")"),
    errore("Questo programma si ferma con un errore. Quale riga?", "const vite = 3\nvite = vite - 1\nconsole.log(vite)", 2, "vite è una const e non si può cambiare: alla riga 1 ci voleva let.", "Che parola c'è davanti a vite alla riga 1?"),
    completa("Crea la variabile x con 5 e aumentala di 1.", "___ x = 5\nx = x ___ 1\nconsole.log(x)", ["let", "const", "+", "-"], ["let", "+"], "let perché x cambia, e + 1 per aumentarla."),
    esercizio("Somma e prodotto", ["Ci sono due variabili già pronte, a e b. Crea una variabile somma con a + b e stampala. Poi stampa a * b."], "let somma = \n", [caso([3, 2], {"a": 1, "b": 2}), caso([16, 63], {"a": 7, "b": 9})], "let somma = a + b\nconsole.log(somma)\nconsole.log(a * b)", ["Prima riga: let somma = a + b.", "Poi console.log(somma) e console.log(a * b)."], esempio="Esempio: a = 1, b = 2 → 3 poi 2"),
])
L[3] = lez(3, "Stringhe", "7 min", [
    sp("Testo tra virgolette", ["Una stringa è un testo. Con + si attaccano due stringhe: \"Ciao, \" + nome. Lo spazio va messo dentro le virgolette, non lo mette nessuno per te.", "Con i backtick (`) puoi infilare un valore nel testo con ${}: `Ciao, ${nome}!`. Si chiama template."], "const nome = \"Bit\"\nconsole.log(\"Ciao, \" + nome + \"!\")\nconsole.log(`Ciao, ${nome}!`)", MASCOTTE),
    sp("Cosa sanno fare le stringhe", ["Ogni stringa porta con sé dei metodi: si chiamano con il punto. s.length è la lunghezza (senza parentesi), s.toUpperCase() la mette in maiuscolo, s.includes(\"x\") dice se contiene x.", "s.slice(0, 3) prende i primi tre caratteri, s.repeat(3) la ripete tre volte."], "const s = \"banana\"\nconsole.log(s.length)\nconsole.log(s.toUpperCase())\nconsole.log(s.includes(\"nan\"))\nconsole.log(s.slice(0, 3))"),
    prova("Gioca con il testo", ["Esegui e poi cambia la parola. Prova anche s.toLowerCase(), s.indexOf(\"a\"), s.repeat(2)."], "const s = \"Code Play\"\nconsole.log(s.length)\nconsole.log(s.toUpperCase())\nconsole.log(s.includes(\"Play\"))\nconsole.log(`${s} è lungo ${s.length}`)"),
    scelta("Quanto vale **\"ciao\".length**?", ["4", "5", "\"4\""], 0, "Quattro lettere: length è un numero, non una stringa."),
    completa("Stampa la parola in maiuscolo.", "let s = \"bit\"\nconsole.log(s.___())", ["toUpperCase", "toLowerCase", "length"], ["toUpperCase"], "toUpperCase() restituisce la stringa in maiuscolo; length non ha le parentesi."),
    prova("Da bit a BIT!", ["Cambia il codice perché stampi BIT! (maiuscolo, con il punto esclamativo) partendo dalla variabile s."], "let s = \"bit\"\nconsole.log(s)", atteso=["BIT!"], soluzione="let s = \"bit\"\nconsole.log(s.toUpperCase() + \"!\")", spiegazione="toUpperCase() e poi + \"!\": i metodi si possono combinare con la concatenazione."),
    esercizio("Il saluto", ["C'è una variabile nome. Stampa Ciao, NOME! con il nome tutto in maiuscolo, la virgola, lo spazio e il punto esclamativo."], "console.log(`Ciao, ${}!`)\n", [caso(["Ciao, BIT!"], {"nome": "bit"}), caso(["Ciao, LUCA!"], {"nome": "luca"})], "console.log(`Ciao, ${nome.toUpperCase()}!`)", ["nome.toUpperCase() dentro ${}.", "Attenzione allo spazio dopo la virgola."], esempio="Esempio: nome = \"bit\" → Ciao, BIT!"),
])
L[4] = lez(4, "Numeri", "7 min", [
    sp("Fare i conti", ["+ - * / sono le operazioni di sempre. % dà il resto della divisione: 7 % 3 è 1. ** è la potenza: 2 ** 3 è 8.", "Attenzione: \"3\" + 4 fa \"34\", perché con una stringa il + attacca. 3 + 4 fa 7."], "console.log(7 % 3)\nconsole.log(2 ** 3)\nconsole.log(\"3\" + 4)\nconsole.log(3 + 4)", MASCOTTE),
    sp("Math e le conversioni", ["Math è una cassetta degli attrezzi: Math.floor(4.7) arrotonda per difetto a 4, Math.round(4.5) al più vicino, Math.max(3, 9) prende il maggiore.", "Number(\"5\") trasforma una stringa in numero. parseInt(\"12px\") legge il numero all'inizio: 12."], "console.log(Math.floor(4.7))\nconsole.log(Math.round(4.5))\nconsole.log(Math.max(3, 9))\nconsole.log(Number(\"5\") + 1)"),
    prova("Calcolatrice", ["Esegui e poi inventa i tuoi calcoli. Prova 10 / 4, 10 % 4, Math.floor(10 / 4)."], "console.log(10 / 4)\nconsole.log(10 % 4)\nconsole.log(Math.floor(10 / 4))\nconsole.log(2 ** 10)"),
    scelta("Cosa stampa **console.log(\"3\" + 4)**?", ["34", "7", "errore"], 0, "Con una stringa il + attacca: \"3\" e 4 diventano \"34\"."),
    scelta("Quanto vale **7 % 3**?", ["1", "2", "2.33"], 0, "7 diviso 3 fa 2 con il resto di 1: % dà il resto."),
    esercizio("Quante decine", ["C'è una variabile n. Stampa quante decine intere ci sono in n: per 47 sono 4, per 9 sono 0.", "Dividi per 10 e arrotonda per difetto."], "console.log(Math.floor())\n", [caso([4], {"n": 47}), caso([12], {"n": 120}), caso([0], {"n": 9})], "console.log(Math.floor(n / 10))", ["n / 10 dà 4.7 per 47: serve Math.floor."], esempio="Esempio: n = 47 → 4"),
    esercizio("La media", ["Tre variabili: a, b, c. Stampa la loro media arrotondata al numero intero più vicino con Math.round."], "", [caso([4], {"a": 3, "b": 4, "c": 5}), caso([10], {"a": 10, "b": 10, "c": 11}), caso([2], {"a": 1, "b": 2, "c": 2})], "console.log(Math.round((a + b + c) / 3))", ["La media è (a + b + c) / 3: servono le parentesi attorno alla somma.", "Poi Math.round(...) attorno a tutto."], esempio="Esempio: a = 3, b = 4, c = 5 → 4"),
])
L[5] = lez(5, "Decidere", "7 min", [
    sp("if, else if, else", ["if esegue il blocco solo se la condizione è vera. else if prova un'altra condizione, else prende tutti gli altri casi.", "Le condizioni si scrivono con i confronti: === uguale, !== diverso, <, >, <=, >=."], "const voto = 8\nif (voto >= 9) {\n  console.log(\"ottimo\")\n} else if (voto >= 6) {\n  console.log(\"promosso\")\n} else {\n  console.log(\"bocciato\")\n}", MASCOTTE),
    sp("Mettere insieme", ["&& è e: vera se tutte e due lo sono. || è oppure: basta una. ! rovescia.", "Una condizione è un valore booleano: puoi metterla in una variabile e usarla dopo."], "const eta = 15\nconst adulto = eta >= 18\nconsole.log(adulto)\nconsole.log(eta > 10 && eta < 20)"),
    prova("Prova a decidere", ["Esegui, poi cambia il valore di ore e guarda quale ramo si accende."], "const ore = 14\nif (ore < 12) {\n  console.log(\"buongiorno\")\n} else if (ore < 18) {\n  console.log(\"buon pomeriggio\")\n} else {\n  console.log(\"buonasera\")\n}"),
    riordina("Metti in ordine: se n è maggiore di 10 stampa grande, altrimenti piccolo.", ["if (n > 10) {", "  console.log(\"grande\")", "} else {", "  console.log(\"piccolo\")", "}"], "if con la condizione, il suo blocco, else e il suo blocco.", [2, 0, 4, 1, 3]),
    completa("Completa: maggiorenne a partire da 18 anni.", "if (eta ___ 18) {\n  console.log(\"adulto\")\n} ___ {\n  console.log(\"minorenne\")\n}", [">=", ">", "else", "if"], [">=", "else"], ">= include il 18; else prende tutti gli altri casi."),
    esercizio("Il voto", ["C'è una variabile voto da 1 a 10. Stampa bocciato se è minore di 6, lode se è 10, promosso in tutti gli altri casi."], "if (voto < 6) {\n  \n}\n", [caso(["bocciato"], {"voto": 4}), caso(["promosso"], {"voto": 6}), caso(["lode"], {"voto": 10}), caso(["promosso"], {"voto": 9})], "if (voto < 6) {\n  console.log(\"bocciato\")\n} else if (voto === 10) {\n  console.log(\"lode\")\n} else {\n  console.log(\"promosso\")\n}", ["Tre rami: if, else if, else.", "Controlla il 10 con ===."]),
])
L[6] = lez(6, "Ripetere", "7 min", [
    sp("for: quando sai quante volte", ["for (let i = 0; i < 5; i++) ripete cinque volte, con i che vale 0, 1, 2, 3, 4. Puoi far partire i da 1 o contare all'indietro con i--.", "Dentro il blocco puoi usare i: è così che si stampano tabelline e sequenze."], "for (let i = 1; i <= 5; i++) {\n  console.log(i * 3)\n}", MASCOTTE),
    sp("while: finché è vero", ["while ripete finché la condizione resta vera. Qualcosa dentro deve cambiarla, o non finisce mai.", "break esce dal ciclo subito; continue salta al giro dopo."], "let n = 1\nwhile (n < 100) {\n  n = n * 2\n}\nconsole.log(n)"),
    prova("La tabellina", ["Esegui, poi cambia il numero della tabellina e quante righe stampa."], "const tab = 7\nfor (let i = 1; i <= 10; i++) {\n  console.log(`${tab} x ${i} = ${tab * i}`)\n}"),
    errore("Questo ciclo non finisce mai. Quale riga?", "let i = 0\nwhile (i < 3) {\n  console.log(i)\n}", 2, "Dentro il while nessuno cambia i: resta 0 e la condizione è sempre vera. Ci vuole i++ nel blocco.", "Cosa cambia tra un giro e l'altro?"),
    esercizio("Somma dei pari", ["C'è una variabile n. Stampa la somma di tutti i numeri pari da 1 a n compreso. Per 10: 2 + 4 + 6 + 8 + 10 = 30."], "let somma = 0\nfor (let i = 1; i <= n; i++) {\n  \n}\nconsole.log(somma)\n", [caso([30], {"n": 10}), caso([6], {"n": 5}), caso([0], {"n": 1})], "let somma = 0\nfor (let i = 1; i <= n; i++) {\n  if (i % 2 === 0) {\n    somma = somma + i\n  }\n}\nconsole.log(somma)", ["Dentro il for: if (i % 2 === 0) somma = somma + i."], esempio="Esempio: n = 10 → 30"),
    esercizio("I multipli di 7", ["Stampa tutti i multipli di 7 da 7 fino a n compreso, uno per riga. Se non ce ne sono, non stampare niente."], "", [caso([7, 14, 21], {"n": 21}), caso([7], {"n": 10}), caso([], {"n": 5})], "for (let i = 7; i <= n; i = i + 7) {\n  console.log(i)\n}", ["Un for che parte da 7 e cresce di 7: i = i + 7.", "Oppure un for da 1 a n con if (i % 7 === 0)."]),
])
L[7] = lez(7, "Funzioni", "8 min", [
    sp("Un pezzo di codice con un nome", ["Una funzione raggruppa delle righe sotto un nome, per riusarle. Si dichiara con function, si chiama con il nome e le parentesi.", "I parametri sono le variabili che la funzione riceve: saluta(\"Bit\") mette \"Bit\" dentro nome."], "function saluta(nome) {\n  console.log(\"Ciao, \" + nome)\n}\nsaluta(\"Bit\")\nsaluta(\"Luca\")", MASCOTTE),
    sp("return", ["return restituisce un valore a chi ha chiamato la funzione: doppio(4) vale 8 e lo puoi usare in un calcolo o stamparlo.", "console.log stampa e basta; return dà indietro il risultato. Dopo return la funzione finisce."], "function doppio(n) {\n  return n * 2\n}\nconsole.log(doppio(4))\nconsole.log(doppio(4) + 1)"),
    sp("Le funzioni freccia", ["Lo stesso si scrive in breve con la freccia: const doppio = n => n * 2. Quando il corpo è una sola espressione, il return è sottinteso.", "Con più righe servono le graffe e il return."], "const doppio = n => n * 2\nconst somma = (a, b) => a + b\nconsole.log(doppio(5), somma(2, 3))"),
    prova("Scrivi una funzione", ["Esegui, poi aggiungi una funzione triplo(n) e chiamala."], "function quadrato(n) {\n  return n * n\n}\nconsole.log(quadrato(3))\nconsole.log(quadrato(10))"),
    completa("Completa la funzione perché stampi 16.", "function quadrato(n) {\n  ___ n * n\n}\nconsole.log(quadrato(___))", ["return", "console.log", "4", "8"], ["return", "4"], "return restituisce n * n; quadrato(4) vale 16."),
    esercizio("doppio", ["Scrivi una funzione doppio(n) che restituisce il doppio di n. I test la chiamano con vari numeri."], "function doppio(n) {\n  \n}\n", [caso([6], chiama="doppio(3)"), caso([20], chiama="doppio(10)"), caso([0], chiama="doppio(0)")], "function doppio(n) {\n  return n * 2\n}", ["Dentro: return n * 2."], esempio="doppio(3) → 6"),
    esercizio("massimo", ["Scrivi una funzione massimo(a, b) che restituisce il più grande dei due. Senza usare Math.max: con un if."], "function massimo(a, b) {\n  \n}\n", [caso([9], chiama="massimo(3, 9)"), caso([12], chiama="massimo(12, 5)"), caso([4], chiama="massimo(4, 4)")], "function massimo(a, b) {\n  if (a > b) {\n    return a\n  }\n  return b\n}", ["if (a > b) return a, altrimenti return b."], esempio="massimo(3, 9) → 9"),
])
L[8] = lez(8, "Array", "8 min", [
    sp("Una lista di valori", ["Un array è una lista tra parentesi quadre: [3, 9, 2]. Gli elementi si contano da 0: lista[0] è il primo, lista.length quanti sono.", "L'ultimo elemento è lista[lista.length - 1]."], "const lista = [\"a\", \"b\", \"c\"]\nconsole.log(lista[0])\nconsole.log(lista.length)\nconsole.log(lista[lista.length - 1])", MASCOTTE),
    sp("Aggiungere e cercare", ["push aggiunge in fondo, pop toglie l'ultimo. includes dice se c'è, indexOf dove sta (o -1). join attacca tutto in una stringa."], "const n = [3, 9]\nn.push(2)\nconsole.log(n)\nconsole.log(n.includes(9), n.indexOf(2))\nconsole.log(n.join(\", \"))"),
    sp("Scorrere", ["for (const x of lista) passa su ogni elemento. forEach fa lo stesso con una funzione; map crea un nuovo array trasformando ogni elemento."], "const n = [1, 2, 3]\nfor (const x of n) {\n  console.log(x * 10)\n}\nconsole.log(n.map(x => x * x))"),
    prova("Prova gli array", ["Esegui e poi aggiungi elementi, prova pop(), prova filter(x => x > 2)."], "const numeri = [4, 1, 3]\nnumeri.push(7)\nconsole.log(numeri, numeri.length)\nfor (const x of numeri) {\n  console.log(x)\n}\nconsole.log(numeri.map(x => x * 2))"),
    scelta("Quanto vale **[10, 20, 30][1]**?", ["20", "10", "30"], 0, "Gli indici partono da 0: l'elemento 1 è il secondo, 20."),
    errore("Questo programma stampa undefined. Quale riga sbaglia?", "const lettere = [\"a\", \"b\", \"c\"]\nconsole.log(lettere[3])", 2, "Tre elementi hanno gli indici 0, 1 e 2: lettere[3] non esiste. L'ultimo è lettere[2].", "Da che numero partono gli indici?"),
    esercizio("Il più grande", ["C'è un array numeri. Stampa il numero più grande. Parti dal primo e scorri gli altri con un for of."], "let max = numeri[0]\nfor (const x of numeri) {\n  \n}\nconsole.log(max)\n", [caso([9], {"numeri": [3, 9, 2]}), caso([1], {"numeri": [1]}), caso([-2], {"numeri": [-5, -2, -9]})], "let max = numeri[0]\nfor (const x of numeri) {\n  if (x > max) {\n    max = x\n  }\n}\nconsole.log(max)", ["Nel for: if (x > max) max = x."], esempio="Esempio: numeri = [3, 9, 2] → 9"),
    esercizio("Conta i grandi", ["Array numeri e variabile soglia. Stampa quanti numeri sono maggiori della soglia."], "let quanti = 0\n", [caso([2], {"numeri": [5, 12, 30, 7], "soglia": 10}), caso([0], {"numeri": [1, 2], "soglia": 10}), caso([3], {"numeri": [11, 12, 13], "soglia": 10})], "let quanti = 0\nfor (const x of numeri) {\n  if (x > soglia) {\n    quanti++\n  }\n}\nconsole.log(quanti)", ["for of sui numeri, if (x > soglia) quanti++."], esempio="Esempio: numeri = [5, 12, 30, 7], soglia = 10 → 2"),
])
L[9] = lez(9, "Oggetti", "8 min", [
    sp("Proprietà con un nome", ["Un oggetto tiene insieme dei valori con un nome ciascuno: { nome: \"Bit\", eta: 3 }. Si legge con il punto: bit.nome. Si cambia allo stesso modo: bit.eta = 4.", "Un oggetto descrive una cosa sola; un array è una lista di cose."], "const bit = { nome: \"Bit\", eta: 3 }\nconsole.log(bit.nome)\nbit.eta = bit.eta + 1\nconsole.log(bit.eta)", MASCOTTE),
    sp("Oggetti dentro array", ["Una lista di oggetti è il modo più comune di tenere dei dati: persone, prodotti, livelli. Si scorre con for of e si legge ogni proprietà con il punto."], "const persone = [\n  { nome: \"Ada\", eta: 36 },\n  { nome: \"Bit\", eta: 3 }\n]\nfor (const p of persone) {\n  console.log(p.nome, p.eta)\n}"),
    prova("Prova gli oggetti", ["Esegui, poi aggiungi una proprietà (per esempio colore) e stampala."], "const gioco = { titolo: \"Code Play\", livelli: 26, gratis: true }\nconsole.log(gioco.titolo)\ngioco.livelli = gioco.livelli + 1\nconsole.log(gioco.livelli)\nconsole.log(`${gioco.titolo} ha ${gioco.livelli} livelli`)"),
    completa("Stampa il nome dell'oggetto.", "const b = { nome: \"Bit\", eta: 3 }\nconsole.log(b.___)", ["nome", "eta", "\"nome\""], ["nome"], "Con il punto e il nome della proprietà, senza virgolette."),
    esercizio("Gli adulti", ["C'è un array persone di oggetti con nome ed eta. Stampa, uno per riga, i nomi di chi ha almeno 18 anni, nell'ordine dell'array."], "for (const p of persone) {\n  \n}\n", [caso(["Ada", "Luca"], {"persone": [{"nome": "Ada", "eta": 36}, {"nome": "Bit", "eta": 3}, {"nome": "Luca", "eta": 18}]}), caso([], {"persone": [{"nome": "Bit", "eta": 3}]})], "for (const p of persone) {\n  if (p.eta >= 18) {\n    console.log(p.nome)\n  }\n}", ["if (p.eta >= 18) console.log(p.nome)."], esempio="Esempio: Ada 36, Bit 3, Luca 18 → Ada, Luca"),
    esercizio("Il totale del carrello", ["C'è un array carrello di oggetti con nome e prezzo. Stampa la somma dei prezzi."], "let totale = 0\n", [caso([12], {"carrello": [{"nome": "pane", "prezzo": 2}, {"nome": "latte", "prezzo": 10}]}), caso([0], {"carrello": []}), caso([5.5], {"carrello": [{"nome": "gelato", "prezzo": 5.5}]})], "let totale = 0\nfor (const p of carrello) {\n  totale = totale + p.prezzo\n}\nconsole.log(totale)", ["for of sul carrello, totale = totale + p.prezzo."], esempio="Esempio: pane 2, latte 10 → 12"),
])
L[10] = lez(10, "Piccoli programmi", "10 min", [
    sp("Mettere insieme", ["Quattro esercizi veri, di quelli che si danno ai colloqui: ogni riga che scrivi usa qualcosa che hai imparato in questa sezione.", "Non c'è una sola soluzione giusta: contano i test."], None, MASCOTTE),
    esercizio("FizzBuzz", ["Per ogni numero da 1 a n: stampa Fizz se è multiplo di 3, Buzz se è multiplo di 5, FizzBuzz se di entrambi, altrimenti il numero."], "for (let i = 1; i <= n; i++) {\n  \n}\n", [caso([1, 2, "Fizz", 4, "Buzz"], {"n": 5}), caso([1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"], {"n": 15})], "for (let i = 1; i <= n; i++) {\n  if (i % 15 === 0) {\n    console.log(\"FizzBuzz\")\n  } else if (i % 3 === 0) {\n    console.log(\"Fizz\")\n  } else if (i % 5 === 0) {\n    console.log(\"Buzz\")\n  } else {\n    console.log(i)\n  }\n}", ["Controlla prima il caso FizzBuzz (multiplo di 15), poi 3, poi 5.", "i % 3 === 0 vuol dire multiplo di 3."]),
    esercizio("Le vocali", ["C'è una variabile parola. Stampa quante vocali contiene (a, e, i, o, u)."], "let vocali = 0\nfor (const c of parola) {\n  \n}\nconsole.log(vocali)\n", [caso([3], {"parola": "banana"}), caso([1], {"parola": "bit"}), caso([0], {"parola": "xyz"})], "let vocali = 0\nfor (const c of parola) {\n  if (\"aeiou\".includes(c)) {\n    vocali++\n  }\n}\nconsole.log(vocali)", ["for of funziona anche sulle stringhe, lettera per lettera.", "\"aeiou\".includes(c) dice se c è una vocale."], esempio="Esempio: banana → 3"),
    esercizio("Al contrario", ["Stampa la variabile parola scritta al contrario."], "let rovescia = \"\"\n", [caso(["tib"], {"parola": "bit"}), caso(["oaic"], {"parola": "ciao"}), caso(["a"], {"parola": "a"})], "let rovescia = \"\"\nfor (const c of parola) {\n  rovescia = c + rovescia\n}\nconsole.log(rovescia)", ["Parti da una stringa vuota e metti ogni lettera DAVANTI: rovescia = c + rovescia."], esempio="Esempio: bit → tib"),
    esercizio("La parola più lunga", ["C'è un array parole. Stampa la più lunga. Se due hanno la stessa lunghezza, la prima."], "let lunga = parole[0]\n", [caso(["banana"], {"parole": ["bit", "banana", "sole"]}), caso(["re"], {"parole": ["re"]}), caso(["ciao"], {"parole": ["ciao", "gino"]})], "let lunga = parole[0]\nfor (const p of parole) {\n  if (p.length > lunga.length) {\n    lunga = p\n  }\n}\nconsole.log(lunga)", ["Come il massimo, ma confrontando p.length."], esempio="Esempio: bit, banana, sole → banana"),
], epilogo="Hai finito la sezione sul linguaggio. Da qui puoi tornare alle stanze di Bit con occhi nuovi, o inventare programmi tuoi nella palestra.")
for n, v in L.items():
    with open(os.path.join(OUT, f'l{n}.json'), 'w') as f: json.dump(v, f, ensure_ascii=False, indent=2)
print("scritte", len(L), "lezioni js")
