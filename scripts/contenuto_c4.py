# Capitolo 4 "Nuove stanze": tre lezioni viste dall'alto (pacchi, chiavi, buchi) e tre in cucina (prendere, cuocere, tagliare, servire).
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'content', 'it', 'c4'); os.makedirs(OUT, exist_ok=True)
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
def S(tipo, testo, valore=None): d = {"tipo": tipo, "testo": testo}; d.update({"valore": valore} if valore is not None else {}); return d
COMPLETA = S("completa", "Livello completato")
TUTTO = ["call", "let", "if", "for", "while"]
def alto(n, sotto, mappa, obiettivo, testo_ob, starter, api, sensori, stelle, aiuti, legenda=None, varianti=None):
    d = {"tipo": "codice", "titolo": f"Livello {n}", "sottotitolo": sotto, "scena": "alto", "config": {"mappa": mappa, "obiettivo": obiettivo, "legenda": legenda or {}},
         "obiettivo": {"tipo": obiettivo, "testo": testo_ob}, "starter": starter, "api": api, "sintassi": TUTTO, "sensori": sensori, "stelle": stelle, "aiuti": aiuti}
    if varianti: d["varianti"] = varianti
    return d
def cucina(n, sotto, stazioni, ordine, testo_ob, starter, api, sensori, stelle, aiuti, tempo=180, varianti=None, spawn=0):
    d = {"tipo": "codice", "titolo": f"Livello {n}", "sottotitolo": sotto, "scena": "cucina", "config": {"stazioni": stazioni, "ordine": ordine, "tempoCottura": tempo, "spawn": spawn},
         "obiettivo": {"tipo": "ordine", "testo": testo_ob}, "starter": starter, "api": api, "sintassi": TUTTO, "sensori": sensori, "stelle": stelle, "aiuti": aiuti}
    if varianti: d["varianti"] = varianti
    return d
API_ALTO = ["moveUp", "moveDown", "moveLeft", "moveRight", "pickUp", "putDown", "wait"]
API_CUCINA = ["moveLeft", "moveRight", "take", "put", "cut", "wait"]
CASSETTA = {"tipo": "cassetta", "ingredienti": ["pomodoro", "cipolla", "carota"]}

L = {}
L["l1"] = {"id": "c4-l1", "capitolo": "Nuove stanze", "titolo": "Vista dall'alto", "durata": "6 min", "prossima": "c4-l2", "schede": [
    sp("Una stanza nuova", ["Da qui in poi non c'è solo il salto alla Super Mario. Questa stanza si guarda dall'alto: Bit si muove in quattro direzioni, senza gravità e senza salti.", "Ai comandi di sempre si aggiungono moveUp() e moveDown(). Bit guarda nella direzione dell'ultimo passo."], "moveUp()\nmoveDown()\nmoveLeft()\nmoveRight()", MASCOTTE),
    sp("Il pacco", ["C'è un pacco da portare sul tappeto verde con la X. pickUp() lo prende se è nella cella davanti a Bit, putDown() lo posa nella cella davanti.", "Con il pacco in mano Bit cammina normalmente. Il livello è finito quando il pacco sta sul tappeto."], "moveRight()\npickUp()\nmoveRight()\nputDown()"),
    scelta("Bit guarda a destra e il pacco è nella cella alla sua destra. Quale comando lo prende?", ["pickUp()", "moveRight()", "putDown()"], 0, "pickUp() prende quello che c'è davanti; moveRight() sbatterebbe contro il pacco."),
    sp("La freccia", ["Mentre scrivi, sulla scena appare una freccia: è il percorso che Bit farà con il codice che hai scritto finora. Se finisce in un buco, la freccia diventa rossa.", "Usala per controllare il piano prima di premere ESEGUI."]),
    alto(22, "Il primo pacco", ["########", "#S..P..#", "#......#", "#..M...#", "#.....D#", "#......#", "########"], "consegna", "Porta il pacco sul tappeto con la X",
         "moveRight()\nmoveRight()\n", API_ALTO, [], [COMPLETA, S("maxRighe", "Massimo 12 righe", 12), S("monete", "Moneta raccolta")],
         ["Due passi a destra ti portano davanti al pacco: pickUp().", "Con il pacco in mano scendi e vai a destra fino alla cella PRIMA del tappeto: putDown() posa il pacco nella cella davanti. Guarda la freccia.", "Passa dalla moneta: un giro un po' più lungo, ma la stella la vale.",
          "moveRight()\nmoveRight()\npickUp()\nmoveDown()\nmoveDown()\nmoveLeft()\nmoveDown()\nmoveRight()\nmoveRight()\nmoveRight()\nputDown()"]),
]}
L["l2"] = {"id": "c4-l2", "capitolo": "Nuove stanze", "titolo": "Chiave e buchi", "durata": "7 min", "prossima": "c4-l3", "schede": [
    sp("Buchi nel pavimento", ["I buchi si vedono dall'alto: se Bit ci cammina sopra, cade e il livello riparte. frontIsHole() dice se la cella davanti è un buco.", "Un pacco posato su un buco lo riempie: da quel momento ci si passa sopra."], "if (frontIsHole()) {\n  putDown()\n}", MASCOTTE),
    sp("Chiave e porta", ["La porta si apre da sola quando Bit ha la chiave in tasca: basta camminare sulla chiave. Poi si va all'uscita.", "Con i corridoi lunghi usa il for: quattro passi a destra sono for (let i = 0; i < 4; i++) { moveRight() }."], "for (let i = 0; i < 4; i++) {\n  moveRight()\n}"),
    errore("Bit deve prendere la chiave a sinistra, ma questo programma va a destra. Quale riga è sbagliata?", "moveDown()\nmoveDown()\nmoveRight()\nmoveRight()\nmoveUp()", 3, "La chiave è a sinistra: le righe 3 e 4 devono essere moveLeft(). La prima delle due è la riga 3.", "Da che parte è la chiave?"),
    alto(23, "Chiave e buchi", ["########", "#S..O..#", "#.#.#..#", "#K#....#", "#.#.OO.#", "#...A.X#", "########"], "uscita", "Prendi la chiave, apri la porta, esci",
         "moveDown()\n", API_ALTO, ["frontIsHole", "hasKey"], [COMPLETA, S("usaFor", "Usa un ciclo for"), S("maxRighe", "Massimo 10 righe", 10)],
         ["Giù due volte, poi a sinistra: sulla chiave. Poi ancora giù fino in fondo.", "In basso vai a destra: la porta si apre da sola, l'uscita è dopo la porta. Usa un for per i passi a destra.",
          "moveDown()\nmoveDown()\nmoveLeft()\nmoveLeft()\nmoveDown()\nmoveDown()\nfor (let i = 0; i < 5; i++) {\n  moveRight()\n}"],
         legenda={"A": {"tipo": "porta", "id": "d1", "chiave": "k1"}, "K": {"tipo": "chiave", "id": "k1"}}),
]}
MAG_A = ["########", "#S.....#", "#.P...D#", "#......#", "#.P...D#", "#....O.#", "########"]
MAG_B = ["########", "#S.....#", "#.P...O#", "#......#", "#..P..D#", "#....D.#", "########"]
L["l3"] = {"id": "c4-l3", "capitolo": "Nuove stanze", "titolo": "Il magazzino", "durata": "8 min", "prossima": "c4-l4", "schede": [
    sp("Due pacchi", ["Due pacchi, due tappeti. Un pacco alla volta: prendi, porta, posa, torna a prendere l'altro.", "Trucco: se cammini contro un pacco, Bit sbatte ma si gira verso di lui. Poi pickUp() lo prende. E putDown() posa sempre nella cella davanti: fermati prima del tappeto."], "moveRight()\npickUp()", MASCOTTE),
    riordina("Metti in ordine una consegna: prendi il pacco, porta a destra, posalo.", ["pickUp()", "moveRight()", "moveRight()", "putDown()"], "Prima si prende, poi ci si sposta, alla fine si posa.", [3, 0, 2, 1]),
    alto(24, "Il magazzino", MAG_A, "consegna", "Porta i due pacchi sui tappeti",
         "moveDown()\n", API_ALTO, ["boxesLeft", "frontIsWall", "hasBox"], [COMPLETA, S("nienteRipetizioni", "Nessuna riga ripetuta tre volte"), S("maxRighe", "Massimo 18 righe", 18)],
         ["Primo pacco: giù, poi moveRight() sbatte contro il pacco ma ti fa girare verso di lui: pickUp(). Quattro passi a destra con un for e putDown() sul tappeto.", "Secondo pacco: due passi giù, poi a sinistra con un for finché non sbatti contro il pacco, pickUp(), due passi a destra, putDown().",
          "moveDown()\nmoveRight()\npickUp()\nfor (let i = 0; i < 4; i++) {\n  moveRight()\n}\nputDown()\nmoveDown()\nmoveDown()\nfor (let i = 0; i < 4; i++) {\n  moveLeft()\n}\npickUp()\nmoveRight()\nmoveRight()\nputDown()"]),
]}
L["l4"] = {"id": "c4-l4", "capitolo": "Nuove stanze", "titolo": "In cucina", "durata": "7 min", "prossima": "c4-l5", "schede": [
    sp("Il bancone", ["Bit è dietro un bancone con delle postazioni: la cassetta degli ingredienti, il tagliere, il fornello, il piatto. Si sposta con moveLeft() e moveRight(), una postazione alla volta.", "Il cartellino in alto a sinistra dice l'ordine da preparare."], None, MASCOTTE),
    sp("Prendere e mettere", ["take(\"pomodoro\") prende un pomodoro dalla cassetta: il nome va tra virgolette, perché è una stringa, cioè un testo.", "put() mette quello che hai in mano nella postazione davanti a te. cut() taglia quello che sta sul tagliere."], "take(\"pomodoro\")\nmoveRight()\nput()\ncut()"),
    scelta("Come si prende una cipolla dalla cassetta?", ["take(cipolla)", "take(\"cipolla\")", "take cipolla"], 1, "Il nome dell'ingrediente è una stringa: va tra virgolette e dentro le parentesi."),
    completa("Completa: prendi il pomodoro, spostati a destra sul tagliere, mettilo giù e taglialo.", "take(\"___\")\nmoveRight()\n___()\ncut()", ["pomodoro", "put", "take"], ["pomodoro", "put"], "Prima take con la stringa, poi put() sul tagliere, poi cut()."),
    cucina(25, "Pomodoro a fette", [CASSETTA, "tagliere", "piatto"], ["pomodoro tagliato"], "Servi un pomodoro tagliato",
           "take(\"pomodoro\")\n", API_CUCINA, ["holding"], [COMPLETA, S("maxRighe", "Massimo 8 righe", 8)],
           ["Il tagliere è la postazione a destra della cassetta: take, moveRight, put, cut.", "Dopo il taglio riprendi il pomodoro con take() e portalo sul piatto con moveRight() e put().",
            "take(\"pomodoro\")\nmoveRight()\nput()\ncut()\ntake()\nmoveRight()\nput()"]),
]}
L["l5"] = {"id": "c4-l5", "capitolo": "Nuove stanze", "titolo": "La zuppa", "durata": "8 min", "prossima": "c4-l6", "schede": [
    sp("Il fornello", ["Sul fornello c'è la pentola: put() ci mette dentro l'ingrediente e la cottura parte. Dopo tre secondi è pronto: sopra la pentola compare la scritta.", "wait(3) aspetta tre secondi. Poi take() lo riprende, cotto."], "put()\nwait(3)\ntake()", MASCOTTE),
    sp("L'ordine", ["L'ordine di oggi: pomodoro cotto e cipolla tagliata. Due giri: uno al fornello e uno al tagliere, poi tutto nel piatto.", "Metti il tempo di cottura in una variabile: se cambia, lo cambi in un posto solo."], "let cottura = 3\nwait(cottura)"),
    scelta("Cosa succede se fai take() dalla pentola dopo un solo secondo?", ["Prendi il pomodoro ancora crudo", "Il programma si ferma", "Prendi il pomodoro cotto"], 0, "La cottura vuole tre secondi: prima è ancora crudo, e l'ordine non sarebbe giusto."),
    cucina(26, "La zuppa", [CASSETTA, "fornello", "tagliere", "piatto"], ["pomodoro cotto", "cipolla tagliato"], "Servi pomodoro cotto e cipolla tagliata",
           "let cottura = 3\ntake(\"pomodoro\")\n", API_CUCINA, ["holding", "pot"], [COMPLETA, S("usaVariabile", "Usa una variabile"), S("maxRighe", "Massimo 22 righe", 22)],
           ["Pomodoro: take, moveRight (fornello), put, wait(cottura), take, poi due passi a destra fino al piatto e put.", "Cipolla: torna alla cassetta (tre passi a sinistra), take, due passi a destra (tagliere), put, cut, take, moveRight, put.",
            "let cottura = 3\ntake(\"pomodoro\")\nmoveRight()\nput()\nwait(cottura)\ntake()\nmoveRight()\nmoveRight()\nput()\nfor (let i = 0; i < 3; i++) {\n  moveLeft()\n}\ntake(\"cipolla\")\nmoveRight()\nmoveRight()\nput()\ncut()\ntake()\nmoveRight()\nput()"]),
]}
L["l6"] = {"id": "c4-l6", "capitolo": "Nuove stanze", "titolo": "Il momento giusto in cucina", "durata": "8 min", "prossima": None, "epilogo": "Capitolo finito: hai portato pacchi, aperto porte e servito zuppe con lo stesso JavaScript. Le regole cambiano stanza per stanza, il modo di ragionare no.", "schede": [
    sp("Quanto ci mette?", ["In questa cucina il fornello non è sempre uguale: in una stanza cuoce in due secondi, in un'altra in cinque. Non puoi indovinare il numero.", "pot.isReady è un sensore: vero quando la pentola è pronta. while (!pot.isReady) { wait(1) } aspetta il tempo giusto, qualunque sia."], "while (!pot.isReady) {\n  wait(1)\n}", MASCOTTE),
    errore("Questo programma serve la carota cruda. Quale riga manca di qualcosa?", "take(\"carota\")\nmoveRight()\nput()\ntake()\nmoveRight()\nmoveRight()\nput()", 4, "Alla riga 4 riprende la carota subito, senza aspettare che cuocia: prima serve while (!pot.isReady) { wait(1) }.", "Tra put() e take() al fornello cosa deve succedere?"),
    cucina(27, "Il momento giusto", [CASSETTA, "fornello", "tagliere", "piatto"], ["carota cotto tagliato", "pomodoro tagliato"], "Servi carota cotta e tagliata, pomodoro tagliato, in tutte le stanze",
           "take(\"carota\")\nmoveRight()\nput()\n", API_CUCINA, ["pot", "holding"], [COMPLETA, S("usaWhile", "Usa un while"), S("nienteRipetizioni", "Nessuna riga ripetuta tre volte")],
           ["Carota: al fornello put(), poi while (!pot.isReady) { wait(1) }, take(), moveRight sul tagliere, put, cut, take, moveRight, put.", "Pomodoro: torna alla cassetta con un for di tre moveLeft, take, due moveRight, put, cut, take, moveRight, put.",
            "take(\"carota\")\nmoveRight()\nput()\nwhile (!pot.isReady) {\n  wait(1)\n}\ntake()\nmoveRight()\nput()\ncut()\ntake()\nmoveRight()\nput()\nfor (let i = 0; i < 3; i++) {\n  moveLeft()\n}\ntake(\"pomodoro\")\nmoveRight()\nmoveRight()\nput()\ncut()\ntake()\nmoveRight()\nput()"],
           tempo=120, varianti=[{"stazioni": [CASSETTA, "fornello", "tagliere", "piatto"], "ordine": ["carota cotto tagliato", "pomodoro tagliato"], "tempoCottura": 300, "spawn": 0}]),
]}
for k, v in L.items():
    with open(os.path.join(OUT, k + '.json'), 'w') as f: json.dump(v, f, ensure_ascii=False, indent=2)
print("scritte", len(L), "lezioni c4")
