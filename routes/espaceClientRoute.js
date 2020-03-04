var express = require('express');
var route = express.Router();

// On importe le controller
var EC = require('../controllers/espaceClientController');

// Les différentes routes du livre d'or
route.get('/', EC.espaceClient);
route.get('/:numUtilisateur/ModifierInfosPerso', EC.modifierInfosPersoPage);
route.get('/:numUtilisateur/VoirDevis', EC.voirDevis);
route.post('/:numUtilisateur/ModifierInfosPerso', EC.modifierInfosPerso);
route.get('/:numUtilisateur/VoirDevis/:numDevis/ConsulterFacture', EC.consulterDevisFacture);
route.get('/:numUtilisateur/VoirDevis/:numDevis/ConsulterDevis', EC.consulterDevisFacture);

// On exporte nos routes
module.exports = route;