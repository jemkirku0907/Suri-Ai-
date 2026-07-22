# Suri.AI — Fact-Check Backend (Setup)

This is the minimal server that makes the "Suri It" search on the News page
actually work by calling the Anthropic API. Walang backend yet dati — demo
lang. Ito na yung totoong gumagana.

## 1. Kunin ang API key

1. Pumunta sa https://console.anthropic.com
2. Gumawa ng account (or log in)
3. Sa kaliwang sidebar, pindutin ang "API Keys" → "Create Key"
4. Kopyahin yung key (magsisimula sa `sk-ant-...`)

## 2. I-setup ang server

```bash
cd server
npm install
cp .env.example .env
```

Buksan yung bagong `.env` file, i-paste yung key mo:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. Patakbuhin

```bash
npm start
```

Dapat lumabas: `Suri.AI fact-check server running on http://localhost:3001`

## 4. Buksan yung website

Buksan/i-serve yung `news.html` gaya ng dati (file:// or live server) —
kakausapin na ng "Suri It" search box yung localhost:3001 server sa likod.

**Note:** kailangan parehong nakabukas — yung site (frontend) AT `npm start`
(backend) habang tine-test mo.

## Papunta sa Next.js/Node.js migration mamaya

Kapag inilipat mo na ito sa Next.js:
- Ilipat lang yung laman ng `server.js` (yung `/api/fact-check` logic) papunta
  sa isang Next.js API route, hal. `app/api/fact-check/route.ts`
- Same env variable pattern (`ANTHROPIC_API_KEY` sa `.env.local`)
- Sa frontend, palitan lang yung `FACT_CHECK_API_URL` sa `script.js`
  (o i-convert na sa `fetch('/api/fact-check')` kung parehong domain na
  yung frontend at backend sa Next.js)
"# Suri-Ai-" 
