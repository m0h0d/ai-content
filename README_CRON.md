# Automatizované generování článků o pohledávkách

Tento projekt automaticky generuje a publikuje články o pohledávkách a finančních službách podle nastaveného časového plánu. Využívá OpenAI API pro generování obsahu a Vercel Cron Jobs pro plánování.

## Jak to funguje

1. **Časový plán**: V souboru `settings.json` je definován časový plán, kdy se mají publikovat nové články. Například pondělí 19:00, úterý 6:00 atd.

2. **Témata článků**: V souboru `settings.json` jsou definována témata článků o pohledávkách. Systém vybírá témata podle nastaveného plánu.

3. **Automatické generování**: Cron job na Vercelu pravidelně (každých 10 minut) kontroluje, zda je čas pro publikování nového článku. Pokud ano, spustí generování.

4. **Generování s využitím AI**: Obsah článků je generován pomocí OpenAI API s ohledem na zvolené téma a nastavení tónu, délky atd.

## Nasazení na Vercel

1. Propojte tento repozitář se svým účtem na Vercelu.

2. Nastavte následující proměnné prostředí v projektu na Vercelu:
   - `OPENAI_API_KEY`: Váš API klíč pro OpenAI
   - `UNSPLASH_ACCESS_KEY`: Váš API klíč pro Unsplash (pro generování obrázků)

3. Nasaďte projekt na Vercel. Cron joby se automaticky aktivují podle konfigurace v souboru `vercel.json`.

## Úprava nastavení

### Změna časového plánu

Pro změnu časů publikování upravte sekci `schedule` v souboru `settings.json`:

```json
"schedule": {
  "monday": {
    "time": "19:00",
    "topic_index": 0
  },
  "tuesday": {
    "time": "06:00",
    "topic_index": 1
  }
}
```

- `day`: Den v týdnu (sunday, monday, tuesday, wednesday, thursday, friday, saturday)
- `time`: Čas publikování ve formátu "HH:MM" v české časové zóně
- `topic_index`: Index tématu ze seznamu `topics`

### Změna témat článků

Pro změnu témat článků upravte sekci `topics` v souboru `settings.json`:

```json
"topics": [
  "Vymáhání pohledávek - efektivní strategie a postupy",
  "Správa firemních pohledávek - klíč k finanční stabilitě",
  "Odkup a prodej pohledávek - průvodce pro podnikatele",
  "Odkup firem - právní a finanční aspekty",
  "Odkup směnek - výhody a rizika"
]
```

## Ladění a monitoring

Logy z cron jobu můžete sledovat v dashboardu Vercelu v sekci "Functions" a "Logs".

Provádění cron jobu můžete také otestovat ručně návštěvou URL:
```
https://vaše-doména.vercel.app/api/cron
```

## Poznámky

- Vercel Cron Jobs jsou spouštěny každých 10 minut, což znamená, že skutečný čas publikování se může lišit až o 10 minut od nastaveného času.
- Pro provozování cron jobů je vyžadován placený plán na Vercelu (Hobby, Pro nebo Enterprise). 