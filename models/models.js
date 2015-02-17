//Sequelize settings
var Sequelize = require('sequelize');
var sequelize = new Sequelize('fse.db', 'root', '', {
      dialect: "sqlite", // or 'sqlite', 'postgres', 'mariadb'
      port:    3306, // or 5432 (for postgres)
    })
 
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })

//define model
var User = sequelize.define('Passport_User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  status: Sequelize.STRING
})
User.sync();

//create an admin
var user = User.create({ username: "admin", password: "mingqi" });

module.exports = User;
