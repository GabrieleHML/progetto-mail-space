const rdsService = require('../services/rdsService');
const geminiService = require('../services/geminiService');

exports.getLabels = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const labels = await rdsService.getLabels(userEmail);
        res.json(labels);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving labels', error });
    }
};


exports.updateLabels = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { toBeRemoved, toBeAdded } = req.body;

    // 1) Validazione payload
    if (!Array.isArray(toBeRemoved) || !Array.isArray(toBeAdded)) {
      console.error('[updateLabels] Payload non valido:', req.body);
      return res.status(400).json({ message: 'Payload non valido: toBeRemoved e toBeAdded devono essere array.' });
    }
    console.log('[updateLabels] Chiamata da utente:', userEmail);
    console.log('[updateLabels] toBeRemoved:', toBeRemoved);
    console.log('[updateLabels] toBeAdded:  ', toBeAdded);

    // ──────────────────────────────────────────────────────────────────────────────
    // 2) **AGGIORNAMENTO DELLA TABELLA user_labels**
    //    Rimuovo le etichette che l’utente ha tolto dal suo profilo
    if (toBeRemoved.length > 0) {
      console.log(`[updateLabels] Rimuovo da user_labels: ${toBeRemoved}`);
      await rdsService.removeLabelsFromUserLabelsTable(userEmail, toBeRemoved);
      console.log('[updateLabels] Rimozione da user_labels completata.');
    } else {
      console.log('[updateLabels] Nessuna etichetta da rimuovere in user_labels.');
    }

    //    Aggiungo le etichette nuove al profilo dell’utente
    if (toBeAdded.length > 0) {
      console.log(`[updateLabels] Aggiungo a user_labels: ${toBeAdded}`);
      await rdsService.addLabelsToUserLabelsTable(userEmail, toBeAdded);
      console.log('[updateLabels] Aggiunta a user_labels completata.');
    } else {
      console.log('[updateLabels] Nessuna etichetta da aggiungere in user_labels.');
    }
    // ──────────────────────────────────────────────────────────────────────────────

    // 3) Rimozione dei tag scelti da ciascuna email
    if (toBeRemoved.length > 0) {
      console.log(`[updateLabels] Rimuovo ${toBeRemoved.length} etichette dalle email dell'utente…`);
      await rdsService.removeLabelsFromUserEmails(userEmail, toBeRemoved);
      console.log('[updateLabels] Rimozione dalle emails completata.');
    } else {
      console.log('[updateLabels] Nessuna etichetta da rimuovere dalle emails.');
    }

    // 4) Recupero tutte le email dell’utente
    const allEmails = await rdsService.getUserEmails(userEmail);
    console.log(`[updateLabels] Recuperate ${allEmails.length} email per l'utente.`);

    // 5) Estrazione delle etichette rimanenti, dopo le rimozioni
    const existingLabels = await rdsService.getDistinctUserLabels(userEmail);
    console.log('[updateLabels] Etichette esistenti (dopo rimozioni):', existingLabels);

    // 6) Costruisco fullLabels = existingLabels U toBeAdded
    const fullLabels = Array.from(new Set([...existingLabels, ...toBeAdded]));
    console.log('[updateLabels] fullLabels (existing + toBeAdded):', fullLabels);

    // 7) Se non ci sono etichette da aggiungere, termino qui
    if (toBeAdded.length === 0) {
      console.log('[updateLabels] Nessuna etichetta da aggiungere alle emails. Finisco qui.');
      return res.json({ message: 'Solo rimozioni effettuate, nessuna classificazione aggiuntiva.' });
    }

    // 8) Per ciascuna email, genero la promise di classificazione + update
    const updatePromises = allEmails.map(async (email) => {
      try {
        console.log(`  [updateLabels] Classifico email id=${email.id}…`);
        const predictedLabels = await geminiService.classifyEmail(email.body, fullLabels);
        console.log(`    [updateLabels] Risposta Gemini per email id=${email.id}:`, predictedLabels);

        // Da predictedLabels estraggo solo i tag nuovi che voglio aggiungere (toBeAdded)
        const labelsToActuallyAdd = predictedLabels.filter(label => toBeAdded.includes(label));
        console.log(`    [updateLabels] labelsToActuallyAdd per email id=${email.id}:`, labelsToActuallyAdd);

        if (labelsToActuallyAdd.length > 0) {
          console.log(`    [updateLabels] Aggiungo ${labelsToActuallyAdd} a email id=${email.id}…`);
          await rdsService.addLabelsToEmail(email.id, labelsToActuallyAdd);
          console.log(`    [updateLabels] Aggiunte con successo per email id=${email.id}.`);
        } else {
          console.log(`    [updateLabels] Nessuna etichetta nuova da aggiungere per email id=${email.id}.`);
        }
      } catch (error) {
        console.error(`  [updateLabels] Errore classificazione/aggiornamento email id=${email.id}:`, error);
      }
    });

    console.log('[updateLabels] Attendo il completamento di tutte le classificazioni…');
    await Promise.all(updatePromises);
    console.log('[updateLabels] Tutte le email processate.');

    // 9) Risposta finale al client
    return res.json({ message: 'Rimozioni e classificazioni completate con successo.' });
  } catch (error) {
    console.error('[updateLabels] Errore generale:', error);
    return res.status(500).json({ message: 'Errore nell’aggiornamento delle etichette utente.', error });
  }
};
