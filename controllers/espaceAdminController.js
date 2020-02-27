// Les models d'où viennent les fonctions sur la BDD
var verifConnexion = require('../models/verifConnexion');
var utilisateur = require('../models/utilisateur');
var Catégorie = require('../models/categorie')
var affichage = require('../models/affichage');
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

// Permet d'accéder à la page de gestion des articles et catégories
exports.gestionArticlesCatégories = (request, response) => {
    var token = request.cookies.token;
    var cas = 10;
    if (request.cookies.gestionAC != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionAC.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionAC', request.cookies.gestionAC);
    verifConnexion.verifConnexion(token, (admin) => {
        Catégorie.avoirNomCatégories((catégories) => {
            if (admin == 1) {
                response.render('pages/admin/gestionArticlesCatégories', { catégories: catégories, cas: cas });
            }
            else {
                response.redirect('/Connexion');
            }
        });
    });
}

exports.ajoutCatégorie = (request, response) => {
    var token = request.cookies.token;
    // On récupère le libellé entré
    var libCat = request.body.libCat;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère le cas d'erreur ou de succès
            affichage.casAjoutCatégorie(libCat, (cas) => {
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                // On peut l'insérer dans la BDD
                if (cas == 2) {
                    Catégorie.ajouterCatégorie(libCat, (cb) => {
                    });
                }
                response.redirect('/EspaceAdmin/GestionArticlesCategories');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer une catégorie
exports.supprimerCatégorie = (request, response) => {
    var numCat = request.params.numCat;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            Catégorie.supprimerCatégorie(numCat, (cb) => {
                // On le supprime, et on indique qu'on l'a bien supprimé sur la page
                var cas = 3;
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                response.redirect('/EspaceAdmin/GestionArticlesCategories');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'accéder à la page de modification d'une catégorie
exports.modifierCatégoriePage = (request, response) => {
    var numCat = request.params.numCat;
    var token = request.cookies.token;
    var cas = 10;
    if (request.cookies.gestionAC != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionAC.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionAC', request.cookies.gestionAC);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On rend la page en remplissant le champ et en renvoyant le cas d'erreur s'il y en a
            Catégorie.avoirLibellé(numCat, (libCat) => {
                response.render('pages/admin/modifierCatégorie', { cas: cas, libCat: libCat, numCat: numCat });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de modifier la catégorie
exports.modifierCatégorie = (request, response) => {
    var numCat = request.params.numCat;
    var libCat = request.body.libCat;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On recupère le libellé de base, pour qu'on sache dans quel cas on est
            affichage.casModifCatégorie(numCat, libCat, (cas) => {
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                if (cas == 4) {
                    // Tout est bon, on modifie
                    Catégorie.modifierCatégorie(libCat, numCat, (cb) => {
                        response.redirect('/EspaceAdmin/GestionArticlesCategories');
                    });
                }
                // Sinon on renvoie l'erreur dans le cookie et on redirige
                else {
                    var link = '/EspaceAdmin/GestionArticlesCategories/' + numCat + '/ModifierCategorie';
                    response.redirect(link)
                }
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