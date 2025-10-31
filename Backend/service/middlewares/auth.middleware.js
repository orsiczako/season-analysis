/**
 * Ellenőrzi a user tokenjét a kérésekhez
 */

const jwt = require('jsonwebtoken');
const ApiResponse = require('../helpers/api-response.helper');

const authenticateToken = (req, res, next) => {
  //az authorization headerben megy a jwt token
  const authHeader = req.headers['authorization'];

  //Kiszedi a tényleges részét
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return ApiResponse.error(res, 'auth.errors.token_required', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, decoded) => {
    if (err) {
      return ApiResponse.error(res, 'auth.errors.invalid_token', 403);
    }
    
    //mostmár hozzáférhetünk a user adataihoz a kérésekben
    req.user = decoded;
    //engedi, hogy a kérést, a kövi middleware vagy route handler kezelje
    next();
  });
};

module.exports = {
  authenticateToken
};