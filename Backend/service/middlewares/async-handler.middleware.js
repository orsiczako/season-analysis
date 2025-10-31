/**
 * Async error kezelő middleware, amennyiben mondjuk egy Promise el van
 * utasítva, akkor annak érdekében, hogy ne szarjon be az app, így ez az ilyen helyzeteket kezeli
 */

const ApiResponse = require('../helpers/api-response.helper');

/**
 * Ez egy Wrapper függvény, ami:
 * - Befogad egy aszinkron route kezelő függvényt
 * - Egy újat visszaad, amit ténylegesen lehet használni
 */
const asyncHandler = (fn) => {

  return (req, res, next) => {

    //Megkpja az én eredeti aszinkron függvényemet, ha hibát dob->catch, és megkapja az errort
    Promise.resolve(fn(req, res, next)).catch((error) => {

      console.error('Async error:', error);
      //Kultúrált formában küldjük ezt a hibát vissza, plusz ne kelljen mindig kézzel beírogatni a hibaüzeneteket
      return ApiResponse.serverError(res, error);
    });
  };
};

module.exports = asyncHandler;