// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage');
var utilisateur = require('../models/utilisateur');
var verifConnexion = require('../models/verifConnexion');

// Pour pouvoir faire un token
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');

// Pour comparer les mots de passe
var bcrypt = require('bcrypt');

// Permet de charger la page formations
exports.formations = (request, response) => {
    var token = request.cookies.token;
    affichage.remplirCatégorie(request, response, (next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/formations', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    var token = request.cookies.token;
    affichage.remplirCatégorie(request, response, (next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/quiSuisJe', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page de connexion
exports.connexion = (request, response) => {
    var token = request.cookies.token;
    // Permet de gérer les cas d'erreur de saisie
    var cas = 5;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1 || admin == 0) {
            // On est déjà connecté, on est redirigé à l'accueil
            response.redirect('/Accueil');
        }
        else {
            response.render('pages/common/connexion', { cas: cas });
        }
    });
}

// Permet de vérifier les informations de connexion
exports.tentativeConnexion = (request, response) => {
    var mail = request.body.mail;
    var mdp = request.body.mdp;
    var cas;
    utilisateur.mailExiste(mail, (bonMDP) => {
        // Cas de mauvais mail
        if (bonMDP[0] == undefined) {
            cas = 0;
            response.render('pages/common/connexion', { cas: cas });
        }
        else {
            // On compare les 2 mots de passe
            bcrypt.compare(mdp, bonMDP[0].MotDePasseUtilisateur, function (err, result) {
                if (result) {
                    // On véifie que le compte est activé
                    if (bonMDP[0].EtatCompteUtilisateur == 1) {
                        // On créé un token qui contiendra le NumUtilisateur et AdminUtilisateur pour savoir s'il est admin ou non
                        var token = jwt.sign({ NumUtilisateur: bonMDP[0].NumUtilisateur, AdminUtilisateur: bonMDP[0].AdminUtilisateur }, key.key, { expiresIn: '1h' }, (err, token) => {
                            if (err) throw err;
                            // Tout est bon, on est connecté et redirigé à l'accueil
                            response.cookie('token', token);
                            response.redirect('/Accueil');
                        });
                    }
                    else {
                        // Compte non activé encore
                        cas = 2;
                        response.render('pages/common/connexion', { cas: cas, mail : mail });
                    }
                }
                // Cas de mauvais mot de passe
                else {
                    cas = 1;
                    response.render('pages/common/connexion', { cas: cas, mail: mail });
                }
            });
        }
    });
}

exports.deconnexion = (request, response) => {
    response.clearCookie('token', request.cookies.token);
    response.redirect('/Accueil');
}

exports.inscription = (request, response) => {
    var cas = 10;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1 || admin == 0) {
            // On est déjà inscrit, on est redirigé à l'accueil
            response.redirect('/Accueil');
        }
        else {
            response.render('pages/common/inscription', { cas: cas });
        }
    });
}

exports.tentativeInscription = (request, response) => {
    // On récupère toutes les données du formulaire
    var mail = request.body.mail;
    var nom = request.body.Nom;
    var prenom = request.body.prénom;
    var pseudo = request.body.pseudo;
    var mdp = request.body.mdp;
    var mdpConf = request.body.mdpConf;
    var tel = request.body.tel;
    var ville = request.body.ville;
    var rue = request.body.rue;
    var cp = request.body.cp;
    var pays = request.body.pays;
    var date = request.body.date;
    var cas = 10;
    var saltRounds = 10;
    // On vérifie qu'il n'y a pas déjà de compte avec cette adresse mail
    utilisateur.mailExiste(mail, (test) => {
        // Champ vide
        if (mail == '') {
            cas = 0
            response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
        }
        else {
            // Bonne adresse mail
            if (test[0] == undefined) {
                // Champs prénom ou nom vide
                if (nom == '' || prenom == '') {
                    cas = 2;
                    response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                }
                else {
                    // On vérifie que les deux mots de passe sont bien identiques
                    if (mdp != mdpConf) {
                        cas = 4;
                        response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                    }
                    else {
                        // On regarde si le mdp est assez long
                        if (mdp.length < 4) {
                            cas = 5;
                            response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                        }
                        // Tout est bon, le reste peut être vide, on insère dans la BDD
                        else {
                            // On hash le mot de passe
                            bcrypt.hash(mdp, saltRounds, (err, mdpHash) => {
                                var mdpH = mdpHash
                                // S'il a mis un pseudo
                                if (pseudo != '') {
                                    utilisateur.pseudoExiste(pseudo, (result) => {
                                        // S'il existe, il faut alors changer
                                        if (result[0] != undefined) {
                                            cas = 3;
                                            response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                                        }
                                        else {
                                            // On insère le nouveau user dans la BDD
                                            utilisateur.newUtilisateur(mail, nom, prenom, pseudo, mdpH, tel, ville, rue, cp, pays, date, (cb) => {
                                                cas = 6;
                                                response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                                            });
                                        }
                                    });
                                }
                                else {
                                    // On insère le nouveau user dans la BDD
                                    utilisateur.newUtilisateur(mail, nom, prenom, pseudo, mdpH, tel, ville, rue, cp, pays, date, (cb) => {
                                        cas = 6;
                                        response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
                                    });
                                }
                            });
                        }
                    }
                }
            }
            else {
                // Un compte a déjà cette adresse
                cas = 1;
                response.render('pages/common/inscription', { cas: cas, mail : mail, nom : nom, prenom : prenom, pseudo : pseudo, tel : tel, ville : ville, rue :rue, cp : cp, pays : pays, date: date });
            }
        }

    })
}