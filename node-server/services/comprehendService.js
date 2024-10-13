const { comprehend } = require('../config');

exports.analyzeText = async (text) => {
  const params = { Text: text, LanguageCode: 'it' };

  const entities = await comprehend.detectEntities(params).promise();
  const keyPhrases = await comprehend.detectKeyPhrases(params).promise();

  const termineCounts = {};
  entities.Entities.forEach(entity => {
    const termine = entity.Text.toLowerCase();
    termineCounts[termine] = (termineCounts[termine] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(termineCounts));
  const terminiUsati = Object.keys(termineCounts).filter(termine => termineCounts[termine] === maxCount);
  const argomento = keyPhrases.KeyPhrases[0] ? keyPhrases.KeyPhrases[0].Text : 'N/A';

  return { terminiUsati, argomento };
};
