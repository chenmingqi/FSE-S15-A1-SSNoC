"use strict";

module.exports = function(sequelize, DataTypes) {
  var PostComment = sequelize.define("PostComment", {
    content: DataTypes.STRING,
    username: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        PostComment.belongsTo(models.NewsFeed);
      }
    }
  });

  return PostComment;
};
