const { DataTypes } = require('sequelize');
// A DataType a Sequelize adattípusokat tartalmazza (String, Integer stb)

module.exports = (sequelize) => {
  //Object Relational Mapping model létrehozása 
  const User = sequelize.define('User', {
    account_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true, //Elsődleges kulcs
      autoIncrement: true, //Folyton növekszik
      allowNull: false,
      comment: 'Account identifier'
    },
    login_name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Name used for login'
    },
    login_password_hash: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Hash for the account password'
    },
    password_recovery_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'The recovery code can not be used beyond this date'
    },
    password_recovery_hash: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'The hash of the last sent recovery code'
    },
    email_address: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'User email address'
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Full name for the user'
    },
    color_season_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Foreign key to color_seasons table',
      references: {
        model: 'color_seasons',
        key: 'season_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    color_analysis_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the color analysis was completed'
    },
  }, {
    tableName: 'account',
    timestamps: true, //Automatikusan kezeli a createdAt és updatedAt mezőket, hozzáadódnak
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return { User };
};
