const express = require('express');
const route = express.Router();

// On importe le controller
const gestionDevis = require('../controllers/gestionDevisController');

// Les différentes routes du livre d'or
route.get('/', gestionDevis.gestionDevis);
route.post('/', gestionDevis.ajoutDevis);
route.get('/:numDevis/ModifierDevis', gestionDevis.modifDevisPage);
route.get('/:numDevis/SupprimerDevis', gestionDevis.supprimerDevis);
route.get('/:numDevis/ConsulterFacture', gestionDevis.consulterFacture);
route.post('/:numDevis/ModifierDevis', gestionDevis.ajoutLigneCommande);
route.post('/:numDevis/AssocierUtilisateurDevis', gestionDevis.associerUtilisateurDevis);
route.post('/:numDevis/ModifierUtilisateurDevis', gestionDevis.modifierUtilisateurDevis);
route.post('/:numDevis/ModifierStatutDevis', gestionDevis.modifierStatutDevis);
route.get('/:numDevis/ModifierDevis/:numLC/SupprimerLC', gestionDevis.supprimerLigneCommandeDevis);



// On exporte nos routes
module.exports = route;