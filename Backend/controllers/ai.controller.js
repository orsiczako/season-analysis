/**
 * Itt kezeljük a Gemini AI-vel való kommunikációt és a bejövő kéréseket
 */

const geminiService = require('../service/ai/gemini.service');
const dbModels = require('../dbo');
const { success, error, serverError } = require('../service/helpers/api-response.helper');
const { User } = dbModels;

/**
 *A frontend egy POST kérést küld, amiben van egy message mező és egy conversationHistory mező
 Ez az üzenet a felhasználó aktuális üzenete
 */
async function chatWithAI(req, res) {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return error(res, 'Message is required', 400, 'MESSAGE_REQUIRED');
    }
    
    console.log('Message received:');
    
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
      return error(res, 'Conversation history is required', 400, 'CONVERSATION_HISTORY_REQUIRED');
    }
    
    if (!accountId) {
      return error(res, 'Account ID is required', 400, 'ACCOUNT_ID_REQUIRED');
    }
    
    //Ha minden rendben volt, akkor átadjuk a Gemininak az előzményeket elemzésre
    const result = await geminiService.analyzeColorType(conversationHistory);
    
    if (!result.success) {
      return serverError(res, new Error(result.message || 'Color analysis failed'));
    }
    
    // Ha sikeres az elemzés, frissítjük a felhasználó adatbázisában a színtípust
    try {
      const { ColorSeason } = dbModels;
      
      console.log('🔍 Searching for season:', result.analysis.season);
      
      // Megkeressük a season_id-t a season név alapján (spring/summer/autumn/winter)
      const seasonRecord = await ColorSeason.findOne({
        where: { season_name: result.analysis.season }
      });
      
      console.log('🔍 Season record found?', !!seasonRecord, seasonRecord ? `ID: ${seasonRecord.season_id}` : 'NULL');
      
      if (seasonRecord) {
        console.log('🔍 Updating user', accountId, 'with season_id:', seasonRecord.season_id);
        
        const [affectedRows] = await User.update(
          {
            color_season_id: seasonRecord.season_id,
            color_analysis_date: new Date()
          },
          {
            where: { account_id: accountId }
          }
        );
        
        console.log('✅ User', accountId, 'color season updated to:', result.analysis.season, '- Affected rows:', affectedRows);
      } else {
        console.warn('⚠️  Season', result.analysis.season, 'not found in color_seasons table');
      }
    } catch (dbError) {
      console.error('❌ Failed to update user color season:', dbError);
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

module.exports = {
  chatWithAI,
  analyzeColorType
};
