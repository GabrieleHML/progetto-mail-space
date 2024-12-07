const { comprehend } = require('../config');
const _ = require('lodash');


exports.analyzeText = async (text) => {
  const params = { Text: text, LanguageCode: 'en' };

  const entities = await comprehend.detectEntities(params).promise();
  const keyPhrases = await comprehend.detectKeyPhrases(params).promise();

  const termineCounts = {};
  entities.Entities.forEach(entity => {
    const termine = entity.Text.toLowerCase();
    termineCounts[termine] = (termineCounts[termine] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(termineCounts));
  const usedTerms = Object.keys(termineCounts).filter(termine => termineCounts[termine] === maxCount);
  const topic = keyPhrases.KeyPhrases[0] ? keyPhrases.KeyPhrases[0].Text : 'N/A';

  return { usedTerms, topic };
};

/*
async function detectKeyPhrases(emailBody) {
  const params = { Text: emailBody, LanguageCode: 'en' };
  try {
    const result = await comprehend.detectKeyPhrases(params).promise();
    const keyPhrases = result.KeyPhrases.map(kp => kp.Text);
    return keyPhrases;
  } catch (error) {
    console.error('Error detecting key phrases: ',error);
  }
}

function calculateWordFrequency(emailBody) {
  const words = emailBody
  .toLowerCase()
  .replace(/[^\w\s]/g, '') // rimuove la punteggiatura
  .split(/\s+/);

  const wordCounts = _.countBy(words);
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1]) // Ordina per frequenza
    .slice(0, 5); // Prendi i top 5 termini

  return sortedWords.map(([word, count]) => ({ word, count }));
}

exports.analyzeEmail = async (emailBody) => {
  const topic = await detectKeyPhrases(emailBody);
  const usedTerms = calculateWordFrequency(emailBody);

  return { topic, usedTerms };
}
*/

