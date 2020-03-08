// Les models d'où viennent les fonctions sur la BDD
const affichage = require('../models/affichage');
const casErreur = require('../models/casErreur');
const verifConnexion = require('../models/verifConnexion');
const livreOr = require('../models/livreOr');
const jwt = require('jsonwebtoken');
const key = require('../config/tokenKey');

// Permet d'afficher la page du livre d'or
exports.livreOr = (request, response) => {
    let cas = 10;
    let titre;
    let texteAvis;
    var status = 200;
    // On regarde s'il y a des cookies pour le livre d'or
    if (request.cookies.livreOr != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.livreOr.cas;
        titre = request.cookies.livreOr.titre;
        texteAvis = request.cookies.livreOr.texteAvis
    }
    if (request.cookies.access != undefined) {
        cas = 4;
    }
    // On regarde s'il a essayé de modifier un message n'étant pas le sien
    if (cas == 4) {
        status = 403;
    }
    // Puis on les supprime
    response.clearCookie('livreOr', request.cookies.livreOr);
    response.clearCookie('access', request.cookies.access);
    let NumUtilisateur;
    let token = request.cookies.token;
    let pageActuelle = 1;
    affichage.remplirCatégorie((next) => {
        // On récupère les avis
        livreOr.avoirAvisLO((avis) => {
            // On récupère les pseudos
            affichage.avoirPseudos(avis, (pseudos) => {
                let trimStart = (pageActuelle - 1) * 10;
                let trimEnd = trimStart + 10;
                // Une version coupée de nos tableaux, pour en afficher au maximum 10 par pages
                let slicedAvis = avis.slice(trimStart, trimEnd);
                let slicedPseudos = pseudos.slice(trimStart, trimEnd);
                let pageMax = Math.ceil(avis.length / 10);
                verifConnexion.verifConnexion(token, (admin) => {
                    jwt.verify(token, key.key, (err, decoded) => {
                        // On est hors ligne ou le token a expiré
                        if (err) {
                            NumUtilisateur = -1;
                        }
                        // On récupère le bon numéro
                        else {
                            NumUtilisateur = decoded.NumUtilisateur;
                        }
                        response.status(status).render('pages/common/livreOr', { contient: next, admin: admin, avis: slicedAvis, pseudos: slicedPseudos, pageActuelle: pageActuelle, pageMax: pageMax, NumUtilisateur: NumUtilisateur, titre: titre, texteAvis: texteAvis, cas: cas });
                    });
                });
            })
        });
    });
}

// Permet d'afficher les autres pages du livre d'or
exports.livreOrPage = (request, response) => {
    let token = request.cookies.token;
    let pageActuelle = request.params.numPage;
    let NumUtilisateur;
    let cas = 10;
    affichage.remplirCatégorie((next) => {
        // On récupère les avis
        livreOr.avoirAvisLO((avis) => {
            // On récupère les pseudos
            affichage.avoirPseudos(avis, (pseudos) => {
                let trimStart = (pageActuelle - 1) * 10;
                let trimEnd = trimStart + 10;
                // Une version coupée de nos tableaux, pour en afficher au maximum 10 par pages
                let slicedAvis = avis.slice(trimStart, trimEnd);
                let slicedPseudos = pseudos.slice(trimStart, trimEnd);
                let pageMax = Math.ceil(avis.length / 10);
                if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
                    verifConnexion.verifConnexion(token, (admin) => {
                        jwt.verify(token, key.key, (err, decoded) => {
                            // On est hors ligne ou le token a expiré
                            if (err) {
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
                    response.status(404).render('pages/common/404notfound');
                }
            })
        });
    });
}

// Permet d'envoyer un message
exports.envoyerMessageLivreOr = (request, response) => {
    let titre = request.body.titre;
    let texteAvis = request.body.avis;
    let token = request.cookies.token;
    casErreur.casLivreOr(titre, texteAvis, (cas) => {
        jwt.verify(token, key.key, (err, decoded) => {
            // On crée un cookie qui dure 1s, afin que le retour au livre d'or traite le bon cas
            response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
            // On peut insérer dans la BDD et afficher que c'est bon
            if (cas == 2) {
                // Si le token expire entre temps
                if (err) {
                    response.cookie('access', { err: true }, { expiresIn: '5s' });
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
    let numLO = request.params.numLO;
    let token = request.cookies.token;
    let titre;
    let texteAvis;
    let cas = 10;
    verifConnexion.verifConnexion(token, (admin) => {
        // On crée un cookie qui dure 5s, afin que le retour au livre d'or traite le bon cas
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
                        if (err) {
                            response.cookie('access', { err: true }, { expiresIn: '5s' });
                            response.redirect('/Connexion');
                        }
                        else {
                            // On vérifie que c'est bien le bon utilisateur qui veut supprimer
                            casErreur.casSupprLivreOr(utilisateur, decoded, (cas) => {
                                response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
                                if (cas == 3) {
                                    // Tout est bon, on supprime
                                    livreOr.supprimerAvis(numLO, (cb) => {
                                        response.redirect('/LivreOr');
                                    });
                                }
                                else {
                                    // Mauvais utilisateur, on envoie une erreur
                                    response.redirect('/LivreOr');
                                }
                            });
                        }
                    });
                });
            }
        }
        // Pas connecté, on est redirigé sur le livre d'or
        else {
            response.cookie('access', { err: true }, { expiresIn: '5s' });
            response.redirect('/Connexion');
        }
    });
}

// Permet d'afficher la page permettant de modifier un message posté
exports.modifierMessagePage = (request, response) => {
    let numLO = request.params.numLO;
    let token = request.cookies.token;
    let cas = 10;
    // On regarde s'il y a des cookies pour le livre d'or
    if (request.cookies.livreOr != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.livreOr.cas;
        titre = request.cookies.livreOr.titre;
        texteAvis = request.cookies.livreOr.texteAvis
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('livreOr', request.cookies.livreOr);
    let titre;
    let texteAvis;
    let NumUtilisateur;
    // On vérifie d'abord qu'on est bien toujours connecté
    verifConnexion.verifConnexion(token, (admin) => {
        affichage.remplirCatégorie((next) => {
            // On vérifie que c'est bien un client qui veut modifier son message
            if (admin != 0) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/LivreOr');
            }
            else {
                // On récupère l'utilisateur qui a créé le message
                livreOr.utilisateurAvis(numLO, (utilisateur) => {
                    // S'il n'y en a pas, le message n'existe pas
                    if (utilisateur[0] == undefined) {
                        // Message non existant
                        cas = 4;
                        response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
                        response.redirect('/LivreOr');
                    }
                    else {
                        NumUtilisateur = utilisateur[0].NumUtilisateur;
                        // On vérifie que c'est le bon utilisateur qui veut modifier son message
                        jwt.verify(token, key.key, (err, decoded) => {
                            if (err) {
                                response.cookie('access', { err: true }, { expiresIn: '5s' });
                                response.redirect('/Connexion');
                            }
                            else {
                                if (NumUtilisateur == decoded.NumUtilisateur) {
                                    livreOr.avoirLO(numLO, (avis) => {
                                        if (cas == 10) {
                                            titre = avis[0].TitreLO;
                                            texteAvis = avis[0].AvisLO;
                                        }
                                        response.render('pages/common/modifMessageLO', { contient: next, avis: avis, titre: titre, texteAvis: texteAvis, cas: cas });
                                    });
                                }
                                // Pas le bon utilisateur
                                else {
                                    response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
                                    response.redirect('/LivreOr')
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}

// Permet de modifier un message existant du livre d'or
exports.modifierMessage = (request, response) => {
    let numLO = request.params.numLO;
    let token = request.cookies.token;
    let titre = request.body.titre;
    let texteAvis = request.body.avis;
    casErreur.casLivreOr(titre, texteAvis, (cas) => {
        jwt.verify(token, key.key, (err, decoded) => {
            // On crée un cookie qui dure 1s, afin que le retour au livre d'or traite le bon cas
            response.cookie('livreOr', { titre: titre, texteAvis: texteAvis, cas: cas }, { expiresIn: '5s' });
            // On peut insérer dans la BDD et afficher que c'est bon
            if (cas == 2) {
                // Si le token expire entre temps
                if (err) {
                    response.cookie('access', { err: true }, { expiresIn: '5s' });
                    response.redirect('/Connexion');
                }
                // Sinon on update le message
                else {
                    livreOr.modifierAvis(titre, texteAvis, numLO, (cb) => {
                        // Et on retourne sur le livre d'or
                        response.redirect('/LivreOr');
                    });
                }
            }
            // Il y a un soucis, on le fait remarquer sur la page de modification
            else {
                let url = '/LivreOr/' + numLO + '/ModifierMessage'
                response.redirect(url);
            }
        });
    });
}