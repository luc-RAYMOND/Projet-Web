var express = require('express');
var route = express.Router();

// On importe le controller
var common = require('../controllers/commonController');

// Les différentes routes hors connexion
route.get('/Formations', common.formations);
route.get('/Qui-suis-je', common.contact);
route.get('/Connexion', common.connexion);
route.get('/Deconnexion', common.deconnexion);
route.post('/TentativeConnexion', common.tentativeConnexion);

// On exporte nos routes
module.exports = route;