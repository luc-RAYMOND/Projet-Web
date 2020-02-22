var express = require('express');
var route = express.Router();

// On importe le controller
var HC = require('../controllers/HCController.js');
 
// Les différentes routes hors connexion
route.get('/Accueil',HC.accueil);
route.get('/Formations',HC.formations);
route.get('/Qui-suis-je',HC.contact);
route.get('/Services/ServicesPeinture',HC.servicesPeinture);
route.get('/Services/ServicesDecors',HC.servicesDécors);
route.get('/Services/ServicesAnnexes',HC.servicesAnnexes);

// On exporte nos routes
module.exports = route;