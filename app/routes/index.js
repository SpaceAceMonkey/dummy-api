const dummyApiRoutes = require('./dummy_api_routes');

module.exports = function(app, db) {
    dummyApiRoutes(app, db);
};