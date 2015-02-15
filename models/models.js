var orm = require("orm");

orm.connect("sqlite://FSEProject.db", function(err, db){
        // db is now available to use! ^__^
    var Person = db.define('person', {
        name: String
    });
});