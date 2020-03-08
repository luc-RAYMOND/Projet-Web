const express = require('express');
const route = express.Router();

// On importe le controller
const accueil = require('../controllers/accueilController');

// Les différentes routes hors connexion
route.get('/', accueil.accueil);
route.get('/Page/:numPage', accueil.accueilPage);

// On exporte nos routes
module.exports = route;