const express = require('express');
const apiRouterFactory = require('./api');

// Factory függvény, ami fogadja a modelleket, itt összegyűjtjük az összes route-ot, hogy ne kelljen az app.js-ben külön-külön importálni
module.exports = (models) => {
  const router = express.Router();
  
  router.use('/api', apiRouterFactory(models));

  
  return router;
};
