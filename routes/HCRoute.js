var express = require('express');
var route = express.Router();

// On importe le controller
var HC = require('../controllers/HCController');

// Les différentes routes hors connexion
route.get('/Formations', HC.formations);
route.get('/Qui-suis-je', HC.contact);

// On exporte nos routes
module.exports = route;