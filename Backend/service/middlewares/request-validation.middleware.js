/**
A kliens által küldött adatok érvényességét nézzük, ha hibás valami, hibát küldünk
 */

const ApiResponse = require('../helpers/api-response.helper');

/**
 * Hiányzó mezők ellenőrzése, ...fields -> kötelező mezők nevei
 */
const validateRequired = (...fields) => {
  return (req, res, next) => {
    //Bármi hiányzik, az a missing tömbbe kerül
    const missing = fields.filter(field => !req.body[field]);
    
   
    if (missing.length > 0) {
      console.log(`Missing fields: ${missing.join(', ')}`);
      //Ha van -> 400
      return ApiResponse.validationError(res);
    }
    
    next();
  };
};

/**
 * Az email template struktúráját validáljuk, bár ezt egyszer megcsináltam, 
 * rábólintottam, hogy jóvanazúgy és azóta se nyúltam hozzá
 */
const validateEmailTemplate = (req, res, next) => {
  //kinyeri a req.bodyból az emailtemplate objektumot
  const { emailTemplate } = req.body;
  
  //Ha nincs email, vagy nincs tárgy, vagy html tartalom
  if (!emailTemplate || !emailTemplate.subject || !emailTemplate.html) {
    console.log('Invalid email template');
    //Akkor gatya -> 400
    return ApiResponse.validationError(res, 'Email template is required');
  }
  
  //Ha minden oksa, akkor a kérés folytatódhat, mehet a kövire
  /**
   * Pl.: router.post(
   *  '/send-email',
   *  authenticateToken,          // Token ellenőrzés
   *  validateEmailTemplate,      // Email sablon ellenőrzés
   *  asyncHandler(sendEmail)     // A tényleges művelet
   *  );
   * És ilyen formában engedjük tovább a kérést, ha nem lenne egyértelmű
   */
  next(); // A next ezt csinálja
};

module.exports = {
  validateRequired,
  validateEmailTemplate
};