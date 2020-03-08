const express = require('express');
const route = express.Router();

// On importe le controller
const serv = require('../controllers/servicesController');

route.get('/ServicesPeinture', serv.servicesPeinture);
route.get('/ServicesDecors', serv.servicesDécors);
route.get('/ServicesAnnexes', serv.servicesAnnexes);

// On exporte nos routes
module.exports = route;