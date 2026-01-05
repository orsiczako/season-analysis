require('dotenv').config();
const { Sequelize } = require('sequelize');

// DB kapcsolat létrehozása

/*
Btw kis megjegyzés miért éppen sequelize-t használok:
-Adatb-ben lévő táblákat objektumként kezeli, nem kell így SQL-t írni
-Adatbázis független(Postgres, mysql)
-Beépített függvényeket használok, ami tök jó SQL injection ellen, és amúgy tök érdekes
a Sequelize nem úgy épít SQL-t, hogy mondjuk WHERE email ' " + userinput + " ' ', hanem SELECT ... WHERE email = ? + a userinput
szóval nem változtat a lekérdezésen, na de anyways
*/

//Sequalize példány, ami majd csacsog az adatbázissal
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',

  }
);

// Modellek importálása 
const UserModels = require('./user/index.js')(sequelize);
const ColorSeason = require('./color-analysis/index')(sequelize);
const SkinAnalysisModels = require('./user/skin-analysis')(sequelize);

// Asszociációk (kapcsolatok) definiálása
const { User } = UserModels;
const { SkinAnalysis } = SkinAnalysisModels;

// User → ColorSeason (N:1)
User.belongsTo(ColorSeason, {
  foreignKey: 'color_season_id',
  as: 'colorSeason'
});

ColorSeason.hasMany(User, {
  foreignKey: 'color_season_id',
  as: 'users'
});

// User → SkinAnalysis (1:N)
User.hasMany(SkinAnalysis, {
  foreignKey: 'account_id',
  as: 'skinAnalyses',
  onDelete: 'CASCADE'
});

SkinAnalysis.belongsTo(User, {
  foreignKey: 'account_id',
  as: 'user'
});

//Ezeket kapjuk ha require
module.exports = {
  sequelize,
  ...UserModels,
  ColorSeason,
  SkinAnalysis
};
