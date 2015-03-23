"use strict";

module.exports = function(sequelize, DataTypes) {
  var Announcement = sequelize.define("Announcement", {
    content: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Announcement.belongsTo(models.User);
      }
    }
  });

  return Announcement;
};
