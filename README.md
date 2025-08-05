# Analisi automatica di email su Cloud

Questo progetto è un'applicazione cloud per l'estrazione automatica di informazioni da email.

---

## Descrizione del progetto

L'obiettivo principale del progetto era realizzare un'applicazione in grado di analizzare un insieme di email caricate dagli utenti, estraendo e associando metadati basati sui termini più usati e sugli argomenti trattati. Queste informazioni servono a supportare diverse funzionalità, tra cui:

- **Ricerca avanzata:** Gli utenti possono effettuare ricerche sulle email caricate sia per contenuto testuale che per metadati.
- **Raggruppamento automatico:** L'applicazione può raggruppare le email in base al nome del mittente e agli argomenti individuati.

La relazione presente nel repository descrive in dettaglio l'architettura, le funzionalità e le scelte implementative del sistema.

### Architettura e Tecnologie

L'applicazione è stata sviluppata seguendo un'architettura a microservizi distribuita su cloud, utilizzando i servizi di **Amazon Web Services (AWS)**.

- **Backend:** Realizzato con **Node.js** per gestire la logica di business e le interazioni con i servizi AWS.
- **Frontend:** Sviluppato con **Angular** per fornire un'interfaccia utente reattiva e intuitiva.
- **Servizi Cloud:** Sono stati utilizzati i seguenti servizi AWS:
    - **EC2:** Per l'hosting del backend e del frontend.
    - **RDS:** Per la gestione del database relazionale.
    - **Cognito:** Per l'autenticazione e la gestione degli utenti.
- **AI/ML:** Per l'analisi del contenuto delle email e l'estrazione di metadati, è stato integrato un modello di **Gemini**.
- **Server Web:** La configurazione di **NGINX** è stata usata per il reverse proxy e la gestione del traffico, i cui dettagli sono illustrati nella relazione.

### Configurazione

Il file `node-server/.env` presente nella repository contiene le istruzioni e le chiavi utili per completare la configurazione dell'ambiente di lavoro. Le variabili al suo interno non sono valorizzate per motivi di sicurezza, ma servono da template per il corretto avvio dell'applicazione.

---

## Contesto

Questo progetto è stato realizzato nell'ambito del corso di **Sistemi Distribuiti e Cloud Computing** durante l'anno accademico 2024/2025 presso l'**Università della Calabria**.
Il progetto è stato sviluppato in risposta alla seguente traccia:

> "Realizzare un’applicazione su cloud per l’estrazione automatica di informazioni da email che utilizzi un servizio cloud. L’applicazione ha il compito di analizzare un insieme di email caricate dagli utenti per analizzare il loro contenuto testuale e identificare i termini più usati e gli argomenti trattati... Per la realizzazione dell’applicazione, lo studente dovrà includere un’analisi dei requisiti funzionali e non funzionali del sistema da realizzare. Il sistema realizzato, tuttavia, dovrà utilizzare le soluzioni di calcolo, storage e virtualizzazione messe a disposizione da Amazon AWS."
