var express = require('express');
var route = express.Router();

// On importe le controller
var EC = require('../controllers/espaceClientController');

// Les différentes routes du livre d'or
route.get('/', EC.espaceClient);
route.get('/:numUtilisateur/ModifierInfosPerso', EC.modifierInfosPersoPage);
route.post('/:numUtilisateur/ModifierInfosPerso', EC.modifierInfosPerso);

// On exporte nos routes
module.exports = route;