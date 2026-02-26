const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Oggetti per memorizzare le parole
let words = {
  it: new Set(),
  en: new Set()
};

// Funzione per caricare le parole dai file
function loadWords() {
  try {
    const itPath = path.join(__dirname, 'db', 'ita.txt');
    const engPath = path.join(__dirname, 'db', 'eng.txt');

    const itWords = fs.readFileSync(itPath, 'utf-8').split('\n').filter(word => word.trim());
    const engWords = fs.readFileSync(engPath, 'utf-8').split('\n').filter(word => word.trim());

    words.it = new Set(itWords.map(w => w.toLowerCase()));
    words.en = new Set(engWords.map(w => w.toLowerCase()));

    console.log(`✓ Caricate ${words.it.size} parole italiane`);
    console.log(`✓ Caricate ${words.en.size} parole inglesi`);
  } catch (error) {
    console.error('Errore nel caricamento dei file:', error);
    process.exit(1);
  }
}

// Carica le parole all'avvio
loadWords();

// Middleware
app.use(express.json());

/**
 * ROTTA 1: Cercare se una parola esiste
 * GET /search?word=parola&lang=it
 * lang: 'it' (default) o 'en'
 */
app.get('/search', (req, res) => {
  const { word, lang = 'it', light } = req.query;

  if (!word) {
    return res.status(400).json({
      success: false,
      error: 'Il parametro "word" è obbligatorio'
    });
  }

  if (!['it', 'en'].includes(lang)) {
    return res.status(400).json({
      success: false,
      error: 'Lingua non valida. Usa "it" o "en"'
    });
  }

  const cleanWord = word.toLowerCase().trim();
  const exists = words[lang].has(cleanWord);

  const isLight = ['true', '1', 'yes'].includes(String(light).toLowerCase());
  if (isLight) {
    return res.json(exists);
  }

  res.json({
    word: cleanWord,
    lang: lang,
    exists: exists,
    message: exists 
      ? `La parola "${cleanWord}" esiste nel database ${lang === 'it' ? 'italiano' : 'inglese'}`
      : `La parola "${cleanWord}" non esiste nel database ${lang === 'it' ? 'italiano' : 'inglese'}`
  });
});

/**
 * ROTTA 2: Ottenere tutte le parole con un prefisso specifico
 * GET /prefix?prefix=pre&lang=it&limit=100
 * lang: 'it' (default) o 'en'
 * limit: numero massimo di risultati (default: 100)
 */
app.get('/prefix', (req, res) => {
  const { prefix, lang = 'it', limit = 100, light } = req.query;

  if (!prefix) {
    return res.status(400).json({
      success: false,
      error: 'Il parametro "prefix" è obbligatorio'
    });
  }

  if (!['it', 'en'].includes(lang)) {
    return res.status(400).json({
      success: false,
      error: 'Lingua non valida. Usa "it" o "en"'
    });
  }

  const cleanPrefix = prefix.toLowerCase().trim();
  const limitNum = Math.max(1, Math.min(parseInt(limit) || 100, 1000));

  const results = Array.from(words[lang])
    .filter(word => word.startsWith(cleanPrefix))
    .sort()
    .slice(0, limitNum);

  const isLight = ['true', '1', 'yes'].includes(String(light).toLowerCase());
  if (isLight) {
    return res.json(results);
  }

  res.json({
    prefix: cleanPrefix,
    lang: lang,
    count: results.length,
    limit: limitNum,
    results: results
  });
});

/**
 * ROTTA 3: Info API (bonus)
 * GET /info
 */
app.get('/info', (req, res) => {
  res.json({
    name: 'Word API',
    version: '1.0.0',
    description: 'API per cercare parole nei database italiano e inglese',
    stats: {
      italian_words: words.it.size,
      english_words: words.en.size
    },
    endpoints: {
      search: {
        path: 'GET /search',
        description: 'Cerca se una parola esiste nel database',
        params: {
          word: 'string (obbligatorio)',
          lang: 'string - "it" o "en" (default: "it")',
          light: 'boolean - risposta leggera (default: false)'
        }
      },
      prefix: {
        path: 'GET /prefix',
        description: 'Ottiene tutte le parole che iniziano con un prefisso',
        params: {
          prefix: 'string (obbligatorio)',
          lang: 'string - "it" o "en" (default: "it")',
          limit: 'number - max risultati (default: 100)',
          light: 'boolean - risposta leggera (default: false)'
        }
      }
    }
  });
});

// Gestione route non trovate
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trovata',
    info: 'Consulta GET /info per le route disponibili'
  });
});

// Avvio server
app.listen(PORT, () => {
  console.log(`\n🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`📖 Documentazione: http://localhost:${PORT}/info\n`);
});
