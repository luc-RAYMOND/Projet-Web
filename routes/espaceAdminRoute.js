var express = require('express');
var route = express.Router();

// On importe le controller
var EA = require('../controllers/espaceAdminController');

// Les différentes routes du livre d'or
route.get('/', EA.espaceAdmin);
route.get('/GestionClients', EA.gestionClients);
route.get('/Statistiques', EA.statistiques);
route.get('/:numUtilisateur/SupprimerUtilisateur', EA.supprimerUtilisateur);
route.get('/:numUtilisateur/ValiderUtilisateur', EA.validerUtilisateur);

// On exporte nos routes
module.exports = route;