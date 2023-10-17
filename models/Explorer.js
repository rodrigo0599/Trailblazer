const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class Explorer extends Model {
  checkPassword(loginPw) {
    return bcrypt.compareSync(loginPw, this.password);
  }
}

Explorer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: { 
        isEmail:true
      }

    }
  },
  {
    hooks: {
      beforeCreate: async (newExplorerData) => {
        newExplorerData.password = await bcrypt.hash(newExplorerData.password, 10);
        return newExplorerData;
      },
      beforeUpdate: async (updatedExplorerData) => {
        updatedExplorerData.password = await bcrypt.hash(updatedExplorerData.password, 10);
        return updatedExplorerData;
      },
    },
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'explorer',
  }
);

module.exports = Explorer;
