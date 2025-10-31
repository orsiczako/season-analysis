const express = require('express');

// Factory routerek
const usersRouterFactory = require('./user');
const aiRouter = require('./ai');

// Factory függvény, ami fogadja a modelleket
module.exports = (models) => {
  const router = express.Router();
  
  router.use('/user', usersRouterFactory(models.User));
  router.use('/ai', aiRouter); // AI routes 

  return router;
};

