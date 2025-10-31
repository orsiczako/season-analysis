/**
 * Itt kommunikálunk a Gemini AI szolgáltatással
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Ezen az objektumon keresztül kommunikálunk a Gemini API-val
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//Most használt modell neve
const MODEL_NAME = 'gemini-2.0-flash';

// Betöltjük a promptokat fájlokból
const PROMPTS_DIR = path.join(__dirname, 'prompts');

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
          // Várunk egy kicsit, mielőtt újrapróbáljuk
          await new Promise(r => setTimeout(r, 800));
          continue;
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

    return {
      success: false,
      error: 'CHAT_FAILED',
      message: error.message
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



module.exports = {
  chat,
  analyzeColorType,
};
