const mockDictionary = {
  en: { pt: { "hello": "olá", "world": "mundo" } },
  pt: { en: { "olá": "hello", "mundo": "world" } }
};

const mockTranslate = (text, source, target) => {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 5000 + 3000; // Demora entre 3 e 8 segundos
    console.log(`Translating '${text}'... will take ${Math.round(delay/1000)}s`);
    
    setTimeout(() => {
      if (text.toLowerCase().includes("fail")) {
        return reject(new Error("Simulated translation error."));
      }
      try {
        const translated = mockDictionary[source][target][text.toLowerCase()];
        if (!translated) {
          return reject(new Error(`Could not translate '${text}' from ${source} to ${target}.`));
        }
        resolve(translated);
      } catch (e) {
        reject(new Error(`Language combination not supported.`));
      }
    }, delay);
  });
};

module.exports = { mockTranslate };