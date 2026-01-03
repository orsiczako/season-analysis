/**
 * Itt kezeljük a Gemini AI-vel való kommunikációt és a bejövő kéréseket
 */

const geminiService = require('../service/ai/gemini.service');
const skinAnalysisService = require('../service/ai/skin-analysis.service');
const dbModels = require('../dbo');
const { success, error, serverError } = require('../service/helpers/api-response.helper');
const { User, SkinAnalysis } = dbModels;

/**
 *A frontend egy POST kérést küld, amiben van egy message mező és egy conversationHistory mező
 Ez az üzenet a felhasználó aktuális üzenete
 */
async function chatWithAI(req, res) {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return error(res, 'MESSAGE_REQUIRED', 400, 'MESSAGE_REQUIRED');
    }

    console.log('Authenticated user message received:', message);

    // Átadjuk a Gemininak az üzit, meg az előzményt
    const result = await geminiService.chat(message, conversationHistory || []);

    if (!result.success) {
      console.error('Chat service failed:', result);
      return serverError(res, new Error(result.message || 'Chat service failed'));
    }

    return success(res, 'Chat response generated', result);
  } catch (error) {
    console.error('Chat controller error:', error);
    return serverError(res, error);
  }
}




/**
 * Ez a függvény kezeli a színtípus elemzést
 */
async function analyzeColorType(req, res) {
  try {
    //Frontend elküldte, hogy mik az előzmények, meg a user azonosítóját, ezt kicsomagoljuk
    const { conversationHistory, accountId } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return error(res, 'CONVERSATION_HISTORY_REQUIRED', 400, 'CONVERSATION_HISTORY_REQUIRED');
    }

    if (!accountId) {
      return error(res, 'ACCOUNT_ID_REQUIRED', 400, 'ACCOUNT_ID_REQUIRED');
    }

    //Ha minden rendben volt, akkor átadjuk a Gemininak az előzményeket elemzésre
    const result = await geminiService.analyzeColorType(conversationHistory);

    if (!result.success) {
      return serverError(res, new Error(result.message || 'Color analysis failed'));
    }

    // Ha sikeres az elemzés, frissítjük a felhasználó adatbázisában a színtípust
    try {
      const { ColorSeason } = dbModels;

      // Megkeressük a season_id-t a season név alapján (spring/summer/autumn/winter)
      const seasonRecord = await ColorSeason.findOne({
        where: { season_name: result.analysis.season }
      });

      if (seasonRecord) {
        await User.update(
          {
            color_season_id: seasonRecord.season_id,
            color_analysis_date: new Date()
          },
          {
            where: { account_id: accountId }
          }
        );
        console.log(` User ${accountId} color season updated to: ${result.analysis.season}`);
      } else {
        console.warn(`Season '${result.analysis.season}' not found in color_seasons table`);
      }
    } catch (dbError) {
      console.error('Failed to update user color season:', dbError);
      // Nem bukik el az egész művelet
    }

    return success(res, 'Color analysis completed', {
      result: result.analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return serverError(res, error);
  }
}

/**
 * Bőrelemzés - kép alapján
 * A kép NEM kerül tartós tárolásra - csak az elemzés idejére létezik ideiglenes fájlként
 */
async function analyzeSkin(req, res) {
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');

  let tempFilePath = null;

  try {

    if (!req.file || !req.file.buffer) {
      console.log('ERROR: No file uploaded');
      return error(res, 'IMAGE_REQUIRED', 400, 'IMAGE_REQUIRED');
    }

    const accountId = req.user?.id || req.user?.accountId;
    if (!accountId) {
      console.log('ERROR: No accountId in req.user');
      return error(res, 'AUTH_REQUIRED', 401, 'AUTH_REQUIRED');
    }

    // Ideiglenes fájl létrehozása a memória bufferből
    const tempDir = os.tmpdir();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    tempFilePath = path.join(tempDir, `skin-analysis-${uniqueSuffix}${path.extname(req.file.originalname)}`);

    await fs.writeFile(tempFilePath, req.file.buffer);
    console.log('Temp file created:', tempFilePath);

    // ML modellek hívása (bőrtípus + bőrproblémák párhuzamosan)
    const analysisResult = await skinAnalysisService.analyzeSkin(tempFilePath);

    // Ideiglenes fájl törlése AZONNAL az elemzés után
    try {
      await fs.unlink(tempFilePath);
      console.log('Temp file deleted:', tempFilePath);
      tempFilePath = null;
    } catch (unlinkErr) {
      console.error('Failed to delete temp file:', unlinkErr);
    }

    if (!analysisResult.success) {
      return error(res, analysisResult.message, 400, analysisResult.error);
    }

    // Protokollok betöltése párhuzamosan
    const [skinProtocol, problemsProtocol] = await Promise.all([
      skinAnalysisService.getSkinProtocol(analysisResult.data.skinType),
      analysisResult.data.skinProblems?.detected?.length > 0
        ? skinAnalysisService.getSkinProblemsProtocol(analysisResult.data.skinProblems.detected)
        : Promise.resolve({ success: true, data: {} })
    ]);

    // Mentés/frissítés az adatbázisban
    try {
      const existingAnalysis = await SkinAnalysis.findOne({
        where: { account_id: accountId },
        order: [['created_at', 'DESC']]
      });

      // Bőrproblémák tömb összeállítása (csak a problem név kell)
      const detectedProblems = analysisResult.data.skinProblems?.detected?.map(p => p.problem) || [];

      const analysisData = {
        skin_type: analysisResult.data.skinType,
        skin_problems: detectedProblems,
        analysis_date: new Date()
      };

      if (existingAnalysis) {
        await existingAnalysis.update(analysisData);
        console.log(`Updated existing skin analysis for user ${accountId}:`, analysisData);
      } else {
        await SkinAnalysis.create({
          account_id: accountId,
          ...analysisData
        });
        console.log(`Created new skin analysis for user ${accountId}:`, analysisData);
      }
    } catch (dbError) {
      console.error('Failed to save skin analysis to database:', dbError);
    }

    return success(res, 'Skin analysis completed', {
      analysis: analysisResult.data,
      protocol: skinProtocol.success ? skinProtocol.data : null,
      problemsProtocol: problemsProtocol.success ? problemsProtocol.data : null
    });
  } catch (err) {
    // Hiba esetén is töröljük az ideiglenes fájlt
    if (tempFilePath) {
      try {
        const fs = require('fs').promises;
        await fs.unlink(tempFilePath);
        console.log('Temp file deleted after error:', tempFilePath);
      } catch (unlinkErr) {
        console.error('Failed to delete temp file after error:', unlinkErr);
      }
    }
    console.error('Skin analysis controller error:', err);
    return serverError(res, err);
  }
}

/**
 * Kép alapú chat - kamera módhoz
 * A frontend Base64 formátumban küldi a képet
 */
async function chatWithImage(req, res) {
  try {
    const { imageBase64, prompt, conversationHistory } = req.body;

    if (!imageBase64) {
      return error(res, 'IMAGE_REQUIRED', 400, 'IMAGE_REQUIRED');
    }

    if (!prompt) {
      return error(res, 'PROMPT_REQUIRED', 400, 'PROMPT_REQUIRED');
    }

    console.log('Image chat request received, prompt:', prompt);

    // Lekérjük a bejelentkezett user színtípusát az adatbázisból
    let userContext = null;
    const accountId = req.user?.id || req.user?.accountId;

    if (accountId) {
      try {
        const { ColorSeason } = dbModels;
        const userWithSeason = await User.findOne({
          where: { account_id: accountId },
          include: [{
            model: ColorSeason,
            as: 'colorSeason',
            attributes: ['season_name']
          }]
        });

        if (userWithSeason?.colorSeason?.season_name) {
          userContext = {
            colorSeason: userWithSeason.colorSeason.season_name
          };
          console.log('User color season from DB:', userContext.colorSeason);
        }
      } catch (dbErr) {
        console.warn('Could not fetch user color season:', dbErr.message);
      }
    }

    // Átadjuk a Gemininak a képet és a promptot
    const result = await geminiService.chatWithImage(
      imageBase64,
      prompt,
      conversationHistory || [],
      userContext
    );

    if (!result.success) {
      console.error('Image chat service failed:', result);
      return error(res, result.message, 400, result.error);
    }

    return success(res, 'Image analysis completed', result);
  } catch (err) {
    console.error('Image chat controller error:', err);
    return serverError(res, err);
  }
}

module.exports = {
  chatWithAI,
  chatWithAIGuest,
  analyzeColorType,
  analyzeSkin,
  chatWithImage
};
