var express = require('express');
var route = express.Router();

// On importe le controller
var common = require('../controllers/livreOrController');

// Les différentes routes du livre d'or
route.get('/', common.livreOr);
route.get('/Page/:numPage', common.livreOrPage);

// On exporte nos routes
module.exports = route;