const { comprehend } = require('../config');
const _ = require('lodash');

exports.analyzeText = async (text) => {
  const params = { Text: text, LanguageCode: 'it' };

  // Estrazione delle frasi chiave e della sintassi dal testo
  const keyPhrases = await comprehend.detectKeyPhrases(params).promise();
  const syntax = await comprehend.detectSyntax(params).promise();

  const termineCounts = {};

  // Conteggio delle occorrenze delle parole che non siano 
  // segni di punteggiatura, pronomi, articoli, verbi ausiliari,
  // preposizioni, congiunzioni coordinate e subordinate
  const excludedTags = ['PUNCT', 'PRON', 'DET', 'AUX', 'ADP', 'CCONJ', 'SCONJ'];
  const syntaxClean = syntax.SyntaxTokens.filter(token => token.PartOfSpeech && !excludedTags.includes(token.PartOfSpeech.Tag));
  syntaxClean.forEach(token => {
    const termine = token.Text.toLowerCase();
    termineCounts[termine] = (termineCounts[termine] || 0) + 1;
  });

  // Ordinamento dei termini in base al conteggio delle occorrenze
  const sortedTerms = Object.entries(termineCounts).sort((a, b) => b[1] - a[1]);

  // Selezione dei primi 5 termini più usati
  const usedTerms = sortedTerms.slice(0, 5).map(entry => entry[0]);

  return { usedTerms };
};