const { comprehend } = require('../config');
const _ = require('lodash');

exports.analyzeText = async (text) => {
  const params = { Text: text, LanguageCode: 'it' };

  // Estrazione delle frasi chiave e della sintassi dal testo
  const keyPhrases = await comprehend.detectKeyPhrases(params).promise();
  const syntax = await comprehend.detectSyntax(params).promise();

  const termineCounts = {};

  /* Conteggio delle occorrenze delle parole che non siano 
  *  segni di punteggiatura, pronomi, articoli o verbi ausiliari
  */
  const excludedTags = ['PUNCT', 'PRON', 'DET', 'AUX'];
  syntax.SyntaxTokens.forEach(token => {
    if (!excludedTags.includes(token.PartOfSpeech.Tag)) {
      const termine = token.Text.toLowerCase();
      termineCounts[termine] = (termineCounts[termine] || 0) + 1;
    }
  });

  // Ordinamento delle frasi chiave in base al punteggio di confidenza
  keyPhrases.KeyPhrases.sort((a, b) => b.Score - a.Score);

  // Ordinamento dei termini in base al conteggio delle occorrenze
  const sortedTerms = Object.entries(termineCounts).sort((a, b) => b[1] - a[1]);
  // Selezione dei primi 5 termini più usati
  const usedTerms = sortedTerms.slice(0, 5).map(entry => entry[0]);
  // Estrazione del primo termine chiave come argomento principale
  const topic = keyPhrases.KeyPhrases.find(phrase => !excludedTags.includes(phrase.PartOfSpeech.Tag))?.Text || 'N/A';
  return { usedTerms, topic };
};