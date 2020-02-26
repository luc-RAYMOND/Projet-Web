// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage');
var verifConnexion = require('../models/verifConnexion');
var livreOr = require('../models/livreOr');
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');

// Permet d'afficher la page du livre d'or
exports.livreOr = (request, response) => {
    var cas = 10;
    var titre;
    var texteAvis;
    // On regarde s'il y a des cookies pour le livre d'or
    if (request.cookies.livreOr != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.livreOr.cas;
        titre = request.cookies.livreOr.titre;
        texteAvis = request.cookies.livreOr.texteAvis
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('livreOr');
    var NumUtilisateur;
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
                    jwt.verify(token, key.key, (err, decoded) => {
                        // On est hors ligne ou le token a expiré
                        if (decoded == undefined) {
                            NumUtilisateur = -1;
                        }
                        // On récupère le bon numéro
                        else {
                            NumUtilisateur = decoded.NumUtilisateur;
                        }
                        response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, NumUtilisateur: NumUtilisateur, titre: titre, texteAvis: texteAvis, cas: cas });
                    });
                });
            })
        });
    });
}

// Permet d'afficher les autres pages du livre d'or
exports.livreOrPage = (request, response) => {
    var token = request.cookies.token;
    var pageActuelle = request.params.numPage;
    var NumUtilisateur;
    var cas = 10;
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
                        jwt.verify(token, key.key, (err, decoded) => {
                            // On est hors ligne ou le token a expiré
                            if (decoded == undefined) {
                                NumUtilisateur = -1;
                            }
                            // On récupère le bon numéro
                            else {
                                NumUtilisateur = decoded.NumUtilisateur;
                            }
                            response.render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, NumUtilisateur: NumUtilisateur, cas: cas });
                        });
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

// Permet d'envoyer un message
exports.envoyerMessageLivreOr = (request, response) => {
    var titre = request.body.titre;
    var texteAvis = request.body.avis;
    var token = request.cookies.token;
    var NumUtilisateur;
    var pageActuelle = 1;
    affichage.casLivreOr(titre, texteAvis, (cas) => {
        jwt.verify(token, key.key, (err, decoded) => {
            // On crée un cookie qui dure 1s, afin que le retour au livre d'or traite le bon cas
            response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
            // On peut insérer dans la BDD et afficher que c'est bon
            if (cas == 2) {
                // Si le token expire entre temps
                if (decoded == undefined) {
                    response.redirect('/Connexion');
                }
                // Sinon on crée le message
                else {
                    livreOr.créationAvis(titre, texteAvis, decoded.NumUtilisateur, (cb) => {
                        // Et on retourne sur le livre d'or
                        response.redirect('/LivreOr');
                    });
                }
            }
            // Il y a un soucis, on le fait remarquer sur la page principale
            else {
                response.redirect('/LivreOr');
            }
        });
    });
}

//Permet de supprimer un message
exports.supprimerMessage = (request, response) => {
    var numLO = request.params.numLO;
    var token = request.cookies.token;
    var titre;
    var texteAvis;
    var cas = 10;
    var NumUtilisateur;
    verifConnexion.verifConnexion(token, (admin) => {
        // On crée un cookie qui dure 1s, afin que le retour au livre d'or traite le bon cas
        response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
        // On est bien connecté
        if (admin == 1 || admin == 0) {
            // S'il est admin, il peut supprimer directement le message
            if (admin == 1) {
                livreOr.supprimerAvis(numLO, (cb) => {
                    cas = 3;
                    response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
                    response.redirect('/LivreOr');
                });
            }
            else {
                // On récupère l'utilisateur qui a créé le message
                livreOr.utilisateurAvis(numLO, (utilisateur) => {
                    jwt.verify(token, key.key, (err, decoded) => {
                        // On vérifie que c'est bien le bon utilisateur qui veut supprimer
                        affichage.casSupprLivreOr(utilisateur, decoded, (cas) => {
                            response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
                            if (cas == 3) {
                                var NumUtilisateur = utilisateur[0].NumUtilisateur;
                                // Tout est bon, on supprime
                                livreOr.supprimerAvis(numLO, (cb) => {
                                    response.redirect('/LivreOr');
                                });
                            }
                            else {
                                cas == 4
                                // Mauvais utilisateur, on envoie une erreur
                                response.redirect('/LivreOr');
                            }
                        });
                    });
                });
            }
        }
        // Pas connecté, on est redirigé sur le livre d'or
        else {
            response.redirect('/LivreOr');
        }
    });
}