# Genera le lezioni dei capitoli 2 (Logica) e 3 (Cicli). Uso: python3 scripts/contenuto_c2_c3.py
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'content', 'it')
LEG = {"=": "pavimento", "#": "blocco", "L": "lampada", "S": "spawn", "X": "uscita", "^": "spuntoni"}
def leg(**extra): d = dict(LEG); d.update(extra); return d
def laser(fase=0, id="l1", lung=2): return {"tipo": "laser", "id": id, "lunghezza": lung, "acceso": 180, "spento": 180, "fase": fase}
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
def riordina(domanda, righe, spiegazione, mescolate=None): return {"tipo": "riordina", "domanda": domanda, "righe": righe, "mescolate": mescolate, "spiegazione": spiegazione}
def errore(domanda, codice, riga, spiegazione, indizio=None): return {"tipo": "trova_errore", "domanda": domanda, "codice": codice, "riga": riga, "spiegazione": spiegazione, "indizio": indizio}
def livello(n, sotto, mappa, legenda, obiettivo, starter, api, sintassi, sensori, stelle, aiuti, varianti=None):
    d = {"tipo": "codice", "titolo": f"Livello {n}", "sottotitolo": sotto, "scena": "platform", "config": {"mappa": mappa, "legenda": legenda},
         "obiettivo": {"tipo": "uscita", "testo": obiettivo}, "starter": starter, "api": api, "sintassi": sintassi, "sensori": sensori, "stelle": stelle, "aiuti": aiuti}
    if varianti: d["varianti"] = [{"mappa": m, "legenda": l} for m, l in varianti]
    return d
API = ["moveRight", "moveLeft", "jump", "wait"]
MASCOTTE = "/assets/mascotte/riposo.png"
S_COMPLETA = {"tipo": "completa", "testo": "Livello completato"}
def S(tipo, testo, valore=None): d = {"tipo": tipo, "testo": testo}; d.update({"valore": valore} if valore is not None else {}); return d

L = {}
# ------------------------------------------------------------------ capitolo 2: Logica
L["c2/l1"] = {"id": "c2-l1", "capitolo": "Logica", "titolo": "Le variabili", "durata": "6 min", "prossima": "c2-l2", "schede": [
    sp("Una scatola con un nome", ["Una variabile è una scatola con un nome, dentro cui metti un valore. let attesa = 3 crea la scatola attesa e ci mette il numero 3.", "Da quel momento puoi usare il nome al posto del numero: wait(attesa) aspetta tre secondi."], "let attesa = 3\nwait(attesa)", MASCOTTE),
    sp("let, il nome, l'uguale", ["let dice a JavaScript: sto creando una variabile. Poi viene il nome, poi l'uguale, poi il valore.", "console.log(passi) scrive il valore nella console: è il modo per sbirciare dentro la scatola. Nel gioco lo vedi nel pannello sotto la scena, insieme alle variabili."], "let passi = 2\nconsole.log(passi)"),
    scelta("Quale riga crea la variabile **salti** con dentro 4?", ["salti = let 4", "let salti = 4", "let 4 = salti"], 1, "Prima let, poi il nome, poi l'uguale e il valore."),
    completa("Completa: la scatola si chiama tempo e vale 2, poi aspetto per quel tempo.", "let ___ = 2\nwait(___)", ["tempo", "wait", "2"], ["tempo", "tempo"], "La variabile si chiama tempo, e wait(tempo) usa il suo valore."),
    sp("Cambiare valore", ["Una variabile si può cambiare: dopo la prima volta non serve più let, bastano il nome e l'uguale.", "Guarda il pannello delle variabili mentre il programma gira: i valori cambiano riga per riga."], "let tempo = 3\ntempo = 1\nwait(tempo)"),
    errore("Una riga non va. Quale?", "let attesa = 3\nwait(attesa)\nmoveRight()\nlet attesa = 1", 4, "attesa esiste già: per cambiarla basta scrivere attesa = 1, senza let.", "Quante volte viene scritto let attesa?"),
    sp("Il piano", ["Due laser con tempi diversi. Crea una variabile per l'attesa e usala due volte: se poi vuoi cambiare i secondi, li cambi in un posto solo.", "La moneta è sul pavimento, un passo davanti a te."]),
    livello(11, "Le variabili", ["..L.....", "........", "..#..#..", "..R..Q..", "........", "SM....X.", "========"],
            leg(M={"tipo": "moneta", "id": "m1"}, R=laser(0, "l1"), Q=laser(180, "l2")), "Passa i due laser usando una variabile", "let attesa = 3\n", API, ["call", "let"], [],
            [S_COMPLETA, S("usaVariabile", "Usa una variabile"), S("monete", "Moneta raccolta")],
            ["Il primo laser è acceso per i primi tre secondi: wait(attesa) prima di partire.", "Dopo il primo laser fai quattro passi e aspetta ancora wait(attesa): il secondo laser ha i tempi al contrario.",
             "let attesa = 3\nwait(attesa)\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nwait(attesa)\nmoveRight()\nmoveRight()"]),
]}
L["c2/l2"] = {"id": "c2-l2", "capitolo": "Logica", "titolo": "Il se", "durata": "7 min", "prossima": "c2-l3", "schede": [
    sp("Decidere", ["Finora il programma faceva sempre le stesse cose. Con if può decidere: se il laser è acceso aspetta, altrimenti va avanti.", "if si legge se. Tra le parentesi tonde c'è la condizione, tra le graffe il blocco: le righe che girano solo se la condizione è vera."], "if (laser.isOn) {\n  wait(3)\n}", MASCOTTE),
    sp("I sensori", ["laser.isOn è un sensore: guarda il laser più vicino e risponde true (acceso) o false (spento) nel momento esatto in cui quella riga viene eseguita.", "Ne esistono altri: frontIsWall() dice se davanti c'è un ostacolo, frontIsGap() se c'è un buco, hasBox() se hai una scatola in mano, coinsLeft() quante monete mancano."], "laser.isOn\nfrontIsGap()\ncoinsLeft()"),
    sp("Le graffe", ["Il blocco tra { } si scrive spostato a destra di due spazi: si chiama indentazione e serve a leggere a colpo d'occhio cosa sta dentro l'if.", "Nell'editor il tasto for/if scrive già le graffe al posto giusto: tu riempi il blocco."], "if (laser.isOn) {\n  wait(3)\n}\nmoveRight()"),
    scelta("Cosa succede con questo codice se il laser è **spento**?", ["Aspetta 3 secondi e poi va avanti", "Va avanti subito", "Non fa niente"], 1, "La condizione è falsa, il blocco viene saltato e si passa a moveRight().", "if (laser.isOn) {\n  wait(3)\n}\nmoveRight()"),
    completa("Completa: se il laser è acceso, aspetta tre secondi.", "___ (laser.isOn) {\n  ___(3)\n}", ["if", "wait", "let"], ["if", "wait"], "if con la condizione, wait dentro il blocco."),
    sp("Stanze diverse, stesso programma", ["Da questo livello il tuo programma viene provato in più stanze una dopo l'altra: in una il laser parte acceso, nell'altra spento.", "Deve funzionare in tutte. Ci riesce solo se decide con if, invece di indovinare i tempi."]),
    livello(12, "Il se", ["..L.....", "........", "...#....", "...R....", "........", "S.....X.", "========"], leg(R=laser(0)), "Supera il laser in tutte e due le stanze", "moveRight()\n", API, ["call", "let", "if"], ["laser"],
            [S_COMPLETA, S("usaIf", "Usa un if"), S("maxRighe", "Massimo 10 righe", 10)],
            ["Fai un passo, poi chiedi al sensore: if (laser.isOn) { wait(3) }.", "Dopo l'if, cinque passi fino all'uscita.", "moveRight()\nif (laser.isOn) {\n  wait(3)\n}\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()"],
            varianti=[(["..L.....", "........", "...#....", "...R....", "........", "S.....X.", "========"], leg(R=laser(180)))]),
]}
L["c2/l3"] = {"id": "c2-l3", "capitolo": "Logica", "titolo": "Altrimenti", "durata": "7 min", "prossima": "c2-l4", "schede": [
    sp("Se no...", ["else vuol dire altrimenti: il suo blocco gira solo quando la condizione è falsa. Così il programma sceglie sempre una delle due strade, mai tutte e due.", "Qui: se davanti c'è un buco salta, altrimenti fai un passo."], "if (frontIsGap()) {\n  jump()\n} else {\n  moveRight()\n}", MASCOTTE),
    sp("Vero o falso", ["Una condizione è qualcosa che vale true o false. Si confrontano i valori con > (maggiore), < (minore) e === (uguale).", "Uguale si scrive con tre segni: uno solo assegna un valore alla variabile, tre lo confrontano."], "coinsLeft() > 0\ncoinsLeft() === 0\n3 < 5"),
    scelta("Quanto vale **5 > 2**?", ["true", "false", "5"], 0, "5 è maggiore di 2, quindi il confronto è vero: true."),
    riordina("Metti in ordine: se davanti c'è un buco salta, altrimenti cammina.", ["if (frontIsGap()) {", "  jump()", "} else {", "  moveRight()", "}"], "Prima l'if con la condizione e il suo blocco, poi else con il suo.", [1, 3, 0, 4, 2]),
    sp("Il piano", ["Nella stanza A il pavimento è intero e c'è una moneta a metà strada: bisogna camminarci sopra, saltando la si perde.", "Nella stanza B nello stesso punto c'è un buco: bisogna saltarlo. Un solo programma per tutte e due, con if e else. In entrambe c'è una moneta da prendere."]),
    livello(13, "Altrimenti", ["..L.....", "........", "........", "........", "........", "S..M..X.", "========"], leg(M={"tipo": "moneta", "id": "m1"}), "Arriva all'uscita in tutte e due le stanze, con le monete", "moveRight()\nmoveRight()\n", API, ["call", "let", "if"], ["frontIsGap", "coinsLeft"],
            [S_COMPLETA, S("usaIf", "Usa if e else"), S("monete", "Monete raccolte")],
            ["Due passi, poi if (frontIsGap()) { jump() } else { moveRight() moveRight() }.", "Dopo il blocco ti trovi a x = 4 in entrambe le stanze: due passi ancora.",
             "moveRight()\nmoveRight()\nif (frontIsGap()) {\n  jump()\n} else {\n  moveRight()\n  moveRight()\n}\nmoveRight()\nmoveRight()"],
            varianti=[(["..L.....", "........", "........", "........", "........", "S....MX.", "===.===="], leg(M={"tipo": "moneta", "id": "m1"}))]),
]}
L["c2/l4"] = {"id": "c2-l4", "capitolo": "Logica", "titolo": "Due condizioni", "durata": "7 min", "prossima": "c2-l5", "schede": [
    sp("Più decisioni", ["Un programma può avere tutti gli if che vuole, uno dopo l'altro. Ogni if guarda il mondo nel momento in cui arriva la sua riga, non prima.", "Per questo l'ordine conta: chiedi del laser quando sei davanti al laser, del buco quando sei davanti al buco."], None, MASCOTTE),
    errore("Questo programma non passa mai il laser. Quale riga è sbagliata?", "moveRight()\nif (laser.isOn) {\n  moveRight()\n}\nmoveRight()", 3, "Se il laser è acceso bisogna aspettare, non andare avanti: la riga 3 deve essere wait(3).", "Cosa dovrebbe fare quando il laser è acceso?"),
    scelta("Il laser è spento e davanti non c'è nessun buco. Dove arriva l'omino, partendo da x = 0?", ["x = 2", "x = 3", "x = 4"], 1, "Un passo, niente attesa, un altro passo (non c'è il buco), un passo: tre passi in tutto.", "moveRight()\nif (laser.isOn) {\n  wait(3)\n}\nif (frontIsGap()) {\n  jump()\n} else {\n  moveRight()\n}\nmoveRight()"),
    sp("Il piano", ["Quattro stanze: il laser parte acceso o spento, e a metà strada c'è un buco oppure no.", "Due if bastano per tutte: uno per il laser all'inizio, uno per il buco quando ci sei davanti."]),
    livello(14, "Due condizioni", ["..L.....", "........", "..#.....", "..R.....", "........", "S.....X.", "========"], leg(R=laser(0)), "Supera laser e buco in tutte e quattro le stanze", "if (laser.isOn) {\n  wait(3)\n}\n", API, ["call", "let", "if"], ["laser", "frontIsGap"],
            [S_COMPLETA, S("usaIf", "Due if", 2), S("maxRighe", "Massimo 14 righe", 14)],
            ["Prima di partire: if (laser.isOn) { wait(3) }. Poi tre passi.", "A x = 3 chiedi if (frontIsGap()): salta, altrimenti due passi. Poi un ultimo passo.",
             "if (laser.isOn) {\n  wait(3)\n}\nmoveRight()\nmoveRight()\nmoveRight()\nif (frontIsGap()) {\n  jump()\n} else {\n  moveRight()\n  moveRight()\n}\nmoveRight()"],
            varianti=[(["..L.....", "........", "..#.....", "..R.....", "........", "S.....X.", "========"], leg(R=laser(180))),
                      (["..L.....", "........", "..#.....", "..R.....", "........", "S.....X.", "====.==="], leg(R=laser(0))),
                      (["..L.....", "........", "..#.....", "..R.....", "........", "S.....X.", "====.==="], leg(R=laser(180)))]),
]}
L["c2/l5"] = {"id": "c2-l5", "capitolo": "Logica", "titolo": "E, oppure, non", "durata": "6 min", "prossima": "c3-l1", "epilogo": "Hai finito il capitolo Logica: il tuo programma ora guarda il mondo e decide. Nel prossimo capitolo smetterà di ripetersi.", "schede": [
    sp("Mettere insieme le condizioni", ["&& vuol dire e: la condizione è vera solo se lo sono tutte e due. || vuol dire oppure: basta che una sia vera.", "Il punto esclamativo davanti rovescia: !laser.isOn è vero quando il laser è spento, !hasKey() quando non hai la chiave."], "if (laser.isOn && coinsLeft() > 0) {\n  wait(1)\n}\nif (!hasKey()) {\n  jump()\n}", MASCOTTE),
    scelta("Quanto vale **true && false**?", ["true", "false"], 1, "Con && servono tutte e due vere: una è falsa, quindi false."),
    scelta("Quanto vale **!false || false**?", ["true", "false"], 0, "!false è true, e con || basta una vera."),
    completa("Completa: se NON hai la chiave, salta a prenderla.", "if (___hasKey()) {\n  jump()\n}", ["!", "&&", "||"], ["!"], "Il punto esclamativo rovescia hasKey(): vero quando la chiave manca."),
    sp("Il piano", ["Nella stanza A la chiave è sul pavimento, un passo davanti a te. Nella stanza B è sopra un blocco: ci vuole un salto per prenderla.", "Dopo il primo passo chiedi se hai la chiave: se no, salta. Poi cammina fino alla porta, che si apre da sola con la chiave in tasca."]),
    livello(15, "La chiave nascosta", ["..L.....", "........", "........", "........", ".....A..", "SK...AX.", "========"], leg(K={"tipo": "chiave", "id": "k1"}, A={"tipo": "porta", "id": "d1", "chiave": "k1"}), "Prendi la chiave e apri la porta in tutte e due le stanze", "moveRight()\n", API, ["call", "let", "if"], ["hasKey"],
            [S_COMPLETA, S("usaIf", "Usa un if"), S("maxRighe", "Massimo 10 righe", 10)],
            ["Un passo, poi if (!hasKey()) { jump() }.", "Dopo l'if bastano cinque passi: la porta si apre appena hai la chiave.",
             "moveRight()\nif (!hasKey()) {\n  jump()\n}\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()\nmoveRight()"],
            varianti=[(["..L.....", "........", "........", "........", "..K..A..", "S.#..AX.", "========"], leg(K={"tipo": "chiave", "id": "k1"}, A={"tipo": "porta", "id": "d1", "chiave": "k1"}))]),
]}
# ------------------------------------------------------------------ capitolo 3: Cicli
CORRIDOIO = ["..L...........", "..............", "..............", "..............", "..............", "S.....M.....X.", "=============="]
L["c3/l1"] = {"id": "c3-l1", "capitolo": "Cicli", "titolo": "Funziona, ma...", "durata": "8 min", "prossima": "c3-l2", "schede": [
    sp("Un corridoio lungo", ["Questa stanza è lunga: dodici passi fino all'uscita, con una moneta a metà. Scrivili tutti, uno per riga. Sì, tutti quanti.", "La scena è più larga dello schermo: trascina con il dito per guardarti intorno."], None, MASCOTTE),
    livello(16, "Il corridoio lungo", CORRIDOIO, leg(M={"tipo": "moneta", "id": "m1"}), "Dodici passi fino all'uscita", "moveRight()\n", API, ["call", "let", "if"], [],
            [S_COMPLETA, S("monete", "Moneta raccolta")], ["Sono dodici moveRight() di fila.", "moveRight()\n" * 12]),
    sp("Funziona, ma...", ["Dodici righe uguali. Funziona, ma se il corridoio fosse lungo cento? E se dovessi cambiare moveRight in jump, lo cambieresti dodici volte?", "I programmatori odiano ripetersi. Per questo esiste il ciclo for: dice al computer ripeti questo blocco un certo numero di volte."], None, MASCOTTE),
    sp("Il ciclo for", ["Leggilo così: parti con i = 0; finché i è minore di 12, esegui il blocco e poi aumenta i di uno (i++). Il blocco gira dodici volte.", "Tre righe al posto di dodici. E per cento passi cambi solo un numero."], "for (let i = 0; i < 12; i++) {\n  moveRight()\n}"),
    completa("Completa il ciclo che salta 4 volte.", "for (let i = 0; i < ___; i++) {\n  ___()\n}", ["4", "jump", "12", "moveRight"], ["4", "jump"], "i va da 0 a 3: quattro giri, e in ogni giro un salto."),
    livello(17, "Lo stesso corridoio", CORRIDOIO, leg(M={"tipo": "moneta", "id": "m1"}), "Lo stesso corridoio, con un ciclo", "for (let i = 0; i < 12; i++) {\n  \n}\n", API, ["call", "let", "if", "for"], [],
            [S_COMPLETA, S("usaFor", "Usa un ciclo for"), S("maxRighe", "Massimo 4 righe", 4)],
            ["Il tasto for nella barra scrive il ciclo: metti moveRight() nel blocco e 12 come limite.", "for (let i = 0; i < 12; i++) {\n  moveRight()\n}"]),
]}
L["c3/l2"] = {"id": "c3-l2", "capitolo": "Cicli", "titolo": "Il contatore", "durata": "7 min", "prossima": "c3-l3", "schede": [
    sp("La variabile del ciclo", ["i è una variabile come le altre: nel blocco vale 0, poi 1, poi 2. Guardala cambiare nel pannello mentre il programma gira.", "Puoi chiamarla come vuoi, ma i (da indice) è la tradizione."], "for (let i = 0; i < 3; i++) {\n  console.log(i)\n}", MASCOTTE),
    scelta("Quante volte gira questo blocco?", ["4", "5", "1"], 0, "i vale 1, 2, 3, 4: quattro giri. Quando arriva a 5 la condizione i < 5 è falsa e il ciclo finisce.", "for (let i = 1; i < 5; i++) {\n  jump()\n}"),
    errore("Questo ciclo non finisce mai. Quale riga è colpevole?", "for (let i = 0; i < 3; i--) {\n  moveRight()\n}", 1, "i-- fa scendere i: parte da 0 e va a -1, -2... non arriva mai a 3. Ci vuole i++.", "Guarda come cambia i a ogni giro."),
    sp("Più righe nel blocco", ["Nel blocco ci possono stare più righe: qui a ogni giro salta e poi fa un passo. Le scale si salgono così.", "Un programma può avere più cicli uno dopo l'altro: uno per la scala, uno per il corridoio in cima."], "for (let i = 0; i < 3; i++) {\n  jump()\n  moveRight()\n}"),
    livello(18, "La scala", ["..L.......", "..........", "........MX", "......####", "....######", "S.########", "=========="], leg(M={"tipo": "moneta", "id": "m1"}), "Sali la scala con due cicli", "for (let i = 0; i < 3; i++) {\n  \n}\n", API, ["call", "let", "if", "for"], [],
            [S_COMPLETA, S("usaFor", "Due cicli for", 2), S("maxRighe", "Massimo 8 righe", 8)],
            ["Tre gradini: in ogni giro jump() e poi moveRight().", "In cima mancano due passi: un secondo for con moveRight().", "for (let i = 0; i < 3; i++) {\n  jump()\n  moveRight()\n}\nfor (let i = 0; i < 2; i++) {\n  moveRight()\n}"]),
]}
def muro(n):
    r5 = list("S..........."); r5[n] = "#"; r5[n + 2] = "X"; return ["..L.........", "............", "............", "............", "............", "".join(r5), "============"]
L["c3/l3"] = {"id": "c3-l3", "capitolo": "Cicli", "titolo": "Finché", "durata": "7 min", "prossima": "c3-l4", "schede": [
    sp("Quando non sai quante volte", ["for va bene quando sai il numero di giri. while ripete finché la condizione resta vera: qui cammina finché davanti non c'è un muro.", "Non serve sapere quanto è lungo il corridoio: il sensore lo scopre strada facendo."], "while (!frontIsWall()) {\n  moveRight()\n}", MASCOTTE),
    sp("Attenzione al ciclo infinito", ["Se la condizione non diventa mai falsa, il ciclo non finisce. Il gioco lo ferma e ti avvisa.", "Dentro un while ci deve essere qualcosa che cambia la situazione: un passo, un salto, un'attesa."], "while (true) {\n  console.log(\"per sempre\")\n}"),
    scelta("Quale while fa aspettare **finché il laser è acceso**?", ["while (laser.isOn) { wait(1) }", "while (!laser.isOn) { wait(1) }", "while (laser.isOn) { moveRight() }"], 0, "La condizione è laser acceso, e nel blocco si aspetta un secondo per volta."),
    riordina("Metti in ordine: cammina fino al muro, poi salta.", ["while (!frontIsWall()) {", "  moveRight()", "}", "jump()"], "Il while con il passo nel blocco, e il salto dopo la graffa chiusa.", [3, 1, 0, 2]),
    sp("Il piano", ["Tre stanze con corridoi di lunghezza diversa e un muretto alla fine. Cammina finché davanti non c'è il muro, salta per salirci e scendi dall'altra parte fino all'uscita.", "Una sola regola: usa while, non contare i passi."]),
    livello(19, "Fino al muro", muro(4), leg(), "Arriva all'uscita in tutte e tre le stanze", "while (!frontIsWall()) {\n  \n}\n", API, ["call", "let", "if", "for", "while"], ["frontIsWall"],
            [S_COMPLETA, S("usaWhile", "Usa un while"), S("maxRighe", "Massimo 6 righe", 6)],
            ["while (!frontIsWall()) { moveRight() } cammina fino al muretto.", "Poi jump() per salire e due moveRight() per scendere ed entrare.", "while (!frontIsWall()) {\n  moveRight()\n}\njump()\nmoveRight()\nmoveRight()"],
            varianti=[(muro(7), leg()), (muro(9), leg())]),
]}
MOMENTO = ["..L.......", "..........", "...#......", "...R......", "..........", "S....MMMX.", "=========="]
L["c3/l4"] = {"id": "c3-l4", "capitolo": "Cicli", "titolo": "Il momento giusto", "durata": "7 min", "prossima": "c3-l5", "schede": [
    sp("Aspettare il momento giusto", ["Invece di indovinare quanti secondi aspettare, controlla ogni secondo: finché il laser è acceso, aspetta un secondo. Appena si spegne il ciclo finisce e passi.", "Funziona con qualunque laser, qualunque sia il suo ritmo."], "while (laser.isOn) {\n  wait(1)\n}\nmoveRight()", MASCOTTE),
    sp("Contare le monete", ["coinsLeft() dice quante monete mancano. Il ciclo cammina finché ne manca almeno una: raccolte tutte, si ferma da solo."], "while (coinsLeft() > 0) {\n  moveRight()\n}"),
    scelta("Con 3 monete in fila davanti, quante volte gira il blocco?", ["3", "0", "Per sempre"], 0, "Ogni passo raccoglie una moneta: dopo tre passi coinsLeft() vale 0 e la condizione è falsa.", "while (coinsLeft() > 0) {\n  moveRight()\n}"),
    errore("Questo programma resta fermo per sempre. Quale riga è il problema?", "while (laser.isOn) {\n  console.log(\"acceso\")\n}\nmoveRight()", 2, "Nel blocco non passa il tempo: il laser resta acceso e la condizione non cambia mai. Ci vuole wait(1).", "Cosa cambia tra un giro e l'altro?"),
    livello(20, "Il momento giusto", MOMENTO, leg(R=laser(0), M="moneta"), "Passa il laser al momento giusto e prendi tutte le monete", "moveRight()\nmoveRight()\n", API, ["call", "let", "if", "for", "while"], ["laser", "coinsLeft"],
            [S_COMPLETA, S("usaWhile", "Due while", 2), S("monete", "Tutte le monete")],
            ["Due passi, poi while (laser.isOn) { wait(1) } e un passo per passare.", "Le monete: while (coinsLeft() > 0) { moveRight() }, poi un ultimo passo.",
             "moveRight()\nmoveRight()\nwhile (laser.isOn) {\n  wait(1)\n}\nmoveRight()\nwhile (coinsLeft() > 0) {\n  moveRight()\n}\nmoveRight()"],
            varianti=[(MOMENTO, leg(R=laser(90), M="moneta")), (MOMENTO, leg(R=laser(200), M="moneta"))]),
]}
SALONE_A = ["..L.............", "................", "................", ".........R......", "..............X.", "S.......M....###", "===.==.========="]
SALONE_B = ["..L.............", "................", "................", ".........R......", "..............X.", "S.......M....###", "====.==.========"]
L["c3/l5"] = {"id": "c3-l5", "capitolo": "Cicli", "titolo": "Il grande salone", "durata": "10 min", "prossima": None, "epilogo": "Capitolo Cicli finito. Da qui in poi nessun programma tuo dovrà più ripetersi: for quando sai quante volte, while quando lo decide il mondo.", "schede": [
    sp("Tutto insieme", ["Un salone lungo: due buchi, un laser, un gradino e una moneta. Nessuna riga uguale ripetuta tre volte di fila: usa i cicli.", "Il programma gira in due stanze diverse: cambiano la posizione dei buchi e il ritmo del laser."], None, MASCOTTE),
    sp("Consiglio", ["Dividi il problema: prima il tratto con i buchi (un if dentro un for che fa sei giri), poi il laser (un while), poi il tratto finale (un for), il gradino e l'ultimo passo.", "Prova un pezzo alla volta con PASSO, guardando i sensori."], "for (let i = 0; i < 6; i++) {\n  if (frontIsGap()) {\n    jump()\n  } else {\n    moveRight()\n  }\n}"),
    livello(21, "Il grande salone", SALONE_A, leg(R=laser(0), M="moneta"), "Attraversa il salone in tutte e due le stanze", "for (let i = 0; i < 6; i++) {\n  \n}\n", API, ["call", "let", "if", "for", "while"], ["laser", "frontIsGap", "frontIsWall", "coinsLeft"],
            [S_COMPLETA, S("nienteRipetizioni", "Nessuna riga ripetuta tre volte"), S("monete", "Moneta raccolta")],
            ["Sei giri di for con if (frontIsGap()) { jump() } else { moveRight() } ti portano davanti al laser.", "while (laser.isOn) { wait(1) }, poi un for da quattro passi, jump() sul gradino e moveRight().",
             "for (let i = 0; i < 6; i++) {\n  if (frontIsGap()) {\n    jump()\n  } else {\n    moveRight()\n  }\n}\nwhile (laser.isOn) {\n  wait(1)\n}\nfor (let i = 0; i < 4; i++) {\n  moveRight()\n}\njump()\nmoveRight()"],
            varianti=[(SALONE_B, leg(R=laser(180), M="moneta"))]),
]}
for k, v in L.items():
    with open(os.path.join(OUT, k + '.json'), 'w') as f: json.dump(v, f, ensure_ascii=False, indent=2)
print("scritte", len(L), "lezioni")
