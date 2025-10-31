/**
 * Frontend router
 *
 * itt kezeljük a frontendhez tartozó statikus fájlokat és az SPA route-okat
 */

const path = require('path');
const express = require('express');
const router = express.Router();

const frontendHome = path.resolve(__dirname, '../Frontend'); 
const indexFile = path.join(frontendHome, 'index.html'); // SPA entry point

// SPA routes - ezeket a frontend router kezeli
const spaRoutes = ['/dashboard*', '/login', '/register', '/profile*', '/color-analysis*'];

router.get(spaRoutes, (req, res, next) => {
  res.sendFile(indexFile, (err) => {
    if (err) next(err);
  });
});


router.use(express.static(frontendHome));

module.exports = router;
