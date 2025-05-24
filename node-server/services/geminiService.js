const { genAI } = require('../config');

exports.classifyEmail = async (body, tags) => {
  const prompt = `
Analizza il seguente testo di una email e restituisci una lista dei tag pertinenti tra quelli forniti.
Testo dell'email:
"${body}"

Tag disponibili: ${tags.join(', ')}

Rispondi con un array JSON contenente solo i tag rilevanti.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Estrai l'array JSON dalla risposta
    const matches = text.match(/\[.*\]/s);
    const extractedLabels = matches ? JSON.parse(matches[0]) : [];
    console.log('Etichette estratte: ', extractedLabels);
    return extractedLabels;
  } catch (error) {
    console.error('Errore durante l\'analisi con Gemini:', error);
    throw error;
  }
};