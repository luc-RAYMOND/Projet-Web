var express = require('express');
var route = express.Router();

// On importe le controller
var serv = require('../controllers/servicesController');

route.get('/ServicesPeinture', serv.servicesPeinture);
route.get('/ServicesDecors', serv.servicesDécors);
route.get('/ServicesAnnexes', serv.servicesAnnexes);

// On exporte nos routes
module.exports = route;