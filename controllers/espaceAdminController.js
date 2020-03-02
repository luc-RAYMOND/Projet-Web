// Les models d'où viennent les fonctions sur la BDD
var verifConnexion = require('../models/verifConnexion');
var utilisateur = require('../models/utilisateur');
var statistiques = require('../models/statistiques');
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

// Fonction permettant d'afficher la page des statistiques
exports.statistiques = (request, response) => {
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère les stats des 7 derniers jours
            statistiques.avoirStats((stats) => {
                // Des 7 derniers mois
                statistiques.avoirStatsDesMois((avoirStatsDesMois) => {
                    var vuesMois = [avoirStatsDesMois[6].NombreVisitesStats, avoirStatsDesMois[5].NombreVisitesStats, avoirStatsDesMois[4].NombreVisitesStats, avoirStatsDesMois[3].NombreVisitesStats, avoirStatsDesMois[2].NombreVisitesStats, avoirStatsDesMois[1].NombreVisitesStats, avoirStatsDesMois[0].NombreVisitesStats];
                    var Mois = [avoirStatsDesMois[0].Mois, avoirStatsDesMois[1].Mois, avoirStatsDesMois[2].Mois, avoirStatsDesMois[3].Mois, avoirStatsDesMois[4].Mois, avoirStatsDesMois[5].Mois, avoirStatsDesMois[6].Mois];
                    var CAMois = [avoirStatsDesMois[6].CAMois, avoirStatsDesMois[5].CAMois, avoirStatsDesMois[4].CAMois, avoirStatsDesMois[3].CAMois, avoirStatsDesMois[2].CAMois, avoirStatsDesMois[1].CAMois, avoirStatsDesMois[0].CAMois];
                    var vues = [stats[0].NombreVisitesStats, stats[1].NombreVisitesStats, stats[2].NombreVisitesStats, stats[3].NombreVisitesStats, stats[4].NombreVisitesStats, stats[5].NombreVisitesStats, stats[6].NombreVisitesStats];
                    var jours = [stats[0].Jour, stats[1].Jour, stats[2].Jour, stats[3].Jour, stats[4].Jour, stats[5].Jour, stats[6].Jour];
                    response.render('pages/admin/statistiques', { vues: vues, jours: jours, vuesMois: vuesMois, Mois: Mois, CAMois: CAMois });
                });

            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}