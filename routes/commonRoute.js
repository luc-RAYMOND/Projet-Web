var express = require('express');
var route = express.Router();

// On importe le controller
var common = require('../controllers/commonController');

// Les différentes routes hors connexion
route.get('', (request, response) => {response.redirect('/Accueil')})
route.get('/Formations', common.formations);
route.get('/Qui-suis-je', common.contact);
route.get('/Connexion', common.connexion);
route.get('/Deconnexion', common.deconnexion);
route.get('/InscriptionClientAtelierAlegolas91', common.inscription);
route.post('/InscriptionClientAtelierAlegolas91', common.tentativeInscription);
route.post('/Connexion', common.tentativeConnexion);

// On exporte nos routes
module.exports = route;