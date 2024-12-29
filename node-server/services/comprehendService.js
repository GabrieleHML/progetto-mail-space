const { comprehend } = require('../config');
const _ = require('lodash');

exports.analyzeText = async (text) => {
  const params = { Text: text, LanguageCode: 'en' };

  // Estrazione delle entità e delle frasi chiave dal testo
  const entities = await comprehend.detectEntities(params).promise();
  const keyPhrases = await comprehend.detectKeyPhrases(params).promise();

  const termineCounts = {};

  // Conteggio delle occorrenze delle entità
  entities.Entities.forEach(entity => {
    const termine = entity.Text.toLowerCase();
    termineCounts[termine] = (termineCounts[termine] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(termineCounts));
  const usedTerms = Object.keys(termineCounts).filter(termine => termineCounts[termine] === maxCount);
  const topic = keyPhrases.KeyPhrases[0] ? keyPhrases.KeyPhrases[0].Text : 'N/A';

  return { usedTerms, topic };
};