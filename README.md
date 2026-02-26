# WordAPI
API Lemmario italiano e inglese.

## Avvio
- Requisiti: Node.js 18+ e npm.
- Installazione dipendenze:
	- `npm install`
- Avvio in produzione:
	- `npm start`
- Avvio in sviluppo (auto-reload):
	- `npm run dev`

Il server parte su `http://localhost:3000`.
Per cambiare porta, imposta `PORT`, ad esempio:
- `PORT=4000 npm start`

## Endpoints
### GET /search
Cerca se una parola esiste nel database.

Parametri query:
- `word` (obbligatorio) stringa da cercare
- `lang` (opzionale) `it` o `en` (default: `it`)
- `light` (opzionale) `true` per risposta leggera (default: `false`)

Esempio:
```bash
curl "http://localhost:3000/search?word=casa&lang=it"
```

Risposta esempio:
```json
{
	"word": "casa",
	"lang": "it",
	"exists": true,
	"message": "La parola \"casa\" esiste nel database italiano"
}
```

Esempio light:
```bash
curl "http://localhost:3000/search?word=casa&lang=it&light=true"
```

Risposta light:
```json
true
```

### GET /prefix
Restituisce tutte le parole che iniziano con un prefisso.

Parametri query:
- `prefix` (obbligatorio) prefisso da cercare
- `lang` (opzionale) `it` o `en` (default: `it`)
- `limit` (opzionale) massimo risultati (default: 100, max: 1000)
- `light` (opzionale) `true` per risposta leggera (default: `false`)

Esempio:
```bash
curl "http://localhost:3000/prefix?prefix=pre&lang=it&limit=5"
```

Risposta esempio:
```json
{
	"prefix": "pre",
	"lang": "it",
	"count": 5,
	"limit": 5,
	"results": ["prea", "preb", "prec", "pred", "pree"]
}
```

Esempio light:
```bash
curl "http://localhost:3000/prefix?prefix=pre&lang=it&limit=5&light=true"
```
Esempio richiesta light c++:
```bash
g++ request.cpp -o example -lcurl
./example
```


Risposta light:
```json
["prea", "preb", "prec", "pred", "pree"]
```

### GET /info
Restituisce informazioni e statistiche dell'API.

Esempio:
```bash
curl "http://localhost:3000/info"
```

## Errori comuni
- `400` se mancano `word` o `prefix`
- `400` se `lang` non e `it` o `en`
- `404` per route non trovate (suggerita `GET /info`)