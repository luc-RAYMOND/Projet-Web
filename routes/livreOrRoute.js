var express = require('express');
var route = express.Router();

// On importe le controller
var LO = require('../controllers/livreOrController');

// Les différentes routes du livre d'or
route.get('/', LO.livreOr);
route.get('/Page/:numPage', LO.livreOrPage);
route.post('/EnvoyerMessageLivreOr',LO.envoyerMessageLivreOr)

// On exporte nos routes
module.exports = route;