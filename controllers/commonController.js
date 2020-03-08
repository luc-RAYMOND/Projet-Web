// Les models d'où viennent les fonctions sur la BDD
const affichage = require('../models/affichage');
const casErreur = require('../models/casErreur');
const utilisateur = require('../models/utilisateur');
const verifConnexion = require('../models/verifConnexion');

// Pour pouvoir faire un token
const jwt = require('jsonwebtoken');
const key = require('../config/tokenKey');

// Pour comparer les mots de passe
const bcrypt = require('bcrypt');

// Permet de charger la page formations
exports.formations = (request, response) => {
    let token = request.cookies.token;
    affichage.remplirCatégorie((next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/formations', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    let token = request.cookies.token;
    affichage.remplirCatégorie((next) => {
        verifConnexion.verifConnexion(token, (admin) => {
            response.render('pages/common/quiSuisJe', { contient: next, admin: admin });
        });
    });
}

// Permet de charger la page de connexion
exports.connexion = (request, response) => {
    let token = request.cookies.token;
    // Permet de gérer les cas d'erreur de saisie
    let cas = 5;
    status = 200;
    // On regarde s'il y a des cookies pour l'accès non autorisé
    if (request.cookies.access != undefined) {
        // On récupère toutes les valeurs
        cas = 6;
        status = 401;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('access', request.cookies.access);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1 || admin == 0) {
            // On est déjà connecté, on est redirigé à l'accueil
            response.redirect('/Accueil');
        }
        else {
            response.status(status).render('pages/common/connexion', { cas: cas });
        }
    });
}

// Permet de vérifier les informations de connexion
exports.tentativeConnexion = (request, response) => {
    let mail = request.body.mail;
    let mdp = request.body.mdp;
    let cas;
    utilisateur.mailExiste(mail, (bonMDP) => {
        // Cas de mail vide
        if (mail == '' || bonMDP[0] == undefined) {
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
                        let token = jwt.sign({ NumUtilisateur: bonMDP[0].NumUtilisateur, AdminUtilisateur: bonMDP[0].AdminUtilisateur }, key.key, { expiresIn: '1h' }, (err, token) => {
                            if (err) {
                                response.status(500).render('pages/common/errServ');
                            }
                            // Tout est bon, on est connecté et redirigé à l'accueil
                            response.cookie('token', token);
                            response.redirect('/Accueil');
                        });
                    }
                    else {
                        // Compte non activé encore
                        cas = 2;
                        response.status('403').render('pages/common/connexion', { cas: cas, mail: mail });
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
    let cas = 3;
    response.clearCookie('token', request.cookies.token);
    response.clearCookie('vue', request.cookies.vue);
    response.render('pages/common/connexion', { cas: cas });
}

exports.inscription = (request, response) => {
    let cas = 10;
    let token = request.cookies.token;
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
    let mail = request.body.mail;
    let nom = request.body.Nom;
    let prenom = request.body.prénom;
    let pseudo = request.body.pseudo;
    let mdp = request.body.mdp;
    let mdpConf = request.body.mdpConf;
    let tel = request.body.tel;
    let ville = request.body.ville;
    let rue = request.body.rue;
    let cp = request.body.cp;
    let pays = request.body.pays;
    let date = request.body.date;
    let saltRounds = 10;
    casErreur.casInscription(pseudo, mail, nom, prenom, mdp, mdpConf, (cas) => {
        if (cas == 6) {
            bcrypt.hash(mdp, saltRounds, (err, mdpHash) => {
                if (err) {
                    response.status(500).render('pages/common/errServ');
                }
                let mdpH = mdpHash
                utilisateur.newUtilisateur(mail, nom, prenom, pseudo, mdpH, tel, ville, rue, cp, pays, date, (cb) => {
                    response.render('pages/common/inscription', { cas: cas, mail: mail, nom: nom, prenom: prenom, pseudo: pseudo, tel: tel, ville: ville, rue: rue, cp: cp, pays: pays, date: date });
                });
            });
        }
        else {
            response.render('pages/common/inscription', { cas: cas, mail: mail, nom: nom, prenom: prenom, pseudo: pseudo, tel: tel, ville: ville, rue: rue, cp: cp, pays: pays, date: date });
        }
    });
}