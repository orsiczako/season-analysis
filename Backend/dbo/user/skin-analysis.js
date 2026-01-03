const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SkinAnalysis = sequelize.define('SkinAnalysis', {
    analysis_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Skin analysis identifier'
    },
    account_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Foreign key to account table',
      references: {
        model: 'account',
        key: 'account_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    skin_type: {
      type: DataTypes.ENUM('oily', 'dry', 'normal', 'combination'),
      allowNull: false,
      comment: 'Detected skin type'
    },
    skin_problems: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of detected skin problems (Acne, Bags, Milia, Redness, Scars, WhiteHead)'
    },
    analysis_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the analysis was performed'
    }
  }, {
    tableName: 'skin_analysis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return { SkinAnalysis };
};
