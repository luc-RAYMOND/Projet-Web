const express = require('express');
const route = express.Router();

// On importe le controller
const catégories = require('../controllers/catégoriesController');

// Les différentes routes hors connexion
route.get('/:numcategorie/Page/:numPage', catégories.catégoriesPage);

// On exporte nos routes
module.exports = route;