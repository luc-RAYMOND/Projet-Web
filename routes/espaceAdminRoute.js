const express = require('express');
const route = express.Router();

// On importe le controller
const EA = require('../controllers/espaceAdminController');

// Les différentes routes du livre d'or
route.get('/', EA.espaceAdmin);
route.get('/GestionClients', EA.gestionClients);
route.get('/Statistiques', EA.statistiques);
route.get('/:numUtilisateur/SupprimerUtilisateur', EA.supprimerUtilisateur);
route.get('/:numUtilisateur/ValiderUtilisateur', EA.validerUtilisateur);
route.get('/:numUtilisateur/ModifierInfosPerso', EA.modifierInfosPersoPage);
route.post('/:numUtilisateur/ModifierInfosPerso', EA.modifierInfosPerso);

// On exporte nos routes
module.exports = route;