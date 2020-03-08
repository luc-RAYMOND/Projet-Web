// Les models d'où viennent les fonctions sur la BDD
const affichage = require('../models/affichage.js')
const verifConnexion = require('../models/verifConnexion');

// Permet de charger la page des services de peinture
exports.servicesPeinture = (request, response) => {
    let token = request.cookies.token;
    affichage.remplirCatégorie((next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/services/servicesPeinture', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page des services de décors
exports.servicesDécors = (request, response) => {
    let token = request.cookies.token;
    affichage.remplirCatégorie((next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/services/servicesDécors', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page des services annexes
exports.servicesAnnexes = (request, response) => {
    let token = request.cookies.token;
    affichage.remplirCatégorie((next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/services/servicesAnnexes', { contient: next, admin: admin });
        });
    });
}