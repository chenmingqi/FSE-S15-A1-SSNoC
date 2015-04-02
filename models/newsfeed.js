"use strict";

module.exports = function(sequelize, DataTypes) {
  var NewsFeed = sequelize.define("NewsFeed", {
    content: DataTypes.STRING,
    filename: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        NewsFeed.belongsTo(models.User);
      }
    }
  });

  return NewsFeed;
};
