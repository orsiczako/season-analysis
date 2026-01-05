/**
 * Itt kommunikálunk a Gemini AI szolgáltatással
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Ezen az objektumon keresztül kommunikálunk a Gemini API-val
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//Most használt modell neve - gemini-2.5-flash jobb kvótával
const MODEL_NAME = 'gemini-2.5-flash';

// Betöltjük a promptokat az ML/gemini/prompts mappából
const PROMPTS_DIR = path.join(__dirname, '..', '..', '..', 'ML', 'gemini', 'prompts');

const systemPrompt = fs.readFileSync(
  path.join(PROMPTS_DIR, 'simple-system-prompt.txt'),
  'utf-8'
);

const analysisPromptTemplate = fs.readFileSync(
  path.join(PROMPTS_DIR, 'analysis-prompt.txt'),
  'utf-8'
);

/**
 * Létrehoz egy modellt egy üzenetváltásra, megkapja a user legújabb üzenetét és a beszélgetés előzményeit,
 * minden elem { role: 'user' | 'assistant', content: string } formátumú
 */
async function chat(message, conversationHistory = []) {
  try {
    //Létrehozunk egy modellt
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });

    // Felépítjük a promptot a beszélgetés előzményeivel, aztán jelezzük, hogy jön a beszélgetés
    let prompt = systemPrompt + '\n\nBeszélgetés:\n';

    //Végigmegyünk az előzményeken, hozzáadjuk őket a prompthoz
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Felhasználó: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Színtanácsadó: ${msg.content}\n`;
      }
    });

    //Az új üzenet hozzáadása, utána az AI fog válaszolni
    prompt += `Felhasználó: ${message}\nSzíntanácsadó: `;

    console.log('Sending to Gemini...');
    let text = ''; // Ebbe kerül a válasz szövege
    let attempts = 0; // Próbálkozások száma

    while (attempts < 2) {
      try {
        // Küldjük a promptot a Gemini modellnek, ha 503-as hibát kapunk, újrapróbáljuk egyszer
        //Először a resultba kerül a válasz, ebben még metaadatok is vannak, pl státusz kód, logok, a model stb 
        /**Szóval ilyesmi:
         * {
            response: {
                  text: [Function],  
                  metadata: { tokensUsed: 120, finishReason: 'stop' }
            },
            model: 'gemini-2.0-flash',
            timestamp: 1698495600000
            } */
        const result = await model.generateContent(prompt);
        //Ezután ebből kinyerjük a response-t
        const response = result.response;
        // A responseból meg a text részt
        text = response.text();
        break; // Sikeres válasz, kilépünk a ciklusból
      } catch (err) {
        attempts++;
        // Ha 503-as hibát kapunk, újrapróbáljuk egyszer
        if (err && err.status === 503 && attempts < 2) {
          console.warn('Gemini 503 Service Unavailable. Retrying...');
          await new Promise(r => setTimeout(r, 800));
          continue;
        }
        // Handle Gemini quota/rate limit errors (status 429 or specific error message)
        const errorMessage = err?.message || '';
        const isQuotaError = (err && err.status === 429) ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.includes('429') ||
          errorMessage.toLowerCase().includes('too many requests');

        if (isQuotaError) {
          throw {
            isQuotaError: true,
            status: 429,
            message: 'A Gemini AI szolgáltatás jelenleg túl van terhelve vagy elérte a kvótát. Kérjük, próbáld meg később, vagy jelezd az adminisztrátornak!'
          };
        }
        throw err;
      }
    }
    console.log('Gemini response received:', text);

    // Ez a rész ellenőrzi, hogy az AI jelezte-e a befejezést a kulcsszóval
    const shouldAnalyze = text.includes('SZÍNANALÍZIS_KÉSZ');

    return {
      success: true,
      response: text,
      shouldAnalyze: shouldAnalyze //Ha igaz, akkor az AI jelezte, hogy készen van az elemzéssel
    };
  } catch (error) {
    console.error('Gemini chat error:', error);

    // Check if it's a quota error (from our custom throw or from original error)
    const errorMessage = error?.message || '';
    const isQuotaError = error?.isQuotaError ||
      error?.status === 429 ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('too many requests');

    // If quota error, return user-friendly message
    if (isQuotaError) {
      return {
        success: false,
        error: 'CHAT_QUOTA_EXCEEDED',
        message: 'A Gemini AI szolgáltatás jelenleg túl van terhelve vagy elérte a kvótát. Kérjük, próbáld meg később, vagy jelezd az adminisztrátornak!'
      };
    }

    return {
      success: false,
      error: 'CHAT_FAILED',
      message: error.message || 'Ismeretlen hiba történt a Gemini AI szolgáltatásnál.'
    };
  }
}

/**
 * Analyze color type based on conversation history
 */
async function analyzeColorType(conversationHistory) {
  try {
    //Megnézzük, hogy tényleg tömb-e az előzmény
    if (!Array.isArray(conversationHistory)) {
      throw new Error('Invalid conversation history');
    }

    // Végigmegyünk visszafelé az előzményeken, hogy megtaláljuk az elemzést tartalmazó üzenetet
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      //Ha nincs üzenet, vagy nem asszisztens, vagy nincs tartalom, akkor lépünk a következőre
      //Csak asszisztens üzeneteket vizsgálunk
      if (!msg || msg.role !== 'assistant' || !msg.content) continue;

      //Átalakítjuk szöveggé a tartalmat (mert lehet, hogy mondjuk null, vagy undefined)
      let content = String(msg.content);

      // Ellenőrizzük, hogy tartalmazza-e a befejezési kulcsszót vagy JSON-t, ha nem még mindig lépünk a következőre
      if (!content.includes('SZÍNANALÍZIS_KÉSZ') && !content.includes('{')) {
        continue;
      }

      // Ha van, csak a befejezési kulcsszó utáni részt tartjuk meg
      if (content.includes('SZÍNANALÍZIS_KÉSZ')) {
        // A befejezési kulcsszó utáni részt tartjuk meg
        const parts = content.split('SZÍNANALÍZIS_KÉSZ');
        content = parts.slice(1).join('SZÍNANALÍZIS_KÉSZ');
      }

      //Eltávolítjuk a markdown kódkereteket és az opcionális nyelvi jelzést
      let cleaned = content
        .replace(/```\s*json/gi, '')
        .replace(/```/g, '')
        .trim();

      // Megnézzük, hogy van-e JSON blokk a szövegben ({...})
      const braceMatch = cleaned.match(/\{[\s\S]*\}/);
      //Ha van, akkor az lesz a jsonStr, ha nincs, akkor az egész tisztított szöveg
      const jsonStr = braceMatch ? braceMatch[0] : cleaned;

      try {
        //Parseljük a JSON-t
        const analysis = JSON.parse(jsonStr);

        // Ha nincs 'season' kulcs, de van 'primary_season', akkor az lesz a season, ez csak attól véd, 
        // hogy a modell esetleg más kulcsnevet használ
        if (!analysis.season && analysis.primary_season) {
          analysis.season = String(analysis.primary_season).toLowerCase();
        }

        console.log('Analysis extracted from conversation history.');
        return { success: true, analysis };
      } catch (e) {
        // Nem sikerült parselni ezt az üzenetet; keresünk tovább korábbiakon
        continue;
      }
    }

    // Semmilyen elemzést nem találtunk
    return {
      success: false,
      error: 'ANALYSIS_NOT_FOUND',
      message: 'No analysis JSON found in conversation history'
    };
  } catch (error) {

    return {
      success: false,
      error: 'ANALYSIS_FAILED',
      message: error.message
    };
  }
}

/**
 * Kép alapú chat - Frame Snapshotting támogatás
 * A felhasználó kamerájából készült képet elemez és stylist tanácsokat ad
 * @param {string} imageBase64 - Base64 kódolt kép (fejléc nélkül)
 * @param {string} prompt - A felhasználó kérdése/utasítása
 * @param {Array} conversationHistory - Korábbi beszélgetés előzményei
 * @param {Object} userContext - Felhasználói kontextus (színtípus, stb.)
 */
async function chatWithImage(imageBase64, prompt, conversationHistory = [], userContext = null) {
  try {
    // Gemini 2.0 Flash modell - képelemzéshez is támogatott
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });

    // Felépítjük a kontextust
    let contextInfo = '';
    if (userContext) {
      if (userContext.colorSeason) {
        const seasonNames = {
          spring: 'Tavasz',
          summer: 'Nyár',
          autumn: 'Ősz',
          winter: 'Tél'
        };
        contextInfo = `\n\nA felhasználó színtípusa: ${seasonNames[userContext.colorSeason] || userContext.colorSeason}`;
      }
    }

    // System prompt a stylist személyiséghez
    const stylistPrompt = `Te egy barátságos és szakértő személyi stylist vagy, aki segít a felhasználóknak a ruházkodásban és a színek kiválasztásában.
    
Feladatod:
- Elemezd a képen látható ruhát/öltözéket
- Adj visszajelzést, hogy a színek illenek-e a felhasználó színtípusához
- Adj konkrét, praktikus tanácsokat
- Légy pozitív és támogató, de őszinte
- Válaszolj magyarul, röviden és lényegre törően (max 2-3 mondat)
- Ha kérdeznek, adj alternatív javaslatokat is
${contextInfo}

Beszélgetés előzmények:
`;

    // Előzmények hozzáadása
    let historyText = '';
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        historyText += `Felhasználó: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        historyText += `Stylist: ${msg.content}\n`;
      }
    });

    const fullPrompt = stylistPrompt + historyText + `\nFelhasználó: ${prompt}\nStylist: `;

    console.log('Sending image to Gemini for analysis...');

    let text = '';
    let attempts = 0;

    while (attempts < 2) {
      try {
        // Kép és szöveg együttes küldése
        const result = await model.generateContent([
          fullPrompt,
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          }
        ]);

        const response = result.response;
        text = response.text();
        break;
      } catch (err) {
        attempts++;
        if (err && err.status === 503 && attempts < 2) {
          console.warn('Gemini 503 Service Unavailable. Retrying...');
          await new Promise(r => setTimeout(r, 800));
          continue;
        }

        // Quota/rate limit kezelés
        const errorMessage = err?.message || '';
        const isQuotaError = (err && err.status === 429) ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.includes('429') ||
          errorMessage.toLowerCase().includes('too many requests');

        if (isQuotaError) {
          throw {
            isQuotaError: true,
            status: 429,
            message: 'A Gemini AI szolgáltatás jelenleg túlterhelt. Kérjük, próbáld meg később!'
          };
        }
        throw err;
      }
    }

    console.log('Gemini image analysis response:', text);

    return {
      success: true,
      response: text
    };
  } catch (error) {
    console.error('Gemini image chat error:', error);

    const errorMessage = error?.message || '';
    const isQuotaError = error?.isQuotaError ||
      error?.status === 429 ||
      errorMessage.toLowerCase().includes('quota');

    if (isQuotaError) {
      return {
        success: false,
        error: 'IMAGE_CHAT_QUOTA_EXCEEDED',
        message: 'A szolgáltatás jelenleg túlterhelt. Próbáld meg később!'
      };
    }

    return {
      success: false,
      error: 'IMAGE_CHAT_FAILED',
      message: error.message || 'Ismeretlen hiba történt a képelemzés során.'
    };
  }
}



module.exports = {
  chat,
  analyzeColorType,
  chatWithImage,
};
