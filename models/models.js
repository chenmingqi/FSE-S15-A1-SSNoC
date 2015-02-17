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

sequelize
  .sync({ force: true })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err)
     } else {
       console.log('It worked!')
     }
  })
  
//create an admin
var user = User.create({ username: "admin", password: "mingqi", status: "on" });

module.exports = User;
