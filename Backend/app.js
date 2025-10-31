require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const dbModels = require('./dbo');
const { sequelize } = dbModels;

// Main router használata - átadjuk az összes modellt
const mainRouterFactory = require('./routers');
const mainRouter = mainRouterFactory(dbModels);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, '../Frontend')));

// Router csatolása
app.use('/', mainRouter);

// Általános error handler
app.use((err, req, res, next) => {
  console.error('Szerver hiba:');
  console.error('URL:', req.method, req.url);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (!res.headersSent) {
    res.status(500).json({ 
      message: 'Szerverhiba. Próbáld újra később.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:');
  console.error(err);
  // Ne lépjünk ki, csak logoljuk
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);

  // Ne lépjünk ki, csak logoljuk
});

// Adatbázis szinkronizálás indításkor
(async () => {
  try {
    console.log('Adatbázis kapcsolódás...');
    await sequelize.authenticate();
    console.log('Adatbázis csatlakoztatva.');
    
    // Szinkronizáljuk a modelleket
    await sequelize.sync();
    console.log('Adatbázis szinkronizálva.');
    
    // Ellenőrizzük hogy van-e season adat az adatbázisban
    const seasonCount = await dbModels.ColorSeason.count();
    
    if (seasonCount === 0) {
      console.log('ColorSeason tábla üres - fel kell tölteni manuálisan vagy seed-scripttel!');
    } else {
      console.log(`Adatbázis feltöltve: ${seasonCount} évszak`);
    }
    
    console.log('Adatbázis kész.');
  } catch (err) {
    console.error('Adatbázis hiba:', err);
    console.error('A szerver továbbra is fut, de az adatbázis nem érhető el.');
  }
})();

// Szerver indítása
app.listen(PORT, () => {
  console.log(`HTTP szerver fut: http://localhost:${PORT}`);
});
