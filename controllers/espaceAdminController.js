// Les models d'où viennent les fonctions sur la BDD
var verifConnexion = require('../models/verifConnexion');
var utilisateur = require('../models/utilisateur');
var verifConnexion = require('../models/verifConnexion');

// Permet d'afficher la page principale de l'espace Admin
exports.espaceAdmin = (request, response) => {
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            response.render('pages/admin/espaceAdmin');
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'afficher la page de gestion des clients
exports.gestionClients = (request, response) => {
    var token = request.cookies.token;
    var cas = 10;
    // On regarde s'il y a des cookies pour la gestion des clients
    if (request.cookies.gestion != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestion.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestion', request.cookies.gestion);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On remplie le tableau des non validés
            utilisateur.avoirUtilisateurNV((utilisateursNV) => {
                // Puis celui des validés
                utilisateur.avoirUtilisateurV((utilisateursV) => {
                    // Et on rend tout avec le potetiel cas d'erreur / succès
                    response.render('pages/admin/gestionClients', { utilisateursNV: utilisateursNV, utilisateursV: utilisateursV, cas: cas });
                });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer un utilisateur
exports.supprimerUtilisateur = (request, response) => {
    var NumUtilisateur = request.params.numUtilisateur;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            utilisateur.supprimerUtilisateur(NumUtilisateur, (cb) => {
                // On le supprime, et on indique qu'on l'a bien supprimé sur la page
                var cas = 1;
                response.cookie('gestion', { cas: cas }, { expiresIn: '5s' });
                response.redirect('/EspaceAdmin/GestionClients');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de valider un compte utilisateur
exports.validerUtilisateur = (request, response) => {
    var NumUtilisateur = request.params.numUtilisateur;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            utilisateur.validerUtilisateur(NumUtilisateur, (cb) => {
                // On le valide, et on indique qu'on l'a bien validé sur la page
                var cas = 2;
                response.cookie('gestion', { cas: cas }, { expiresIn: '5s' });
                response.redirect('/EspaceAdmin/GestionClients');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'accéder à la page de gestion des devis
exports.gestionDevis = (request, response) => {
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            response.render('pages/admin/gestionDevis');
        }
        else {
            response.redirect('/Connexion');
        }
    });
}