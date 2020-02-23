// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js')

// Permet de charger la page formations
exports.formations = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/formationsHC', { contient: next });
    });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/quiSuisJeHC', { contient: next });
    });
}