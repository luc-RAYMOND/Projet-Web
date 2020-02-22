var express = require('express');
var route = express.Router();

// On importe le controller
var HC = require('../controllers/HCController.js');
 
// Les différentes routes hors connexion
route.get('/Accueil',HC.accueil);

// On exporte nos routes
module.exports = route;