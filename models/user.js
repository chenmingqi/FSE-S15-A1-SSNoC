"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    share: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Message)
        User.hasMany(models.Announcement)
      }
    }
  });

  return User;
};
