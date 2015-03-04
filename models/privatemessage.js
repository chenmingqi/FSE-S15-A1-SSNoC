"use strict";

module.exports = function(sequelize, DataTypes) {
  var PrivateMessage = sequelize.define("PrivateMessage", {
    content: DataTypes.STRING,
    sender: DataTypes.STRING,
    receiver: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        PrivateMessage.belongsTo(models.User);
      }
    }
  });

  return PrivateMessage;
};
