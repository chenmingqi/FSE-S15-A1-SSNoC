"use strict";

module.exports = function(sequelize, DataTypes) {
  var PrivateMessage = sequelize.define("PrivateMessage", {
    content: DataTypes.STRING,
    receiver: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        PrivateMessage.belongsTo(models.User);
      }
    }
  });

  return PrivateMessage;
};
