# Mail Space

## Descrizione del Progetto
Cloud Email Analyzer è un'applicazione basata su cloud per l'estrazione automatica di informazioni dalle email utilizzando Amazon Comprehend. L'obiettivo del progetto è analizzare il contenuto testuale delle email caricate dagli utenti e identificare i termini più usati e gli argomenti trattati.

L'applicazione consente agli utenti di:
- Caricare email in formato `.eml` o testo semplice.
- Analizzare il contenuto con Amazon Comprehend per estrarre termini chiave e argomenti.
- Effettuare ricerche sulle email per testo e metadati (mittente, argomento, parole chiave).
- Organizzare le email in gruppi basati sul mittente o sugli argomenti trattati.

## Tecnologie Utilizzate
Il sistema è stato sviluppato utilizzando le seguenti tecnologie e servizi AWS:
- **Frontend:** Angular
- **Backend:** Node.js con Express
- **Autenticazione:** Amazon Cognito
- **Storage:** Amazon S3
- **Database:** Amazon RDS (PostgreSQL)
- **Analisi del Testo:** Amazon Comprehend
- **Hosting e Virtualizzazione:** Amazon EC2

## Architettura del Sistema
1. **Caricamento Email**: L'utente carica un'email che viene salvata su Amazon S3.
2. **Analisi del Testo**: Il backend invia il contenuto a Amazon Comprehend per l'analisi.
3. **Salvataggio Metadati**: I termini chiave e l'argomento vengono salvati nel database.
4. **Ricerca Avanzata**: Gli utenti possono effettuare ricerche basate sul contenuto testuale e i metadati associati.
5. **Organizzazione Email**: Possibilità di raggruppare le email in base al mittente o agli argomenti identificati.

## Requisiti del Sistema
### Requisiti Funzionali
- Gli utenti devono poter caricare email e visualizzarle.
- Il sistema deve analizzare automaticamente il contenuto delle email con Amazon Comprehend.
- Gli utenti devono poter effettuare ricerche per testo, parole chiave e argomento.
- Le email devono poter essere organizzate per mittente o argomento.

### Requisiti Non Funzionali
- Il sistema deve essere scalabile per supportare un numero elevato di utenti.
- Il tempo di risposta dell'analisi del testo deve essere accettabile per una buona UX.
- L'infrastruttura deve garantire sicurezza e protezione dei dati degli utenti.
- Il servizio deve essere accessibile tramite web browser e supportare dispositivi mobili.

## Setup del Progetto
### Prerequisiti
- **Node.js** installato sulla macchina locale
- **AWS CLI** configurato con le credenziali di accesso
- **Database PostgreSQL** configurato su Amazon RDS

## Contributi
I contributi sono benvenuti! Per proposte di miglioramento, aprire una issue o una pull request su GitHub.

## Licenza
Questo progetto è rilasciato sotto la licenza MIT.