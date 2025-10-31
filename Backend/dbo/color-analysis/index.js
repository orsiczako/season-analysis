const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ColorSeason = sequelize.define('ColorSeason', {
    season_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Season identifier'
    },
    season_name: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      comment: 'Season name in English (spring, summer, autumn, winter)'
    },
    season_display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Localized display name for the season'
    }
  }, {
    tableName: 'color_seasons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ColorSeason;
};