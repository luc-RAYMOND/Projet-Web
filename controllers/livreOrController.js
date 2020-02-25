// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage');
var verifConnexion = require('../models/verifConnexion');
var livreOr = require('../models/livreOr');
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');

// Permet d'afficher la page du livre d'or
exports.livreOr = (request, response) => {
    var cas = 10;
    var token = request.cookies.token;
    var pageActuelle = 1;
    affichage.remplirCatégorie(request, response, (next) => {
        // On récupère les avis
        livreOr.avoirAvisLO((avis) => {
            // On récupère les pseudos
            affichage.avoirPseudos(avis, (pseudos) => {
                var trimStart = (pageActuelle - 1) * 10;
                var trimEnd = trimStart + 10;
                // Une version coupée de nos tableaux, pour en afficher au maximum 10 par pages
                var slicedAvis = avis.slice(trimStart, trimEnd);
                var slicedPseudos = pseudos.slice(trimStart, trimEnd);
                var pageMax = Math.ceil(avis.length / 10);
                verifConnexion.verifConnexion(token, (admin) => {
                    response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, cas: cas });
                });
            })
        });
    });
}

// Permet d'afficher les autres pages du livre d'or
exports.livreOrPage = (request, response) => {
    var cas = 10;
    var token = request.cookies.token;
    var pageActuelle = request.params.numPage;
    affichage.remplirCatégorie(request, response, (next) => {
        // On récupère les avis
        livreOr.avoirAvisLO((avis) => {
            // On récupère les pseudos
            affichage.avoirPseudos(avis, (pseudos) => {
                var trimStart = (pageActuelle - 1) * 10;
                var trimEnd = trimStart + 10;
                // Une version coupée de nos tableaux, pour en afficher au maximum 10 par pages
                var slicedAvis = avis.slice(trimStart, trimEnd);
                var slicedPseudos = pseudos.slice(trimStart, trimEnd);
                var pageMax = Math.ceil(avis.length / 10);
                if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
                    verifConnexion.verifConnexion(token, (admin) => {
                        response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, cas: cas });
                    });
                }
                else {
                    // Si URL non valide
                    response.send("404 not found");
                }
            })
        });
    });
}

exports.envoyerMessageLivreOr = (request, response) => {
    var titre = request.body.titre;
    var texteAvis = request.body.avis;
    var token = request.cookies.token;
    var pageActuelle = 1;
    affichage.casLivreOr(titre, texteAvis, (cas) => {
        affichage.remplirCatégorie(request, response, (next) => {
            // On récupère les avis
            livreOr.avoirAvisLO((avis) => {
                // On récupère les pseudos
                affichage.avoirPseudos(avis, (pseudos) => {
                    var trimStart = (pageActuelle - 1) * 10;
                    var trimEnd = trimStart + 10;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 10 par pages
                    var slicedAvis = avis.slice(trimStart, trimEnd);
                    var slicedPseudos = pseudos.slice(trimStart, trimEnd);
                    var pageMax = Math.ceil(avis.length / 10);
                    verifConnexion.verifConnexion(token, (admin) => {
                        // On peut insérer dans la BDD et afficher que c'est bon
                        if (cas == 2) {
                            jwt.verify(token, key.key, (err, decoded) => {
                                livreOr.créationAvis(titre, texteAvis, decoded.NumUtilisateur, (cb) => {
                                    response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, cas: cas, titre: titre, texteAvis: texteAvis });
                                });
                            });
                        }
                        // Il y a un soucis, on le fait remarquer
                        else {
                            response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, cas: cas, titre: titre, texteAvis: texteAvis });
                        }
                    });
                })
            });
        });
    });
}