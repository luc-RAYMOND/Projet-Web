var express = require('express');
var route = express.Router();

// On importe le controller
var EA = require('../controllers/espaceAdminController');

// Les différentes routes du livre d'or
route.get('/', EA.espaceAdmin);
route.get('/GestionClients', EA.gestionClients);
route.get('/GestionArticlesCategories', EA.gestionArticlesCatégories);
route.post('/GestionArticlesCategories1', EA.ajoutCatégorie);
route.get('/GestionArticlesCategories/:numCat/SupprimerCategorie', EA.supprimerCatégorie);
route.get('/GestionArticlesCategories/:numCat/ModifierCategorie', EA.modifierCatégoriePage);
route.post('/GestionArticlesCategories/:numCat/ModifierCategorie', EA.modifierCatégorie);
route.get('/GestionDevis', EA.gestionDevis);
route.get('/:numUtilisateur/SupprimerUtilisateur', EA.supprimerUtilisateur);
route.get('/:numUtilisateur/ValiderUtilisateur', EA.validerUtilisateur);

// On exporte nos routes
module.exports = route;