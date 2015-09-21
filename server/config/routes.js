var config = require('./config');

// Controllers
var viewController = require('../controllers/viewController');
//var userController = require('../controllers/userController');
//var containerController = require('../controllers/containerController');
//var ruleController = require('../controllers/ruleController');
//var devController = require('../controllers/devController');
//var productDefinitionController = require('../controllers/productDefinitionController');
//var locationDefinitionController = require('../controllers/locationDefinitionController');
//var optionsController = require('../controllers/optionsController');
//var carrierController = require('../controllers/carrierController');
//var searchController = require('../controllers/searchController');
//var loggingController = require('../controllers/loggingController');
//var crossDocksController = require('../controllers/crossDocksController');
//var skuController = require('../controllers/skuController');
//var loggerController = require('../controllers/loggerController');

// Policies
var isLoggedIn = require('../policies/isLoggedIn');
//var isEditor = require('../policies/isEditor');
//var isAdmin = require('../policies/isAdmin');

/*
 NOTE: Custom Sub Routes need to be defined first. Otherwise the :id
 route is chosen first.

 Example:
 app.get('/api/rule/optionValues', ruleController.optionValues);
 app.get('/api/rule/:id', isLoggedIn, ruleController.findOne);

 */
module.exports = function (app) {

	// Public
	app.get('/login', viewController.login);
	app.get('/logout', viewController.logout);
	//app.post('/api/user/login', userController.login);

	// Internal views
	app.get('/', isLoggedIn, viewController.index);

	// Containers (productGroup and locationGroup)
	//app.get('/api/container/:type', isLoggedIn, containerController.find);
	//app.get('/api/container/:type/:id', isLoggedIn, containerController.findOne);
	//app.put('/api/container/:type/validate', isLoggedIn, containerController.validate);
	//app.put('/api/container/:type/:id?', isLoggedIn, isEditor, containerController.save);
	//app.delete('/api/container/:type/:id', isLoggedIn, isAdmin, containerController.remove);
	//
	//// Rules
	//app.get('/api/rule/optionValues', isLoggedIn, ruleController.optionValues);
	//app.get('/api/rule/attribute', isLoggedIn, ruleController.attributes);
	//app.put('/api/rule/attribute/:type/:id?', isLoggedIn, isAdmin, ruleController.saveAttribute);
	//app.delete('/api/rule/attribute/:type/:id', isLoggedIn, isAdmin, ruleController.removeAttribute);
	//app.get('/api/rule/attribute/:type/:id', isLoggedIn, isAdmin, ruleController.getAttribute);
	//app.get('/api/rule', isLoggedIn, ruleController.find);
	//app.get('/api/rule/:id', isLoggedIn, ruleController.findOne);
	//app.put('/api/rule/validate', isLoggedIn, ruleController.validate);
	//app.put('/api/rule/:id?', isLoggedIn, isEditor, ruleController.save);
	//app.delete('/api/rule/:id', isLoggedIn, isAdmin, ruleController.remove);
	//
	//// Api Key - Skip auth check for integration testing
	//if (config.environment == 'integration-testing') {
	//	app.put('/api/user/newApiKey/:username', userController.newApiKey);
	//}
	//else {
	//	app.put('/api/user/newApiKey', isLoggedIn, userController.newApiKey);
	//}
	//app.delete('/api/user/removeApiKey/:id', isLoggedIn, userController.removeApiKey);
	//
	//// Users
	//app.get('/api/user', isLoggedIn, userController.find);
	//app.get('/api/user/:id', isLoggedIn, userController.findOne);
	//// TODO make all of these under isAdmin (didn't do it now so we can dev easier)
	//app.put('/api/user/:id?', isLoggedIn, userController.save);
	//app.delete('/api/user/:id', isLoggedIn, isAdmin, userController.remove);
	//
	//// Lookups
	//app.get('/api/productDefinition', isLoggedIn, productDefinitionController.lookup);
	//app.get('/api/locationDefinition', isLoggedIn, locationDefinitionController.lookup);
	//app.get('/api/option/:type', isLoggedIn, optionsController.lookup);
	//app.get('/api/sku/:id', isLoggedIn, skuController.getSku);
	//
	//// Search
	//app.get('/api/search/results', isLoggedIn, searchController.search);
	//
	//// version
	//app.get('/api/version', viewController.version);
	//
	//// logging
	//app.put('/api/clientLogging', isLoggedIn, loggingController.clientLogging);
	//app.get('/api/loggers', isAdmin, loggerController.getLoggers);
	////in the interest of making this easy to do for dev lets violate some REST paradigms:
	//app.get('/api/loggers/:logger/:level', isAdmin, loggerController.setLoggerLevel);
	//
	//// carrier
	//app.post('/api/carrier', carrierController.getRoute);
	//app.post('/api/carrierruletest/:ruleid', carrierController.getRouteForRuleTest);
	//
	//// dev
	//app.post('/api/_dev/sendInvalidRulesEmail', devController.sendInvalidRulesEmail);
	//
	//if(config.allowDevRoutes){
	//	app.get('/api/_dev/autovalidate', devController.autoValidate);
	//	app.get('/api/crossdocks/validateStoreToDestination', crossDocksController.validateStoreToDestination);
	//	app.get('/api/crossdocks/checkAllLocationRoutes', crossDocksController.checkAllLocationRoutes);
	//
	//	/* POST body for sendInvalidRulesEmail
	//
	//	 [
	//	 {"name": "rule1",
	//	 "description": "mah description",
	//	 "productGroup": {"name": "prod group"},
	//	 "locationGroup": {"name": "loc group"},
	//	 "destination": {"label": "the dest"},
	//	 "carrier": {"value": "carrier value"},
	//	 "status": "BLAH"
	//	 }]
	//
	//	 */
	//}
};