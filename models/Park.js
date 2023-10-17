const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Park extends Model {}

Park.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designation: {
      type: DataTypes.TEXT,
    },
    directions_url: {
      type: DataTypes.STRING,
    },
    image_url: {
      type: DataTypes.STRING,
    },
    image_altText: {
      type: DataTypes.STRING,
    }

    },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'park',
  }
);

module.exports = Park;
