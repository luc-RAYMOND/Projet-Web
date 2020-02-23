var express = require('express');
var route = express.Router();

// On importe le controller
var catégories = require('../controllers/catégoriesController');

// Les différentes routes hors connexion
route.get('/:numcategorie/Page/:numPage', catégories.catégoriesPage);

// On exporte nos routes
module.exports = route;