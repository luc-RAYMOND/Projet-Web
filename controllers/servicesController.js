// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js')

// Permet de charger la page des services de peinture
exports.servicesPeinture = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/services/servicesPeintureHC', { contient: next });
    });
}

// Permet de charger la page des services de décors
exports.servicesDécors = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/services/servicesDécorsHC', { contient: next });
    });
}

// Permet de charger la page des services annexes
exports.servicesAnnexes = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/services/servicesAnnexesHC', { contient: next });
    });
}