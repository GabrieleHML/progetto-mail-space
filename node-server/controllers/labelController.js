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

    if (!Array.isArray(toBeRemoved) || !Array.isArray(toBeAdded)) {
      return res.status(400).json({ message: 'Payload non valido: toBeRemoved e toBeAdded devono essere array.' });
    }

    // 1) Rimuovo tutti i tag in "toBeRemoved" dalle email dell'utente
    if (toBeRemoved.length > 0) {
      await rdsService.removeLabelsFromUserEmails(userEmail, toBeRemoved);
    }

    // 2) Recupero tutte le email dell'utente (con ID, body, labels correnti)
    const allEmails = await rdsService.getUserEmails(userEmail);

    // 3) Identifico le etichette rimanenti "esistenti", dopo la rimozione
    const existingLabels = await rdsService.getDistinctUserLabels(userEmail);

    // 4) Costruisco l'insieme "fullLabels" = etichette esistenti + quelle nuove da aggiungere
    const fullLabels = Array.from(new Set([...existingLabels, ...toBeAdded]));

    // 5) Se non ci sono etichette da aggiungere, restituisco subito una risposta
    if (toBeAdded.length === 0) {
      return res.json({ message: 'Solo rimozioni effettuate, nessuna classificazione aggiuntiva.' });
    }

    // 6) Per ciascuna email, creo una promise che:
    //    a. chiama geminiService.classifyEmail(email.body, fullLabels)
    //    b. filtra(predictedLabels) solo su toBeAdded e, se ne trova, fa addLabelsToEmail
    const updatePromises = allEmails.map(async (email) => {
      try {
        const predictedLabels = await geminiService.classifyEmail(email.body, fullLabels);
        const labelsToActuallyAdd = predictedLabels.filter(label => toBeAdded.includes(label));
        if (labelsToActuallyAdd.length > 0) {
          await rdsService.addLabelsToEmail(email.id, labelsToActuallyAdd);
        }
      } catch (error) {
        console.error(`Errore durante la classificazione/aggiornamento per email id=${email.id}:`, error);
        // Non rilancio l’errore: voglio continuare a processare le altre
      }
    });

    // 7) Attendo che tutte le updatePromises vengano completate
    await Promise.all(updatePromises);

    // 8) Rispondo al client
    return res.json({ message: 'Rimozioni e classificazioni completate con successo.' });
  } catch (error) {
    console.error('Errore in updateLabels (controller):', error);
    return res.status(500).json({ message: 'Errore nell’aggiornamento delle etichette utente.', error });
  }
};