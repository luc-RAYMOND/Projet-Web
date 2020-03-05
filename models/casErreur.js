// Ce model permet d'utiliser les fonctions des autres models pour gérer les différents cas d'erreur
var Catégorie = require('../models/categorie');
var utilisateur = require('../models/utilisateur');
var article = require('../models/article');
var bcrypt = require('bcrypt');

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
        if (libCat == '' || libCat.length > 50 || libCat.length < 2) {
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
                // Tout va bien
                cas = 8;
            }
        }
    }
    next(cas);

}

exports.casErreurModifArticle = (numArticle, titreArticle, texteArticle, catégories, next) => {
    var cas = 10;
    if (titreArticle == '' || titreArticle > 255) {
        // Le titre est incorrect
        cas = 3;
        next(cas);
    }
    else {
        if (texteArticle == '') {
            // Le texte est incorrect
            cas = 4;
            next(cas);
        }
        else {
            article.avoirLibelléUnArticle(numArticle, (libCat) => {
                var length1;
                // On regarde si l'article a des catégories de base
                if (catégories != undefined && libCat != undefined) {
                    // On regarde combien de catégories qu'on veut rajouter
                    if (catégories[0].length == 1) {
                        // S'il y a qu'une catégorie, c'est simplement un String
                        length1 = 1;
                    }
                    else {
                        // Sinon c'est un tableau
                        length1 = catégories.length;
                    }
                    var k = 0
                    var length2 = libCat.length;
                    // On vérifie qu'il n'y ait pas de doublon de catégorie
                    while (cas != 5 && k != length2) {
                        if (length1 == 1) {
                            if (catégories == libCat[k].LibelléCatégorie) {
                                cas = 5
                            }
                        }
                        else {
                            for (var i = 0; i < length1; i++) {
                                if (catégories[i] == libCat[k].LibelléCatégorie) {
                                    cas = 5;
                                }
                            }
                        }
                        k++;
                    }
                    // Tout va bien, on peut ajouter les nouvelles catégories
                    if (cas != 5) {
                        cas = 7;
                    }
                    next(cas);
                }
                // On n'ajoute pas de catégorie, tout va bien
                else {
                    cas = 6
                    next(cas);
                }
            });
        }
    }
}

exports.casErreurAjoutDevis = (numUtilisateur, prenomNom, cb) => {
    // On regarde d'abord si l'on a entré un utilisateur inscrit ou non
    if (numUtilisateur == "N") {
        // Si non, on regarde si l'entrée est correcte pour les nom et prénom provisoires
        if (prenomNom == '' || prenomNom.length > 50 || prenomNom.length < 2) {
            cas = 2;
        }
        else {
            // On a le cas où l'on va créer un devis avec un utilisateur provisoire
            cas = 3;
        }
    }
    else {
        // On a forcément un utilisateur avec un numéro qui existe
        cas = 4;
    }
    cb(cas);
}

exports.casErreurAjoutLC = (libellé, quantité, prixU, cb) => {
    var cas = 10;
    // On regarde si le libellé a une entrée correcte
    if (libellé == '' || libellé.length > 400) {
        cas = 1;
    }
    else {
        // On regarde si la quantité est bien positive
        if (quantité < 0 || quantité == '') {
            cas = 2;
        }
        else {
            // On regarde que le prixU est bien positif
            if (prixU < 0 || prixU == '') {
                cas = 3;
            }
            // Tout est bon
            else {
                cas = 4;
            }
        }
    }
    cb(cas);
}

// Permet de voir les cas d'erreurs de changement de mot de passe
exports.casModifMDP = (numUtiliateur, mdpAct, newMdp, newMdpConf, cb) => {
    var modifMDP = 10;
    // On récupère le mdp du user
    utilisateur.avoirUtilisateur(numUtiliateur, (user) => {
        // On le compare avec ce qu'il a rentré
        bcrypt.compare(mdpAct, user[0].MotDePasseUtilisateur, function (err, result) {
            // On regarde si l'utilisateur veut changer son mot de passe
            if (mdpAct != '') {
                if (result) {
                    // Les nouveaux mots de passe ne sont pas identiques
                    if (newMdp != newMdpConf) {
                        modifMDP = 2;
                    }
                    else {
                        // On regarde si le mdp est assez long
                        if (newMdp.length < 4) {
                            modifMDP = 3;
                        }
                        else {
                            // Tout est bon ici
                            modifMDP = 4;
                        }
                    }
                }
                else {
                    // Le mot de passe actuel est faux
                    modifMDP = 1;
                }
            }
            // Il ne cherche pas à modifier le mdp, on renvoie 10
            cb(modifMDP);
        });
    });
}

// Permet de vérifier le pseudo
exports.casModifPseudo = (pseudo, cb) => {
    var cas = 10;
    if (pseudo != undefined) {
        utilisateur.pseudoExiste(pseudo, (result) => {
            if (pseudo != '' && pseudo != undefined) {
                // S'il existe, il faut alors changer
                if (result[0] != undefined) {
                    cas = 1;
                }
                else {
                    if (pseudo.length > 15) {
                        cas = 2;
                    }
                    else {
                        // Tout va bien
                        cas = 3;
                    }
                }
            }
            cb(cas);
        });
    }
    else {
        cb(cas);
    }
}