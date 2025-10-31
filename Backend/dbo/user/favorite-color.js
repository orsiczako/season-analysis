const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FavoriteColor = sequelize.define('FavoriteColor', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Favorite color record id'
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Reference to account.account_id',
      references: {
        model: 'account',
        key: 'account_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: 'Hex color code in format #RRGGBB'
    }
  }, {
    tableName: 'favorite_colors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return FavoriteColor;
};
