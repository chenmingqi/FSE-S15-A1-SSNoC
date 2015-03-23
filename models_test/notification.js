"use strict";

module.exports = function(sequelize, DataTypes) {
  var Notification = sequelize.define("Notification", {
    type: DataTypes.STRING,
    sender: DataTypes.STRING,
    receiver: DataTypes.STRING
  }, {
    classMethods: {
    }
  });
  return Notification;
};
