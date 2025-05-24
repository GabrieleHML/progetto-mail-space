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

    // 1) Controllo validità payload e log iniziale
    if (!Array.isArray(toBeRemoved) || !Array.isArray(toBeAdded)) {
      console.error('[labelController.updateLabels] Payload non valido:', req.body);
      return res.status(400).json({ message: 'Payload non valido: toBeRemoved e toBeAdded devono essere array.' });
    }
    console.log('[labelController.updateLabels] Chiamata da utente:', userEmail);
    console.log('[labelController.updateLabels] toBeRemoved:', toBeRemoved);
    console.log('[labelController.updateLabels] toBeAdded:  ', toBeAdded);

    // 2) Rimozione delle etichette "toBeRemoved"
    if (toBeRemoved.length > 0) {
      console.log(`[labelController.updateLabels] Rimuovo ${toBeRemoved.length} etichette dalle email dell'utente...`);
      await rdsService.removeLabelsFromUserEmails(userEmail, toBeRemoved);
      console.log('[labelController.updateLabels] Rimozione completata.');
    } else {
      console.log('[labelController.updateLabels] Nessuna etichetta da rimuovere.');
    }

    // 3) Recupero tutte le email e log sul numero
    const allEmails = await rdsService.getUserEmails(userEmail);
    console.log(`[labelController.updateLabels] Recuperate ${allEmails.length} email per l'utente.`);

    // 4) Estrazione delle etichette già esistenti, e log
    const existingLabels = await rdsService.getDistinctUserLabels(userEmail);
    console.log('[labelController.updateLabels] Etichette esistenti (dopo rimozioni):', existingLabels);

    // 5) Costruisco l'insieme fullLabels e log
    const fullLabels = Array.from(new Set([...existingLabels, ...toBeAdded]));
    console.log('[labelController.updateLabels] fullLabels (existing + toBeAdded):', fullLabels);

    // 6) Se non ci sono etichette da aggiungere, restituisco subito
    if (toBeAdded.length === 0) {
      console.log('[labelController.updateLabels] Nessuna etichetta da aggiungere. Finisco qui.');
      return res.json({ message: 'Solo rimozioni effettuate, nessuna classificazione aggiuntiva.' });
    }

    // 7) Per ciascuna email, creo una promise con classificazione + update
    const updatePromises = allEmails.map(async (email) => {
      try {
        console.log(`  [labelController.updateLabels] Classifico email id=${email.id}…`);
        const predictedLabels = await geminiService.classifyEmail(email.body, fullLabels);
        console.log(`    [labelController.updateLabels] Risposta Gemini per email id=${email.id}:`, predictedLabels);

        // Individuo quali delle predictedLabels sono esattamente in toBeAdded
        const labelsToActuallyAdd = predictedLabels.filter(label => toBeAdded.includes(label));
        console.log(`    [labelController.updateLabels] labelsToActuallyAdd per email id=${email.id}:`, labelsToActuallyAdd);

        if (labelsToActuallyAdd.length > 0) {
          console.log(`    [labelController.updateLabels] Aggiungo ${labelsToActuallyAdd} a email id=${email.id}…`);
          await rdsService.addLabelsToEmail(email.id, labelsToActuallyAdd);
          console.log(`    [labelController.updateLabels] Aggiunte con successo per email id=${email.id}.`);
        } else {
          console.log(`    [labelController.updateLabels] Né nuove né existing tra toBeAdded per email id=${email.id}, salto update.`);
        }
      } catch (error) {
        console.error(`  [labelController.updateLabels] Errore classifying/updating email id=${email.id}:`, error);
        // Non interrompo il flusso: continuo con le altre email
      }
    });

    // 8) Attendo tutte le Promise
    console.log('[labelController.updateLabels] Attendo il completamento di tutte le classificazioni…');
    await Promise.all(updatePromises);
    console.log('[labelController.updateLabels] Tutte le email processate.');

    // 9) Risposta finale al client
    return res.json({ message: 'Rimozioni e classificazioni completate con successo.' });
  } catch (error) {
    console.error('[labelController.updateLabels] Errore generale:', error);
    return res.status(500).json({ message: 'Errore nell’aggiornamento delle etichette utente.', error });
  }
};
