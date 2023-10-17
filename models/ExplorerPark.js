const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

// create our Trip model
class ExplorerPark extends Model {}

// create fields/columns for Trip model
ExplorerPark.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date_added: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
    is_favorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    has_visited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    wants_to_visit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
  },
    explorer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'explorer',
        key: 'id',
        unique: false
      }
    },
    park_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'park',
        key: 'id',
        unique: false
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'explorer_park'
  }
);

module.exports = ExplorerPark;
