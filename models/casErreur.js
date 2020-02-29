// Ce model permet d'utiliser les fonctions des autres models pour gérer les différents cas d'erreur
var Catégorie = require('../models/categorie');
var utilisateur = require('../models/utilisateur');
var image = require('../models/image');

// Cette fonction permet de renvoyer le cas d'inscription
// On ne vérifie pas tout ce qui est données de facturation (taille immense dans la BDD)
exports.casInscription = (pseudo, mail, nom, prenom, mdp, mdpConf, cb) => {
    var cas = 10;
    // On vérifie qu'il n'y a pas déjà de compte avec cette adresse mail
    utilisateur.mailExiste(mail, (test) => {
        utilisateur.pseudoExiste(pseudo, (result) => {
            // Champ vide
            if (mail == '' || mail.length > 255) {
                cas = 0;
            }
            else {
                // Bonne adresse mail
                if (test[0] == undefined) {
                    // Champs prénom ou nom vide
                    if (nom == '' || prenom == '' || nom.length > 25 || prenom.length > 25) {
                        cas = 2;
                    }
                    else {
                        // On vérifie que les deux mots de passe sont bien identiques
                        if (mdp != mdpConf) {
                            cas = 4;
                        }
                        else {
                            // On regarde si le mdp est assez long
                            if (mdp.length < 4) {
                                cas = 5;
                            }
                            // Il reste seulement à vérifier que le pseudo n'est pas pris
                            else {
                                // S'il a mis un pseudo
                                if (pseudo != '') {
                                    // S'il existe, il faut alors changer
                                    if (result[0] != undefined) {
                                        cas = 3;
                                    }
                                    else {
                                        if (pseudo.length > 15) {
                                            cas = 7;
                                        }
                                        else {
                                            // On peut insérer le nouveau user dans la BDD
                                            cas = 6;
                                        }
                                    }
                                }
                                else {
                                    // On peut insérer le nouveau user dans la BDD
                                    cas = 6;
                                }
                            }
                        }
                    }
                }
                else {
                    // Un compte a déjà cette adresse
                    cas = 1;
                }
            }
            if (cas != 3 && cas != 7 && cas != 6) {
            }
            cb(cas)
        });
    });
}

// Nous permet de déterminer quel sera le cas à afficher sur la page
exports.casLivreOr = (titre, avis, next) => {
    // Cas par défaut
    var cas = 10;
    // On vérifie que le titre est ok
    if (titre == '' || titre.length > 40) {
        cas = 0;
    }
    else {
        // On vérifie que le texte est ok
        if (avis == '' || avis.length > 400) {
            cas = 1;
        }
        // Tout va bien
        else {
            cas = 2;
        }
    }
    next(cas);
}

// Cas de suppression dans le livre d'or
exports.casSupprLivreOr = (utilisateur, decoded, next) => {
    var cas = 10;
    if (utilisateur[0] != undefined) {
        var NumUtilisateur = utilisateur[0].NumUtilisateur;
        // Tout est bon, on supprime
        if (NumUtilisateur == decoded.NumUtilisateur) {
            cas = 3
        }
        // Ce n'est pas le bon utilisateur
        else {
            cas = 4
        }
    }
    // Ce message n'existe plus
    else {
        cas = 4;
    }
    next(cas);
}

// Cas d'ajout d'une catégorie 
exports.casAjoutCatégorie = (libCat, next) => {
    var cas = 10;
    Catégorie.vérifierLibellé(libCat, (result) => {
        if (libCat == '' || libCat.length > 50) {
            // Mauvaise entrée
            cas = 0;
        }
        else {
            if (result[0] != undefined) {
                // Cette catégorie existe déjà
                cas = 1;
            }
            else {
                // Tout va bien
                cas = 2;
            }
        }
        next(cas);
    });
}

// Cas de modification d'une catégorie 
exports.casModifCatégorie = (numCat, libCat, next) => {
    var cas = 10;
    Catégorie.avoirLibellé(numCat, (lib) => {
        Catégorie.vérifierLibellé(libCat, (result) => {
            if (libCat == '' || libCat.length > 50) {
                // Mauvaise entrée
                cas = 0;
            }
            else {
                if (result[0] != undefined && libCat != lib.LibelléCatégorie) {
                    // Cette catégorie existe déjà
                    cas = 1;
                }
                else {
                    // Tout va bien
                    cas = 4;
                }
            }
            next(cas);
        });
    });
}

// Cas d'erreur d'ajout d'article
exports.casErreurAjoutArticle = (titreArticle, texteArticle, catégories, next) => {
    var cas = 10;
    var length = 0;
    image.liensImage((imgBDD) => {
        if (titreArticle == '' || titreArticle > 255) {
            // Le titre est incorrect
            cas = 5;
        }
        else {
            if (texteArticle == '') {
                // Le texte est incorrect
                cas = 6;
            }
            else {
                if (catégories == undefined) {
                    // Il faut au moins choisir une catégorie 
                    cas = 7;
                }
                else {
                    cas = 8;
                }
            }
        }
        next(cas);
    });
}